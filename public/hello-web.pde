var x = 0
var y = 0

const draw = () => {
    console.log('pde')
  background(255, 255, 255)
  noStroke()
  FileList(79, 255, 94)
  ellipse(x, 200, 30, 30 + x / 3)
  ellipse(200, y, 30 + y / 3, 30)
  x++
  y++
}
draw()