import ImageData = require('@canvas/image-data')

declare interface ErrorEvent {
  type: 'error'
  path: [Image]
}

declare interface LoadEvent {
  type: 'load'
  path: [Image]
}

export declare class Image {
  /**
   * @param width - The width of the image (i.e., the value for the `width` attribute).
   * @param height - The height of the image (i.e., the value for the `height` attribute).
   */
  constructor (width?: number, height?: number)

  /** A boolean value which indicates whether or not the image has completely loaded. */
  readonly complete: boolean

  /** An integer value indicating the height of the image. */
  height: number

  /**
   * An integer value indicating the intrinsic height of the image, in CSS pixels. This is the height at which the image is naturally drawn when no constraint or specific value is established for the image. This natural height is corrected for the pixel density of the device on which it's being presented, unlike the value of `height`.
   *
   * If the intrinsic height is not available—either because the image does not specify an intrinsic height or because the image data is not available in order to obtain this information, `naturalHeight` returns 0.
   */
  readonly naturalHeight: number

  /**
   * An integer value indicating the intrinsic width of the image, in CSS pixels. This is the width at which the image is naturally drawn when no constraint or specific value is established for the image. This natural width is corrected for the pixel density of the device on which it's being presented, unlike the value of `width`.
   *
   * If the intrinsic width is not available—either because the image does not specify an intrinsic width or because the image data is not available in order to obtain this information, `naturalWidth` returns 0.
   */
  readonly naturalWidth: number

  /**
   * This event handler will be called on the image element when an error occurs loading the image.
   */
  onerror: ((event: ErrorEvent) => void) | null

  /**
   * This event handler will be called on the image element when the image has finished loading. If you change the image, the event will fire again when the new image loads.
   */
  onload: (() => void) | null

  /** A string specifying the URL of the desired image. */
  src: string

  /** An integer value indicating the width of the image. */
  width: number
}

export declare function getImageData (image: Image): ImageData | undefined
export declare function imageFromBuffer (buffer: Uint8Array): Promise<Image>
export declare function imageFromImageData (imageData: ImageData): Promise<Image>

export default Image
