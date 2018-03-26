// -*- Mode: js2; js2-basic-offset: 2 -*-

//----------------------------------------------------------------------------
// Math Utils
//----------------------------------------------------------------------------

/**
 * Bound a number `num` such that is between `min` (inclusive) and
 * `max` (inclusive).
 */
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

/**
 * Linear interpolation.
 */
function lerp(t, min, max) {
  return min + ( max - min ) * t;
}

/**
 * Random integer between `from` (inclusive) and `to` (inclusive).
 */
function randint(min, max) {
  let r = Math.random();
  return Math.round( lerp(r, min, max) );
}

/**
 * Clone an object.
 */
function clone(obj) {
  return JSON.parse( JSON.stringify(obj) );
}


//----------------------------------------------------------------------------
// Constants
//----------------------------------------------------------------------------
let data =
// TODO this could be read from JSON file?
{
  player: {
    color:          "red",
    size:           { x:30, y:30 },
    movementSpeed:  0.3
  },

  enemy: {
    color:          "green",
    size:           { x:30, y:30 },
    movementSpeed:  0.3
  },

  enemySpawner: {
    millisBetweenSpawn:  { min: 300, max: 800 }
  },

  input: {
    moveDown: {
      name:        "moveDown",
      keyboard:    [ "ArrowDown" ]
    },
    moveUp: {
      name:        "moveUp",
      keyboard:    [ "ArrowUp" ]
    }
  }
}
;



//----------------------------------------------------------------------------
// Game Components
//----------------------------------------------------------------------------
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

  getRandomLane : function() {
    return randint( 0, this.maxLanes - 1 );
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
  this.size       = clone( data.enemy.size );
  this.position   = gLanes.laneToPosition(lane);
  this.position.x = gGameArea.canvas.width;
  this.velocity   = {x: -data.enemy.movementSpeed, y: 0};

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
    ctx.fillStyle = data.enemy.color;
    ctx.fillRect( this.position.x,
		  this.position.y,
		  this.size.x,
		  this.size.y );
  };
};

function EnemySpawner(data) {
  let that = this;

  this.data    = clone(data);
  this.enemies = [];

  var spawnCountdown = 0;
  let updateSpawnCountdown = function() {
    var countdownEnded = false;

    // Update countdown
    spawnCountdown -= gGameArea.dt;

    // Test countdown
    if (spawnCountdown <= 0) {
      countdownEnded = true;

      // New random count.
      let ms = that.data.millisBetweenSpawn;
      let moreTime = randint(ms.min, ms.max);
      spawnCountdown += moreTime;
    }

    return countdownEnded;
  };

  let spawnEnemy = function() {
    let lane  = gLanes.getRandomLane();
    let enemy = new Enemy(lane);
    that.enemies.push(enemy);
  };

  this.start = function() {
  };

  this.update = function() {
    if(updateSpawnCountdown()) {
      spawnEnemy();
    }
    this.updateEnemies();
  };

  this.updateEnemies = function() {
    this.enemies.forEach(function(enemy, i) {
      enemy.update();
    });
  };

  this.draw = function() {
    this.enemies.forEach(function(enemy, i) {
      enemy.draw();
    });
  };
};
var gEnemySpawner = new EnemySpawner(data.enemySpawner);

var gPlayer = {

  readInput : function() {
    // Read and reset key.
    let v = false;
    let k = gGameArea.key;
    gGameArea.key = false;

    let up   = data.input.moveUp;
    let down = data.input.moveDown;
    if(k) {
      while(false);
    }

    // Convert to player direction.
    if (k === down.keyboard[0] ) {
      v = down.name;
    } else if (k === up.keyboard[0] ) {
      v = up.name;
    }

    return v;
  },

  updateDesiredLane : function() {
    let dir = this.readInput();

    // Parse direction
    let dl  = this.desiredLane;
    let input = data.input;
    if(dir === input.moveUp.name) {
      dl -= 1;
    } else if (dir === input.moveDown.name ) {
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
      velocity.y = -speed;
    }
    else if( destination.y > start.y ) {
      // Moving downwards
      velocity.y = speed;
    }

    return velocity;
  },

  getDestination : function() {
    return gLanes.laneToPosition(this.desiredLane);
  },

  updatePosition : function() {
    let dest = this.getDestination();
    let velo = this.getVelocity(this.position, dest, data.player.movementSpeed);
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
    this.desiredLane = 1;
    this.size        = data.player.size;
    this.position    = this.getDestination();
  },

  update : function() {
    this.updateDesiredLane();
    this.updatePosition();
  },

  draw : function() {
    let ctx = gGameArea.context;
    ctx.fillStyle = data.player.color;
    ctx.fillRect( this.position.x,
		  this.position.y,
		  this.size.x,
		  this.size.y );
  }
};



//----------------------------------------------------------------------------
//  Game State
//----------------------------------------------------------------------------
var gGameArea = null;
function Game() {
  let that  = this;
  gGameArea = this;

  this.start = function startGame() {
    gLanes.start();
    gPlayer.start();
    gEnemySpawner.start();

    // Init input
    // TODO remove this on exit.
    window.addEventListener('keyup', function (e) {
      console.log("key received");
      that.key = e.key;
    });
  };

  this.update = function update() {
    gLanes.update();
    gPlayer.update();
    gEnemySpawner.update();
  };

  this.draw = function drawGame() {
    gLanes.draw();
    gPlayer.draw();
    gEnemySpawner.draw();
  };
};

