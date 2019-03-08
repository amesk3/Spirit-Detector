var video = document.getElementById('video')

let prevImage

const threshold = 25

let motionX = 0
let motionY = 0

const width = 1800
const height = 600

let lerpX = 0
let lerpY = 0

function lerp(a, b, n) {
  return (1 - n) * a + n * b
}

function initialize(videoElement) {
  if (typeof videoElement != 'object') {
    webCamWindow = document.getElementById(videoElement)
  } else {
    webCamWindow = videoElement
  }
}
/*
		 * Captures a still image from the video.
		 *
		 * @param <Element> append An optional element where we want to append the image. 
		 *
		 * @return <Element> A canvas element with the image.
		 *
		 */
function captureImage(append) {
  var canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(webCamWindow, 0, 0, width, height)

  var pngImage = canvas.toDataURL('image/png')

  if (append) {
    append.appendChild(canvas)
  }

  return canvas
}

function updatePixels() {
  if (count > 200) {
    motionX = avgX / count
    motionY = avhY / count
  }
}

// lerpX = lerp(lerpX, motionX, 0.1)
// lerpY = lerp(lerpY, motionY, 0.1)
