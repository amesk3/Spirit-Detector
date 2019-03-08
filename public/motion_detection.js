// import QuickSettings from './quicksettings.min'
// var settings = QuickSettings.create()

// function createCanvas(canvas_name) {
//   canvas = document.createElement('canvas')
//   var body = document.querySelector('body')
//   canvas.setAttribute('id', canvas_name)
//   canvas.style.position = 'absolute'
//   canvas.style.left = '0px'
//   canvas.style.top = '0px'
//   body.appendChild(canvas)
//   var ctx = canvas.getContext('2d')
//   resize()
//   window.addEventListener('resize', resize, false)
//   return ctx
// }

// var old = []
// var threshold = 50
// var sample_size = 50
// var scalefactor = 1
// function motionDetection() {
//   console.log('hitting motion detection')
//   var motion = []
//   var ctx = createCanvas('canvas1')
//   // draw the video and get its pixels
//   ctx.drawImage(video, 0, 0, video.width, video.height)
//   var data = ctx.getImageData(0, 0, video.width, video.height).data
//   // we can now loop over all the pixels of the video
//   for (var y = 0; y < video.height; y++) {
//     for (var x = 0; x < video.width; x++) {
//       var pos = (x + y * video.width) * 4
//       var r = data[pos]
//       var g = data[pos + 1]
//       var b = data[pos + 2]
//       if (old[pos] && Math.abs(old[pos].red - r) > threshold) {
//         // push the x, y and rgb values into the motion array
//         // but multiply the x and y values bck up by scalefactor
//         // to get their actual screen position
//         motion.push({x: x * scalefactor, y: y * scalefactor, r: r, g: g, b: b})
//       }
//       old[pos] = {red: r, green: g, blue: b}
//     }
//   }

//   return motion
// }

// // motionDetection()
