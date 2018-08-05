PShape s;

// NORMATIVE GRID
float gridWidth = 720.0,
      gridHeight = 216.0,
      gridInterval = 8.0;

// NET
float netInterval = 72.0,
      netDisplacementX = 8.0,
      netDisplacementY = 8.0;
      
ArrayList<PVector> peaks;
      
// FORCES
enum ForceType {
  CONTRACTING,
  EXPANDING
};

PVector forcePoint = new PVector(96,96);
float forceFactor = 400; // horizontal stretch of exponential curve
float forceExp = -40.0;  // exponent of exponential curve
float forceIntensity = 12.0;
ForceType forcePointType = ForceType.CONTRACTING;
float parameterThreshold = 0.001;


//class Peak {
//  PVector point;
  
//}


void setup() {
  size(1000, 600);
  pixelDensity(displayDensity());
  noLoop();
  noFill();
  
  // Load SVG file
  s = loadShape("site.svg"); // The file must be in the data folder of the current sketch to load successfully
  
  background(255);
}

void createPeaks() {
  peaks = new ArrayList<PVector>();
  int i_max = int(gridWidth / netInterval);
  int j_max = int(gridHeight / netInterval);
  for (int i = 0; i < i_max; i++) {
    int offset = (i%2==0) ? 1 : 0;
    //int offset = 0;
    for (int j = 0; j < j_max; j+=2) {
      PVector p = new PVector(i * netInterval + netDisplacementX, (j+offset) * netInterval + netDisplacementY);
      if (p.y <= gridHeight) {
        point(p.x, p.y);
        peaks.add(p);
      }
    }
  }
}

void draw() {
  clear();
  background(255);
  
  shape(s, 0, 0, 1000, 600); // shape(shape, x, y, width, height);
  
  pushMatrix();
  
  translate(174, 224);
  //rotate(radians(299.2));
  
  strokeWeight(4.0);
  createPeaks();
  // point(forcePoint.x, forcePoint.y);
  
  
  curveTightness(0);
  stroke(#FA7462, 100);
  strokeWeight(0.5);
  drawGrid_ParameterBalance(false);
  
  stroke(#78B6E3); // Jordy Blue
  drawGrid_ParameterBalance(true);
  

  popMatrix();
  saveFrame("Plan");
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
        // CONTRACTING FORCE
        // Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp
        if (forcePointType == ForceType.CONTRACTING) {
          ArrayList<PVector> displacements = new ArrayList<PVector>();
          for (int i = 0; i < peaks.size(); i++) {
            PVector peak = peaks.get(i);
            PVector p = new PVector(x, y);
            float distance = PVector.dist(p, peak);
            float a = pow(distance/forceFactor + 1, forceExp);
            if (a > parameterThreshold) {
              PVector forcePointParametrized = peak.copy().mult(a);
              p.mult(1.0-a).add(forcePointParametrized);
              displacements.add(p);
            }
          }
          
          float xSum = 0.0, ySum = 0.0;
          for (int i = 0; i < displacements.size(); i++) {
            PVector d = displacements.get(i);
            xSum += d.x;
            ySum += d.y;
          }
          point.x = xSum / parseFloat(displacements.size());
          point.y = ySum / parseFloat(displacements.size());
        }
      }
      curveVertex(point.x, point.y);
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
      
      if (applyForces) {
        // CONTRACTING FORCE
        // Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp
        if (forcePointType == ForceType.CONTRACTING) {
          ArrayList<PVector> displacements = new ArrayList<PVector>();
          for (int i = 0; i < peaks.size(); i++) {
            PVector peak = peaks.get(i);
            PVector p = new PVector(x, y);
            float distance = PVector.dist(p, peak);
            float a = pow(distance/forceFactor + 1, forceExp);
            if (a > parameterThreshold) {
              PVector forcePointParametrized = peak.copy().mult(a);
              p.mult(1.0-a).add(forcePointParametrized);
              displacements.add(p);
            }
          }
          
          float xSum = 0.0, ySum = 0.0;
          for (int i = 0; i < displacements.size(); i++) {
            PVector d = displacements.get(i);
            xSum += d.x;
            ySum += d.y;
          }
          point.x = xSum / parseFloat(displacements.size());
          point.y = ySum / parseFloat(displacements.size());
        }
      }
      curveVertex(point.x, point.y);
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