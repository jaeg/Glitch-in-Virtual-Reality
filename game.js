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


var rooms = [];
//Based on http://bigbadwofl.me/random-dungeon-generator/
function generateMap(map_size) {
    //Initialize the array
    map = [];
    for (var y = 0; y < map_size; y++) {
        map[y] = [];
        for (var x = 0; x < map_size; x++) {
            map[y][x] = 3;
        }
    }

    //Generate Rooms
    var room_count = GetRandom(15, 31);
    var min_size = 5;
    var max_size = 15;

    for (var i = 0; i < room_count; i++) {
      var room = {connectedTo:[]};

      room.x = GetRandom(1, map_size - max_size - 1);
      room.y = GetRandom(1, map_size - max_size - 1);
      room.w = GetRandom(min_size, max_size);
      room.h = GetRandom(min_size, max_size);

      if (DoesCollide(room)) {
          i--;
          continue;
      }
      room.w--;
      room.h--;

      rooms.push(room);
    }
    //Squash rooms
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < rooms.length; j++) {
            var room = rooms[j];
            while (true) {
                var old_position = {
                    x: room.x,
                    y: room.y
                };
                if (room.x > 1) room.x--;
                if (room.y > 1) room.y--;
                if ((room.x == 1) && (room.y == 1)) break;
                if (this.DoesCollide(room, j)) {
                    room.x = old_position.x;
                    room.y = old_position.y;
                    break;
                }
            }
        }
    }

    //Create corridors
    for (i = 0; i < room_count; i++) {
        var roomA = rooms[i];
        var roomB = FindClosestRoom(roomA);

        roomA.connectedTo.push(roomB);
        roomB.connectedTo.push(roomA);

        pointA = {
            x: GetRandom(roomA.x, roomA.x + roomA.w),
            y: GetRandom(roomA.y, roomA.y + roomA.h)
        };
        pointB = {
            x: GetRandom(roomB.x, roomB.x + roomB.w),
            y: GetRandom(roomB.y, roomB.y + roomB.h)
        };
        while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
            if (pointB.x != pointA.x) {
                if (pointB.x > pointA.x) pointB.x--;
                else pointB.x++;
            }
            else if (pointB.y != pointA.y) {
                if (pointB.y > pointA.y) pointB.y--;
                else pointB.y++;
            }

            map[pointB.y][pointB.x] = 0;
        }
    }
    //Translate rooms to map
    for (i = 0; i < room_count; i++) {
        var room = rooms[i];
        for (var x = room.x; x < room.x + room.w; x++) {
            for (var y = room.y; y < room.y + room.h; y++) {
                map[y][x] = 0;
            }
        }
    }

    //Create Walls
    for (var x = 0; x < map_size; x++) {
        for (var y = 0; y < map_size; y++) {
            if (map[y][x] == 0) {
                for (var xx = x - 1; xx <= x + 1; xx++) {
                    for (var yy = y - 1; yy <= y + 1; yy++) {
                        if (map[yy][xx] == 3) map[yy][xx] = 1;
                    }
                }
            }
        }
    }
}

function FindClosestRoom(room) {
    var mid = {
        x: room.x + (room.w / 2),
        y: room.y + (room.h / 2)
    };
    var closest = null;
    var closest_distance = 1000;
    for (var i = 0; i < rooms.length; i++) {
        var check = rooms[i];
        if (check == room) continue;
        if (room.connectedTo.indexOf(check) != -1) continue;
        if (check.connectedTo.indexOf(room) != -1) continue;
        var check_mid = {
            x: check.x + (check.w / 2),
            y: check.y + (check.h / 2)
        };
        var distance = Math.abs(mid.x - check_mid.x) + Math.abs(mid.y - check_mid.y);
        if (distance < closest_distance) {
            closest_distance = distance;
            closest = check;
        }
    }
    return closest;
}

function DoesCollide(room, ignore) {
    for (var i = 0; i < rooms.length; i++) {
        if (i == ignore) continue;
        var check = rooms[i];
        if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h)))
            return true;
    }

    return false;
}

generateMap(100);

var itemTypes = ["FOOD", "POTION", "SWORD", "ARMOR"];
var enemyTypes = ["RAT", "BAT", "ZOMBIE", "GOBLIN"];
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

    this.takeDamage = function(amount) {
        var damage = amount - this.armor;
        if (damage < 0) {
            damage = 0;
        }
        this.hp -= damage
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
                if (map[newPosY][newPosX] == 0) {
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
    this.type = type || "FOOD";
    this.equipped = false;
    this.useText = "Food has been collected!"
    this.buff = Math.floor(Math.random() * 20)
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
            amount = Math.round(amount);
        }
        if (badEffect) {
            player[effect] -= amount;
            addMessage("ITEM", "The potion made you fill ill.")
        } else {
            player[effect] += amount;
            addMessage("ITEM", "The potion made you fill impowered.")
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
        this.populateTraps(10);
        this.populateEnemies(1);
        this.populateItems(50);
        this.inventoryUp = false;
        this.inventoryCursor = 0;
        var x = 0;
        var y = 0;

        do {
            x = Math.floor(Math.random() * map[0].length)
            y = Math.floor(Math.random() * map.length)
        } while (map[y][x] != 0)
        this.player.x = x;
        this.player.y = y;

        var x = 0;
        var y = 0;

        do {
            x = Math.floor(Math.random() * map[0].length)
            y = Math.floor(Math.random() * map.length)
        } while (map[y][x] != 0 || (Math.abs(x-this.player.x) < map.length/4 && Math.abs(y-this.player.y) < map.length/4))
        this.stairsX = x;
        this.stairsY = y;
    }

    this.update = function() {
        this.player.updateUI();
        //Screen move
        if (this.player.x * tileSize + screenOffset.x + tileSize > this.gameCanvas.width)
            screenOffset.x -= this.gameCanvas.width;
        if (this.player.x * tileSize + screenOffset.x < 0)
            screenOffset.x += this.gameCanvas.width;
        if (this.player.y * tileSize + screenOffset.y + tileSize > this.gameCanvas.height)
            screenOffset.y -= this.gameCanvas.height;
        if (this.player.y * tileSize + screenOffset.y < 0)
            screenOffset.y += this.gameCanvas.height;

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
        if (this.state == "menu") {
            this.gameCtx.fillStyle = "black";
            this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

            this.gameCtx.fillStyle = "white";
            this.gameCtx.font = "20px Courier New";
            this.gameCtx.fillText("Hit Enter To Start", 240, 240);
        }

        if (this.state == "play") {
            for (var y = 0; y < map.length; y++) {
                for (var x = 0; x < map[y].length; x++) {
                    var tile = map[y][x];

                    if (tile == 1) {
                        this.drawSprite(tilesImage, 2, 0, spriteTileSize, tileSize, x, y);

                    }

                    if (tile == 3) {
                        this.gameCtx.fillStyle="grey";
                        this.gameCtx.fillRect(x * tileSize + screenOffset.x, y * tileSize + screenOffset.y, tileSize, tileSize);
                    }
                }
            }

            //draw traps
            for (var i = 0; i < this.traps.length; i++) {
                var trap = this.traps[i];
                if (trap.spotted && !trap.setOff) {
                    this.drawSprite(tilesImage, 7, 0, spriteTileSize, tileSize, trap.x, trap.y);
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

                switch (enemy.type) {
                    case "RAT":
                        xOffset = 14;
                        yOffset = 6;

                        break;
                }

                if (enemy.dead == false) {
                    this.drawSprite(tilesImage, xOffset, yOffset, spriteTileSize, tileSize, enemy.x, enemy.y)
                } else {
                    this.drawSprite(tilesImage, 10, 1, spriteTileSize, tileSize, enemy.x, enemy.y)
                }
            }

            this.drawSprite(tilesImage, 5, 5, spriteTileSize, tileSize, this.player.x, this.player.y);

            this.drawSprite(tilesImage, 5, 0, spriteTileSize, tileSize, this.stairsX, this.stairsY);

            //Mini map
            this.gameCtx.fillStyle="white";
            this.gameCtx.fillRect(this.player.x*4, this.player.y*4 , 4, 4);
            for (var y = 0; y < map.length; y++) {
                for (var x = 0; x < map[y].length; x++) {
                    var tile = map[y][x];

                    if (tile == 1) {
                        this.gameCtx.fillStyle="red";
                        this.gameCtx.fillRect(x*4 , y*4 , 4, 4);

                    }
                }
            }
            //draw inventory
            if (this.inventoryUp) {
                var inventoryX = this.gameCanvas.width / 4;
                var inventoryY = this.gameCanvas.height / 4;
                var inventoryWidth = this.gameCanvas.width / 2;
                var inventoryHeight = this.gameCanvas.height / 2
                this.gameCtx.fillStyle = "black";
                this.gameCtx.fillRect(inventoryX, inventoryY, inventoryWidth, inventoryHeight);

                this.gameCtx.fillStyle = "white";
                this.gameCtx.fillRect(inventoryX, inventoryY + this.inventoryCursor * tileSize, tileSize, tileSize);

                for (var i = 0; i < this.player.inventory.length; i++) {
                    this.gameCtx.fillStyle = "white";
                    if (this.player.inventory[i].equipped == true) {
                        this.gameCtx.fillStyle = "blue";
                    }
                    this.gameCtx.font = "20px Courier New";
                    this.gameCtx.fillText(this.player.inventory[i].type, inventoryX + tileSize, inventoryY + 20 + i * tileSize);
                }
            }
        }
    }

    this.cleanUp = function() {

    }

    this.drawSprite = function(img, xOffset, yOffset, spriteSize, tileSize, x, y) {
        this.gameCtx.drawImage(img, xOffset * spriteSize, yOffset * spriteSize, spriteSize, spriteSize, x * tileSize + screenOffset.x, y * tileSize + screenOffset.y, tileSize, tileSize);
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
            } while (map[y][x] != 0)
            this.enemies.push(new Enemy(x, y))
        }
    }

    this.updateEnemies = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            if (enemy.dead == false) {
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

                if (map[newEnemyY] != undefined) {
                    if (map[newEnemyY][newEnemyX] != undefined) {
                        if (map[newEnemyY][newEnemyX] == 0) {
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
            }
        }
    }

    this.checkForItems = function() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];

            if (item.x == this.player.x && item.y == this.player.y) {
                this.player.inventory.push(item);
                //remove item
                addMessage("PLAYER", "Picked up " + item.type)
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
