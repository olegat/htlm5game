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
    // Init canvas
    this.canvas.width  = 480;
    this.canvas.height = 270;
    this.context  = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    // Init time
    this.lastFrame = (new Date()).getTime();
    this.dt        = 0; // milliseconds.
    this.interval  = setInterval(gameLoop, 20);

    // Init input
    window.addEventListener('keyup', function (e) {
      console.log("key received");
      gGameArea.key = e.key;
    });
  },

  update : function() {
    // Update time
    let ms = (new Date()).getTime();
    this.dt        = ms - this.lastFrame;
    this.lastFrame = ms;
  },

  draw : function() {
  },

  clear  : function() {
    let w = this.canvas.width;
    let h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
  }
};

var gLanes = {
  maxLanes : 3, // 0 is the top lane, maxLanes-1 is the bottom lane

  laneToPosition : function(lane) {
    let h = gGameArea.canvas.height;
    let step = h / 6;
    let yoff = 40;
    return { x: 20,
	     y: yoff + (step * lane)
	   };
  },

  start : function() {
  },

  update : function() {
  },

  draw : function() {
  },

  clear : function() {
  }
};

function Enemy(lane) {
  this.size       = {x:30, y:30};
  this.position   = gLanes.laneToPosition(lane);
  this.position.x = gGameArea.canvas.width;
  this.velocity   = {x:-0.1, y: 0};

  this.shouldBeRemoved = function() {
    // Compute the right border of the enemy's bounding box.
    let rightBorder = this.position.x + this.size.x;

    // Has the enemy run off to the left side of the canvas?
    if(rightBorder < 0) {
      return true;
    }

    return false;
  };

  this.update = function() {
    this.shouldBeRemoved();
    let p  = this.position;
    let v  = this.velocity;
    let dt = gGameArea.dt;
    // Update position.
    this.position = { x: p.x + (v.x * dt) ,
		      y: p.y + (v.y * dt) };
  };

  this.draw = function() {
    let ctx = gGameArea.context;
    ctx.fillStyle = "green";
    ctx.fillRect( this.position.x,
		  this.position.y,
		  this.size.x,
		  this.size.y );
  };
}
var gTestEnemy = null; // TODO: remove me.

var gPlayer = {
  desiredLane : 1,
  speed       : {x:0,  y:0.3}, // pixels-per-milliseconds. must be positive.
  position    : {x:0,  y:0},
  size        : {x:30, y:30},

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
    let max = gLanes.maxLanes - 1;
    this.desiredLane = clamp(dl, 0, max);
  },

  getVelocity : function(start, destination, speed) {
    var velocity = { x:0, y:0 };

    if( destination.y < start.y ) {
      // Moving upwards
      velocity.y = -speed.y;
    }
    else if( destination.y > start.y ) {
      // Moving downwards
      velocity.y = speed.y;
    }

    return velocity;
  },

  getDestination : function() {
    return gLanes.laneToPosition(this.desiredLane);
  },

  updatePosition : function() {
    let dest = this.getDestination();
    let velo = this.getVelocity(this.position, dest, this.speed);
    let dy   = (velo.y * gGameArea.dt);
    let newY = (this.position.y + dy);

    // Update position.
    if (dy > 0) { // Moving downwards
      // Don't move down further than desired-pos.
      this.position.y = Math.min(dest.y, newY);
    }
    else if (dy < 0) { // Moving upwards
      // Don't move up further than desired-pos.
      this.position.y = Math.max(dest.y, newY);
    }
  },

  start : function() {
    this.position = this.getDestination();
  },

  update : function() {
    this.updateDesiredLane();
    this.updatePosition();
  },

  draw : function() {
    let ctx = gGameArea.context;
    ctx.fillStyle = "red";
    ctx.fillRect( this.position.x,
		  this.position.y,
		  this.size.x,
		  this.size.y );
  }
};



//----------------------------------------------------------------------------
//  Game Entry / Loop
//----------------------------------------------------------------------------
function startGame() {
  gGameArea.start();
  gLanes.start();
  gPlayer.start();
};

function updateGame() {
  gGameArea.update();
  gLanes.update();
  gPlayer.update();

  if (gTestEnemy == null) {
    gTestEnemy = new Enemy(0);
  }
  gTestEnemy.update();
};

function drawGame() {
  gGameArea.clear();
  gGameArea.draw();
  gLanes.draw();
  gPlayer.draw();
  gTestEnemy.draw();
};

function gameLoop() {
  updateGame();
  drawGame();
}
