//setup

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const img = {
  bg: "./Imgs/neon-city.jpg",
  heart: "./Imgs/heart.png",
  feather: "./Imgs/feather.png",
  bird: "./Imgs/birds.png",
  nut: "./Imgs/almond.png",
  tera: "./Imgs/tera.png",
  pippa: "./Imgs/pippa.png",
  bomb: "./Imgs/bomb.png"
};
let nut = [];
let feather = 0;
let frames = 0;
let interval;
let pajaritos = [];
let plumitas = 0;
let audio = "./"

//Background

class Upper {
  constructor(y, x) {
    this.y = 0;
    this.x = 0;
    this.width = canvas.width;
    this.height = canvas.height - 150;
   
  }
  draw() {
   let grd = ctx.createLinearGradient(0,0,0,520)
    grd.addColorStop(0, "violet");
    grd.addColorStop(1, "white");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 500, 520)
  }
}

class Down {
    constructor(y, x) {
        this.y = 520;
        this.x = 0;
        this.width = canvas.width;
        this.height = canvas.height - this.y;
      }
      draw(){
        ctx.fillStyle = "violet";
        ctx.fillRect(0, 520, 500, 150)
      }
}

class Tera {
    constructor(){
        this.y = 470
        this.x = 200
        this.width = 50;
        this.height = 50;
        this.img = new Image()
       this.img.src = img.tera
       this.img.onload = () => { this.draw()}

    }
    draw(){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
    }
    goLeft(){
        this.x -= 10
    }
    goRight(){
        this.x += 10
    }
    jump(){
        this.y -= 50
    }
}

class Pippa {
    constructor(x,y){
        this.y = 620
        this.x = 200
        this.width = 50;
        this.height = 50;
        this.img = new Image()
        this.img.src = img.pippa
        this.img.onload = () => {
            this.draw()
        }
    }
    draw(){
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
    //console.log("miau")
    }
    goLeft(){
        this.x -= 15
    }
    goRight(){
        this.x += 15
    }
}


class Plataform {
    constructor(){
        this.x = x 
        this.y = y 
        this.width = canvas.height - 200
    }
    
}

let tera = new Tera();
let pippa = new Pippa();
let upper = new Upper();
let down = new Down();


function update() {
  frames++;
  //ctx.clearRect(0, 0, canvas.width, canvas.height);

  upper.draw();
  down.draw();
  tera.draw();
  pippa.draw();
  
}

function startGame() {
  if(interval) return
  interval = setInterval(update, 1000 / 60);
  pajaritos = [];
  frames = 0;
}

  document.addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
      case 32:
       tera.jump()
      case 37:
        tera.goLeft()
        break
      case 39:
        tera.goRight()
        break
      case 65:
        pippa.goLeft()
        break
      case 68:
        pippa.goRight()
        break
    }
  })


window.onload = function() {
  startGame();
};

