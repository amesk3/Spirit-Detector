/* eslint-disable max-statements */
;(function() {
  // prep capture canvas
  let captureCanvas
  let captureContext
  let diffContext
  let diffCanvas
  let captureWidth = 1800
  let captureHeight = 900
  let diffWidth = 1800
  let diffHeight = 900
  let includeMotionPixels
  let pixelDiffThreshold = 32
  let scoreThreshold = 16
  var motionContext
  var includeMotionBox = false
  var motionCanvas
  let captureCallback = function() {}

  captureCanvas = document.createElement('canvas')
  captureCanvas.width = captureWidth
  captureCanvas.height = captureHeight
  captureContext = captureCanvas.getContext('2d')
  diffCanvas = document.createElement('canvas')
  diffContext = diffCanvas.getContext('2d')
  includeMotionPixels = false
  motionCanvas = document.createElement('canvas')
  motionContext = motionCanvas.getContext('2d')

  let isReadyToDiff = false
  let motionBox = undefined

  //initialize video
  var canvas = document.getElementById('canvas')
  console.log('canvas', canvas)
  var context = canvas.getContext('2d')
  var video = document.getElementById('video')
  var vendorUrl = window.URL || window.webkitUrl

  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia

  var constraints = {audio: false, video: true}

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(mediaStream) {
      video.srcObject = mediaStream
      video.onloadedmetadata = function(e) {
        video.play()
      }
    })
    .catch(function(e) {
      console.log(e.name + ':' + e.message)
    })

  //link video from html
  var video = document.getElementById('video')

  //create canvas element
  var canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 480
  var context = canvas.getContext('2d')

  //how soon we get the next snapshot of the webcam stream
  setInterval(capture, 100)

  function capture() {
    context.drawImage(video, 0, 0, 640, 480)
  }

  var imageScore = 0

  function capture() {
    // save a full-sized copy of capture
    let captureWidth = 640
    let letcaptureHeight = captureWidth

    captureContext.drawImage(video, 0, 0, captureWidth, captureHeight)
    var captureImageData = captureContext.getImageData(
      0,
      0,
      captureWidth,
      captureHeight
    )

    // diff current capture over previous capture, leftover from last time
    diffContext.globalCompositeOperation = 'difference'
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight)
    var diffImageData = diffContext.getImageData(0, 0, diffWidth, diffHeight)

    if (isReadyToDiff) {
      var diff = processDiff(diffImageData)

      motionContext.putImageData(diffImageData, 0, 0)
      if (diff.motionBox) {
        motionContext.strokeStyle = '#fff'
        motionContext.strokeRect(
          diff.motionBox.x.min + 0.5,
          diff.motionBox.y.min + 0.5,
          diff.motionBox.x.max - diff.motionBox.x.min,
          diff.motionBox.y.max - diff.motionBox.y.min
        )
      }
      captureCallback({
        imageData: captureImageData,
        score: diff.score,
        hasMotion: diff.score >= scoreThreshold,
        motionBox: diff.motionBox,
        motionPixels: diff.motionPixels,
        getURL: function() {
          return getCaptureUrl(this.imageData)
        },
        checkMotionPixel: function(x, y) {
          return checkMotionPixel(this.motionPixels, x, y)
        }
      })
    }
    // draw current capture normally over diff, ready for next time
    diffContext.globalCompositeOperation = 'source-over'
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight)
    isReadyToDiff = true
  }

  function processDiff(diffImageData) {
    var rgba = diffImageData.data

    // pixel adjustments are done by reference directly on diffImageData
    var score = 0
    var motionPixels = includeMotionPixels ? [] : undefined
    var motionBox = undefined
    for (var i = 0; i < rgba.length; i += 4) {
      var pixelDiff = rgba[i] * 0.3 + rgba[i + 1] * 0.6 + rgba[i + 2] * 0.1
      var normalized = Math.min(255, pixelDiff * (255 / pixelDiffThreshold))
      rgba[i] = 0
      rgba[i + 1] = normalized
      rgba[i + 2] = 0

      if (pixelDiff >= pixelDiffThreshold) {
        score++
        coords = calculateCoordinates(i / 4)

        if (includeMotionBox) {
          motionBox = calculateMotionBox(motionBox, coords.x, coords.y)
        }

        if (includeMotionPixels) {
          motionPixels = calculateMotionPixels(
            motionPixels,
            coords.x,
            coords.y,
            pixelDiff
          )
        }
      }
    }

    return {
      score: score,
      motionBox: score > scoreThreshold ? motionBox : undefined,
      motionPixels: motionPixels
    }
  }

  function calculateCoordinates(pixelIndex) {
    return {
      x: pixelIndex % diffWidth,
      y: Math.floor(pixelIndex / diffWidth)
    }
  }
  function calculateMotionBox(currentMotionBox, x, y) {
    // init motion box on demand
    var motionBox = currentMotionBox || {
      x: {min: coords.x, max: x},
      y: {min: coords.y, max: y}
    }

    motionBox.x.min = Math.min(motionBox.x.min, x)
    motionBox.x.max = Math.max(motionBox.x.max, x)
    motionBox.y.min = Math.min(motionBox.y.min, y)
    motionBox.y.max = Math.max(motionBox.y.max, y)

    return motionBox
  }

  function calculateMotionPixels(motionPixels, x, y, pixelDiff) {
    motionPixels[x] = motionPixels[x] || []
    motionPixels[x][y] = true

    return motionPixels
  }

  function getCaptureUrl(captureImageData) {
    // may as well borrow captureCanvas
    captureContext.putImageData(captureImageData, 0, 0)
    return captureCanvas.toDataURL()
  }

  function checkMotionPixel(motionPixels, x, y) {
    return motionPixels && motionPixels[x] && motionPixels[x][y]
  }

  function getPixelDiffThreshold() {
    return pixelDiffThreshold
  }

  function setPixelDiffThreshold(val) {
    pixelDiffThreshold = val
  }

  function getScoreThreshold() {
    return scoreThreshold
  }

  function setScoreThreshold(val) {
    scoreThreshold = val
  }
})()
