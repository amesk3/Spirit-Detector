/* eslint-disable complexity */
var video
var hidden_ctx
var showBgImg = false
var showVideo = false

// allows me global access to canvas and it’s width and height properties
var w, h
var width = 1182
var height = 997
var canvas

function createHiddenCanvas(canvas_name) {
  var ctx = createCanvas(canvas_name)
  canvas.style.left = -w + 'px'
  return ctx
}

// this enables me to have many canvases
// positioned on top of each other at 100% width and height of page
function resize() {
  var c = document.getElementsByTagName('canvas')
  width = w = window.innerWidth
  height = h = window.innerHeight
  for (var i = 0; i < c.length; i++) {
    c[i].width = width
    c[i].height = height
  }
  console.log('resize: ' + w + ':' + h)
}

function createCanvas(canvas_name) {
  canvas = document.createElement('canvas')
  var body = document.querySelector('body')
  canvas.setAttribute('id', canvas_name)
  canvas.style.position = 'absolute'
  canvas.style.left = '0px'
  canvas.style.top = '0px'
  body.appendChild(canvas)
  var ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize, false)
  return ctx
}

//create DDR buttons
function blocks() {
  var c = document.getElementById('canvas')
  var ctx = c.getContext('2d')
  ctx.fillStyle = '#FF0000'
  ctx.fillRect(20, 20, 150, 100)
}
// blocks()

document.addEventListener('DOMContentLoaded', function() {
  hidden_ctx = createHiddenCanvas('hidden_canvas')
  video = document.createElement('video')
  document.body.appendChild(video)

  video.autoplay = true
  video.loop = true
  video.setAttribute('id', 'videoOutput')
  video.setAttribute('style', 'float:left;')
  video.width = 1600 //change video display size
  video.height = 800

  // check if browser supports getUserMedia - yes we are looking at you Safari!
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL

  if (navigator.getUserMedia) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('enumerateDevices() not supported.')
      return
    }

    // List cameras and microphones.

    navigator.mediaDevices
      .enumerateDevices()
      .then(function(devices) {
        gotSources(devices)
      })
      .catch(function(err) {
        console.log(err.name + ': ' + err.message)
      })
  }

  //CHOOSE WHICH CAMERA TO USE

  function setupCamera(cameras) {
    //console.log(cameras)

    //var videoSource = cameras[cameras.length-1].id;
    var videoSource = cameras[0].id

    var constraints = {
      // audio: {
      //   optional: [{
      //     sourceId: audioSource
      //   }]
      // },
      video: {
        optional: [
          {
            sourceId: videoSource
          }
        ]
      }
    }

    navigator.getUserMedia(constraints, successCallback, errorCallback)
  }

  function successCallback(stream) {
    console.log('successCallback hitting', video.captureStream)
    if (video.captureStream) {
      console.log('IN THIS', stream)
      video.captureStream = stream
      video.srcObject = stream
    } else {
      video.src = (window.URL && window.URL.createObjectURL(stream)) || stream
    }
    // console.log('video should play', video.srcObject)

    video.play()
    this.video = video
  }

  function errorCallback(error) {
    error('Unable to get webcam stream.')
  }

  // hacky loop to make sure video is streaming

  video.addEventListener(
    'loadeddata',
    function() {
      var attempts = 50
      function checkVideo() {
        if (attempts > 0) {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            video.available = true
          } else {
            // Wait a bit and try again
            window.setTimeout(checkVideo, 100)
          }
        } else {
          // Give up after 10 attempts
          alert('Unable to play video stream. Is webcam working?')
        }

        attempts--
      }

      checkVideo()
    },
    false
  )

  function gotSources(devices) {
    var cameras = []

    devices.forEach(function(device) {
      // console.log(device.kind + ": " + device.label + " id = " + device.deviceId);

      if (device.kind === 'videoinput') {
        //console.log(device.deviceId);
        cameras.push(device)
      }
    })

    setupCamera(cameras)
  }
})
