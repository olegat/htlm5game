// -*- Mode: js2; js2-basic-offset: 2 -*-


//----------------------------------------------------------------------------
//  Create Game Canvas and Loop
//----------------------------------------------------------------------------
function GameShell(initialState) {
  this.canvas = document.createElement("canvas");
  this.state  = initialState;

  // Init canvas
  this.canvas.width  = 480;
  this.canvas.height = 270;
  this.context  = this.canvas.getContext("2d");
  document.body.insertBefore(this.canvas, document.body.childNodes[0]);

  // Init time
  this.lastFrame = (new Date()).getTime();
  this.interval  = setInterval(gameLoop, 20);

  // Init state
  this.state.dt      = 0; // milliseconds.
  this.state.canvas  = this.canvas;
  this.state.context = this.context;
  this.state.start();

  this.update = function() {
    // Update time
    let ms = (new Date()).getTime();
    this.state.dt   = ms - this.lastFrame;
    this.lastFrame  = ms;

    this.state.update();
  };

  this.draw = function() {
    this.clear();
    this.state.draw();
  };

  this.clear = function() {
    let w = this.canvas.width;
    let h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
  };
};

var gGameShell = null;

function startGame() {
  gGameShell = new GameShell(new Game());
};

function gameLoop() {
  gGameShell.update();
  gGameShell.draw();
}
