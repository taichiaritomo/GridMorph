// Detects if cursor is inside canvas.
window.ev = false;
document.getElementById('canvas-container').onmouseover = function () {
    window.ev = true;
}
document.getElementById('canvas-container').onmouseout = function () {
    window.ev = false;
}

var showPoints = false;
var showBaseGrid = false;
var showWarpGrid = true;


document.querySelector("#forceFactor-minus").onclick = function() {
  adjustForceFactor(-1);
}
document.querySelector("#forceFactor-plus").onclick = function() {
  adjustForceFactor(1);
}

function keyAdjustForceFactor(exponent) {
  if (exponent == 1) {
    adjustForceFactor(1);
    document.querySelector("#forceFactor-plus").classList.add("active");
    setTimeout(
      function() {
        document.querySelector("#forceFactor-plus").classList.remove("active");
      }, 100);
  } else if (exponent == -1) {
    adjustForceFactor(-1);
    document.querySelector("#forceFactor-minus").classList.add("active");
    setTimeout(
      function() {
        document.querySelector("#forceFactor-minus").classList.remove("active");
      }, 100);
  }
}

// Multiplies forceFactor of cursorPoint by 2^(exponent)
function adjustForceFactor(exponent) {
  cursorPoint.forceFactor *= pow(2, exponent);
  document.getElementById('forceFactor-value').innerHTML = cursorPoint.forceFactor;
  console.log("Force: " + cursorPoint.forceFactor);
}

// Processing: Click events
function mouseClicked() {
  // Save forcePoint
  if (!window.ev) {
    return;
  }
  forcePoints.push(new ForcePoint(cursorPoint.center, cursorPoint.forceFactor, cursorPoint.forceExp, cursorPoint.forceIntensity, "CONTRACTING"));
}

// Processing: Key events
function keyPressed() {
  // TOGGLE EXPANDING / CONTRACTING
//  if (keyCode == TAB) {
//    if (cursorPoint.type == "CONTRACTING")
//      cursorPoint.type = "EXPANDING";
//    else
//      cursorPoint.type = "CONTRACTING";
//  }
  if (keyCode === RIGHT_ARROW) {
//    cursorPoint.forceFactor *= 2;
    keyAdjustForceFactor(1);
  }
  else if (keyCode === LEFT_ARROW) {
//    cursorPoint.forceFactor /= 2;
    keyAdjustForceFactor(-1);
  }
  
  return false;
}