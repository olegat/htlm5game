// -*- Mode: js2; js2-basic-offset: 2 -*-

//----------------------------------------------------------------------------
// Math Utils
//----------------------------------------------------------------------------
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
};



//----------------------------------------------------------------------------
// Game Components
//----------------------------------------------------------------------------
var gGameArea = {
  canvas : document.createElement("canvas"),
  start  : function() {
    this.canvas.width  = 480;
    this.canvas.height = 270;
    this.context  = this.canvas.getContext("2d");
    this.interval = setInterval(gameLoop, 20);
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    window.addEventListener('keyup', function (e) {
      console.log("key received");
      gGameArea.key = e.key;
    });
  },
  clear  : function() {
    let w = this.canvas.width;
    let h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
  }
};

var gPlayer = {
  desiredLane : 1, // 0 is the bottom lane, maxLanes-1 is the top lane
  maxLanes    : 3,
  ySpeed      : 30, // pixels per second. must be positive.
  velocity    : {x: 0, y: 0},
  position    : {x: 0, y: 0},

  readInput : function() {
    // Read and reset key.
    let v = false;
    let k = gGameArea.key;
    gGameArea.key = false;

    // Convert to player direction.
    if (k === "ArrowDown") {
      v = "down";
    } else if (k === "ArrowUp") {
      v = "up";
    }

    return v;
  },

  updateDesiredLane : function() {
    let dir = this.readInput();

    // Parse direction
    let dl  = this.desiredLane;
    if(dir === "up") {
      dl -= 1;
    } else if (dir === "down" ) {
      dl += 1;
    }

    // Update
    let max = this.maxLanes - 1;
    this.desiredLane = clamp(dl, 0, max);
  },

  laneToPosition : function() {
    let w = gGameArea.canvas.width;
    let h = gGameArea.canvas.height;
    let step = h / 6;
    let yoff = 40;
    let lane = this.desiredLane;
    return { x: 20,
	     y: yoff + (step * lane)
	   };
  },

  update : function() {
    this.updateDesiredLane();
    this.position = this.laneToPosition();
  },

  draw : function() {
    let ctx = gGameArea.context;
    ctx.fillStyle = "red";
    ctx.fillRect( this.position.x,
		  this.position.y,
		  30, 30);
  }
};



//----------------------------------------------------------------------------
//  Game Entry / Loop
//----------------------------------------------------------------------------
function startGame() {
  gGameArea.start();
};

function updateGame() {
  gPlayer.update();
};

function drawGame() {
  gPlayer.draw();
};

function gameLoop() {
  gGameArea.clear();
  updateGame();
  drawGame();
}
