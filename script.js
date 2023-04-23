const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")

window.focus()
const ship = {
    position : {
        x : canvas.width/2,
        y : canvas.height/2,
        angle: 0
    },
    velocity: {
        speed: 0,
        fallof: 0.985
    },
    actions: {
        forward: false,
        left: false,
        right: false,
    },
    draw() {
        c.save()
        c.translate(this.position.x,this.position.y)
        c.rotate(ship.position.angle)
        c.translate(-this.position.x,-this.position.y)
        c.font = "50px Work Sans, sans serif"
        c.fillStyle = "white"
        c.textAlign = "center"
        c.textBaseline = "middle"
        c.fillText("A",this.position.x,this.position.y)
        c.restore()
    },
    update() {
        if (this.actions.forward) {
            this.velocity.speed = 5
        }
        else {
            this.velocity.speed *= this.velocity.fallof
        }
        this.position.x += Math.sin(this.position.angle) * this.velocity.speed
        this.position.y += -Math.cos(this.position.angle) * this.velocity.speed

        if (this.position.y > canvas.height) {
            this.position.y = 0
        }
        else if (this.position.y < 0) {
            this.position.y = canvas.height
        }
        else if (this.position.x < 0) {
            this.position.x = canvas.width
        }
        else if (this.position.x > canvas.width) {
            this.position.x = 0
        }
    },
    rotate() {
        if (ship.actions.left) {
            ship.position.angle -= 0.05
        }
        if (ship.actions.right) {
            ship.position.angle += 0.05
        }
    }
}

class Bullet {
    constructor() {
        this.bullet = {
            x: ship.position.x,
            y: ship.position.y,
            dy: 8,
            angle: ship.position.angle,
            looped: false,
            draw() {
                c.fillStyle = "blue"
                c.beginPath()
                c.arc(this.x + Math.sin(this.angle),this.y - Math.cos(this.angle),7.5,0,2*Math.PI)
                c.fill()
            },
            update() {
                this.x += Math.sin(this.angle) * this.dy
                this.y += -Math.cos(this.angle) * this.dy
            }
        }
    }
}

let bullets = []

window.addEventListener("keydown", (e) => {
    const key = e.key
    if (key == "w") {
        ship.actions.forward = true
    }
    if (key == "a") {
        ship.actions.left = true
    }
    else if (key == "d") {
        ship.actions.right = true
    }
})
window.addEventListener("keyup", (e) => {
    const key = e.key
    if (key == "w") {
        ship.actions.forward = false
    }
    if (key == "a") {
        ship.actions.left = false
    }
    else if (key == "d") {
        ship.actions.right = false
    }
    if (key == " ") {
        bullets.push(new Bullet)
    }
})

function animate() {
    c.save()
    c.setTransform(1,0,0,1,0,0)
    c.clearRect(0,0,canvas.width,canvas.height)
    c.restore()
    bullets.forEach(e => {
        e.bullet.update()
        e.bullet.draw()
    });
    ship.draw()
    ship.rotate()
    ship.update()
    requestAnimationFrame(animate)
}

animate()
