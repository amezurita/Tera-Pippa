const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let interval = null;
let frames = 0;

const framesPerSecond = 60
const gameSpeed = (1000 / framesPerSecond) * 0.005

let rectanglesOnGame = []

class Rectangle {
    constructor(positionX, positionY, width, height, color, id) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.width = width;
        this.height = height;
        this.color = color || "red";
        this.id = id || null;

        rectanglesOnGame.push(this)
    }

    getBorders() {
        return {
            top: this.positionY,
            bottom: this.positionY + this.height,

            left: this.positionX,
            right: this.positionX + this.width,
        }
    }

    handleNewFrame() {
        this.draw()
    }

    incrementPosition(incrementX, incrementY) {
        this.positionX = this.positionX + ((incrementX || 0) * gameSpeed);
        this.positionY = this.positionY + ((incrementY || 0) * gameSpeed);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.positionX, this.positionY, this.width, this.height);
    }

    removeFromGame() {
        rectanglesOnGame = rectanglesOnGame.filter(item => item.id !== this.id)
    }
}

class Platform extends Rectangle {
    constructor(positionX, positionY, width, height, color, id, velocityX, velocityY) {
        super(positionX, positionY, width, height, color, "platform" + id)
        this.velocityX = velocityX || 0;
        this.velocityY = velocityY || 0;
    }

    handleNewFrame() {
        this.incrementPosition(this.velocityX, this.velocityY)

        if(this.positionY > canvas.height || this.positionX > canvas.width) {
            this.removeFromGame()
        } else {
            this.draw()
        }
    }
}

class Jumper extends Rectangle {
    constructor(positionX, positionY, width, height, color, id, jumpSpeed, moveSpeed, gravity) {
        super(positionX, positionY, width, height, color, id)

        this.moveSpeed = moveSpeed;
        this.jumpSpeed = jumpSpeed;

        this.moveVelocity = 0;
        this.fallVelocity = 0;

        this.gravity = gravity;
        
    }

    handleNewFrame() {
        const platforms = rectanglesOnGame.filter(r => 
            r instanceof Platform
        )

        let restingPlatform = this.findCollition(platforms)
        this.fall(restingPlatform)

        restingPlatform = this.findCollition(platforms)
        this.move(restingPlatform)

        restingPlatform = this.findCollition(platforms)
        this.avoidTraspasing(restingPlatform)

        this.draw()
    }

    handleControl(code, action) {
        const press = action === "press"

        if(code === 38 && press) {
            this.jump()
        }

        if(code === 37) {
            this.changeMovement(press ? 1 : 0, 0)
        }

        if(code === 39) {
            this.changeMovement(0, press ? 1 : 0)
        }
    }

    changeMovement(left, right) {
        left = left || 0;
        right = right || 0;

        this.moveVelocity = (right - left) * this.moveSpeed
    }

    move() {
        this.incrementPosition(this.moveVelocity)
    }

    jump() {
        const platforms = rectanglesOnGame.filter(r => 
            r instanceof Platform
        )

        let restingPlatform = this.findCollition(platforms, 0, 10)

        console.log(restingPlatform)


        if(!restingPlatform) {
            return 
        }

        this.fallVelocity = this.fallVelocity - this.jumpSpeed;
    }

    fall(isResting) {
        if(isResting) {
            this.fallVelocity = this.fallVelocity < 0 ? this.fallVelocity : 0
        } else {
            this.fallVelocity = this.fallVelocity + (this.gravity * gameSpeed);
        }

        this.incrementPosition(0, this.fallVelocity)
    }

    findCollition(collitionTargets, errorToleranceX, errorToleranceY) {
        errorToleranceX = errorToleranceX || 0
        errorToleranceY = errorToleranceY || 0

        const borders = this.getBorders() // {top, bottom, left, right}

    
        return collitionTargets.find(collitionTarget => {
            const targetBorders = collitionTarget.getBorders();
    
            const collitionX = (
                borders.right >= targetBorders.left &&
                borders.left <= targetBorders.right 
            )
    
            const collitionY = (
                (borders.bottom + errorToleranceY) >= targetBorders.top &&
                borders.top <= targetBorders.bottom
            )
    
            return collitionX && collitionY
        });
    }


    avoidTraspasing(collitionTarget) {
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
        */

        if(borders.bottom >= targetBorders.top) {
            this.positionY = targetBorders.top - this.height
        } else if(borders.top <= targetBorders.bottom) {
            this.positionY = targetBorders.bottom
        }
    }
}

const background = new Rectangle(0, 0, canvas.width, canvas.height, 'white', 'background')

new Platform(10, 50, 150, 30, 'blue', id = 1, velocityX = 0, velocityY = 5)
new Platform(100, 300, 80, 30, null, id = 2, velocityX = 0, velocityY = 5)
new Platform(5, 120, 80, 30, null, id = 3, velocityX = 0, velocityY = 5)

new Platform(0, canvas.height - 100, canvas.width, 100, 'orange', id = ' base', 0, 0)

const tera = new Jumper(0, 480, 30, 30, color = 'green', id = 'tera', jumpSpeed = 250, moveSpeed = 30, gravity = 100);

interval = setInterval(() => {

    rectanglesOnGame.forEach(item => item.handleNewFrame())
    frames++
}, 1000 / framesPerSecond)

addEventListener("keydown", (e) => {
    tera.handleControl(e.keyCode, "press")
})

addEventListener("keyup", (e) => {
    tera.handleControl(e.keyCode, "release")
})
