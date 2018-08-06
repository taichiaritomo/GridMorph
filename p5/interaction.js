function mouseClicked() {
  // Save forcePoint
  if (!window.ev) {
    return;
  }
  forcePoints.push(new ForcePoint(cursorPoint.center, cursorPoint.forceFactor, cursorPoint.forceExp, cursorPoint.forceIntensity, "CONTRACTING"));
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
    adjustForceFactor(1);
  }
  else if (keyCode === DOWN_ARROW) {
    cursorPoint.forceFactor /= 2;
    adjustForceFactor(-1);
  }
  
  return false;
}