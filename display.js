/** Version 1, ForcePoints **/
// In this model, points of force compete to transform the grid.

// GRID
var gridWidth = 600,
    gridHeight = 400,
    gridInterval = 12;

// FORCES
var parameterThreshold = 0.001;

function ForcePoint(center, forceFactor, forceExp, forceIntensity, type) {
  this.center = center;                 // central point as p5.vector
  this.forceFactor = forceFactor,       // horizontal stretch of exponential curve
  this.forceExp = forceExp,             // exponent of exponential curve
  this.forceIntensity = forceIntensity,
  this.type = type;                     // "CONTRACTING" or "EXPANDING"
}

// Array of ForcePoints.
// [0] is reserved for cursor point
var forcePoints = [];
var cursorPoint;


var myImg;
function preload() {
  myImg = loadImage('bliss.png');
}

function setup() {
  var myCanvas = createCanvas(1000, 800);
  myCanvas.parent('canvas-container');
  
  var origin = createVector(0, 0);
  forcePoints.push(new ForcePoint(origin, 1600, -40, 12, "CONTRACTING"));
  cursorPoint = forcePoints[0];
  noFill();
}

function draw() {
  // Reset canvas
//  clear();
//  image(img, 0, 0);
//  console.log(myImg);
  background(255);
  
  image(myImg, 200, 200, 300, 241);
  curveTightness(0);
  angleMode(DEGREES);
  
  // Mouse position update
  var mousePos = createVector(mouseX, mouseY);
  mousePos.sub(200, 200);
  cursorPoint.center = mousePos;
  
  // Centered...
  push();
  translate(200, 200);
  
  // Draw normative grid
  stroke(250, 116, 98, 100);
  strokeWeight(0.5);
  drawNormGrid();
  
  // Draw distorted grid
  stroke('#78B6E3'); // Jordy Blue
  drawMorphGrid();
  
  // Draw distortion points
  drawPoints();
  
//  strokeWeight(4.0);
//  for (var i = 0; i < forcePoints.length; i++) {
//    point(forcePoints[i].center.x, forcePoints[i].center.y);
//  }
  pop();
  
  
}

// Draws force points
function drawPoints() {
  stroke("#000000");
  strokeWeight(0.05);
  
  var skipCursor = window.ev ? 0 : 1;
  for (var i = skipCursor; i < forcePoints.length; i++) {
    var current = forcePoints[i];
    push();
    translate(current.center.x, current.center.y);
    
    var numLines = -2 * current.forceExp;
    var radius = current.forceFactor / 64;
    for (var j = 0; j < numLines; j++) {
      var angle = (j / numLines)*360;
      push();
      rotate(angle);
      line(0, -radius, 0, radius);
      pop();
    }
    
    pop();
  }
}

// Draws grid displaced by force points
function drawMorphGrid() {
  
  // Vertical Lines
  for (var x = 0; x <= gridWidth; x+= gridInterval) {
    beginShape();
    var y;
    curveVertex(x, 0); // beginning control point
    for (y = 0; y <= gridHeight; y += gridInterval) {
      var morphGridPoint = createVector(x, y);

      // Contracting: Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp

      // A collection of versions of the same normGridPoint, with each one displaced by a different forcePoint
      var displacements = [];

      // Calculate each displacement
      var skipCursor = window.ev ? 0 : 1; // if mouse is inside canvas, include cursor force. otherwise, skip.
      for (var i = skipCursor; i < forcePoints.length; i++) {
        var fp = forcePoints[i];
        var displacedPoint = createVector(x, y);
        var distanceToFP = p5.Vector.dist(fp.center, displacedPoint);
        var a = pow(distanceToFP/fp.forceFactor + 1, fp.forceExp);
        if (a > parameterThreshold) {
          var parametrizedCenter = fp.center.copy().mult(a);
          displacedPoint.mult(1.0 - a).add(parametrizedCenter);
        }
        displacements.push(displacedPoint);
      }

      // Average the displacements to receive final morphGridPoint
      var xSum = 0, ySum = 0;
      for (var i = 0; i < displacements.length; i++) {
        var displacement = displacements[i];
        xSum += displacement.x;
        ySum += displacement.y;
      }
      // Accounts for original grid points
//      xSum += x;
//      ySum += y;
//      morphGridPoint.x = xSum / (displacements.length + 1);
//      morphGridPoint.y = ySum / (displacements.length + 1);
      morphGridPoint.x = xSum / (displacements.length);
      morphGridPoint.y = ySum / (displacements.length);
      curveVertex(morphGridPoint.x, morphGridPoint.y);
    }
    curveVertex(x, y - gridInterval); // end control point
    endShape();
  }
  
  
  // Horizontal Lines
  for (var y = 0; y <= gridHeight; y+= gridInterval) {
    beginShape();
    var x;
    curveVertex(0, y); // beginning control point
    for (x = 0; x <= gridWidth; x += gridInterval) {
      var morphGridPoint = createVector(x, y);

      // Contracting: Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp

      // A collection of versions of the same normGridPoint, with each one displaced by a different forcePoint
      var displacements = [];

      // Calculate each displacement
      var skipCursor = window.ev ? 0 : 1; // if mouse is inside canvas, include cursor force. otherwise, skip.
      for (var i = skipCursor; i < forcePoints.length; i++) {
        var fp = forcePoints[i];
        var displacedPoint = createVector(x, y);
        var distanceToFP = p5.Vector.dist(fp.center, displacedPoint);
        var a = pow(distanceToFP/fp.forceFactor + 1, fp.forceExp);
        if (a > parameterThreshold) {
          var parametrizedCenter = fp.center.copy().mult(a);
          displacedPoint.mult(1.0 - a).add(parametrizedCenter);
        }
        displacements.push(displacedPoint);
      }

      // Average the displacements to receive final morphGridPoint
      var xSum = 0, ySum = 0;
      for (var i = 0; i < displacements.length; i++) {
        var displacement = displacements[i];
        xSum += displacement.x;
        ySum += displacement.y;
      }
      // Accounts for original grid points
//      xSum += x;
//      ySum += y;
//      morphGridPoint.x = xSum / (displacements.length + 1);
//      morphGridPoint.y = ySum / (displacements.length + 1);
      morphGridPoint.x = xSum / (displacements.length);
      morphGridPoint.y = ySum / (displacements.length);
      curveVertex(morphGridPoint.x, morphGridPoint.y);
    }
    curveVertex(x - gridInterval, y); // end control point
    endShape();
  }
  
  
}

// Draws normative grid before displacement
function drawNormGrid() {
  
  // Vertical Lines
  for (var x = 0; x <= gridWidth; x+= gridInterval) {
    beginShape();
    var y;
    curveVertex(x, 0); // beginning control point
    for (y = 0; y <= gridHeight; y+= gridInterval) {
      var myVector = createVector(x, y);
      curveVertex(myVector.x, myVector.y);
    }
    curveVertex(x, y - gridInterval); // end control point
    endShape();
  }
  
  // Horizontal Lines
  for (var y = 0; y <= gridHeight; y+= gridInterval) {
    beginShape();
    var x;
    curveVertex(0, y); // beginning control point
    for (x = 0; x <= gridWidth; x+= gridInterval) {
      var myVector = createVector(x, y);
      curveVertex(myVector.x, myVector.y);
    }
    curveVertex(x - gridInterval, y); // end control point
    endShape();
  }
}