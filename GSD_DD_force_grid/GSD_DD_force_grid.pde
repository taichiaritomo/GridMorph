PShape s;

// GRID
float gridWidth = 400.0,
      gridHeight = 800.0,
      gridInterval = 12.0;
  
// FORCES
enum ForceType {
  CONTRACTING,
  EXPANDING
};

PVector forcePoint = new PVector(96,96);
float forceFactor = 400; // horizontal stretch of exponential curve
float forceExp = -20.0;  // exponent of exponential curve
float forceIntensity = 12.0;
ForceType forcePointType = ForceType.CONTRACTING;
float parameterThreshold = 0.001;



void setup() {
  size(1000, 600);
  pixelDensity(displayDensity());
  //noLoop();
  noFill();
  
  // Load SVG file
  s = loadShape("site.svg"); // The file must be in the data folder of the current sketch to load successfully
  
  background(255);
  
}

void draw() {
  clear();
  background(255);
  
  shape(s, 0, 0, 1000, 600); // shape(shape, x, y, width, height);
  
  PVector mousePos = new PVector(mouseX, mouseY);
  mousePos.sub(151, 270);
  mousePos.rotate(radians(-299.2));
  forcePoint = mousePos;
  
  pushMatrix();
  
  translate(151, 270);
  rotate(radians(299.2));
  
  curveTightness(0);
  
  stroke(#FA7462, 100);
  strokeWeight(0.5);
  drawGrid_ParameterBalance(false);
  
  stroke(#78B6E3); // Jordy Blue
  drawGrid_ParameterBalance(true);
  
  strokeWeight(4.0);
  point(forcePoint.x, forcePoint.y);
  
  popMatrix();
}

void keyPressed() {
  // TOGGLE EXPANDING / CONTRACTING
  if (keyCode == TAB) {
    if (forcePointType == ForceType.CONTRACTING)
      forcePointType = ForceType.EXPANDING;
    else
      forcePointType = ForceType.CONTRACTING;
  }
  else if (keyCode == UP) {
    forceFactor *= 2;
  }
  else if (keyCode == DOWN) {
    forceFactor /= 2;
  }
}


void drawGrid_ParameterBalance(boolean applyForces) {
  
  for (float x = 0.0; x <= gridWidth; x += gridInterval) {
    beginShape();
    float y;
    curveVertex(x, 0.0); // beginning control point
    for (y = 0.0; y <= gridHeight; y+= gridInterval) {
      
      PVector point = new PVector(x, y);
      
      if (applyForces) {
        float distance = PVector.dist(point, forcePoint);
        
        // CONTRACTING FORCE
        // Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp
        if (forcePointType == ForceType.CONTRACTING) {
          // a is a float from 0.0 to 1.0, indicating balance of gravitational center's influence
          float a = pow(distance/forceFactor + 1, forceExp);
          if (a > parameterThreshold) {
            PVector forcePointParametrized = forcePoint.copy().mult(a);
            point.mult(1.0-a).add(forcePointParametrized);
          }
        }
        
        // EXPANDING FORCE
        // Applies a repellent force away from forcePoint, along an inverse exponential curve with parameters forceIntensity, forceFactor, and forceExp
        if (forcePointType == ForceType.EXPANDING) {
          // a is a float from 0.0 to 1.0, indicating influence of repellent force
          float a = pow(distance/forceFactor + 1, forceExp);
          if (a > parameterThreshold) {
            PVector difference = PVector.sub(point, forcePoint);
            point.add(difference.normalize().mult(forceIntensity * a));
          }
        }
      
        curveVertex(point.x, point.y);
      }
    }
    curveVertex(x, y - gridInterval); // end control point
    endShape();
  }
  
  for (float y = 0.0; y <= gridHeight; y += gridInterval) {
    beginShape();
    float x;
    curveVertex(0.0, y); // beginning control point
    for (x = 0.0; x <= gridWidth; x+= gridInterval) {
      
      PVector point = new PVector(x, y);
      
      if (applyForces) { //distance < forcePointRadius) {
        float distance = PVector.dist(point, forcePoint);
        
        // CONTRACTING FORCE
        if (forcePointType == ForceType.CONTRACTING) {
          float a = pow(distance/forceFactor + 1, forceExp);
          if (a > parameterThreshold) {
            PVector forcePointParametrized = forcePoint.copy().mult(a);
            point.mult(1.0-a).add(forcePointParametrized);
          }
        }
        
        // EXPANDING FORCE
        // Applies a repellent force away from forcePoint, along an inverse exponential curve with parameters forceIntensity, forceFactor, and forceExp
        if (forcePointType == ForceType.EXPANDING) {
          // a is a float from 0.0 to 1.0, indicating influence of repellent force
          float a = pow(distance/forceFactor + 1, forceExp);
          if (a > parameterThreshold) {
            PVector difference = PVector.sub(point, forcePoint);
            point.add(difference.normalize().mult(forceIntensity * a));
          }
        }
        curveVertex(point.x, point.y);
      }
    }
    curveVertex(x - gridInterval, y); // end control point
    endShape();
  }
}



//void drawGrid_Displacement(boolean applyForces) {
  
//  for (float x = 0.0; x <= gridWidth; x += gridInterval) {
//    beginShape();
//    float y;
//    curveVertex(x, 0.0); // beginning control point
//    for (y = 0.0; y <= gridHeight; y+= gridInterval) {
//      PVector point = new PVector(x, y);
//      PVector direction = forcePoint.copy().sub(point);
//      float distance = direction.mag();
//      float influence = pow(gridInterval*distance, forceExp);
//      direction.normalize().mult(influence*gridInterval);
//      if (applyForces) {//distance < forcePointRadius) {
//        point.add(direction);
//      }
//      curveVertex(point.x, point.y);
//    }
//    curveVertex(x, y - gridInterval); // end control point
//    endShape();
//  }
  
//  for (float y = 0.0; y <= gridHeight; y += gridInterval) {
//    beginShape();
//    float x;
//    curveVertex(0.0, y); // beginning control point
//    for (x = 0.0; x <= gridWidth; x+= gridInterval) {
//      PVector point = new PVector(x, y);
//      PVector direction = forcePoint.copy().sub(point);
//      float distance = direction.mag();
//      float influence = pow(gridInterval*distance, forceExp);
//      direction.normalize().mult(influence*gridInterval);
//      if (applyForces) { //distance < forcePointRadius) {
//        point.add(direction);
//      }
//      curveVertex(point.x, point.y);
//    }
//    curveVertex(x - gridInterval, y); // end control point
//    endShape();
//  }
//}