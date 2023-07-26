const fs = require('fs')
const { performance } = require('perf_hooks')

const base64Decode = require('fast-base64-decode')
const base64Length = require('fast-base64-length')
const ImageData = require('@canvas/image-data')
const simpleGet = require('simple-get')

const bmp = require('@cwasm/nsbmp')
const gif = require('@cwasm/nsgif')
const jpeg = require('@cwasm/jpeg-turbo')
const png = require('@cwasm/lodepng')
const webp = require('@cwasm/webp')
const decodeIco = require('decode-ico')

const heightMap = new WeakMap()
const imageDataMap = new WeakMap()
const srcMap = new WeakMap()
const widthMap = new WeakMap()

const headers = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36' }

function decodeImage (data) {
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
    return jpeg.decode(data)
  }

  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47 && data[4] === 0x0D && data[5] === 0x0A && data[6] === 0x1A && data[7] === 0x0A) {
    return png.decode(data)
  }

  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
    return gif.decode(data)
  }

  if (data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
    return webp.decode(data)
  }

  if (data[0] === 0x42 && data[1] === 0x4D) {
    return bmp.decode(data)
  }

  if (data[0] === 0x00 && data[1] === 0x00 && data[2] === 0x01 && data[3] === 0x00) {
    const images = decodeIco(data)
    let biggestEntry = images[0]

    // ref: https://github.com/mozilla/gecko-dev/blob/10a46f9dacc39a9305ef9cbfb27f8b68e25eccc9/image/decoders/nsICODecoder.cpp#L249-L258
    for (const image of images.slice(1)) {
      if (
        image.bpp >= biggestEntry.bpp &&
        image.width * image.height >= biggestEntry.width * biggestEntry.height
      ) {
        biggestEntry = image
      }
    }

    if (biggestEntry.type === 'png') {
      return png.decode(biggestEntry.data)
    } else {
      return new ImageData(biggestEntry.data, biggestEntry.width, biggestEntry.height)
    }
  }

  throw new Error('Unknown file format')
}

function fireError (img, err) {
  img.complete = true

  process.nextTick(() => {
    if (!img.onerror) throw err
    img.onerror({ type: 'error', bubbles: false, cancelable: false, currentTarget: img, defaultPrevented: false, eventPhase: 2, target: img, timeStamp: performance.now() })
  })
}

function fireLoad (img, data) {
  imageDataMap.set(img, data)
  img.complete = true

  process.nextTick(() => {
    if (!img.onload) return
    img.onload({ type: 'load', bubbles: false, cancelable: false, currentTarget: img, defaultPrevented: false, eventPhase: 2, target: img, timeStamp: performance.now() })
  })
}

const reDataURL = /^data:([^;,]*)(;base64)?,/
function decodeDataURL (url) {
  const m = reDataURL.exec(url)

  if (m && m[2] === ';base64') {
    const source = url.slice(m[0].length)
    const length = base64Length(source)
    const data = new Uint8Array(length)
    base64Decode(source, data)
    return decodeImage(data)
  }

  throw new Error('Invalid data url')
}

async function readDataURL (url, img) {
  await Promise.resolve()

  let data
  try {
    data = decodeDataURL(url)
  } catch (err) {
    return fireError(img, err)
  }

  fireLoad(img, data)
}

async function readWeb (url, img) {
  let data
  try {
    const [res, encoded] = await new Promise((resolve, reject) => simpleGet.concat({ headers, url }, (err, res, data) => err ? reject(err) : resolve([res, data])))
    if (res.statusCode < 200 || res.statusCode >= 300) throw new Error(`Server responded with ${res.statusCode}`)
    data = decodeImage(encoded)
  } catch (err) {
    return fireError(img, err)
  }

  fireLoad(img, data)
}

async function readFile (url, img) {
  const queryIndex = url.indexOf('?')
  if (queryIndex !== -1) url = url.slice(0, queryIndex)
  if (url.startsWith('file://')) url = url.slice(7)

  let data
  try {
    data = decodeImage(await new Promise((resolve, reject) => fs.readFile(url, (err, raw) => err ? reject(err) : resolve(raw))))
  } catch (err) {
    return fireError(img, err)
  }

  fireLoad(img, data)
}

class Image {
  constructor (width, height) {
    this.complete = true
    this.onerror = null
    this.onload = null

    srcMap.set(this, '')

    if (width != null) this.width = width
    if (height != null) this.height = height
  }

  get src () {
    return srcMap.get(this)
  }

  set src (url) {
    url = String(url)

    this.complete = false
    imageDataMap.delete(this)
    srcMap.set(this, url)

    if (url.startsWith('data:')) {
      readDataURL(url, this)
    } else if (url.startsWith('http:') || url.startsWith('https:')) {
      readWeb(url, this)
    } else {
      readFile(url, this)
    }
  }

  get height () {
    return heightMap.has(this) ? heightMap.get(this) : this.naturalHeight
  }

  set height (value) {
    value = Number(value)
    if (value < 0) value = 0
    if (value > 0x7fffffff) value = 0
    heightMap.set(this, value >>> 0)
  }

  get naturalHeight () {
    return imageDataMap.has(this) ? imageDataMap.get(this).height : 0
  }

  get naturalWidth () {
    return imageDataMap.has(this) ? imageDataMap.get(this).width : 0
  }

  get width () {
    return widthMap.has(this) ? widthMap.get(this) : this.naturalWidth
  }

  set width (value) {
    value = Number(value)
    if (value < 0) value = 0
    if (value > 0x7fffffff) value = 0
    widthMap.set(this, value >>> 0)
  }
}

function getImageData (image) {
  return imageDataMap.get(image)
}

function imageFromBuffer (buffer) {
  return new Promise((resolve) => {
    const imageData = decodeImage(buffer)
    resolve(imageFromImageData(imageData))
  })
}

function imageFromImageData (imageData) {
  const img = new Image()
  fireLoad(img, imageData)
  return Promise.resolve(img)
}

exports.getImageData = getImageData
exports.imageFromBuffer = imageFromBuffer
exports.imageFromImageData = imageFromImageData

exports.Image = Image
exports.default = Image
