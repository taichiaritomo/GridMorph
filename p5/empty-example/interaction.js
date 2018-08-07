// Detects if cursor is inside canvas.
window.ev = false;
document.getElementById('canvas-container').onmouseover = function () {
    window.ev = true;
}
document.getElementById('canvas-container').onmouseout = function () {
    window.ev = false;
}

var showPoints = true;
var showBaseGrid = true;
var showWarpGrid = true;


/* ------------------- MENU -------------------------- */
var menu_toggles = {
  forces: {
    element: document.querySelector("#forcePoints-button"),
    parameter: true
  },
  baseGrid: {
    element: document.querySelector("#originalGrid-button"),
    parameter: false
  },
  image: {
    element: document.querySelector("#image-button"),
    parameter: true
  },
  deformGrid: {
    element: document.querySelector("#morphGrid-button"),
    parameter: true
  }
}

// Create event listeners for menu toggles
for (var key in menu_toggles) {
  // skip if property is from _prototype
  if (!menu_toggles.hasOwnProperty(key)) continue;
  
  let toggle = menu_toggles[key];
  toggle.element.addEventListener("click", function() {
//    if (toggle.parameter)
//      toggle.element.classList.remove("selected");
//    else
//      toggle.element.classList.add("selected");
    toggle.element.classList.toggle("selected");
    toggle.parameter = !toggle.parameter;
  });
  console.log(toggle);
}

// Handling cursor display
menu_toggles.forces.element.addEventListener("click", function() {
  document.querySelector("#canvas-container").classList.toggle("show-cursor");
});

// Info Container Toggle
var info_visible = true;
var info_toggle = document.querySelector("#info-button");
info_toggle.addEventListener("click", function() {
  info_toggle.innerHTML = info_visible ? "Show Info" : "Hide Info";
  document.querySelector("#info-container").classList.toggle("hidden");
  info_toggle.classList.toggle("selected");
  info_visible = !info_visible;
  info_toggle.classList.remove("highlight");
});

// Save Image
var saveCounter = 0;
var save_button = document.querySelector("#save-button");
save_button.addEventListener("click", function() {
  saveCanvas(myCanvas, "deform-grid_" + saveCounter, "png");
});

/*------------- IMAGE UPLOAD ---------------*/
var upload_button = document.getElementById('upload-button');
var input_dialogBox = document.getElementById('upload-dialog-box');
var imageInput = document.getElementById('image-input');
upload_button.addEventListener("click", function() {
  imageInput.click();
});


imageInput.addEventListener('change', handleFiles);

function handleFiles(e) {
  var ctx = document.getElementById('holding-ground').getContext('2d');
  var img = new Image;
  img.onload = function() {
    console.log("hello");
    
    // Calculate proportion between grid and image
    var proportion;
    if (img.width >= img.height) // fill out width
      proportion = maxGridWidth / img.width;
    else// fill out height
      proportion = maxGridHeight / img.height;
    
    // Resize grid to fit in bounds with image's aspect ratio
    gridWidth = proportion * img.width;
    gridHeight = proportion * img.height;
    adjustOffsets();

    // Set index maximums for low-res grid
    i_max = Math.floor(gridWidth / gridInterval);
    j_max = Math.floor(gridHeight / gridInterval);
    
    ctx.canvas.width = i_max;
    ctx.canvas.height = j_max;
    ctx.drawImage(img, 0, 0, i_max, j_max);
//    ctx.drawImage(img, 0, 0, 26, 39);
    
    var imgData = ctx.getImageData(0, 0, i_max, j_max).data;
    img_S = createImage(i_max, j_max);
    img_S.loadPixels();
    for (var i = 0; i < img_S.width; i++) {
      for (var j = 0; j < img_S.height; j++) {
        var pixelIndex = (i + j * i_max) * 4;
        img_S.set(i, j, color(imgData[pixelIndex], imgData[pixelIndex+1], imgData[pixelIndex+2]));
      }
    }
    img_S.updatePixels();
    URL.revokeObjectURL(img.src)
  }
  img.src = URL.createObjectURL(e.target.files[0]);
}


/*------------- FORCE FACTOR ADJUSTMENT -----------------*/
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
  // prevent exceeding forceFactor limits
  if (exponent == 1 && cursorPoint.forceFactor>=forceFactorMax || exponent == -1 && cursorPoint.forceFactor<=forceFactorMin)
    return;
  cursorPoint.forceFactor *= pow(2, exponent);
  document.getElementById('forceFactor-value').innerHTML = cursorPoint.forceFactor/100;
}


/* -------------- PROCESSING CLICK/KEY EVENTS --------------*/
// Click events
function mouseClicked() {
  // Save forcePoint
  if (!window.ev) {
    return;
  }
  
  for (var i = 1; i < forcePoints.length; i++) {
    // Check if hovering over fixed forcePoint
    var current = forcePoints[i];
    if (current.hover) {
      forcePoints.splice(i, 1);
      return;
    }
  }
  
  forcePoints.push(new ForcePoint(cursorPoint.center, cursorPoint.forceFactor, cursorPoint.forceExp, cursorPoint.forceIntensity, "CONTRACTING"));
}

// Key events
function keyPressed() {
  // TOGGLE EXPANDING / CONTRACTING
//  if (keyCode == TAB) {
//    if (cursorPoint.type == "CONTRACTING")
//      cursorPoint.type = "EXPANDING";
//    else
//      cursorPoint.type = "CONTRACTING";
//  }
  if (keyCode === RIGHT_ARROW || keyCode === UP_ARROW) {
    keyAdjustForceFactor(1);
  }
  else if (keyCode === LEFT_ARROW || keyCode === DOWN_ARROW) {
    keyAdjustForceFactor(-1);
  }
  return false;
}