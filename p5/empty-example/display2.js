/** Version 1, ForcePoints **/
// In this model, points of force compete to transform the grid.

var myCanvas;

// GRID
var maxGridWidth = 600,
    maxGridHeight = 400;

var gridWidth = maxGridWidth,
    gridHeight = maxGridHeight,
    gridInterval = 12,
    offsetX, // translate x to center grid in canvas
    offsetY, // translate y to center grid in canvas
    i_max, // Low-res grid width (x)
    j_max; // Low-res grid height (y)

// FORCES
var forceFactorMin = 100,
    forceFactorMax = 409600;

var parameterThreshold = 0.001;

function ForcePoint(center, forceFactor, forceExp, forceIntensity, type) {
  this.center = center;                 // central point as p5.vector
  this.forceFactor = forceFactor,       // horizontal stretch of exponential curve
  this.forceExp = forceExp,             // exponent of exponential curve
  this.forceIntensity = forceIntensity,
  this.type = type;                     // "CONTRACTING" or "EXPANDING"
  this.hover = false;
}

var forcePoints = []; // array of forcePoints. [0] is reserved for cursorPoint
var cursorPoint; // forcePoint corresponding to active cursor
var skipCursorCompute; // boolean: if true, skip cursor in deformGrid computation

// Array of deformedGrid points
var deformedGridPoints = [];


var img_L, img_S;
function preload() {
  img_L = loadImage('bliss.png');
  img_S = loadImage('bliss.png');
  img_S.loadPixels();
}

function setup() {
  myCanvas = createCanvas(1000, 800);
  myCanvas.parent('canvas-container');
  
//  var fileInput = createFileInput(handleFile);
//  fileInput.parent('menu-left');
//  fileInput.class('menu-option menu-button');
  
  // Resize image to fill out alloted grid area.
  if (img_L.width >= img_L.height) {
    img_L.resize(maxGridWidth, 0); // Resize image to fill out width, keeping proportions.
    gridHeight = img_L.height;
    img_S.resize(maxGridWidth/gridInterval, 0);
  } else {
    img_L.resize(0, maxGridHeight); // Resize image to fill out height, keeping proportions.
    gridWidth = img_L.width;
    img_S.resize(0, maxGridHeight/gridInterval);
  }
  
  adjustOffsets();
  
  // Set index maximums for low-res grid
  i_max = gridWidth / gridInterval;
  j_max = gridHeight / gridInterval;
  
  var forceOrigin = createVector(300, 300);
  forcePoints.push(new ForcePoint(forceOrigin, 6400, -40, 12, "CONTRACTING"));
  cursorPoint = forcePoints[0];
  
//  noLoop();
}

function draw() {
  background(255);
  curveTightness(0);
  angleMode(DEGREES);
  noFill();
  strokeWeight(0.5);
  
  // Register mouse position
  var mousePos = createVector(mouseX, mouseY);
  mousePos.sub(offsetX, offsetY);
  cursorPoint.center = mousePos;
  
  // Center
  push();
  translate(offsetX, offsetY);
  
  // Calculate deformations
  skipCursor = window.ev ? 0 : 1; // if mouse is inside canvas, include cursor force. otherwise, skip.
  computeDeformedGrid();
  
  // Draw distorted grid
  if (menu_toggles.deformGrid.parameter && !menu_toggles.image.parameter) {
    stroke('#78B6E3'); // Blue
    drawDeformedGrid();
  }
  
  if (menu_toggles.image.parameter) {
    drawImageOnDeformedGrid();
  }
  
  // Draw normative grid
  if (menu_toggles.baseGrid.parameter) {
    stroke(250, 116, 98, 100); // Orange 50%
    drawNormGrid();
  }
  
  // Draw distortion points
  if (menu_toggles.forces.parameter) {
    drawForcePoints();
  }
  
  pop();  
}

// readjusts offsets to center grid
function adjustOffsets() {
  offsetX = (width - gridWidth)/2;
  offsetY = (height - gridHeight)/2;
}

function drawForcePoint(fp) {
  push();
  translate(fp.center.x, fp.center.y);
  var numLines = -2 * fp.forceExp;
    var radius = fp.forceFactor / 64;
    for (var j = 0; j < numLines; j++) {
      var angle = (j / numLines)*360;
      push();
      rotate(angle);
      line(0, -radius, 0, radius);
      pop();
    }
  pop();
}

// Draws force points. Handles hover states.
function drawForcePoints() {
  var showCursor = true;
  stroke("#000000");
  strokeWeight(0.1);
  
  for (var i = 1; i < forcePoints.length; i++) {
    // Check if hovering over fixed forcePoint
    var current = forcePoints[i];
    if (abs(mouseX-offsetX - current.center.x) < 10 && abs(mouseY-offsetY - current.center.y) < 10) {
//      current.hover = true;
      
      stroke("#ff0000"); // color red.
      if (mouseIsPressed)
        strokeWeight(0.5);
      showCursor = false;
    } else { // Not hovering
//      current.hover = false;
      strokeWeight(0.1);
      stroke("#000000");
    }
    drawForcePoint(current)
  }
  
  if (showCursor && window.ev) {
    if (mouseIsPressed)
      strokeWeight(0.5);
    drawForcePoint(forcePoints[0]);
  }
}


// Computes deformed grid points from force points
function computeDeformedGrid() {
  // Vertical Lines
  var i = 0;
  for (var x = 0; x <= gridWidth; x+= gridInterval, i++) {
    var row = [];
    var y;
    var j = 0;
    for (y = 0; y <= gridHeight; y += gridInterval, j++) {
      if (forcePoints.length == 1 && !window.ev) {
        row.push(createVector(x, y));
        continue;
      }

      // Contracting: Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp

      // A collection of versions of the same normGridPoint, with each one displaced by a different forcePoint
      var displacements = [];

      // Calculate each displacement
      for (var k = skipCursor; k < forcePoints.length; k++) {
        var fp = forcePoints[k];
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
      for (var k = 0; k < displacements.length; k++) {
        var displacement = displacements[k];
        xSum += displacement.x;
        ySum += displacement.y;
      }
      var morphGridPoint = createVector(x, y);
      morphGridPoint.x = xSum / (displacements.length);
      morphGridPoint.y = ySum / (displacements.length);
      row.push(morphGridPoint);
    }
    deformedGridPoints[i] = row;
  }
}


// Draws grid displaced by force points
function drawDeformedGrid() {
  // Vertical Lines
  for (var i = 0; i <= i_max; i++) {
    beginShape();
    var first = deformedGridPoints[i][0];
    curveVertex(first.x, first.y); // beginning control point
    var j = 0;
    for (j = 0; j <= j_max; j++) {
      var current = deformedGridPoints[i][j];
      curveVertex(current.x, current.y);
    }
    var last = deformedGridPoints[i][j-1];
    curveVertex(last.x, last.y);
    endShape();
  }
  
  // Horizontal Lines
  for (var j = 0; j <= j_max; j++) {
    beginShape();
    var first = deformedGridPoints[0][j];
    curveVertex(first.x, first.y);
    var i = 0;
    for (i = 0; i <= i_max; i++) {
      var current = deformedGridPoints[i][j];
      curveVertex(current.x, current.y);
    }
    var last = deformedGridPoints[i-1][j];
    curveVertex(last.x, last.y);
    endShape();
  }
}

function drawImageOnDeformedGrid() {
  for (var i = 0; i <= i_max - 1; i++) {
    for (var j = 0; j <= j_max - 1; j++) {
      noStroke();
      var pixelIndex = (i + j * i_max) * 4,
          pixel_r = img_S.pixels[pixelIndex],
          pixel_g = img_S.pixels[pixelIndex+1],
          pixel_b = img_S.pixels[pixelIndex+2];
      stroke(pixel_r, pixel_g, pixel_b);
      fill(pixel_r, pixel_g, pixel_b);
      quad(
        deformedGridPoints[i][j].x, deformedGridPoints[i][j].y,
        deformedGridPoints[i][j+1].x, deformedGridPoints[i][j+1].y,
        deformedGridPoints[i+1][j+1].x, deformedGridPoints[i+1][j+1].y,
        deformedGridPoints[i+1][j].x, deformedGridPoints[i+1][j].y);
    }
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