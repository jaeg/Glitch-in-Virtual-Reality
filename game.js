//SPRITES
var tilesImage = new Image();
//tilesImage.src = "img/tiles.png";
var spriteTileSize = 16

//MAPS
var tileSize = 32;
var mapArray = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

];

var screenOffset = {
    x: 0,
    y: 0
};

//Player location is going to be maintained in map array index notation to prevent conversions
var player = {
  x: 1,
  y: 1,
  inventory: [],
  move: function(dirX, dirY, avoidCollisions){
    if (avoidCollisions) {
      this.x += dirX;
      this.y += dirY;
      return;
    }

    var newPosX = this.x + dirX;
    var newPosY = this.y + dirY;

    //This is a roguelike.  I don't need very fancy collision detection.
    //When enemies get added I may have to iterate through them to see if I touch one though.
    if (mapArray[newPosY] != undefined) {
      if (mapArray[newPosY][newPosX] != undefined){
        if (mapArray[newPosY][newPosX] != 3) {
          this.x = newPosX;
          this.y = newPosY;
        }
      }
    }
  }
}

game = function(){
  that = this;
  this.state = "menu"; //menu, play, lose, win
  //Canvas
  this.gameCanvas = document.getElementById('game');
  this.gameCtx = this.gameCanvas.getContext("2d");

  this.gameCanvas.width = 640;
  this.gameCanvas.height = 640;

  this.handleKeyPressed = function(e) {
    if (that.state == "play") {
      switch (String.fromCharCode(e.keyCode))
      {
          case 'W':
              player.move(0,-1);
              break;
          case 'A':
              player.move(-1,0);
              break;
          case 'S':
              player.move(0,1);
              break;
          case 'D':
              player.move(1,0);
              break;
      }
    }
    if (that.state != "play") {
      if (e.keyCode == 13 && that.state != "play")
       {
           that.start();
       }
    }
  }

  this.start = function() {
    //generate map, position player, create enemies, all that fun stuff.
    this.state = "play";
  }

  this.update = function() {

  },

  this.draw = function() {
    this.gameCanvas.width = this.gameCanvas.width; //clear the canvas
    if (this.state == "menu") {
      this.gameCtx.fillStyle = "black";
      this.gameCtx.fillRect(0,0, this.gameCanvas.width, this.gameCanvas.height);

      this.gameCtx.fillStyle = "white";
      this.gameCtx.font = "20px Courier New";
      this.gameCtx.fillText("Hit Enter To Start", 240, 240);
    }

    if (this.state == "play") {
      for (var y = 0; y<mapArray.length; y++) {
        for (var x = 0; x<mapArray[y].length; x++){
          var tile = mapArray[y][x];
          switch (tile) {
            case 0: this.gameCtx.fillStyle = "black";break;
            case 1: this.gameCtx.fillStyle = "red";break;
            case 3: this.gameCtx.fillStyle = "blue";break;

          }
          this.gameCtx.fillRect(x * tileSize + screenOffset.x, y * tileSize + screenOffset.y, tileSize, tileSize);
        }
      }
      this.gameCtx.fillStyle = "purple"
      this.gameCtx.fillRect(player.x * tileSize + screenOffset.x, player.y * tileSize + screenOffset.y, tileSize, tileSize);
    }
  }

  this.cleanUp = function() {

  }

}

theGame = new game();
//Main Loop
var mainloop = function() {
    theGame.update();
    theGame.draw();
};

var animFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    null;

var recursiveAnim = function() {
    mainloop();
    animFrame(recursiveAnim);
};


// start the mainloop
document.addEventListener("keydown", theGame.handleKeyPressed, false);
animFrame(recursiveAnim);
function addMessage(from, message){
  var messageLog = document.getElementById("messageLog");
  var currentMessageLogText = messageLog.innerHTML;

  var newMessage = "<b>"+from+"</b>: "+message +"</br>";

  currentMessageLogText = currentMessageLogText + newMessage;

  messageLog.innerHTML = currentMessageLogText;
  console.log(messageLog);
}
