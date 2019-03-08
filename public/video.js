;(function() {
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
    .catch(function(err) {
      console.log(err.name + ':' + err.message)
    })
})()
