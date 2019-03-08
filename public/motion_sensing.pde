// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/QLHMtE5XsMs



// let capture;

// let prev;

// let threshold = 25;

// let motionX = 0;
// let motionY = 0;

// let lerpX = 0;
// let lerpY = 0;


// function setup() {
//   createCanvas(640, 360);
//   let cameras = Capture.list();
//   printArray(cameras);
//   let video = new Capture(this, cameras[3]);
//   video.start();
//   prev = createImage(640, 360, RGB);
//   // Start off tracking for red
// }

let capture;

function setup() {
  createCanvas(390, 240);
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  //capture.hide();
}

function draw() {
  background(255);
  image(capture, 0, 0, 320, 240);
  filter('INVERT');
}
