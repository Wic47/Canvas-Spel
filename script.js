
const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")
const width = canvas.width
const height = canvas.height
window.focus

const ship =  {
    x: width/2,
    y: height/2,
    dy: 4,
    dx: 4,
    movement: {
        forward: false,
        right: false,
        left: false
    },
    draw() {
        c.font = "30px Ruda"
        c.fillStyle = "white"
        c.fillText("A", ship.x, ship.y)
    }
}

const bullet = {
    x: ship.x,
    y: ship.y,
    dy: 5,
    dx: 5,

}

let bullets = []

document.addEventListener("keydown", e => {
    const key = e.key
    
    if (key == "w") {
        ship.movement.forward = true
    }
    else if (key == "a") {
        ship.movement.left = true
    }
    else if (key == "d") {
        ship.movement.right = true
    }
})

document.addEventListener("keyup", e => {
    const key = e.key
    
    if (key == "w") {
        ship.movement.forward = false
    }
    else if (key == "a") {
        ship.movement.left = false
    }
    else if (key == "d") {
        ship.movement.right = false
    }
})


function draw() {
    requestAnimationFrame(draw)
    if (ship.movement.left) {
        c.translate(ship.x,ship.y)
        c.rotate(-0.05)
        c.translate(-ship.x,-ship.y)
    }
    if (ship.movement.right) {
        c.translate(ship.x,ship.y)
        c.rotate(0.05)
        c.translate(-ship.x,-ship.y)
    }
    c.save()
    c.setTransform(1,0,0,1,0,0)
    c.clearRect(0,0,width,height)
    c.restore()
    ship.draw()

    if (ship.movement.forward) {
        ship.y -= ship.dy
    }
}   

draw()
