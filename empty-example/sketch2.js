  // GRID
var gridWidth = 1000,
    gridHeight = 600,
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


function setup() {
  var myCanvas = createCanvas(1000, 600);
  myCanvas.parent('canvasContainer');

  
  var origin = createVector(0, 0);
  forcePoints.push(new ForcePoint(origin, 400, -20, 12, "CONTRACTING"));
  cursorPoint = forcePoints[0];
  noFill();
}

function draw() {
  clear();
  background(255);
  
  var mousePos = createVector(mouseX, mouseY);
  cursorPoint.center = mousePos;
  
  curveTightness(0);
  
  stroke(250, 116, 98, 100);
  strokeWeight(0.5);
  drawNormGrid();
  
  stroke('#78B6E3'); // Jordy Blue
  drawMorphGrid();
  
  strokeWeight(4.0);
  for (var i = 0; i < forcePoints.length; i++) {
    point(forcePoints[i].center.x, forcePoints[i].center.y);
  }
  
}

function mouseClicked() {
  // Save forcePoint
  forcePoints.push(new ForcePoint(createVector(mouseX, mouseY), cursorPoint.forceFactor, cursorPoint.forceExp, cursorPoint.forceIntensity, "CONTRACTING"));
}

function keyPressed() {
  // TOGGLE EXPANDING / CONTRACTING
  if (keyCode == TAB) {
    if (cursorPoint.type == "CONTRACTING")
      cursorPoint.type = "EXPANDING";
    else
      cursorPoint.type = "CONTRACTING";
  }
  else if (keyCode === UP_ARROW) {
    cursorPoint.forceFactor *= 2;
  }
  else if (keyCode === DOWN_ARROW) {
    cursorPoint.forceFactor /= 2;
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
      for (var i = 0; i < forcePoints.length; i++) {
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
      morphGridPoint.x = xSum / displacements.length;
      morphGridPoint.y = ySum / displacements.length;
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
      for (var i = 0; i < forcePoints.length; i++) {
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
      morphGridPoint.x = xSum / displacements.length;
      morphGridPoint.y = ySum / displacements.length;
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