/**
 * Basic surival game created using pixi.js and planck.js
 */
let body

(function main() {
  function intersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item))
  }

  let idPointer = 0

  function createId() {
    idPointer += 1
    return idPointer
  }

  const RED = '#aa2222'
  const YELLOW = '#aaaa22'
  const GREEN = '#22aa22'

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

  const BORDER_X_RIGHT = 40
  const BORDER_X_LEFT = -40

  const HEALTH_BAR_X = -25
  const HEALTH_BAR_Y = 26
  const HEALTH_BAR_MAX_WIDTH = 5

  const SPRITE_JUMP = 35
  const SPRITE_MAX_HEALTH = 10
  const SPRITE_DAMAGE = 1
  const SPRITE_SPEED = 25
  const SPRITE_MAX_JUMPS = 2
  const SPRITE_SPRINT_MULTIPLIER = 1.75

  const FISH_DAMAGE = 1
  const FISH_THROW_X = 20
  const FISH_THROW_Y = 50
  const FISH_THROW_INTERVAL = 25

  const SEAL_SPEED = 10.0
  const SEAL_HEALTH = 1
  const SEAL_DAMAGE = 1
  const SEAL_SPAWN_X = 60
  const SEAL_SPAWN_Y = 5
  const SEAL_PROBABILITY = 0.01
  const SEAL_JUMP = 7
  const SEAL_MAX_JUMPS = 1
  const SEAL_POINTS = 10

  const GULL_SPEED = 6.0
  const GULL_HEALTH = 1
  const GULL_DAMAGE = 2
  const GULL_SPAWN_X = 60
  const GULL_SPAWN_Y = 20
  const GULL_FLAP = 7
  const GULL_FLAP_INTERVAL = 45
  const GULL_PROBABILITY = 0.01
  const GULL_POINTS = 15

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

  const enemies = {}
  const fishes = {}
  let points = 0

  function resetBodies() {
    Object.keys(enemies).forEach((id) => {
      world.destroyBody(enemies[id].body)
    })

    Object.keys(fishes).forEach((id) => {
      world.destroyBody(fishes[id].body)
    })

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
    update(health) {
      if (this.body) {
        world.destroyBody(this.body)
      }

      if (health) {
        this.body = world.createBody(Vec2(HEALTH_BAR_X, HEALTH_BAR_Y));
        this.body.createFixture(planck.Box(HEALTH_BAR_MAX_WIDTH * (health / SPRITE_MAX_HEALTH), 0.5), 0.0);

        let color

        if (health > SPRITE_MAX_HEALTH * 0.67) {
          color = GREEN
        } else if (health > SPRITE_MAX_HEALTH * 0.33) {
          color = YELLOW
        } else {
          color = RED
        }

        this.body.render = {
          fill: color,
          stroke: color,
        }
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
      }
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
        fill: '#cc0000',
        stroke: '#cc0000'
      }

      this.body.type = SEAL
      this.body.id = this.id
    }

    move() {
      this.body.setLinearVelocity(Vec2(
        this.velocity,
        this.body.getLinearVelocity().y
      ))
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
        fill: '#00cc00',
        stroke: '#00cc00'
      }

      this.body.type = GULL
      this.body.id = this.id
      this.untilFlap = GULL_FLAP_INTERVAL
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
    }
  }

  class Sprite {
    constructor() {
      this.health = SPRITE_MAX_HEALTH
      this.invincibilityTime = 0
      this.fishThrowTime = 0
      this.damage = SPRITE_DAMAGE
      this.sprinting = false
      this.attacking = false
      this.direction = RIGHT

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
        fill: '#dddddd',
        stroke: '#dddddd'
      }

      this.jumps = SPRITE_MAX_JUMPS
      this.speed = SPRITE_SPEED
      body = this.body
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

    stomp() {
      this.attacking = true
      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        -70)
      )
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
  }

  function createBorders() {
    const walls = world.createBody()
    const ground = world.createBody()

    ground.type = GROUND
    walls.type = WALL

    const groundOpts = {
      density: 0.0,
      friction: 7.5
    }

    const wallOpts = {
      density: 0.0,
      friction: 0.0
    }

    walls.createFixture(planck.Edge(Vec2(BORDER_X_LEFT, -20.0), Vec2(BORDER_X_LEFT, 30.0)), wallOpts)
    walls.createFixture(planck.Edge(Vec2(BORDER_X_RIGHT, -20.0), Vec2(BORDER_X_RIGHT, 30.0)), wallOpts)
    walls.createFixture(planck.Edge(Vec2(BORDER_X_LEFT, 30.0), Vec2(BORDER_X_RIGHT, 30.0)), wallOpts)
    ground.createFixture(planck.Edge(Vec2(-100.0, -20.0), Vec2(100.0, -20.0)), groundOpts)
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

    const sprite = new Sprite()
    const healthBar = new HealthBar()
    healthBar.update(sprite.health)

    testbed.keydown = function () {
      if (testbed.activeKeys.up) {
        sprite.jump()
      }
    }

    function evaluateActiveKeys() {
      // sprite.sprinting = Boolean(testbed.activeKeys.fire)

      if (testbed.activeKeys.fire) {
        sprite.throwFish()
      }

      if (testbed.activeKeys.down) {
        sprite.stomp()
      } else if (testbed.activeKeys.right) {
        sprite.move(RIGHT)
      } else if (testbed.activeKeys.left) {
        sprite.move(LEFT)
      }
    }

    function shake() {
      testbed.x = Math.random() * 1.5 - 0.75
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
            if (sprite.body.getLinearVelocity().y <= 0) {
              sprite.jumps = SPRITE_MAX_JUMPS
            }
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
      if (!gameActive) {
        resetBodies()
        return
      }

      evaluateCollisions()
      evaluateActiveKeys()
      spawn()
      moveEnemies()

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

