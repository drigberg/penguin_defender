/**
 * Basic surival game created using pixi.js and planck.js
 */
let body

(function main() {
  const pscale = 13;

  function mpx(m) {
    return m * pscale + (window.innerWidth / 2.3);
  }

  function mpy(m) {
    return window.innerHeight * 0.5 - (m * pscale);
  }

  const app = new PIXI.Application(window.innerWidth * 0.9, window.innerHeight * 0.9)
  const container = new PIXI.Container();
  app.stage.addChild(container);

  document.getElementById('content').appendChild(app.view);
  app.view.style.position = 'absolute';
  app.view.style.border = '1px solid #222222';

  function intersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item))
  }

  let idPointer = 0

  function createId() {
    idPointer += 1
    return idPointer
  }

  const RED = '#ee1111'
  const BLUE = '#5555ee'
  const YELLOW = '#aaaa22'
  const GREEN = '#22aa22'

  const BIT_RED = 0xEE5555
  const BIT_BLUE = 0x5555EE
  const BIT_YELLOW = 0xAAAA22
  const BIT_GREEN = 0x22AA22

  const TEXT_STYLE = new PIXI.TextStyle({
    fontFamily: 'Courier New',
    fontSize: 72,
    stroke: '#000000',
    strokeThickness: 5,
    fontWeight: 'bold',
    fill: BLUE,
  });

  const LEFT = -1
  const RIGHT = 1

  const SPRITE = 'SPRITE'
  const GROUND = 'GROUND'
  const WALL = 'WALL'
  const FISH = 'FISH'
  const SEAL = 'SEAL'
  const GULL = 'GULL'

  const INVINCIBILITY_INTERVAL = 30
  const SHAKE_THRESHOLD = 20
  const GRAVITY = -60
  const BACKGROUND_TEXTURE = PIXI.Texture.fromImage('assets/sierra.png')
  const BORDER_X_RIGHT = 40
  const BORDER_X_LEFT = -40

  const HEALTH_BAR_X = -40
  const HEALTH_BAR_Y = 26
  const HEALTH_BAR_MAX_WIDTH = 10

  const SPRITE_JUMP = 35
  const SPRITE_MAX_HEALTH = 5
  const SPRITE_DAMAGE = 1
  const SPRITE_SPEED = 25
  const SPRITE_MAX_JUMPS = 3
  const SPRITE_SPRINT_MULTIPLIER = 1.75
  const SPRITE_GLIDE_IMPULSE = 7
  const SPRITE_TEXTURE = PIXI.Texture.fromImage('assets/penguin.png')

  const FISH_DAMAGE = 1
  const FISH_THROW_X = 20
  const FISH_THROW_Y = 50
  const FISH_THROW_INTERVAL = 25
  const FISH_TEXTURE = PIXI.Texture.fromImage('assets/fish.png')

  const SEAL_SPEED = 5.0
  const SEAL_HEALTH = 1
  const SEAL_DAMAGE = 1
  const SEAL_SPAWN_X = 60
  const SEAL_SPAWN_Y = 5
  const SEAL_PROBABILITY = 0.01
  const SEAL_JUMP = 7
  const SEAL_MAX_JUMPS = 1
  const SEAL_POINTS = 10
  const SEAL_TEXTURE = PIXI.Texture.fromImage('assets/penguin.png')

  const GULL_SPEED = 3.0
  const GULL_HEALTH = 1
  const GULL_DAMAGE = 2
  const GULL_SPAWN_X = 60
  const GULL_SPAWN_Y = 20
  const GULL_FLAP = 7
  const GULL_FLAP_INTERVAL = 45
  const GULL_PROBABILITY = 0.01
  const GULL_POINTS = 15
  const GULL_TEXTURE = PIXI.Texture.fromImage('assets/penguin.png')

  let waveCountdown = 100

  let gameActive = true

  const ENEMY_TYPES = [
    GULL,
    SEAL,
  ]

  const collisions = []
  const Vec2 = planck.Vec2

  const world = new planck.World({
    gravity: Vec2(0, GRAVITY)
  })

  let sprite
  let enemies = {}
  let fishes = {}
  let points = 0
  let healthBar
  let textDisplay
  let pointDisplay
  let background

  function gameOver() {
    resetBodies()
    textDisplay.show('GAME OVER', {
      fill: RED
    });
  }

  function resetBodies() {
    healthBar.graphics.clear();

    Object.keys(enemies).forEach((id) => {
      enemies[id].destroy()
    })

    Object.keys(fishes).forEach((id) => {
      fishes[id].destroy()
    })

    sprite.destroy()

    fishes = {}
    enemies = {}
  }

  function addPoints(num) {
    points += num
    console.log(`${points} points!`)
  }

  world.on('pre-solve', function (contact, oldManifold) {
    const manifold = contact.getManifold()

    if (!manifold.pointCount) {
      return
    }

    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()

    const types = [
      fixtureA.getBody().type,
      fixtureB.getBody().type,
    ]

    if (types.includes(WALL) && intersection(types, ENEMY_TYPES).length) {
      contact.setEnabled(false)
    } else if (types.includes(SPRITE) && types.includes(FISH)) {
      contact.setEnabled(false)
    } else if (types.includes(FISH) && types.includes(WALL)) {
      contact.setEnabled(false)
    }

    const worldManifold = contact.getWorldManifold()

    for (let i = 0; i < manifold.pointCount; ++i) {
      collisions.push({
        fixtureA,
        fixtureB,
        position: worldManifold.points[i],
        normal: worldManifold.normal,
        normalImpulse: manifold.points[i].normalImpulse,
        tangentImpulse: manifold.points[i].tangentImpulse,
        separation: worldManifold.separations[i],
      })
    }
  })

  function setDefaults(testbed) {
    testbed.info('←/→: Accelerate sprite, ↑: jump, ↓: attack')
    testbed.speed = 2
    testbed.hz = 50
  }

  class HealthBar {
    constructor() {
      this.graphics = new PIXI.Graphics();
      container.addChild(this.graphics);
    }
    update(health) {
      if (this.body) {
        world.destroyBody(this.body)
      }

      if (health) {
        this.body = world.createBody(Vec2(HEALTH_BAR_X, HEALTH_BAR_Y));
        this.body.createFixture(planck.Box(HEALTH_BAR_MAX_WIDTH * (health / SPRITE_MAX_HEALTH), 0.5), 0.0);

        let color
        let bitColor

        if (health > SPRITE_MAX_HEALTH * 0.67) {
          color = GREEN
          bitColor = BIT_GREEN
        } else if (health > SPRITE_MAX_HEALTH * 0.33) {
          color = YELLOW
          bitColor = BIT_YELLOW
        } else {
          color = RED
          bitColor = BIT_RED
        }

        this.graphics.clear();
        createBlockDisplay(
          this.graphics,
          HEALTH_BAR_X,
          HEALTH_BAR_Y,
          HEALTH_BAR_X + (HEALTH_BAR_MAX_WIDTH * (health / SPRITE_MAX_HEALTH)),
          HEALTH_BAR_Y + 2,
          bitColor
        )

        this.body.render = {
          stroke: color,
        }
      }
    }
  }

  class Text {
    constructor(x, y, style) {
      this.x = x
      this.y = y
      this.style = style
    }

    show(text, style) {
      container.removeChild(this.text)

      this.text = new PIXI.Text(text, {
        ...this.style,
        ...style,
      });
      this.text.anchor.set(0.5)
      this.text.x = mpx(this.x)
      this.text.y = mpy(this.y)

      container.addChild(this.text);
    }

    hide() {
      if (this.text) {
        container.removeChild(this.text)
        this.text = null
      }
    }
  }

  class Enemy {
    constructor({
      damage,
      health,
    }) {
      this.damage = damage
      this.health = health
      this.invincibilityTime = 0

      this.id = createId()
      enemies[this.id] = this
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) {
        return
      }

      this.health -= damage
      this.invincibilityTime = INVINCIBILITY_INTERVAL

      if (this.health <= 0) {
        world.destroyBody(this.body)
        addPoints(this.points)
        this.destroy()
      }
    }

    destroy() {
      world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }
  }

  class Seal extends Enemy {
    constructor(direction) {
      super({
        damage: SEAL_DAMAGE,
        health: SEAL_HEALTH,
      })

      this.points = SEAL_POINTS
      this.velocity = SEAL_SPEED
      if (direction === LEFT) {
        this.velocity *= -1
      }

      const x = direction === LEFT
        ? SEAL_SPAWN_X
        : SEAL_SPAWN_X * -1

      this.body = world.createBody({
        position : Vec2(x, SEAL_SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.createFixture(planck.Circle(0.5), {
        friction: 0
      })

      this.body.render = {
        stroke: RED
      }

      this.body.type = SEAL
      this.body.id = this.id

      this.sprite = new PIXI.Sprite(SEAL_TEXTURE)
      this.sprite.scale.set(0.13)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
      this.sprite.rotation = this.body.getAngle()
    }

    move() {
      this.body.setLinearVelocity(Vec2(
        this.velocity,
        this.body.getLinearVelocity().y
      ))

      this.render()
    }

    jump() {
      if (!this.jumps) { return }

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        SEAL_JUMP * (Math.random() / 2 + 0.5))
      )

      this.jumps -= 1
    }
  }

  class Gull extends Enemy {
    constructor(direction) {
      super({
        damage: GULL_DAMAGE,
        health: GULL_HEALTH,
      })

      this.points = GULL_POINTS
      this.velocity = GULL_SPEED
      if (direction === LEFT) {
        this.velocity *= -1
      }

      const x = direction === LEFT
        ? GULL_SPAWN_X
        : GULL_SPAWN_X * -1

      this.body = world.createBody({
        position : Vec2(x, GULL_SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : true,
      })

      this.body.createFixture(planck.Circle(0.4), {
        friction: 0
      })

      this.body.render = {
        stroke: BLUE
      }

      this.body.type = GULL
      this.body.id = this.id
      this.untilFlap = GULL_FLAP_INTERVAL
      this.sprite = new PIXI.Sprite(GULL_TEXTURE)
      this.sprite.scale.set(0.13)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }

    move() {
      this.untilFlap -= 1
      let yVelocity

      if (this.untilFlap <= 0) {
        yVelocity = GULL_FLAP + Math.random() * 5 - 2.5
        this.untilFlap = GULL_FLAP_INTERVAL + Math.random() * 5 - 2.5
      } else {
        yVelocity = this.body.getLinearVelocity().y
      }

      this.body.setLinearVelocity(Vec2(
        this.velocity,
        yVelocity
      ))

      var f = this.body.getWorldVector(Vec2(0.0, 1.7))
      var p = this.body.getWorldPoint(Vec2(0.0, 2.0))
      this.body.applyLinearImpulse(f, p, true)

      this.render()
    }
  }

  class Fish {
    constructor({ x, y, direction }) {
      this.damage = FISH_DAMAGE

      this.body = world.createBody({
        position : Vec2(x, y),
        type : 'dynamic',
        fixedRotation : false,
        allowSleep : false
      })

      this.body.setLinearVelocity(Vec2(
        FISH_THROW_X * direction,
        FISH_THROW_Y
      ))

      this.sprite = new PIXI.Sprite(FISH_TEXTURE)
      this.sprite.scale.set(0.13)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)

      this.body.setAngularVelocity(Math.random() * Math.PI * 10 - (Math.PI * 5));

      this.body.type = FISH
      this.body.createFixture(planck.Polygon([
        Vec2(-1, 0),
        Vec2(1, 0),
        Vec2(1, 1),
        Vec2(-1, 1),
      ]), 1.0)

      this.id = createId()
      fishes[this.id] = this
      this.body.id = this.id
    }

    destroy() {
      world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
      this.sprite.rotation = this.body.getAngle()
    }
  }

  class Sprite {
    constructor() {
      this.health = SPRITE_MAX_HEALTH
      this.invincibilityTime = 0
      this.fishThrowTime = 0
      this.damage = SPRITE_DAMAGE
      this.sprinting = false
      this.direction = RIGHT

      this.sprite = new PIXI.Sprite(SPRITE_TEXTURE)
      this.sprite.scale.set(0.2)
      this.sprite.anchor.set(0.5)
      container.addChild(this.sprite)

      this.body = world.createBody({
        position : Vec2(0, 5.0),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.type = SPRITE
      this.body.createFixture(planck.Polygon([
        Vec2(-1, -1),
        Vec2(1, -1),
        Vec2(1, 1),
        Vec2(-1, 1),
      ]), 1.0)

      this.body.render = {
        stroke: GREEN
      }

      this.jumps = SPRITE_MAX_JUMPS
      this.speed = SPRITE_SPEED
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage, bar) {
      if (this.invincibilityTime) { return }

      this.health -= damage
      this.invincibilityTime = INVINCIBILITY_INTERVAL
      if (this.health <= 0) {
        world.destroyBody(this.body)
        gameActive = false
      }

      bar.update(this.health)
    }

    throwFish() {
      if (this.fishThrowTime) { return }

      const pos = this.body.getPosition()
      new Fish({
        x: pos.x,
        y: pos.y,
        direction: this.direction
      })

      this.fishThrowTime = FISH_THROW_INTERVAL
    }

    destroy() {
      world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    stomp() {
      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        -70)
      )

      this.stompFixture = this.body.createFixture(planck.Polygon([
        Vec2(-3, 0),
        Vec2(3, 0),
        Vec2(3, -1),
        Vec2(-3, -1),
      ]), 1.0);

      body = this.stompFixture
    }

    glide() {
      this.jumps = 0

      var f = this.body.getWorldVector(Vec2(0.0, SPRITE_GLIDE_IMPULSE))
      var p = this.body.getWorldPoint(Vec2(0.0, 2.0))
      this.body.applyLinearImpulse(f, p, true)
    }

    land() {
      if (this.body.getLinearVelocity().y <= 0) {
        this.jumps = SPRITE_MAX_JUMPS
      }

      if (this.stompFixture) {
        // this.body.destroyFixture(this.stompFixture)
        // this.stompFixture = null
      }
    }

    /**
     * @param {Integer} direction - LEFT or RIGHT
     */
    move(direction) {
      this.direction = direction
      const sprintMultiplier = this.sprinting
        ? SPRITE_SPRINT_MULTIPLIER
        : 1

      this.body.setLinearVelocity(Vec2(
        direction * this.speed * sprintMultiplier,
        this.body.getLinearVelocity().y)
      )
    }

    jump() {
      if (!this.jumps) { return }

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        SPRITE_JUMP)
      )

      this.jumps -= 1
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  function createBlockDisplay(graphics, x1, y1, x2, y2, color) {
    graphics.beginFill(color, 1);
    graphics.drawRect(
      mpx(x1),
      mpy(y1),
      mpx(x2) - mpx(x1),
      mpy(y2) - mpy(y1)
    )
    graphics.endFill();
  }

  function createBlock(graphics, body, box2dOpts, display, x1, y1, x2, y2) {
    if (display) {
      createBlockDisplay(graphics, x1, y1, x2, y2, BIT_BLUE)
    }

    body.createFixture(planck.Edge(Vec2(x1, y1), Vec2(x2, y2)), box2dOpts)
  }

  function createBorders() {
    const graphics = new PIXI.Graphics();
    container.addChild(graphics);

    const wall = world.createBody()
    const ground = world.createBody()

    ground.type = GROUND
    wall.type = WALL

    const groundOpts = {
      density: 0.0,
      friction: 7.5
    }

    const wallOpts = {
      density: 0.0,
      friction: 0.0
    }

    createBlock(graphics, wall, wallOpts, true, BORDER_X_LEFT, -20.0, BORDER_X_LEFT, 30.0)
    createBlock(graphics, wall, wallOpts, true, BORDER_X_RIGHT, -20.0, BORDER_X_RIGHT, 30.0)
    createBlock(graphics, wall, wallOpts, true, BORDER_X_LEFT, 30.0, BORDER_X_RIGHT, 30.0)
    createBlock(graphics, ground, groundOpts, true, -100.0, -20.0, 100.0, -20.0)
  }

  function createSeal() {
    const direction = Math.random() < 0.5
      ? LEFT
      : RIGHT

    new Seal(direction)
  }

  function createGull() {
    const direction = Math.random() < 0.5
      ? LEFT
      : RIGHT

    new Gull(direction)
  }

  function spawn() {
    if (Math.random() < SEAL_PROBABILITY) {
      createSeal()
    }

    if (Math.random() < GULL_PROBABILITY) {
      createGull()
    }
  }

  function moveEnemies() {
    Object.keys(enemies).forEach((id) => {
      const enemy = enemies[id]
      enemy.move()

      if (enemy.invincibilityTime) {
        enemy.invincibilityTime -= 1
      }
    })
  }

  planck.testbed('sprite', function (testbed) {
    setDefaults(testbed)
    createBorders(testbed)

    background = new PIXI.Sprite(BACKGROUND_TEXTURE)
    background.scale.set(1)
    // background.anchor.set(0.5)
    background.zOrder = -3
    container.addChild(background)

    textDisplay = new Text(0, 10, {
      ...TEXT_STYLE,
      fill: GREEN,
    })

    pointDisplay = new Text(40, 25, {
      ...TEXT_STYLE,
      fill: BLUE,
    })

    sprite = new Sprite()
    healthBar = new HealthBar()
    healthBar.update(sprite.health)

    testbed.keydown = function () {
      if (testbed.activeKeys.up) {
        sprite.jump()
      }
    }

    function evaluateActiveKeys() {
      if (testbed.activeKeys.fire) {
        sprite.throwFish()
      }

      if (testbed.activeKeys.down) { // TODO: G
        sprite.glide()
      }

      // if (testbed.activeKeys.F) {
      //   sprite.stomp()
      // }

      if (testbed.activeKeys.right) {
        sprite.move(RIGHT)
      } else if (testbed.activeKeys.left) {
        sprite.move(LEFT)
      }
    }

    function shake() {
      testbed.x = Math.random() * 1.5 - 0.75
      container.x = (Math.random() * 1.5 - 0.75) * pscale
    }

    function evaluateCollisions() {
      for (let i = 0; i < collisions.length; ++i) {
        const point = collisions[i]

        const bodies = [
          point.fixtureA.getBody(),
          point.fixtureB.getBody(),
        ]

        const types = bodies.map(item => item.type)

        if (types.includes(GROUND)) {
          const other = bodies.find(item => item.type !== GROUND)

          if (other.type === SPRITE) {
            sprite.land()
          } else if (other.type === FISH) {
            const fish = fishes[other.id]

            fish.destroy()
          } else if (other.type === SEAL) {
            const enemy = enemies[other.id]
            enemy.jumps = SEAL_MAX_JUMPS
          }
        } else if (types.includes(SPRITE)) {
          const other = bodies.find(item => item.type !== SPRITE)
          if (ENEMY_TYPES.includes(other.type)) {
            const enemy = enemies[other.id];
            if (point.normal.y < 0 && Math.abs(point.normal.y) - Math.abs(point.normal.x) > 0.5) {
              enemy.takeDamage(sprite.damage)
              sprite.jumps = SPRITE_MAX_JUMPS
            } else {
              sprite.takeDamage(enemy.damage, healthBar)
            }
          }
        } else if (types.filter(item => item === SEAL).length === 2) {
          let enemy1 = enemies[bodies[0].id]
          let enemy2 = enemies[bodies[1].id]

          if (Math.random() > 0.5) {
            enemy1.jump()
          } else {
            enemy2.jump()
          }
        } else if (types.includes(FISH) && types.filter(item => item === FISH).length === 1) {
          const fish = fishes[bodies.find(item => item.type === FISH).id]
          const other = bodies.find(item => item.type !== FISH)

          if (ENEMY_TYPES.includes(other.type)) {
            enemies[other.id].takeDamage(fish.damage)
            fish.destroy()
          }
        }
      }

      collisions.length = 0
    }

    testbed.step = function () {
      sprite.render()
      pointDisplay.show(String(points))

      if (waveCountdown > 0) {
        textDisplay.show(String(Math.floor(waveCountdown / 25)));

        waveCountdown -= 1
        return;
      }

      textDisplay.hide()

      if (!gameActive) {
        gameOver()
        return
      }

      evaluateCollisions()
      evaluateActiveKeys()
      spawn()
      moveEnemies()

      Object.keys(fishes).forEach((id) => {
        fishes[id].render()
      })

      if (sprite.invincibilityTime) {
        if (sprite.invincibilityTime > SHAKE_THRESHOLD) {
          shake()
        }

        sprite.invincibilityTime -= 1
      }

      if (sprite.fishThrowTime > 0) {
        sprite.fishThrowTime -= 1
      } else {
        sprite.fishThrowTime = 0
      }
    }

    return world
  })
})()

