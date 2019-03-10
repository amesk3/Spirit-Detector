/* eslint-disable complexity */
/* eslint-disable max-statements */
var DiffCamEngine = (function() {
  var stream // stream obtained from webcam
  var video // shows stream
  var captureCanvas // internal canvas for capturing full images from video
  var captureContext // context for capture canvas
  var diffCanvas // internal canvas for diffing downscaled captures
  var diffContext // context for diff canvas
  var motionCanvas // receives processed diff images
  var motionContext // context for motion canvas

  var soundContext
  var bufferLoader
  var setNoteReady
  var notes = []

  var initSuccessCallback // called when init succeeds
  var initErrorCallback // called when init fails
  var startCompleteCallback // called when start is complete
  var captureCallback // called when an image has been captured and diffed

  var captureInterval // interval for continuous captures
  var captureIntervalTime // time between captures, in ms
  var captureWidth // full captured image width
  var captureHeight // full captured image height
  var diffWidth // downscaled width for diff/motion
  var diffHeight // downscaled height for diff/motion
  var isReadyToDiff // has a previous capture been made to diff against?
  var pixelDiffThreshold // min for a pixel to be considered significant
  var scoreThreshold // min for an image to be considered significant
  var includeMotionBox // flag to calculate and draw motion bounding box
  var includeMotionPixels // flag to create object denoting pixels with motion

  var lastImageData
  var canvasSource = document.createElement('canvas')
  document.getElementById('canvas-source').appendChild(canvasSource)
  var canvasBlended = document.createElement('canvas')
  document.getElementById('canvas-blended').appendChild(canvasBlended)
  console.log('canvasBlended', canvasBlended)

  var contextSource = canvasSource.getContext('2d')
  var contextBlended = canvasBlended.getContext('2d')
  contextBlended.canvas.naturalWidth = 800
  contextBlended.canvas.naturalHeight = 600
  contextBlended.canvas.width = contextBlended.canvas.naturalWidth
  contextBlended.canvas.height = contextBlended.canvas.naturalHeight
  console.log('contezxtblended', contextBlended)

  const audio = new Audio('/sounds/note2.mp3')

  function init(options) {
    console.log('INIT?')
    // sanity check
    if (!options) {
      throw 'No options object provided'
    }

    // incoming options with defaults
    video = options.video || document.createElement('video')
    video.width = 800
    video.height = 600
    motionCanvas = options.motionCanvas || document.createElement('canvas')
    captureIntervalTime = options.captureIntervalTime || 100
    captureWidth = options.captureWidth || 800
    captureHeight = options.captureHeight || 600
    diffWidth = options.diffWidth || 800
    diffHeight = options.diffHeight || 600
    pixelDiffThreshold = options.pixelDiffThreshold || 32
    scoreThreshold = options.scoreThreshold || 16
    includeMotionBox = options.includeMotionBox || false
    includeMotionPixels = options.includeMotionPixels || false

    // callbacks
    initSuccessCallback = options.initSuccessCallback || function() {}
    initErrorCallback = options.initErrorCallback || function() {}
    startCompleteCallback = options.startCompleteCallback || function() {}
    captureCallback = options.captureCallback || function() {}

    // non-configurable
    captureCanvas = document.createElement('canvas')
    diffCanvas = document.createElement('canvas')
    document.getElementById('newCanvas').appendChild(diffCanvas)
    isReadyToDiff = false

    // prep video
    video.autoplay = true

    // prep capture canvas
    captureCanvas.width = captureWidth
    captureCanvas.height = captureHeight
    captureContext = captureCanvas.getContext('2d')

    // prep diff canvas
    diffCanvas.width = diffWidth
    diffCanvas.height = diffHeight
    diffContext = diffCanvas.getContext('2d')

    // prep motion canvas
    motionCanvas.width = diffWidth
    motionCanvas.height = diffHeight
    motionContext = motionCanvas.getContext('2d')

    requestWebcam()
    initialize()
  }

  var webcamError = function(e) {
    alert('Webcam error!', e)
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
      video.srcObject = stream
      initialize()
    }, webcamError)
  } else if (navigator.getUserMedia) {
    navigator.getUserMedia(
      {video: true},
      function(stream) {
        video.srcObject = stream
        initialize()
      },
      webcamError
    )
  } else if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia(
      {video: true},
      function(stream) {
        video.srcObject = window.webkitURL.createObjectURL(stream)
        initialize()
      },
      webcamError
    )
  } else {
    //video.src = 'somevideo.webm'; // fallback.
  }
  // mirror video
  contextSource.translate(canvasSource.width, 0)
  contextSource.scale(-1, 1)

  function requestWebcam() {
    var constraints = {
      audio: true,
      video: {width: captureWidth, height: captureHeight}
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(initSuccess)
      .catch(initError)
  }

  function initSuccess(requestedStream) {
    stream = requestedStream
    initSuccessCallback()
  }

  function initError(error) {
    console.log(error)
    initErrorCallback()
  }

  function start() {
    // if (!stream) {
    console.log(stream, 'stream')
    //   throw 'Cannot start after init fail'
    // }

    // streaming takes a moment to start
    video.addEventListener('canplay', startComplete)
    video.srcObject = stream

    update()
  }

  function update() {
    drawVideo()
    // blend()
    // checkAreas()
    // requestAnimFrame(update);
    //		timeOut = setTimeout(update, 1000/60);
  }

  function drawVideo() {
    console.log('drawing video', video.width, video.height)
    contextSource.drawImage(video, 0, 0, video.width, video.height)
  }

  function startComplete() {
    video.removeEventListener('canplay', startComplete)
    captureInterval = setInterval(capture, captureIntervalTime)
    startCompleteCallback()
  }

  function stop() {
    clearInterval(captureInterval)
    video.src = ''
    motionContext.clearRect(0, 0, diffWidth, diffHeight)
    isReadyToDiff = false
  }

  function capture() {
    // save a full-sized copy of capture
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
          console.log(motionBox, 'MOTION BOX')
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

    if (score > 3000) {
      audio.play()
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

  function initialize() {
    if (!AudioContext) {
      alert('AudioContext not supported!')
    } else {
      loadSounds()
      // checkAreas()
    }
  }

  function BufferLoader(context, urlList, callback) {
    this.context = context
    this.urlList = urlList
    this.onload = callback
    this.bufferList = new Array()
    this.loadCount = 0
  }

  BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    var loader = this

    request.onload = function() {
      // Asynchronously decode the audio file data in request.response
      loader.context.decodeAudioData(
        request.response,
        function(buffer) {
          if (!buffer) {
            alert('error decoding file data: ' + url)
            return
          }
          loader.bufferList[index] = buffer
          if (++loader.loadCount == loader.urlList.length)
            loader.onload(loader.bufferList)
        },
        function(error) {
          console.error('decodeAudioData error', error)
        }
      )
    }

    request.onerror = function() {
      alert('BufferLoader: XHR error')
    }

    request.send()
  }

  BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
      this.loadBuffer(this.urlList[i], i)
  }

  function loadSounds() {
    console.log('hit loadsounds')

    soundContext = new AudioContext()

    bufferLoader = new BufferLoader(
      soundContext,
      [
        'sounds/note1.mp3',
        'sounds/note2.mp3',
        'sounds/note3.mp3',
        'sounds/note4.mp3',
        'sounds/note5.mp3',
        'sounds/note6.mp3',
        'sounds/note7.mp3',
        'sounds/note8.mp3'
      ],
      finishedLoading
    )
    bufferLoader.load()
  }

  function finishedLoading(bufferList) {
    for (var i = 0; i < 8; i++) {
      var source = soundContext.createBufferSource()
      source.buffer = bufferList[i]
      source.connect(soundContext.destination)
      var note = {
        note: source,
        ready: true
      }
      notes.push(note)
      // console.log('updated NOTES', typeof notes, notes.length)
    }

    start()
  }

  // function blend() {
  //   var width = canvasSource.width
  //   var height = canvasSource.height
  //   // get webcam image data
  //   var sourceData = contextSource.getImageData(0, 0, width, height)
  //   // create an image if the previous image doesn’t exist
  //   if (!lastImageData)
  //     lastImageData = contextSource.getImageData(0, 0, width, height)
  //   // create a ImageData instance to receive the blended result
  //   var blendedData = contextSource.createImageData(width, height)
  //   // blend the 2 images
  //   differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data)
  //   // draw the result in a canvas
  //   contextBlended.putImageData(blendedData, 0, 0)
  //   console.log('contextblended', contextBlended)
  //   // store the current webcam image
  //   lastImageData = sourceData
  // }

  // function threshold(value) {
  //   return value > 0x15 ? 0xff : 0
  // }

  // function fastAbs(value) {
  //   return (value ^ (value >> 31)) - (value >> 31)
  // }

  // function differenceAccuracy(target, data1, data2) {
  //   if (data1.length != data2.length) return null
  //   var i = 0
  //   while (i < data1.length * 0.25) {
  //     var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3
  //     var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3
  //     var diff = threshold(fastAbs(average1 - average2))
  //     target[4 * i] = diff
  //     target[4 * i + 1] = diff
  //     target[4 * i + 2] = diff
  //     target[4 * i + 3] = 0xff
  //     ++i
  //   }
  // }

  // // function checkAreas() {
  // //   console.log('checkareas check')

  // //   // let motionData = motionContext.getImageData(0, 0, 32, 32)
  // //   var blendedData = contextBlended.getImageData(0, 0, 100, 100)
  // //   // let diffData = diffContext.getImageData(0, 0, 32, 32)
  // //   console.log('diffdata', diffData)

  // //   let i = 0
  // //   let average = 0
  // //   //loop over pixels
  // //   while (i < diffData.data.length * 0.25) {
  // //     //make an average between the color channel
  // //     average +=
  // //       (diffData.data[i * 4] +
  // //         diffData.data[i * 4 + 1] +
  // //         diffData.data[i * 4 * 2]) /
  // //       3
  // //     console.log('average', average)
  // //     ++i
  // //   }
  // //   //calculate an average between of the color values of the note area
  // //   average = Math.round(average / (diffData.data.length * 0.25))
  // //   //over a small limit, consider that a movement is detected
  // //   //play a note and show a visual feedback to the user
  // //   if (average > 10) {
  // //     // console.log('notesR', notes)
  // //     // playSound()
  // //     audio.pause()
  // //     audio.currentTime = 0
  // //     audio.play()
  // //     // }
  // //     // playSound()
  // //     // if (!notes[r].visual.is(':animated')) {
  // //     //   notes[r].visual.css({opacity: 1})
  // //     //   notes[r].visual.animate({opacity: 0}, 700)
  // //   }
  // // }
  // function checkAreas() {
  //   // loop over the note areas
  //   for (var r = 0; r < 8; ++r) {
  //     // console.log('motionContext bottom', motionContext)
  //     // console.log(video.width, 'vid')
  //     var blendedData = diffContext.getImageData(
  //       // console.log('blendeddata', blendedData)
  //       1 / 8 * r * video.width,
  //       0,
  //       video.width / 8,
  //       100
  //     )
  //     // console.log('blendeddata', blendedData)
  //     var i = 0
  //     var average = 0
  //     // loop over the pixels
  //     while (i < blendedData.data.length * 0.25) {
  //       // console.log('hitting while')
  //       // make an average between the color channel
  //       average +=
  //         (blendedData.data[i * 4] +
  //           blendedData.data[i * 4 + 1] +
  //           blendedData.data[i * 4 + 2]) /
  //         3
  //       ++i
  //       console.log('average', average)
  //     }
  //     // calculate an average between of the color values of the note area
  //     average = Math.round(average / (blendedData.data.length * 0.25))
  //     if (average > 10) {
  //       console.log('above avg')
  //       // over a small limit, consider that a movement is detected
  //       // play a note and show a visual feedback to the user
  //       console.log(notes, ' notes')
  //       playSound(notes[r])
  //       //				notes[r].visual.show();
  //       //				notes[r].visual.fadeOut();
  //     }
  //   }
  // }

  function playSound(obj) {
    console.log('playing sounds check', obj, 'obj')
    // if (!obj.ready) return
    var source = soundContext.createBufferSource()
    // console.log('note', note, 'OBJ', obj.note)
    console.log('source.buffer', source.buffer)
    source.buffer = obj.note.buffer
    source.connect(soundContext.destination)
    source.start(0)
    obj.ready = false
    // throttle the note
    setTimeout(setNoteReady, 400, obj)
  }

  return {
    // public getters/setters
    getPixelDiffThreshold: getPixelDiffThreshold,
    setPixelDiffThreshold: setPixelDiffThreshold,
    getScoreThreshold: getScoreThreshold,
    setScoreThreshold: setScoreThreshold,

    // public functions
    init: init,
    start: start,
    stop: stop
  }
})()
