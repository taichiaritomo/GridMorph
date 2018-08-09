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
var forceFactorMin = 1,
    forceFactorMax = 4096;
var parameterThreshold = 0.001; // minimum interpolation parameter for calculations
var algorithm = "SEQUENTIAL";

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
var showCursor = true;
var skipCursorCompute = false; // boolean: if true, skip cursor in deformGrid computation

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
  forcePoints.push(new ForcePoint(forceOrigin, 128, -2, 12, "CONTRACTING"));
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
  
  showCursor = window.ev;
  
  // Check forcePointHover
  checkForcePointHover();
  
  // Calculate deformations
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

// Readjusts offsets to center grid.
// Also adjusts forcePoint centers.
function adjustOffsets() {
  var newOffsetX = (width - gridWidth)/2;
  var newOffsetY = (height - gridHeight)/2;
  
  for (var i = 1; i < forcePoints.length; i++) {
    var current = forcePoints[i];
    current.center.x += (offsetX - newOffsetX);
    current.center.y += (offsetY - newOffsetY);
  }
  
  offsetX = newOffsetX;
  offsetY = newOffsetY;
}

function drawForcePoint(fp) {
  push();
  translate(fp.center.x, fp.center.y);
  var numLines = -48 * fp.forceExp;
    var radius = 0.8 * fp.forceFactor;
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
  // Draw fixed forces
  for (var i = 1; i < forcePoints.length; i++) {
    // Check if hovering over fixed forcePoint
    var current = forcePoints[i];
    if (current.hover) {
      stroke("#ff0000");
      if (mouseIsPressed) strokeWeight(0.5);
    } else {
      strokeWeight(0.1);
      stroke("#000000");
    }
    drawForcePoint(current)
  }
  
  // Draw cursor force
  if (showCursor) {
    stroke("#000000");
    strokeWeight(mouseIsPressed ? 0.5 : 0.1); // emphasize mouseDown
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
      // Contracting: Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp
      if (algorithm == "SIMULTANEOUS") {
        // Simultaneous-Displacement Algorithm
        // Adds displacement vectors
        var totalDisplacement = createVector(0,0);
        // Calculate displacement from each force point
        var initialIndex = window.ev ? 0 : 1;
        for (var k = initialIndex; k < forcePoints.length; k++) {
          var fp = forcePoints[k];
          if (fp.hover) continue;
          var baseGridPoint = createVector(x, y);
//          var distanceToFP = distApprox(fp.center, baseGridPoint);
          var distanceToFP = p5.Vector.dist(fp.center, baseGridPoint);
          var parameter = pow(distanceToFP/fp.forceFactor + 1, fp.forceExp);
//          var parameter = parametricGravityFunction(distanceToFP, fp.forceFactor);
          if (parameter > parameterThreshold) {
            var displacedPoint = p5.Vector.lerp(baseGridPoint, fp.center, parameter);
            var displacement = p5.Vector.sub(displacedPoint, baseGridPoint);
            totalDisplacement.add(displacement);
          }
        }
        var morphGridPoint = createVector(x, y).add(totalDisplacement);
        row.push(morphGridPoint);
      } else if (algorithm == "SEQUENTIAL") {
        // Sequential-Displacement Algorithm
        // Interpolates displaced points one by one
        var displacedPoint = createVector(x, y);
        var initialIndex = 1;
        for (var k = initialIndex; k < forcePoints.length; k++) { 
          var fp = forcePoints[k];
          if (fp.hover) continue;
//          var distanceToFP = distApprox(fp.center, displacedPoint);
          var distanceToFP = p5.Vector.dist(fp.center, displacedPoint);
           var parameter = pow(distanceToFP/fp.forceFactor + 1, fp.forceExp);
//          var parameter = parametricGravityFunction(distanceToFP, fp.forceFactor);
          if (parameter > parameterThreshold) {
            displacedPoint.lerp(fp.center, parameter);
          }
        }
        if (window.ev) {
          var fp = forcePoints[0];
          if (fp.hover) continue;
          var distanceToFP = p5.Vector.dist(fp.center, displacedPoint);
          var parameter = pow(distanceToFP/fp.forceFactor + 1, fp.forceExp);
          if (parameter > parameterThreshold) {
            displacedPoint.lerp(fp.center, parameter);
          }
        }
        row.push(displacedPoint);
      }
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

// Distance function using Taylor approximation. Accepts two p5.Vectors
function distApprox(u, v) {
  var t_1 = pow(u.x - v.x, 2) + pow(u.x - v.x, 2) - 1;
  var t_2 = t_1*t_1;
  return 1 + 0.5*t_1 - 0.125*t_2 + 0.0625*t_2*t_1 - 0.0390625*t_2*t_2;
}

// Parametric Gravity Function
// Returns Taylor approximation of y = (t/forceFactor + 1)^(-2)
function parametricGravityFunction(t, forceFactor) {
  var t_2 = t*t,
      t_3 = t_2*t,
      t_4 = t_2*t_2;
  switch (forceFactor) {
//    case 1:
//      return 0;
//    case 2:
//      return (1 - t + 0.75*t_2 - 0.5*t_3 + 0.3125*t_4);
//    case 4:
//      return (1 - 0.5*t + 0.1875*t_2 - 0.0625*t_3 + 0.01953125*t_4);
//    case 8:
//      return (1 - 0.25*t + 0.046875*t_2 - 0.0078125*t_3 + 0.001220703125*t_4);
//    case 16:
//      return (1 - 0.125*t + 0.01171875*t_2 - 0.0009765625*t_3 + 0.00007629394531*t_4);
//    case 32:
//      return (1 - 0.0625*t + 0.0029296875*t_2 - 0.0001220703125*t_3 + 0.000004768371582*t_4);
//    case 64:
//      return (1 - 0.03125*t + 0.000732421875*t_2 - 0.00001525878906*t_3 + 0.0000002980232239*t_4);
//    case 128:
//      return (1 - 0.015625*t + 0.0001831054688*t_2 - 0.000001907348633*t_3 + 0.00000001862645149*t_4);
//    case 256:
//      return (1 - 0.0078125*t + 0.00004577636719*t_2 - 0.0000002384185791*t_3 + 0.000000001164153218*t_4);
    default:
      return pow(t/forceFactor + 1, -2);
  }
  
}