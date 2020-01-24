const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let rectanglesOnGame = [];
let interval = null;
let lives = 3;

let frames = 0;

// const framesPerSecond = 240
const positionMultiplier = 1; // the greater, the bigger each "jump in position" each update have
const velocitiesMultiplier = 1;

const s = 1;
const intervalMiliSeconds = 15 * s; // 1000 / 60 = 16.666 // 15 -> each 15ms redraw the canvas
const updatePositions = () => frames % s === 0;

const img = {
  bg: "./Imgs/city.png",
  heart: "./Imgs/heart.png",
  tera: "./Imgs/tera.png",
  pippa: "./Imgs/pippa.png",
  coin: "./Imgs/coin.png"
};

const miau = new Audio();
miau.src = "./Sounds/ES_Cat Meow 1 - SFX Producer.mp3";

const guau = new Audio();
guau.src = "./Sounds/Dog Whine-SoundBible.com-260290547.wav";

const getLives = () =>
  rectanglesOnGame.find(r => r instanceof Icons && r.id === "lives");

class Icons {
  constructor(positionX, positionY, width, height, amount, id, asset) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.width = width;
    this.height = height;
    this.amount = amount;
    this.id = id;
    this.asset = asset;

    this.image = new Image();
    this.image.src = img[this.asset];

    rectanglesOnGame.push(this);
  }

  handleNewFrame() {
    this.draw();
  }

  draw() {
    for (let i = 0; i < this.amount; i++) {
      ctx.drawImage(
        this.image,
        this.positionX + i * this.width + i * 10,
        this.positionY,
        this.width,
        this.height
      );
    }
  }

  decrease() {
    this.amount--;
  }

  increase() {
    this.amount++;
  }
}

class Rectangle {
  constructor(positionX, positionY, width, height, color, id) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.width = width;
    this.height = height;
    this.color = color || "black";
    this.id = id || null;

    this.img = null;

    rectanglesOnGame.push(this);
  }

  setImage(src) {
    this.img = new Image();
    this.img.src = src;
  }

  getBorders() {
    return {
      top: this.positionY,
      bottom: this.positionY + this.height,

      left: this.positionX,
      right: this.positionX + this.width
    };
  }

  handleNewFrame() {
    this.draw();
  }

  incrementPosition(incrementX, incrementY) {
    if (!updatePositions()) {
      return;
    }

    this.positionX = this.positionX + (incrementX || 0) * positionMultiplier;
    this.positionY = this.positionY + (incrementY || 0) * positionMultiplier;
  }

  draw() {
    if(this.img) {
      ctx.drawImage(this.img, this.positionX, this.positionY, this.width, this.height);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.positionX, this.positionY, this.width, this.height);
    }
  }

  removeFromGame() {
    rectanglesOnGame = rectanglesOnGame.filter(item => item.id !== this.id);
  }
}

class Platform extends Rectangle {
  constructor(
    positionX,
    positionY,
    width,
    height,
    color,
    id,
    velocityX,
    velocityY
  ) {
    super(positionX, positionY, width, height, color, "platform" + id);

    this.velocityX = velocityX || 0;
    this.velocityY = velocityY || 0;
  }

  handleNewFrame() {
    this.incrementPosition(this.velocityX, this.velocityY);
    this.comeBack();
    this.draw();
  }

  comeBack() {
    if (this.positionY > 670) {
      this.positionY = 0;
    }
  }
}

class Collectable extends Rectangle {
  constructor(
    positionX,
    positionY,
    width,
    height,
    id,
    asset,
    counter
  ) {
    super(positionX, positionY, width, height, 'black', "item " + id);
    this.asset = asset

    this.image = new Image();
    this.image.src = img[this.asset];

    this.lastTimeCatched = 0;
    this.counter = counter;

    rectanglesOnGame.push(this);
  }

  handleNewFrame() {
    if(this.canBeCollected()) {
      if(this.checkCollitions()) {
        this.collect()
      } else {
        this.draw();
      }
    }
  }

  checkCollitions() {
    const borders = this.getBorders(); // this is the collectable
    const jumper = rectanglesOnGame.find(r => r instanceof Jumper && r.id === 'tera');

    const jumperBorders = jumper.getBorders();

    const collitionX =
      borders.right >= jumperBorders.left &&
      borders.left <= jumperBorders.right;

    const collitionY =
      borders.bottom >= jumperBorders.top &&
      borders.top <= jumperBorders.bottom;

    return collitionX && collitionY;
  }

  collect() {
    this.lastTimeCatched = Date.now();
    this.counter.increase()
    miau.play()
  }

  canBeCollected() {
    return this.lastTimeCatched === 0 || ( Date.now() - this.lastTimeCatched) > (3 * 1000)
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.positionX,
      this.positionY,
      this.width,
      this.height
    );
  }


}

class Jumper extends Rectangle {
  constructor(
    positionX,
    positionY,
    width,
    height,
    color,
    id,
    jumpSpeed,
    moveSpeed,
    gravity
  ) {
    super(positionX, positionY, width, height, color, id);

    this.moveSpeed = moveSpeed;
    this.jumpSpeed = jumpSpeed;

    this.moveVelocity = 0;
    this.fallVelocity = 0;

    this.gravity = gravity;
  }



  // cada "frame" = 15miliseconds
  handleNewFrame() {
    // move it in vertical and horizontally
    this.fall();
    this.move(); // this is only horizontal movement

    // this that undo movement
    this.markLimits();

    this.draw();
  }

  // every time a key is press/released
  handleControl(code, action) {
    const press = action === "press";

    if (code === 38 && press) {
      this.jump();
    }

    if (code === 37) {
      this.changeMovement(press ? 1 : 0, 0);
    }

    if (code === 39) {
      this.changeMovement(0, press ? 1 : 0);
    }
  }

  changeMovement(left, right) {
    left = left || 0;
    right = right || 0;

    this.moveVelocity = (right - left) * this.moveSpeed;
  }

  move() {
    // should it care about platform colliding ?
    this.incrementPosition(this.moveVelocity);
  }

  jump() {
    const borders = this.getBorders();

    const isOnFloor = borders.bottom + 10 >= canvas.height;
    const isOnPlatform = this.findPlatform();

    if (isOnPlatform || isOnFloor) {
      this.fallVelocity = 0 - this.jumpSpeed * velocitiesMultiplier;
    }

    console.log(isOnPlatform, isOnFloor, this.fallVelocity, this.jumpSpeed);
  }

  fall() {
    if (!updatePositions()) {
      return;
    }

    const isOnPlatform = this.findPlatform();

    if (isOnPlatform && this.fallVelocity > 0) {
      this.fallVelocity = 0;
    }

    if (!isOnPlatform) {
      this.fallVelocity =
        this.fallVelocity + this.gravity * velocitiesMultiplier;
    }

    this.incrementPosition(0, this.fallVelocity);
  }

  markLimits() {
    const borders = this.getBorders();

    if (borders.right >= canvas.width) {
      this.positionX = canvas.width - this.width;
    } else if (borders.left < 0) {
      return (this.positionX = 0);
    }

    if (borders.bottom >= canvas.height && !(this.fallVelocity < 0)) {
      this.positionY = canvas.height - this.height;
    }

    //TODO: put a limit on the top
  }

  findPlatform() {
    return this.findCollition(0, 0);
    /*
        const borders = this.getBorders()
        const platforms = rectanglesOnGame.filter(r => r instanceof Platform)

        return platforms.find(platform => {
            const platformBorders = platform.getBorders()

            return (
                borders.bottom >= platformBorders.top && borders.bottom <= platformBorders.bottom
            )
        })
        */
  }

  findCollition(errorToleranceX, errorToleranceY) {
    errorToleranceX = errorToleranceX || 0;
    errorToleranceY = errorToleranceY || 0;

    const borders = this.getBorders();
    const platforms = rectanglesOnGame.filter(r => r instanceof Platform);

    return platforms.find(platform => {
      const platformBorders = platform.getBorders();

      const collitionX =
        borders.right >= platformBorders.left &&
        borders.left <= platformBorders.right;

      const collitionY =
        borders.bottom + errorToleranceY >= platformBorders.top &&
        borders.top <= platformBorders.bottom;

      return collitionX && collitionY;
    });
  }

  /*
    avoidTraspasing(collitionTarget) {
        const collitionTarget = false

        if(!collitionTarget) {
            return
        }

        const borders = this.getBorders()
        const targetBorders = collitionTarget.getBorders()
        /*
        if(borders.right >= targetBorders.left) {
            this.positionX = targetBorders.left - this.width - 1
        } else if(borders.left <= targetBorders.right) {
            this.positionX = targetBorders.right + 1
        }

        if(borders.bottom >= targetBorders.top) {
            this.positionY = targetBorders.top - this.height
        } else if(borders.top <= targetBorders.bottom) {
            this.positionY = targetBorders.bottom
        }
    }
    */
}
class Shifter extends Jumper {
  constructor(
    positionX,
    positionY,
    width,
    height,
    color,
    id,
    jumpSpeed,
    moveSpeed,
    gravity
  ) {
    super(
      positionX,
      positionY,
      width,
      height,
      color,
      id,
      jumpSpeed,
      moveSpeed,
      gravity
    );

    this.lastTimeHitted = 0
  }

  handleNewFrame() {
    this.move(); // this is only horizontal movement
    this.markLimits();
    this.receiveDamage();

    if(this.isDamaged()) {
      this.color = 'yellow'
    } else {
      this.color = 'red'
    }

    this.draw();
  }

  // every time a key is press/released
  handleControl(code, action) {
    const press = action === "press";

    if (code === 65) {
      this.changeMovement(press ? 1 : 0, 0);
    }

    if (code === 68) {
      this.changeMovement(0, press ? 1 : 0);
    }
  }

  isDamaged() {
    const hittedTimeDiference = Date.now() - this.lastTimeHitted

    return (hittedTimeDiference < (2*1000) && this.lastTimeHitted !== 0)
  }

  receiveDamage() {
    if(this.isDamaged()) {
      return
    }

    const collition = this.findCollition(0, 0);
    const lives = getLives();

    if (collition) {
      guau.play()
      lives.decrease();
      this.lastTimeHitted = Date.now()
    }
  }

  /*
    constructor(positionX, positionY, width, height, id, jumpSpeed, moveSpeed) {
        super(positionX, positionY, width, height, id)

        this.moveSpeed = moveSpeed;
        this.jumpSpeed = jumpSpeed;

        this.moveVelocity = 0;
        this.fallVelocity = 0;

       
        this.img = img;
        this.img.src = img.src
        
    }
    */
}

const background = new Rectangle(
  0,
  0,
  canvas.width,
  canvas.height,
  "violet",
  "background"
);

background.setImage(img.bg)

new Icons(0, 0, 20, 20, 3, "lives", "heart");
const counter = new Icons(0, 30, 20, 20, 0, "coins", "coin");

new Collectable(
  Math.floor(Math.random() * 50) + 100, 
  Math.floor(Math.random() * 400) + 200, 
  30, 30, 
 "coin", "coin",
  counter
)

new Platform(100, -50, 199, 30, null, (id = 1), null, (velocityY = 3));
new Platform(80, 10, 70, 30, null, (id = 2), null, (velocityY = 3));
new Platform(200, 120, 240, 30, null, (id = 3), null, (velocityY = 3));
new Platform(470, 180, 80, 30, null, (id = 4), null, (velocityY = 3));
new Platform(270, -100, 80, 30, null, (id = 5), null, (velocityY = 3));
new Platform(340, -190, 120, 30, null, (id = 6), null, (velocityY = 3));
new Platform(320, 300, 120, 30, null, (id = 6), null, (velocityY = 3));

// new Platform(0, canvas.height - 100, canvas.width, 5, 'purple', id = ' base', 0, 0)

const tera = new Jumper(
  120,
  620,
  50,
  50,
  (color = "green"),
  (id = "tera"),
  (jumpSpeed = 45),
  (moveSpeed = 6),
  (gravity = 5)
);
tera.setImage(img.tera)
const pippa = new Shifter(
  220,
  640,
  50,
  50,
  (color = "red"),
  (id = "pippa"),
  (jumpSpeed = 0),
  (moveSpeed = 10),
  (gravity = 0)
);
pippa.setImage(img.pippa)

//function paint(){
//   background.drawImage(img.bg, 0, 0)
//}

interval = setInterval(() => {
  if (getLives().amount === 0) {
    clearInterval(interval);

    new Rectangle(0, 0, canvas.width, canvas.height, 'black').draw()

    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game over", 20, 50);
    ctx.fillText("Coins: " + counter.amount, 20, 90);

    return
  }

  if(counter.amount === 3) {
    clearInterval(interval);

    new Rectangle(0, 0, canvas.width, canvas.height, 'black').draw()

    ctx.fillStyle = "yellow";
    ctx.font = "30px Arial";
    ctx.fillText("Win", 20, 50);
    ctx.fillText("Coins: " + counter.amount, 20, 90);

    return
  }

  rectanglesOnGame.forEach(item => item.handleNewFrame());
  frames++;
}, intervalMiliSeconds);

function start() {
  setInterval(interval);
  update;
}

addEventListener("keydown", e => {
  tera.handleControl(e.keyCode, "press");
  pippa.handleControl(e.keyCode, "press");
});

addEventListener("keyup", e => {
  tera.handleControl(e.keyCode, "release");
  pippa.handleControl(e.keyCode, "release");
});
