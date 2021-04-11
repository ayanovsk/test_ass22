var req;
var canvas = document.getElementById("canvas");
var cx =  canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 700;
var img_player = new Image();
img_player.src = "tank.jpg";

var x  = 0;
var y  = 0;
var w  = 80;
var h  = 65;
var xsp = 5;
var ysp = 5;
var keys = [];
var gravity = 5;
var platforms = [];
var score = 0;

var xR = 0;
var yR = 1000;
var wR  = 50;
var hR  = 25;
var xRsp = 5;
platforms.push({x: 0, y:100, w:100, h:10});
platforms.push({x: 100, y:180, w:100, h:10});
platforms.push({x: 200, y:245, w:200, h:10});
platforms.push({x: 300, y:345, w:300, h:10});
platforms.push({x: 400, y:450, w:300, h:20});
platforms.push({x: 500, y:550, w:500, h:20});

var xM  = 500;
var yM  = 500;
var wM  = 100;
var hM  = 100;
var xMsp = 1;
var yMsp = 1;

var img_coin = new Image();
img_coin.src = "prize.png";

var xC  = 300;
var yC  = 300;
var wC  = 20;
var hC  = 20;
var facing = "left";

var img_monster = new Image();
img_monster.src = "crocodili.jpg";

var img_bullet = new Image();
img_bullet.src = "bullet2.jpeg";

document.addEventListener('keyup', function(event) {
  keys[event.keyCode]=false;
});

document.addEventListener('keydown', function(event) {
  keys[event.keyCode]=true;
  event.preventDefault();
});

function setDirection()
{
  if (keys[40])
  {
    xR = x + w/2;
    yR = y + 10;
    if (facing == "left")
    {
      xRsp = -25;
    }
    else
    {
      xRsp = 25;
    }
  }

  if (keys[32] && gravity === 0) {y -= 120;}
if (keys[37] && x >= 0) {xsp = -5; facing = "left"; img_player.src = "image.jpg";}
else if (keys[39] && x+w <= canvas.width) {xsp = 5; facing = "right"; img_player.src = "tank.jpg"}
else {xsp = 0; ysp = 0;}
}

function lava()
{
  cx.fillStyle = "red";
  cx.fillRect(0, canvas.height-50, canvas.width, 50);
  if (y + h == canvas.height - 50) {gameOver(); }

}

function platform()
{
  gravity = 5;
  cx.fillStyle = "red";
 platforms.forEach(function(plat) {
   cx.fillRect(plat.x, plat.y, plat.w, plat.h);
   if (y + h == plat.y && x + w >= plat.x && x <= plat.x + plat.w)
   {
     gravity = 0;
   }
 });

}
function monster()
{
  cx.drawImage(img_monster, xM, yM, wM, hM);
  xM += xMsp;
  yM += yMsp;
  if (xR > xM && xM + wM > xR && yM + hM > yR && yR + hR > yM)
  {
    xM = 800;
    yM = 0;
    score += 100000
  }
  if (x + w > xM && xM + wM > x && yM + hM > y && y + h > yM){gameOver();}
  if (xM < 0 || xM > canvas.width) {xMsp = -xMsp;}
  if (yM < 0 || yM > canvas.height) {yMsp = -yMsp;}
}
function gameOver()
{
  cx.fillStyle = "red";
  cx.font = "30px comic sans Ms";
  cx.fillText("Game Over you lost!", 150, 50);
stop();
}
function stop()
{
  if (req)
  {
    cancelAnimationFrame(req);
    req = undefined;
  }
}

function coin()
{
  cx.drawImage(img_coin, xC, yC, wC, hC);
  if (x + w > xC && xC + wC > x && yC + hC > y && y + h > yC)
  {
    score += 100000
  var i = Math.floor(Math.random() * platforms.length);
  xC = platforms[i].x;
  yC = platforms[i].y - 40;
  }
}

function scoreDisplay()
{
  cx.fillstyle = "gold";
  cx.font = "30px Comic Sans MS";
  cx.fillText("Score: " + score, 500, 100)
}

function gameWin()
{cx.fillstyle = "gold";
  cx.font = "30px Comic Sans MS";
  cx.fillText("You Win and get a prize", 500, 200);
  stop();
}

function bullet()
{
cx.drawImage(img_bullet, xR , yR, hR, wR);
xR += xRsp;


}

function animate()
{
  req = requestAnimationFrame(animate);
  cx.clearRect(0, 0, canvas.width, canvas.height);
  cx.drawImage(img_player, x, y, w, h);
  x += xsp;
  y += ysp +gravity;
  setDirection();
  platform();
  lava();
  monster();
  coin();
  scoreDisplay();
  if (score === 1000000)
  {
  gameWin();
  }
  bullet();
}

animate();