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

function generateMap(width, height){
  //Initialize the array
  mapArray = [];
  for (var y = 0; y < height; y++){
    mapArray[y] = [];
    for (var x = 0; x < width; x++) {
      mapArray[y][x] = 3; //We are digging out the rooms
    }
  }

  for (var i = 0; i < 10; i++) {
    //Initial Room
    var roomWidth = 1;
    var roomHeight = 1;
    var roomX = 1;
    var roomY = 1;
    var tries = 0;
    do {
      if (roomIntersects(roomX,roomY,roomWidth,roomHeight)) {
        tries++;
      }

      if (tries > 100) {
        console.log("BREAK");
        break;
      }
      roomWidth = Math.ceil(Math.random()*10);
      roomHeight = Math.ceil(Math.random()*10);
      roomX = Math.floor(Math.random()*width);
      roomY = Math.floor(Math.random()*height);
    } while (roomX + roomWidth > width || roomY + roomHeight > height || roomIntersects(roomX,roomY,roomWidth,roomHeight))

    carveRoom(roomX,roomY,roomWidth, roomHeight);
  }



}

function roomIntersects(x,y,width,height) {
  if (x + width > mapArray[0].length || y + height > mapArray.length) {
    return true;
  }
  for (var currentY = 0; currentY < height; currentY++) {
    for (var currentX = 0; currentX < width; currentX++) {
      if (mapArray[currentY+y][currentX+x] != 3){
        console.log("Intersect");
        return true;
      }

    }
  }
  return false;
}

function carveRoom(x,y, width, height) {
  if (x + width > mapArray[0].length || y + height > mapArray.length) {
    return true;
  }
  for (var currentY = 0; currentY < height; currentY++) {
    for (var currentX = 0; currentX < width; currentX++) {
      mapArray[currentY+y][currentX+x] = 0;
    }
  }
}
generateMap(640/32,480/32);

//Player location is going to be maintained in map array index notation to prevent conversions
function Player() {
    this.x = 1;
    this.y = 1;
    this.hp = 50;
    this.armor = 0;
    this.damage = 2;
    this.sightRange = 3;
    this.inventory = [];
    this.hitRate = 0.7;
    this.foodCount = 0;

    this.takeDamage = function(amount) {
        this.hp -= amount - this.armor
    };
    this.updateUI = function() {
        var hpSpan = document.getElementById('hp');
        hpSpan.innerHTML = this.hp;
        var damageSpan = document.getElementById('damage');
        damageSpan.innerHTML = this.damage;
        var armorSpan = document.getElementById('armor');
        armorSpan.innerHTML = this.armor;
        var sightRangeSpan = document.getElementById('sightrange');
        sightRangeSpan.innerHTML = this.sightRange;

        var foodSpan = document.getElementById('foodcount');
        foodSpan.innerHTML = this.foodCount;

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
                    if (!theGame.checkForEnemyAt(newPosX, newPosY, true, this.damage)) {
                        this.x = newPosX;
                        this.y = newPosY;
                    }

                    theGame.checkTraps();
                    theGame.checkForItems();
                }
            }
        }

        theGame.updateEnemies();
    }
}

function Enemy(x, y, type) {
    this.x = x;
    this.y = y;
    this.hp = 10;
    this.damage = 1;
    this.hitRate = 0.5;
    this.dead = false;
    this.type = type || "RAT";
    this.sightRange = 5;
    this.chasing = false;
    this.attackText = "has attacked the player!";
    this.spotsPlayerText = "has spotted the player!";
    this.lostPlayerText = "has lost the trail of the player..";
}

function Trap(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || "Pit";
    this.damage = 5;
    this.setOff = false;
    this.spotted = false;
    this.spotText = "You see a trap nearby!";
    this.triggerText = "You have set off the trap!";
}

function Item(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || "food";
    this.useText = "Food has been collected!"
}

function Game() {
    that = this;
    this.state = "menu"; //menu, play, lose, win
    this.traps = [];
    this.enemies = [];
    this.items = [];
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
                case 'F':
                    if (that.player.foodCount > 0) {
                        addMessage("PLAYER", "Consumed food.");
                        that.player.hp += Math.floor(Math.random() * 10);
                        that.player.foodCount--;
                    } else {
                        addMessage("PLAYER", "No food to eat.");
                    }
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
        this.player = new Player();
        this.populateTraps(10);
        this.populateEnemies(3);
        this.populateItems(10);
        var x = 0;
        var y = 0;
        do {
            x = Math.floor(Math.random() * mapArray[0].length)
            y = Math.floor(Math.random() * mapArray.length)
        } while (mapArray[y][x] != 0)
        this.player.x = x;
        this.player.y = y;
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

            //Draw Items
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                this.gameCtx.fillStyle = "brown"
                this.gameCtx.fillRect(item.x * tileSize + screenOffset.x, item.y * tileSize + screenOffset.y, tileSize, tileSize);
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

    this.populateItems = function(count) {
        for (var i = 0; i < count; i++) {
            var x = 0;
            var y = 0
            do {
                x = Math.floor(Math.random() * mapArray[0].length)
                y = Math.floor(Math.random() * mapArray.length)
            } while (mapArray[y][x] != 0)
            this.items.push(new Item(x, y))
        }
    }

    this.populateTraps = function(count) {
        for (var i = 0; i < count; i++) {
            var x = 0;
            var y = 0
            do {
                x = Math.floor(Math.random() * mapArray[0].length)
                y = Math.floor(Math.random() * mapArray.length)
            } while (mapArray[y][x] != 0)
            this.traps.push(new Trap(x, y))
        }
    }

    this.populateEnemies = function(count) {
        for (var i = 0; i < count; i++) {
            var x = 0;
            var y = 0
            do {
                x = Math.floor(Math.random() * mapArray[0].length)
                y = Math.floor(Math.random() * mapArray.length)
            } while (mapArray[y][x] != 0)
            this.enemies.push(new Enemy(x, y))
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
                                    var hitChance = Math.random();
                                    if (hitChance < enemy.hitRate) {
                                        addMessage(enemy.type, enemy.attackText);
                                        this.player.takeDamage(enemy.damage)
                                    } else {
                                        addMessage(enemy.type, "Attack missed the player!");
                                    }

                                } else if (!this.checkForEnemyAt(newEnemyX, newEnemyY, false)) {
                                    enemy.x = newEnemyX;
                                    enemy.y = newEnemyY;
                                }

                            }
                        }
                    }

                } else {
                    if (enemy.chasing == true) {
                        enemy.chasing = false;
                        addMessage(enemy.type, enemy.lostPlayerText);
                    }
                }
            }
        }
    }

    this.checkForItems = function() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.x == this.player.x && item.y == this.player.y) {
                if (item.type == "food") {
                    this.player.foodCount++
                }

                addMessage("PLAYER","Picked up "+item.type)

                //remove item
                this.items.splice(i, 1);
                return;
            }
        }
    }

    this.checkTraps = function() {
        for (var i = 0; i < this.traps.length; i++) {
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

    this.checkForEnemyAt = function(x, y, attack, damage) {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];

            if (enemy.x == x && enemy.y == y && enemy.dead == false) {
                if (attack) {
                    var hitChance = Math.random();
                    if (hitChance < this.player.hitRate) {
                        addMessage("PLAYER", "You have attacked the enemy.");
                        enemy.hp -= damage;
                        if (enemy.hp <= 0) {
                            enemy.dead = true;
                            addMessage("PLAYER",enemy.type + " has been slain!");
                        }
                    } else {
                        addMessage("PLAYER", "Attack misssed the enemy!");
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
