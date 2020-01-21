
//setup

const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")
 const img = {
     bg: "./Imgs/neon-city.jpg",
     heart: "./Imgs/heart.png",
     feather:"./Imgs/feather.png", 
     bird: "./Imgs/birds.png",
     nut: "./Imgs/almond.png",
     tera: "./Imgs/tera.png",
     pippa:"./Imgs/pippa.png",
     bomb: "./Imgs/bomb.png",
 }
 let nut = []
 let feather = 0
 let frames = 0
 let interval
 let pajaritos = []
 let plumitas = 0
 

 //Background

 class Background {
     constructor(){
         this.y = y
         this.x = x
         this.width = canvas.width
         this.height = canvas.height
         this.img = new Image()
         this.img.src = img.bg
         this.img.onload = () => {
            this.draw()
          }
     }
        draw() {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
          }

     }
 let background = new Background
 function update(){
    frames++
    ctx.clearRect(0, 0, canvas.width , canvas.height)
    background.draw()
 }
 function startGame(){
    if(interval) return
    interval = setInterval(update,1000 / 60)
    pajaritos = []
    frames = 0
    background.draw()
 }
 
 
 window.onload = function() {
    startGame()
 }
 

 


