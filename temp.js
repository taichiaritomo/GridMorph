//NetGrid
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






















//ForceGrid
function drawGrid_ParameterBalance(boolean applyForces) {
  
  for (var x = 0.0; x <= gridWidth; x += gridInterval) {
    beginShape();
    var y;
    curveVertex(x, 0.0); // beginning control point
    for (y = 0.0; y <= gridHeight; y+= gridInterval) {
      
      PVector point = new PVector(x, y);
      
      if (applyForces) {
        var distance = PVector.dist(point, forcePoint);
        
        // CONTRACTING FORCE
        // Applies gravitational force toward forcePoint, along an inverse exponential curve with parameters forceFactor and forceExp
        if (forcePointType == ForceType.CONTRACTING) {
          // a is a var from 0.0 to 1.0, indicating balance of gravitational center's influence
          var a = pow(distance/forceFactor + 1, forceExp);
          if (a > parameterThreshold) {
            PVector forcePointParametrized = forcePoint.copy().mult(a);
            point.mult(1.0-a).add(forcePointParametrized);
          }
        }
        
        // EXPANDING FORCE
        // Applies a repellent force away from forcePoint, along an inverse exponential curve with parameters forceIntensity, forceFactor, and forceExp
        if (forcePointType == ForceType.EXPANDING) {
          // a is a float from 0.0 to 1.0, indicating influence of repellent force
          var a = pow(distance/forceFactor + 1, forceExp);
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
  
  for (var y = 0.0; y <= gridHeight; y += gridInterval) {
    beginShape();
    var x;
    curveVertex(0.0, y); // beginning control point
    for (x = 0.0; x <= gridWidth; x+= gridInterval) {
      
      PVector point = new PVector(x, y);
      
      if (applyForces) { //distance < forcePointRadius) {
        var distance = PVector.dist(point, forcePoint);
        
        // CONTRACTING FORCE
        if (forcePointType == ForceType.CONTRACTING) {
          var a = pow(distance/forceFactor + 1, forceExp);
          if (a > parameterThreshold) {
            PVector forcePointParametrized = forcePoint.copy().mult(a);
            point.mult(1.0-a).add(forcePointParametrized);
          }
        }
        
        // EXPANDING FORCE
        // Applies a repellent force away from forcePoint, along an inverse exponential curve with parameters forceIntensity, forceFactor, and forceExp
        if (forcePointType == ForceType.EXPANDING) {
          // a is a float from 0.0 to 1.0, indicating influence of repellent force
          var a = pow(distance/forceFactor + 1, forceExp);
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