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
function Player(){
    this.x = 1;
    this.y = 1;
    this.hp = 50;
    this.armor = 0;
    this.damage = 2;
    this.sightRange = 3;
    this.inventory = [];

    this.takeDamage = function(amount) {
      this.hp -= amount - this.armor
    };
    this.updateUI = function() {
      hpSpan = document.getElementById('hp');
      hpSpan.innerHTML = this.hp;
      damageSpan = document.getElementById('damage');
      damageSpan.innerHTML = this.damage;
      armorSpan = document.getElementById('armor');
      armorSpan.innerHTML = this.armor;
      sightRangeSpan = document.getElementById('sightrange');
      sightRangeSpan.innerHTML = this.sightRange;

    };
    this.move = function(dirX, dirY, avoidCollisions) {
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
            if (mapArray[newPosY][newPosX] != undefined) {
                if (mapArray[newPosY][newPosX] != 3) {
                  if (!theGame.checkForEnemyAt(newPosX,newPosY, true, this.damage)) {
                    this.x = newPosX;
                    this.y = newPosY;
                  }

                  theGame.checkTraps();
                }
            }
        }

        theGame.updateEnemies();
    }
}

function Enemy(x,y, type) {
  this.x = x;
  this.y = y;
  this.hp = 10;
  this.damage = 1;
  this.dead = false;
  this.type = type || "RAT";
  this.sightRange = 5;
  this.chasing = false;
  this.attackText = "has attacked the player!";
  this.spotsPlayerText = "has spotted the player!";
  this.lostPlayerText = "has lost the trail of the player..";
}

function Trap(x,y, type) {
  this.x = x;
  this.y = y;
  this.type = type;
  this.damage = 5;
  this.setOff = false;
  this.spotted = false;
  this.spotText = "You see a trap nearby!";
  this.triggerText = "You have set off the trap!";
}

function Game() {
    that = this;
    this.state = "menu"; //menu, play, lose, win
    this.traps = [];
    this.enemies = [];
    this.player = new Player();
    //Canvas
    this.gameCanvas = document.getElementById('game');
    this.gameCtx = this.gameCanvas.getContext("2d");

    this.gameCanvas.width = 640;
    this.gameCanvas.height = 640;

    this.handleKeyPressed = function(e) {
        if (that.state == "play") {
            switch (String.fromCharCode(e.keyCode)) {
                case 'W':
                    that.player.move(0, -1);
                    break;
                case 'A':
                    that.player.move(-1, 0);
                    break;
                case 'S':
                    that.player.move(0, 1);
                    break;
                case 'D':
                    that.player.move(1, 0);
                    break;
            }
        }
        if (that.state != "play") {
            if (e.keyCode == 13 && that.state != "play") {
                that.start();
            }
        }
    }

    this.start = function() {
        //generate map, position player, create enemies, all that fun stuff.
        this.state = "play";
        this.populateTraps(10);
        this.populateEnemies(3);
    }

    this.update = function() {
      this.player.updateUI();
    }

    this.draw = function() {
            this.gameCanvas.width = this.gameCanvas.width; //clear the canvas
            if (this.state == "menu") {
                this.gameCtx.fillStyle = "black";
                this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

                this.gameCtx.fillStyle = "white";
                this.gameCtx.font = "20px Courier New";
                this.gameCtx.fillText("Hit Enter To Start", 240, 240);
            }

            if (this.state == "play") {
                for (var y = 0; y < mapArray.length; y++) {
                    for (var x = 0; x < mapArray[y].length; x++) {
                        var tile = mapArray[y][x];
                        switch (tile) {
                            case 0:
                                this.gameCtx.fillStyle = "black";
                                break;
                            case 1:
                                this.gameCtx.fillStyle = "red";
                                break;
                            case 3:
                                this.gameCtx.fillStyle = "blue";
                                break;

                        }
                        this.gameCtx.fillRect(x * tileSize + screenOffset.x, y * tileSize + screenOffset.y, tileSize, tileSize);
                    }
                }

                //draw traps
                for (var i = 0; i < this.traps.length; i++) {
                  var trap = this.traps[i];
                  if (trap.spotted && !trap.setOff) {
                    this.gameCtx.fillStyle = "teal"
                    this.gameCtx.fillRect(trap.x * tileSize + screenOffset.x, trap.y * tileSize + screenOffset.y, tileSize, tileSize);
                  }

                  if (trap.setOff) {
                    this.gameCtx.fillStyle = "grey"
                    this.gameCtx.fillRect(trap.x * tileSize + screenOffset.x, trap.y * tileSize + screenOffset.y, tileSize, tileSize);

                  }

                }

                //draw enemies
                for (var i = 0; i < this.enemies.length; i++) {
                  var enemy = this.enemies[i];
                  if (enemy.dead == false) {
                    this.gameCtx.fillStyle = "green";
                  } else {
                    this.gameCtx.fillStyle = "darkgreen";
                  }
                  this.gameCtx.fillRect(enemy.x * tileSize + screenOffset.x, enemy.y * tileSize + screenOffset.y, tileSize, tileSize);

                }

                this.gameCtx.fillStyle = "purple"
                this.gameCtx.fillRect(this.player.x * tileSize + screenOffset.x, this.player.y * tileSize + screenOffset.y, tileSize, tileSize);

            }
        }

    this.cleanUp = function() {

    }

    this.populateTraps = function(count){
      for(var i = 0; i < count; i++) {
        var x = 0;
        var y = 0
        do {
          x = Math.floor(Math.random()* mapArray[0].length)
          y = Math.floor(Math.random()* mapArray.length)
        } while(mapArray[y][x] != 0)
        this.traps.push(new Trap(x,y))
      }
    }

    this.populateEnemies = function(count){
      for(var i = 0; i < count; i++) {
        var x = 0;
        var y = 0
        do {
          x = Math.floor(Math.random()* mapArray[0].length)
          y = Math.floor(Math.random()* mapArray.length)
        } while(mapArray[y][x] != 0)
        this.enemies.push(new Enemy(x,y))
      }
    }

    this.updateEnemies = function() {
      for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        if (enemy.dead == false) {
          if (Math.abs(enemy.x - this.player.x) < enemy.sightRange && Math.abs(enemy.y - this.player.y) < enemy.sightRange) {
            if (enemy.chasing == false) {
              enemy.chasing = true;
              addMessage(enemy.type, enemy.spotsPlayerText);
            }

            var newEnemyX = enemy.x;
            var newEnemyY = enemy.y;

            //very primative AI
            if (enemy.x < this.player.x) {
              newEnemyX += 1;
            } else if (enemy.x > this.player.x) {
              newEnemyX -= 1;
            }
            if (enemy.y > this.player.y) {
              newEnemyY -= 1;
            } else if (enemy.y < this.player.y) {
              newEnemyY += 1;
            }

            if (mapArray[newEnemyY] != undefined) {
                if (mapArray[newEnemyY][newEnemyX] != undefined) {
                    if (mapArray[newEnemyY][newEnemyX] != 3) {
                      //check if player
                      if (this.player.x == newEnemyX && this.player.y == newEnemyY) {
                        addMessage(enemy.type,enemy.attackText);
                        this.player.takeDamage(enemy.damage)
                      } else if ( !this.checkForEnemyAt(newEnemyX,newEnemyY,false)){
                        enemy.x = newEnemyX;
                        enemy.y = newEnemyY;
                      }

                    }
                }
            }

          }
          else {
            if (enemy.chasing == true) {
              enemy.chasing = false;
              addMessage(enemy.type, enemy.lostPlayerText);
            }
          }
        }
      }
    }

    this.checkTraps = function() {
      for (var i = 0; i < this.traps.length; i++){
        var trap = this.traps[i];
        if (!trap.setOff) {
          if (trap.x == this.player.x && trap.y == this.player.y) {
            trap.setOff = true;
            addMessage("TRAP", trap.triggerText);
            this.player.takeDamage(trap.damage);
          }

          if (!trap.spotted) {
            if (Math.abs(trap.x - this.player.x) < this.player.sightRange && Math.abs(trap.y - this.player.y) < this.player.sightRange) {
              trap.spotted = true;
              addMessage("TRAP", trap.spotText);
            }
          }
        }
      }
    }

    this.checkForEnemyAt = function(x,y, attack, damage) {
      for (var i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];

        if (enemy.x == x && enemy.y == y && enemy.dead == false){
          if (attack) {
            addMessage("PLAYER","You have attacked the enemy.");
            enemy.hp -= damage;
            if (enemy.hp <= 0) {
              enemy.dead = true;
            }
          }

          return true;
        }
      }

      return false;
    }
}


theGame = new Game();
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

function addMessage(from, message) {
    var messageLog = document.getElementById("messageLog");
    var currentMessageLogText = messageLog.innerHTML;

    var newMessage = "<b>" + from + "</b>: " + message + "</br>";

    currentMessageLogText = currentMessageLogText + newMessage;

    messageLog.innerHTML = currentMessageLogText;

    messageLog.scrollTop = messageLog.scrollHeight;
}
