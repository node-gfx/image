# Image

An `Image` implementation for usage outside of the browser.

Also exports some helper methods which are available both in Node.js, and in the browser when packaging with Browserify, Webpack, etc.

## Installation

```sh
npm install --save @canvas/image
```

## Usage

```js
const fs = require('fs')
const { Image, getImageData, imageFromBuffer, imageFromImageData } = require('@canvas/image')

// Traditional loading
const img = new Image()
img.src = 'image.png'
img.onload = () => {
  console.log(img.width)
  // => 2

  console.log(img.height)
  // => 1

  console.log(getImageData(img).data)
  // => Uint8ClampedArray [ 1, 2, 3, 4, 5, 6, 7, 8 ]
}

// From Buffer
const source = fs.readFileSync('image.png')
imageFromBuffer(source).then((img) => {
  console.log(img.width)
  // => 2

  console.log(img.height)
  // => 1

  console.log(getImageData(img).data)
  // => Uint8ClampedArray [ 1, 2, 3, 4, 5, 6, 7, 8 ]
})

// From ImageData
const data = new ImageData(new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]), 2, 1)
imageFromImageData(data).then((img) => {
  console.log(img.width)
  // => 2

  console.log(img.height)
  // => 1

  console.log(getImageData(img).data)
  // => Uint8ClampedArray [ 1, 2, 3, 4, 5, 6, 7, 8 ]
})
```

## API

### `getImageData(image)`

- `image` ([`Image`](https://developer.mozilla.org/en-US/docs/Web/API/Image), required)
- returns [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) or `undefined`

### `imageFromBuffer(buffer)`

- `buffer` ([`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), required)
- returns `Promise<Image>`

### `imageFromImageData(imageData)`

- `imageData` ([`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData), required)
- returns `Promise<Image>`

## Hacking

The tests are made to be run against both this implementation and Chrome's implementation to make sure that we behave in the same way. You can run the tests in Chrome by building the test bundle (`npm run build`), spinning up a local web server, and then opening `test.html`.
