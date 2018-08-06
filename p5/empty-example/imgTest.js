var img;
function preload() {
  img = loadImage('bliss.png');
}
function setup() {
  createCanvas(600, 600);
  background(255);
  image(img, 0, 0);
  
}