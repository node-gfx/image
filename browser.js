/* eslint-env browser */

const base64Encode = require('fast-base64-encode')

function getImageData (image) {
  if (!image.complete || image.naturalWidth === 0) return

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function imageFromBuffer (buffer) {
  return imageFromDataURL('data:;base64,' + base64Encode(buffer))
}

function imageFromDataURL (dataURL) {
  const img = new Image()
  img.src = dataURL
  return img.decode().then(() => img)
}

function imageFromImageData (imageData) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height

  const ctx = canvas.getContext('2d')
  ctx.putImageData(imageData, 0, 0)

  return imageFromDataURL(canvas.toDataURL())
}

exports.getImageData = getImageData
exports.imageFromBuffer = imageFromBuffer
exports.imageFromImageData = imageFromImageData

exports.Image = Image
exports.default = Image
