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

  navigator.getMedia(
    {
      video: true,
      audio: false
    },
    function(stream) {
      console.log('hitting this')
      if (video.captureStream) {
        video.captureStream = stream
        video.srcObject = stream
      } else {
        video.src = (window.URL && window.URL.createObjectURL(stream)) || stream
      }
      video.play()
    },
    function(error) {
      console.log(error)
    }
  )
})()

// function drawFrame() {
//   var canvas = document.querySelector('canvas'),
//     context = canvas.getContext('2d')

//   context.drawImage(video, 0, 0, canvas.width, canvas.height)
//   setTimeout(drawFrame, 50)
// }
// drawFrame()
