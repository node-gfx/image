const ImageData = require('@canvas/image-data')
const { Image, getImageData, imageFromBuffer, imageFromImageData } = require('.')

const assert = (condition) => { if (!condition) throw new Error('Assertion failed') }
const loaded = (img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = () => { img.onload = null; resolve() } })
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const blackWhitePng2x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQAAAADcWUInAAAACklEQVR4AWNwAAAAQgBBEu1RhgAAAABJRU5ErkJggg=='
const brokenImage = 'data:image/png;base64,'
const invalidDataUrl = 'data:foobar'

const testCases = [
  async () => {
    const img = new Image()
    assert(img.complete === true)
    assert(img.onload === null)
    assert(img.onerror === null)
    assert(img.src === '')
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image(3, 4)
    assert(img.complete === true)
    assert(img.onload === null)
    assert(img.onerror === null)
    assert(img.src === '')
    assert(img.width === 3)
    assert(img.height === 4)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.width = '4'
    assert(img.width === 4)
    img.height = '5'
    assert(img.height === 5)
  },

  async () => {
    const img = new Image()
    img.width = 4.5
    assert(img.width === 4)
    img.height = 5.999
    assert(img.height === 5)
  },

  async () => {
    const img = new Image()
    img.width = NaN
    assert(img.width === 0)
    img.height = Infinity
    assert(img.height === 0)
  },

  async () => {
    const img = new Image()
    img.width = -4
    assert(img.width === 0)
    img.height = -5
    assert(img.height === 0)
  },

  async () => {
    const img = new Image()
    img.width = Math.pow(2, 31)
    assert(img.width === 0)
    img.height = Math.pow(2, 31) - 1
    assert(img.height === Math.pow(2, 31) - 1)
  },

  async () => {
    const img = new Image('4', '5')
    assert(img.width === 4)
    assert(img.height === 5)
  },

  async () => {
    const img = new Image(4.5, 5.999)
    assert(img.width === 4)
    assert(img.height === 5)
  },

  async () => {
    const img = new Image(NaN, Infinity)
    assert(img.width === 0)
    assert(img.height === 0)
  },

  async () => {
    const img = new Image(-4, -5)
    assert(img.width === 0)
    assert(img.height === 0)
  },

  async () => {
    const img = new Image(Math.pow(2, 31), Math.pow(2, 31) - 1)
    assert(img.width === 0)
    assert(img.height === Math.pow(2, 31) - 1)
  },

  async () => {
    const img = new Image()
    img.src = blackWhitePng2x1
    await loaded(img)
    assert(img.complete === true)
    assert(img.onload === null)
    assert(img.onerror === null)
    assert(img.src === blackWhitePng2x1)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image(0, 0)
    img.src = blackWhitePng2x1
    await loaded(img)
    assert(img.complete === true)
    assert(img.src === blackWhitePng2x1)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image(4, 2)
    img.src = blackWhitePng2x1
    await loaded(img)
    assert(img.complete === true)
    assert(img.src === blackWhitePng2x1)
    assert(img.width === 4)
    assert(img.height === 2)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image(4)
    img.src = blackWhitePng2x1
    await loaded(img)
    assert(img.complete === true)
    assert(img.src === blackWhitePng2x1)
    assert(img.width === 4)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.height = 2
    img.src = blackWhitePng2x1
    await loaded(img)
    assert(img.complete === true)
    assert(img.src === blackWhitePng2x1)
    assert(img.width === 2)
    assert(img.height === 2)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    let loaded = false
    const img = new Image()

    img.onload = () => { loaded = true }
    assert(loaded === false)

    await sleep(80)
    assert(loaded === false)
  },

  async () => {
    let loaded = false
    const img = new Image()

    img.onload = () => { loaded = true }
    assert(loaded === false)

    img.src = blackWhitePng2x1
    assert(loaded === false)

    await sleep(0)
    assert(loaded === true)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/2x1.png'
    await loaded(img)
    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/2x1.png?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/2x1.jpg?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/2x1.webp?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/2x1.bmp?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/2x1.gif?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/bmp.ico?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 32)
    assert(img.height === 32)
    assert(img.naturalWidth === 32)
    assert(img.naturalHeight === 32)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/png.ico?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 32)
    assert(img.height === 32)
    assert(img.naturalWidth === 32)
    assert(img.naturalHeight === 32)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/multiple.ico?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const load = await new Promise((resolve) => { img.onload = resolve })

    assert(load.bubbles === false)
    assert(load.cancelable === false)
    assert(load.currentTarget === img)
    assert(load.defaultPrevented === false)
    assert(load.eventPhase === 2)
    assert(load.target === img)
    assert(typeof load.timeStamp === 'number')
    assert(load.type === 'load')

    assert(img.complete === true)
    assert(img.width === 256)
    assert(img.height === 256)
    assert(img.naturalWidth === 256)
    assert(img.naturalHeight === 256)
  },

  async () => {
    const img = new Image()
    img.src = 'fixtures/empty.dat?' + Math.random()
    assert(img.complete === false)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const err = await new Promise((resolve) => { img.onerror = resolve })

    assert(err.bubbles === false)
    assert(err.cancelable === false)
    assert(err.currentTarget === img)
    assert(err.defaultPrevented === false)
    assert(err.eventPhase === 2)
    assert(err.target === img)
    assert(typeof err.timeStamp === 'number')
    assert(err.type === 'error')

    assert(img.complete === true)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.src = brokenImage
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const err = await new Promise((resolve) => { img.onerror = resolve })

    assert(err.bubbles === false)
    assert(err.cancelable === false)
    assert(err.currentTarget === img)
    assert(err.defaultPrevented === false)
    assert(err.eventPhase === 2)
    assert(err.target === img)
    assert(typeof err.timeStamp === 'number')
    assert(err.type === 'error')

    assert(img.src === brokenImage)
    assert(img.complete === true)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.src = invalidDataUrl
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const err = await new Promise((resolve) => { img.onerror = resolve })

    assert(err.bubbles === false)
    assert(err.cancelable === false)
    assert(err.currentTarget === img)
    assert(err.defaultPrevented === false)
    assert(err.eventPhase === 2)
    assert(err.target === img)
    assert(typeof err.timeStamp === 'number')
    assert(err.type === 'error')

    assert(img.src === invalidDataUrl)
    assert(img.complete === true)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.src = 'https://thishostnameshouldhopefullyneverberegistered.com/foobar.png'
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const err = await new Promise((resolve) => { img.onerror = resolve })

    assert(err.bubbles === false)
    assert(err.cancelable === false)
    assert(err.currentTarget === img)
    assert(err.defaultPrevented === false)
    assert(err.eventPhase === 2)
    assert(err.target === img)
    assert(typeof err.timeStamp === 'number')
    assert(err.type === 'error')

    assert(img.src === 'https://thishostnameshouldhopefullyneverberegistered.com/foobar.png')
    assert(img.complete === true)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.src = 'https://httpstat.us/500'
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const err = await new Promise((resolve) => { img.onerror = resolve })

    assert(err.bubbles === false)
    assert(err.cancelable === false)
    assert(err.currentTarget === img)
    assert(err.defaultPrevented === false)
    assert(err.eventPhase === 2)
    assert(err.target === img)
    assert(typeof err.timeStamp === 'number')
    assert(err.type === 'error')

    assert(img.src === 'https://httpstat.us/500')
    assert(img.complete === true)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.src = 'file:///this/file/does/not/exists.png'
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)

    const err = await new Promise((resolve) => { img.onerror = resolve })

    assert(err.bubbles === false)
    assert(err.cancelable === false)
    assert(err.currentTarget === img)
    assert(err.defaultPrevented === false)
    assert(err.eventPhase === 2)
    assert(err.target === img)
    assert(typeof err.timeStamp === 'number')
    assert(err.type === 'error')

    assert(img.src === 'file:///this/file/does/not/exists.png')
    assert(img.complete === true)
    assert(img.width === 0)
    assert(img.height === 0)
    assert(img.naturalWidth === 0)
    assert(img.naturalHeight === 0)
  },

  async () => {
    const img = new Image()
    img.src = 'https://user-images.githubusercontent.com/189580/69494359-99787f80-0eb2-11ea-9c75-34d5c4d0d24e.png'

    await loaded(img)

    assert(img.complete === true)
    assert(img.width === 2)
    assert(img.height === 1)
    assert(img.naturalWidth === 2)
    assert(img.naturalHeight === 1)
  },

  async () => {
    const img = new Image()
    img.src = blackWhitePng2x1
    await loaded(img)

    const data = getImageData(img)
    assert(data instanceof ImageData)
    assert(data.width === 2)
    assert(data.height === 1)
    assert(data.data[0] === 0x00)
    assert(data.data[1] === 0x00)
    assert(data.data[2] === 0x00)
    assert(data.data[3] === 0xff)
    assert(data.data[4] === 0xff)
    assert(data.data[5] === 0xff)
    assert(data.data[6] === 0xff)
    assert(data.data[7] === 0xff)
  },

  async () => {
    const src = new Uint8Array([71, 73, 70, 56, 55, 97, 2, 0, 1, 0, 240, 0, 0, 0, 0, 0, 255, 255, 255, 44, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2, 2, 68, 10, 0, 59])
    const img = await imageFromBuffer(src)

    assert(img.complete === true)
    assert(img.height === 1)
    assert(img.naturalHeight === 1)
    assert(img.naturalWidth === 2)
    assert(img.onerror === null)
    assert(img.onload === null)
    assert(img.width === 2)
  },

  async () => {
    const src = new ImageData(new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]), 2, 1)
    const img = await imageFromImageData(src)

    assert(img.complete === true)
    assert(img.height === 1)
    assert(img.naturalHeight === 1)
    assert(img.naturalWidth === 2)
    assert(img.onerror === null)
    assert(img.onload === null)
    assert(img.width === 2)
  },

  async () => {
    if (typeof window === 'undefined') {
      let uncaught
      const handler = (err) => { uncaught = err }
      global.process.addListener('uncaughtException', handler)

      try {
        const img = new Image()
        img.src = 'file:///this/file/does/not/exists.png'
        await sleep(80)
        assert(uncaught instanceof Error)
      } finally {
        global.process.removeListener('uncaughtException', handler)
      }
    }
  },

  () => {
    // imageFromBuffer should reject the promise if the buffer is malformed
    const malformedSrc = new Uint8Array([])
    return imageFromBuffer(malformedSrc).catch(() => {})
  }
]

async function run () {
  for (const testCase of testCases) await testCase()
}

if (typeof window === 'object') {
  const success = () => {
    document.body.style.backgroundColor = 'green'
  }

  const error = (err) => {
    document.body.style.backgroundColor = 'red'
    document.body.style.whiteSpace = 'pre'
    document.body.textContent = err.stack
  }

  document.body.style.backgroundColor = 'yellow'

  run().then(success, error)
} else {
  run().catch((err) => {
    global.process.exitCode = 1
    console.error(err.stack)
  })
}
