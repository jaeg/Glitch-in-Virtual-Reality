//SPRITES
var tilesImage = new Image();
tilesImage.src = "img/minirogue-all.png";
var spriteTileSize = 8;

//MAPS
var tileSize = 32;
var map = [];

var screenOffset = {
    x: 0,
    y: 0
};

function generateMap(map_size) {
    //Initialize the array
    map = [];
    for (var y = 0; y < map_size; y++) {
        map[y] = [];
        for (var x = 0; x < map_size; x++) {
            map[y][x] = -1;
        }
    }

    //place room in center
    var roomWidth = GetRandom(5, 10);
    var roomHeight = GetRandom(5, 10);
    createRoom(Math.round(map_size / 2 - roomWidth / 2), Math.round(map_size / 2 - roomHeight / 2), roomWidth, roomHeight);

    var room_max = 25;
    for (var i = 0; i < room_max; i++) {
        var done = false;
        while (!done) {
            var x = GetRandom(1, map_size - 1);
            var y = GetRandom(1, map_size - 1);

            if (x > 0 && x < map[y].length - 1 && y < map.length - 1 && y > 0) {
                if (map[y][x] == 1) {
                    var roomWidth = GetRandom(10, 20);
                    var roomHeight = GetRandom(10, 20);
                    //find out which direction to build the roomWidth
                    //up
                    if (map[y - 1][x] == -1) {
                        if (map[y][x + 1] == 1 && map[y][x - 1] == 1 && map[y + 1][x] != 1) {
                            if (!roomIntersects(x - roomWidth / 2, y - roomHeight + 1, roomWidth, roomHeight)) {
                                createRoom(x - roomWidth / 2, y - roomHeight + 1, roomWidth, roomHeight);
                                map[y][x] = 2;
                                done = true;
                            }
                        }
                    }

                    //down
                    if (map[y + 1][x] == -1) {

                        if (map[y][x + 1] == 1 && map[y][x - 1] == 1 && map[y - 1][x] != 1) {
                            if (!roomIntersects(x - roomWidth / 2, y, roomWidth, roomHeight)) {
                                createRoom(x - roomWidth / 2, y, roomWidth, roomHeight);
                                map[y][x] = 2;
                                done = true;
                            }
                        }
                    }

                    //left
                    if (map[y][x - 1] == -1) {
                        if (map[y + 1][x] == 1 && map[y - 1][x] == 1 && map[y][x - 1] != 1) {
                            if (!roomIntersects(x - roomWidth + 1, y - roomHeight / 2, roomWidth, roomHeight)) {
                                createRoom(x - roomWidth + 1, y - roomHeight / 2, roomWidth, roomHeight);
                                map[y][x] = 2;
                                done = true;
                            }
                        }
                    }

                    //right
                    if (map[y][x + 1] == -1) {
                        if (map[y + 1][x] == 1 && map[y - 1][x] == 1 && map[y][x + 1] != 1) {
                            if (!roomIntersects(x, y - roomHeight / 2, roomWidth, roomHeight)) {
                                createRoom(x, y - roomHeight / 2, roomWidth, roomHeight);
                                map[y][x] = 2;
                                done = true;
                            }
                        }
                    }

                }
            }
        }
    }

}


function createRoom(ax, ay, aw, ah) {
    for (var x = ax; x < ax + aw; x++) {
        for (var y = ay; y < ay + ah; y++) {
            if (y == ay || x == ax || y == ay + ah - 1 || x == ax + aw - 1) {
                map[y][x] = 1
            } else {
                map[y][x] = 0;
            }
        }
    }
}

function roomIntersects(x, y, width, height) {
    if (x + width > map[0].length - 1 || y + height > map.length - 1) {
        return true;
    }

    if (y < 1 || x < 1) {
        return true;
    }

    for (var currentY = 0; currentY < height; currentY++) {
        for (var currentX = 0; currentX < width; currentX++) {
            if (map[currentY + y] == undefined) return true;
            if (map[currentY + y][currentX + x] == undefined) return true;
            if (map[currentY + y][currentX + x] == 0) {
                return true;
            }
        }
    }

    return false;
}

generateMap(100);

var itemTypes = ["FOOD", "POTION", "SWORD", "ARMOR"];
var enemyTypes = ["RAT", "BAT","GHOST","WRAITH","ZOMBIE","DRAGONLING","OOZE","BIGOOZE","BEHOLDER","DEATH", "BASILISK", "GIANTSKELETON", "DRAGON"];
var trapTypes = ["PIT", "SPIKES", "FIRE RUNES", "POISON VENTS"];
var trapText = ["You fell down a pit.", "You were impaled by spikes.", "You set off fire runes.", "Poison blasts you in the face."];


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

    this.equippedWeapon = "";
    this.equippedArmor = "";

    this.useItem = function(i) {
        if (i < this.inventory.length) {
            if (this.inventory[i].use(this)) { //item.use returns true if item should be removed from bag.
                this.inventory.splice(i, 1);
            }
        }

    };

    this.tossItem = function(i) {
        if (i < this.inventory.length) {
            this.inventory.splice(i, 1);
        }
    }

    this.equipItem = function(i) {
        if (i < this.inventory.length) {
            var item = this.inventory[i];

            if (item.type == "SWORD") {
                if (this.equippedWeapon != "") {
                    this.equippedWeapon.equipped = false;
                    this.damage -= this.equippedWeapon.buff;
                }

                this.equippedWeapon = item;
                this.equippedWeapon.equipped = true;
                this.damage += this.equippedWeapon.buff;
            } else if (item.type == "ARMOR") {
                if (this.equippedArmor != "") {
                    this.equippedArmor.equipped = false;
                    this.armor -= this.equippedArmor.buff;
                }

                this.equippedArmor = item;
                this.equippedArmor.equipped = true;
                this.armor += this.equippedArmor.buff;
            } else {
                addMessage("PLAYER", "You can't equip that.");
            }
        }
    }

    this.takeDamage = function(amount, ignoreArmor) {
        var damage = amount;
        if (!ignoreArmor) {
          damage = amount - this.armor;
        }

        if (damage < 0) {
            damage = 0;
        }
        this.hp -= damage;
        addMessage("PLAYER","Took " + damage + " damage.");
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

        var hitrateSpan = document.getElementById('hitrate');
        hitrateSpan.innerHTML = this.hitRate;
        if (hitrateSpan.innerHTML.length > 5) {
          hitrateSpan.innerHTML = hitrateSpan.innerHTML.substring(0, 4)
        }

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
        if (map[newPosY] != undefined) {
            if (map[newPosY][newPosX] != undefined) {
                if (map[newPosY][newPosX] == 0 || map[newPosY][newPosX] == 2) {
                    if (!theGame.checkForEnemyAt(newPosX, newPosY, true, this.damage)) {
                        this.x = newPosX;
                        this.y = newPosY;

                        if (map[newPosY][newPosX] == 2) {
                          map[newPosY][newPosX] = 0;
                          addMessage("PLAYER","You opened the door with a creak.");
                        }
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
    this.xOffset = 14;
    this.yOffset = 6;
    this.numTurns = 1;
    this.coolsDown = false;
    this.coolingDown = false;
    this.ghost = false;
    this.big = false;
    this.attackText = "has attacked the player!";
    this.spotsPlayerText = "has spotted the player!";
    this.lostPlayerText = "has lost the trail of the player..";
}

function createRandomEnemy(x,y) {
  var enemy = new Enemy(x,y);
  var max = 7;
  if (Math.abs(x-theGame.stairsX) < 20 && Math.abs(y-theGame.stairsY) < 20) {
    max = enemyTypes.length;
  }
  var enemyType = enemyTypes[GetRandom(0,max)];

    switch (enemyType) {
      case "RAT":
      enemy.type = "RAT"
      enemy.hp = 4;
      enemy.damage = 1;
      enemy.sightRange = 5;
      enemy.hitRate = 0.8;
      enemy.xOffset = 14;
      enemy.yOffset = 6;
      enemy.numTurns = 1;
      enemy.coolsDown = true;
      break;

      case "ZOMBIE":
      enemy.type = "ZOMBIE"
      enemy.hp = 4;
      enemy.damage = 2;
      enemy.sightRange = 4;
      enemy.hitRate = 0.7;
      enemy.xOffset = 1;
      enemy.yOffset = 6;
      enemy.numTurns = 1;
      enemy.spotsPlayerText = "has started shambling towards the player.";
      enemy.coolsDown = true;
      break;

      case "SKELETON":
      enemy.type = "SKELETON"
      enemy.hp = 4;
      enemy.damage = 2;
      enemy.sightRange = 5;
      enemy.hitRate = 0.7;
      enemy.xOffset = 9;
      enemy.yOffset = 6;
      enemy.numTurns = 1;
      enemy.spotsPlayerText = "has started shambling towards the player.";
      enemy.coolsDown = false;
      break;

      case "OOZE":
      enemy.type = "OOZE"
      enemy.hp = 4;
      enemy.damage = 4;
      enemy.sightRange = 5;
      enemy.hitRate = 0.5;
      enemy.xOffset = 6;
      enemy.yOffset = 6;
      enemy.numTurns = 1;
      enemy.coolsDown = true;
      break;

      case "BIGOOZE":
      enemy.type = "BIGOOZE"
      enemy.hp = 20;
      enemy.big = true;
      enemy.damage = 4;
      enemy.sightRange = 3;
      enemy.hitRate = 0.5;
      enemy.xOffset = 0;
      enemy.yOffset = 5;
      enemy.numTurns = 1;
      enemy.coolsDown = true;
      break;

      case "BEHOLDER":
      enemy.type = "BEHOLDER"
      enemy.hp = 25;
      enemy.big = true;
      enemy.damage = 5;
      enemy.sightRange = 7;
      enemy.hitRate = 0.8;
      enemy.xOffset = 2;
      enemy.yOffset = 5;
      enemy.numTurns = 1;
      enemy.coolsDown = true;
      enemy.spotsPlayerText = "I see you...";
      enemy.lostPlayerText = "Where did he go?";
      enemy.attackText = "Has stared you down.";
      break;

      case "DEATH":
      enemy.type = "DEATH"
      enemy.hp = 10;
      enemy.big = true;
      enemy.damage = 6;
      enemy.sightRange = 5;
      enemy.hitRate = 0.4;
      enemy.xOffset = 4;
      enemy.yOffset = 3.5;
      enemy.numTurns = 2;
      enemy.coolsDown = false;
      enemy.ghost = true;
      enemy.spotsPlayerText = "You're time has come.";
      enemy.lostPlayerText = "Player has skirted death.";
      enemy.attackText = "Has shortened your life..";
      break;

      case "BASILISK":
      enemy.type = "BASILISK"
      enemy.hp = 10;
      enemy.big = true;
      enemy.damage = 6;
      enemy.sightRange = 6;
      enemy.hitRate = 0.7;
      enemy.xOffset = 2;
      enemy.yOffset = 3.5;
      enemy.numTurns = 1;
      enemy.coolsDown = false;
      enemy.spotsPlayerText = "Has caught your scent.";
      enemy.attackText = "Has bit you.";
      break;

      case "DRAGON":
      enemy.type = "DRAGON"
      enemy.hp = 15;
      enemy.big = true;
      enemy.damage = 10;
      enemy.sightRange = 6;
      enemy.hitRate = 0.7;
      enemy.xOffset = 6;
      enemy.yOffset = 3.5;
      enemy.numTurns = 1;
      enemy.coolsDown = true;
      enemy.spotsPlayerText = "Is hunting you down.";
      enemy.attackText = "Has scorched you with fire.";
      break;

      case "GIANTSKELETON":
      enemy.type = "GIANTSKELETON"
      enemy.hp = 8;
      enemy.big = true;
      enemy.damage = 6;
      enemy.sightRange = 6;
      enemy.hitRate = 0.6;
      enemy.xOffset = 1;
      enemy.yOffset = 4;
      enemy.numTurns = 1;
      enemy.coolsDown = true;
      break;

      case "BAT":
      enemy.type = "BAT"
      enemy.hp = 2;
      enemy.damage = 1;
      enemy.sightRange = 6;
      enemy.hitRate = 0.5;
      enemy.xOffset = 3;
      enemy.yOffset = 6;
      enemy.numTurns = 2;
      break;

      case "DRAGONLING":
      enemy.type = "DRAGONLING"
      enemy.hp = 4;
      enemy.damage = 2;
      enemy.sightRange = 5;
      enemy.hitRate = 0.7;
      enemy.xOffset = 0;
      enemy.yOffset = 7;
      enemy.numTurns = 2;
      break;

      case "GHOST":
      enemy.type = "GHOST"
      enemy.hp = 2;
      enemy.damage = 2;
      enemy.sightRange = 5;
      enemy.hitRate = 0.5;
      enemy.xOffset = 2;
      enemy.yOffset = 7;
      enemy.spotsPlayerText = "You are being haunted";
      enemy.lostPlayerText = "The haunting has ceased.";
      enemy.attackText = "has frightened the player!";
      enemy.numTurns = 2;
      enemy.ghost= true;
      break;

      case "WRAITH":
      enemy.type = "WRAITH"
      enemy.hp = 6;
      enemy.damage = 3;
      enemy.sightRange = 6;
      enemy.hitRate = 0.3;
      enemy.xOffset = 10;
      enemy.yOffset = 6;
      enemy.spotsPlayerText = "You feel intense dread.";
      enemy.lostPlayerText = "The haunting has ceased.";
      enemy.attackText = "is sucking the player's soul!";
      enemy.numTurns = 3;
      enemy.ghost = true;
      break;
    }

    return enemy;
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
    this.type = type || "FOOD";
    this.equipped = false;
    this.useText = "Food has been collected!"
    this.buff = GetRandom(1,4);
    this.use = function(player) {
        if (this.type == "FOOD") {
            addMessage("PLAYER", "Consumed food.");
            that.player.hp += Math.floor(Math.random() * 10);
            return true;
        } else if (this.type == "POTION") {
            this.generateRandomPotionEffect(player);
            return true;
        } else {
            addMessage("PLAYER", "You can't use that.  Try equipping it.");
        }
    }

    this.generateRandomPotionEffect = function(player) {
        var effects = ['hp', 'sightRange', 'hitRate', 'damage', 'armor'];
        var effect = effects[Math.floor(Math.random() * effects.length)];
        var multiplier = Math.random();
        var badEffect = Math.round(Math.random()); //50/50 good or bad
        var amount = player[effect] * multiplier;
        if (effect != "hitRate") {
            amount = Math.ceil(amount);
        }
        if (badEffect) {
            player[effect] -= amount;
            addMessage("ITEM", "The potion made you fill ill. " + effect + " went down.")
        } else {
            player[effect] += amount;
            addMessage("ITEM", "The potion made you fill impowered. " + effect + " went up.")
        }
    }
}


function Game() {
    that = this;
    this.state = "menu"; //menu, play, lose, win
    this.traps = [];
    this.enemies = [];
    this.items = [];
    this.player = new Player();
    this.inventoryUp = false;
    this.inventoryCursor = 0;
    this.stairsX = 0;
    this.stairsY = 0;
    //Canvas
    this.gameCanvas = document.getElementById('game');
    this.gameCtx = this.gameCanvas.getContext("2d");
    this.gameCtx.imageSmoothingEnabled = false;

    this.gameCanvas.width = 640;
    this.gameCanvas.height = 480;

    this.handleKeyPressed = function(e) {
        if (that.state == "play") {
            if (that.inventoryUp == false) {
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
                    case 'M':
                        that.map = !that.map;
                        break;
                }

                if (e.keyCode == 13) {
                    if (that.inventoryUp == true) {
                        that.inventoryUp = false;
                    } else {
                        that.inventoryUp = true;
                    }
                }

            } else {
                switch (String.fromCharCode(e.keyCode)) {
                    case 'E': //equip
                        that.player.equipItem(that.inventoryCursor);
                        break;
                    case 'T': //toss
                        that.player.tossItem(that.inventoryCursor);
                        break;
                    case 'U': //use
                        that.player.useItem(that.inventoryCursor);
                        break;
                    case 'W': //Up
                        if (that.inventoryCursor > 0) {
                            that.inventoryCursor -= 1;
                        }

                        break;
                    case 'S': //Down
                        if (that.inventoryCursor < that.player.inventory.length - 1) {
                            that.inventoryCursor += 1;
                        }

                        break;
                }

                if (e.keyCode == 13) {
                    if (that.inventoryUp == true) {
                        that.inventoryUp = false;
                    } else {
                        that.inventoryUp = true;
                    }
                }
            }

        }
        if (that.state != "play") {
            if (e.keyCode == 13) {
                that.start();
            }
        }
    }

    this.start = function() {
        //generate map, position player, create enemies, all that fun stuff.
        this.state = "play";
        clearMessages();
        addMessage("GM", "I am zzzzhe game master.");
        addMessage("SYSTEM", "*malfunction on level 5*");
        addMessage("GM", "Welcome to the Dungeons of Ma'kidar.");
        addMessage("SYSTEM", "*ERROR 503 can not disengage virtual reality helmet*");
        addMessage("UNKNOWN", "You must defeat me to live.");
        this.player = new Player();
        this.inventoryUp = false;
        this.inventoryCursor = 0;
        this.map = false;
        this.items = [];
        this.enemies = [];
        this.traps = [];

        generateMap(100);



        //Place player
        //Starting from the top left.
        for (var y = 0; y < map.length; y++) {
          var done = false;
          for (var x = 0; x < map[y].length; x++) {
            if (map[y][x] == 0){
              this.player.x = x;
              this.player.y = y;
              done = true;
              break;
            }
          }
          if (done) {
            break;
          }
        }

        //Starting from the bottom right.
        for (var y = map.length-1; y > 0; y--) {
          var done = false;
          for (var x = map[y].length - 1; x > 0; x--) {
            if (map[y][x] == 0){
              this.stairsX = x;
              this.stairsY = y;
              done = true;
              break;
            }
          }
          if (done) {
            break;
          }
        }
        this.populateTraps(100);
        this.populateEnemies(100);
        this.populateItems(15);
    }

    this.update = function() {
        this.player.updateUI();

        //Screen move
        screenOffset.x = -this.player.x * tileSize + this.gameCanvas.width/2
        screenOffset.y = -this.player.y * tileSize + this.gameCanvas.height/2

        //Check for win
        if (this.player.x == this.stairsX  && this.player.y == this.stairsY) {
          this.state = "win";
        }

        if (this.player.hp < 1) {
          this.state = "lose"
        }
    }

    this.draw = function() {
        this.gameCanvas.width = this.gameCanvas.width; //clear the canvas
        this.gameCtx.imageSmoothingEnabled = false;

        this.gameCtx.fillStyle = "black";
        this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        if (this.state == "menu") {
            this.gameCtx.fillStyle = "white";
            this.gameCtx.font = "20px Courier New";
            this.gameCtx.fillText("Hit Enter To Start", 240, 240);
        }

        if (this.state == "win") {
            this.gameCtx.fillStyle = "white";
            this.gameCtx.font = "20px Courier New";
            this.gameCtx.fillText("You have escaped!", 240, 200);
            this.gameCtx.fillText("Hit Enter To Start", 240, 240);
        }

        if (this.state == "lose") {
            this.gameCtx.fillStyle = "white";
            this.gameCtx.font = "20px Courier New";
            this.gameCtx.fillText("You have perished!", 240, 200);
            this.gameCtx.fillText("Hit Enter To Start", 240, 240);
        }

        if (this.state == "play") {
            for (var y = 0; y < map.length; y++) {
                for (var x = 0; x < map[y].length; x++) {
                    var tile = map[y][x];

                    if (tile == 1) {
                        this.drawSprite(tilesImage, 2, 0, spriteTileSize, tileSize, x, y);
                    }

                    if (tile == 2) {
                      this.drawSprite(tilesImage, 11, 1, spriteTileSize, tileSize, x, y);
                    }
                }
            }

            //draw traps
            for (var i = 0; i < this.traps.length; i++) {
                var trap = this.traps[i];
                if (trap.spotted && !trap.setOff) {
                    //this.drawSprite(tilesImage, 7, 0, spriteTileSize, tileSize, trap.x, trap.y);
                    this.gameCtx.strokeStyle="grey"
                    this.gameCtx.setLineDash([6]);
                    this.gameCtx.strokeRect(trap.x * tileSize + screenOffset.x, trap.y * tileSize + screenOffset.y, tileSize, tileSize);
                }

                if (trap.setOff) {
                    this.drawSprite(tilesImage, 6, 0, spriteTileSize, tileSize, trap.x, trap.y);
                }

            }

            //Draw Items
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];

                var xOffset = 0;
                var yOffset = 0;

                switch (item.type) {
                    case "POTION":
                        xOffset = 5;
                        yOffset = 3;
                        break;

                    case "FOOD":
                        xOffset = 1;
                        yOffset = 3;
                        break;

                    case "SWORD":
                        xOffset = 1;
                        yOffset = 4;
                        break;

                    case "ARMOR":
                        xOffset = 14;
                        yOffset = 4;
                        break;
                }

                this.drawSprite(tilesImage, xOffset, yOffset, spriteTileSize, tileSize, item.x, item.y)

            }

            //draw enemies
            for (var i = 0; i < this.enemies.length; i++) {
                var enemy = this.enemies[i];

                var xOffset = 0;
                var yOffset = 0;

                if (enemy.big == false) {
                  if (enemy.dead == false) {
                      this.drawSprite(tilesImage, enemy.xOffset, enemy.yOffset, spriteTileSize, tileSize, enemy.x, enemy.y)
                  } else {
                      this.drawSprite(tilesImage, 10, 1, spriteTileSize, tileSize, enemy.x, enemy.y)
                  }
                } else {
                  if (enemy.dead == false) {
                      this.drawSprite(tilesImage, enemy.xOffset, enemy.yOffset, spriteTileSize*2, tileSize, enemy.x, enemy.y,2)
                  } else {
                      this.drawSprite(tilesImage, 10, 1, spriteTileSize, tileSize, enemy.x, enemy.y,2)
                  }
                }

            }

            this.drawSprite(tilesImage, 5, 5, spriteTileSize, tileSize, this.player.x, this.player.y);

            this.drawSprite(tilesImage, 5, 0, spriteTileSize, tileSize, this.stairsX, this.stairsY);

            //Mini map
            if (this.map){
              this.gameCtx.fillStyle="white";
              this.gameCtx.fillRect(this.player.x*4, this.player.y*4 , 4, 4);
              this.gameCtx.fillRect(this.stairsX*4, this.stairsY*4 , 4, 4);
              for (var y = 0; y < map.length; y++) {
                  for (var x = 0; x < map[y].length; x++) {
                      var tile = map[y][x];

                      if (tile == 1) {
                          this.gameCtx.fillStyle="red";
                          this.gameCtx.fillRect(x*4 , y*4 , 4, 4);

                      }
                  }
              }

              for (var i = 0; i < this.enemies.length; i++) {
                this.gameCtx.fillStyle="purple";
                this.gameCtx.fillRect(this.enemies[i].x*4, this.enemies[i].y*4 , 4, 4);
              }
            }

            //draw inventory
            if (this.inventoryUp) {
                var inventoryX = this.gameCanvas.width / 4;
                var inventoryY = this.gameCanvas.height / 4;
                var inventoryWidth = this.gameCanvas.width / 2;
                var inventoryHeight = this.gameCanvas.height / 1.5;

                this.gameCtx.fillStyle = "white";
                this.gameCtx.font = "30px Courier New";
                this.gameCtx.fillText("Inventory",inventoryX+80, inventoryY-20, inventoryWidth, 20);

                this.gameCtx.fillStyle = "black";
                this.gameCtx.fillRect(inventoryX, inventoryY, inventoryWidth, inventoryHeight);

                this.gameCtx.beginPath();
                this.gameCtx.lineWidth="6";
                this.gameCtx.strokeStyle="white";
                this.gameCtx.setLineDash([0]);
                this.gameCtx.rect(inventoryX-3, inventoryY-3, inventoryWidth+6, inventoryHeight+6);
                this.gameCtx.stroke();


                this.gameCtx.fillStyle = "white";
                this.gameCtx.fillRect(inventoryX, inventoryY + this.inventoryCursor * tileSize, tileSize, tileSize);

                for (var i = 0; i < this.player.inventory.length; i++) {
                    this.gameCtx.fillStyle = "white";
                    if (this.player.inventory[i].equipped == true) {
                        this.gameCtx.fillStyle = "grey";
                    }
                    this.gameCtx.font = "20px Courier New";
                    if (this.player.inventory[i].type == "SWORD" || this.player.inventory[i].type == "ARMOR") {
                      this.gameCtx.fillText("+"+this.player.inventory[i].buff+ " " + this.player.inventory[i].type, inventoryX + tileSize, inventoryY + 20 + i * tileSize);
                    } else {
                      this.gameCtx.fillText(this.player.inventory[i].type, inventoryX + tileSize, inventoryY + 20 + i * tileSize);
                    }

                }
            }
        }
    }

    this.cleanUp = function() {

    }

    this.drawSprite = function(img, xOffset, yOffset, spriteSize, tileSize, x, y,scale) {
        scale = scale || 1;
        this.gameCtx.drawImage(img, xOffset * spriteSize, yOffset * spriteSize, spriteSize, spriteSize, x * tileSize + screenOffset.x, y * tileSize + screenOffset.y, tileSize*scale, tileSize*scale);
    }
    this.populateItems = function(count) {
        for (var i = 0; i < count; i++) {
            var x = 0;
            var y = 0
            do {
                x = Math.floor(Math.random() * map[0].length)
                y = Math.floor(Math.random() * map.length)
            } while (map[y][x] != 0)
            this.items.push(new Item(x, y, itemTypes[Math.floor(Math.random() * itemTypes.length)]))
        }
    }

    this.populateTraps = function(count) {
        for (var i = 0; i < count; i++) {
            var x = 0;
            var y = 0
            do {
                x = Math.floor(Math.random() * map[0].length)
                y = Math.floor(Math.random() * map.length)
            } while (map[y][x] != 0)
            this.traps.push(new Trap(x, y))
        }
    }

    this.populateEnemies = function(count) {
        for (var i = 0; i < count; i++) {
            var x = 0;
            var y = 0
            do {
                x = Math.floor(Math.random() * map[0].length)
                y = Math.floor(Math.random() * map.length)
            } while (map[y][x] != 0 || (Math.abs(x-this.player.x) < 10 && Math.abs(y-this.player.y) < 10))
            this.enemies.push(new createRandomEnemy(x, y))
        }
    }

    this.updateEnemies = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            if (enemy.dead == false) {
                var turnsTaken = 0;
                if (enemy.coolingDown == true) {
                  enemy.coolingDown = false;
                  continue;
                }
                while (turnsTaken < enemy.numTurns) {
                  var newEnemyX = enemy.x;
                  var newEnemyY = enemy.y;
                  if (Math.abs(enemy.x - this.player.x) < enemy.sightRange && Math.abs(enemy.y - this.player.y) < enemy.sightRange) {
                      if (enemy.chasing == false) {
                          enemy.chasing = true;
                          addMessage(enemy.type, enemy.spotsPlayerText);
                      }

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
                  } else {
                      if (enemy.chasing == true) {
                          enemy.chasing = false;
                          addMessage(enemy.type, enemy.lostPlayerText);
                      }

                      newEnemyX += Math.floor(Math.random() * 3) - 1
                      newEnemyY += Math.floor(Math.random() * 3) - 1
                  }

                  if (enemy.big == false) {
                    if (map[newEnemyY] != undefined) {
                        if (map[newEnemyY][newEnemyX] != undefined) {
                            if (map[newEnemyY][newEnemyX] == 0 || enemy.ghost == true) {
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
                                if (enemy.coolsDown == true) {
                                  enemy.coolingDown = true;
                                }
                            }
                        }
                    }
                  } else {
                    if (map[newEnemyY] != undefined && map[newEnemyY+1] != undefined) {
                      if (map[newEnemyY][newEnemyX] != undefined && map[newEnemyY+1][newEnemyX] != undefined && map[newEnemyY][newEnemyX+1] != undefined && map[newEnemyY+1][newEnemyX+1] != undefined) {
                        if (map[newEnemyY][newEnemyX] == 0 && map[newEnemyY+1][newEnemyX] == 0 && map[newEnemyY][newEnemyX+1] == 0 && map[newEnemyY+1][newEnemyX+1] == 0 || enemy.ghost == true) {
                          //check if player
                          if ((this.player.x == newEnemyX && this.player.y == newEnemyY) || (this.player.x == newEnemyX+1 && this.player.y == newEnemyY) || (this.player.x == newEnemyX+1 && this.player.y == newEnemyY+1) || (this.player.x == newEnemyX && this.player.y == newEnemyY+1) ) {
                              var hitChance = Math.random();
                              if (hitChance < enemy.hitRate) {
                                  addMessage(enemy.type, enemy.attackText);
                                  this.player.takeDamage(enemy.damage)
                              } else {
                                  addMessage(enemy.type, "Attack missed the player!");
                              }

                          } else if (true) {
                              enemy.x = newEnemyX;
                              enemy.y = newEnemyY;
                          }

                          if (enemy.coolsDown == true) {
                            enemy.coolingDown = true;
                          }
                        }
                      }
                  }
                }
                turnsTaken++;
            }
        }
      }
    }

    this.checkForItems = function() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];

            if (item.x == this.player.x && item.y == this.player.y ) {
                if (this.player.inventory.length < 10) {
                  this.player.inventory.push(item);
                  //remove item
                  addMessage("PLAYER", "Picked up " + item.type)
                  this.items.splice(i, 1);

                } else {
                  addMessage("PLAYER","You have too much in your inventory to pick this up.");
                }


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
                    this.player.takeDamage(trap.damage, true);
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
            if (((enemy.big == false && enemy.x == x && enemy.y == y) || (enemy.big == true && ((x == enemy.x && y == enemy.y) || (x == enemy.x+1 && y == enemy.y) || (x == enemy.x+1 && y == enemy.y+1) || (x == enemy.x && y == enemy.y+1)))) && enemy.dead == false) {
                if (attack) {
                    var hitChance = Math.random();
                    if (hitChance < this.player.hitRate) {
                        addMessage("PLAYER", "You have attacked the enemy.");
                        enemy.hp -= damage;
                        if (enemy.hp <= 0) {
                            enemy.dead = true;
                            addMessage("PLAYER", enemy.type + " has been slain!");
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

function clearMessages() {
    var messageLog = document.getElementById("messageLog");
    messageLog.innerHTML = "<b>Message Log</b></br>";
}

function GetRandom (low, high) {
    return~~ (Math.random() * (high - low)) + low;
}
