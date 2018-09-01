/**
 * Basic surival game created using pixi.js and planck.js
 */
let body

(function main() {
  let idPointer = 0

  function createId() {
    idPointer += 1
    return idPointer
  }

  const LEFT = -1
  const RIGHT = 1
  const SPRITE = 'SPRITE'
  const GROUND = 'GROUND'
  const WALL = 'WALL'
  const FISH = 'FISH'
  const ENEMY = 'ENEMY'
  const INVINCIBILITY_INTERVAL = 30
  const SHAKE_THRESHOLD = 20
  const GRAVITY = -60
  const SPRINT_MULTIPLIER = 1.75
  const BORDER_X_RIGHT = 40
  const BORDER_X_LEFT = -40

  const SPRITE_JUMP = 35
  const SPRITE_HEALTH = 10
  const SPRITE_DAMAGE = 1
  const SPRITE_SPEED = 25

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

  const GULL_SPEED = 6.0
  const GULL_HEALTH = 1
  const GULL_DAMAGE = 2
  const GULL_SPAWN_X = 60
  const GULL_SPAWN_Y = 20
  const GULL_FLAP = 7
  const GULL_FLAP_INTERVAL = 45
  const GULL_PROBABILITY = 0.01

  const m_points = []
  const Vec2 = planck.Vec2

  const world = new planck.World({
    gravity: Vec2(0, GRAVITY)
  })

  const enemies = {}
  const fishes = {}

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

    if (types.includes(WALL) && types.includes(ENEMY)) {
      contact.setEnabled(false)
    } else if (types.includes(SPRITE) && types.includes(FISH)) {
      contact.setEnabled(false)
    } else if (types.includes(FISH) && types.includes(WALL)) {
      contact.setEnabled(false)
    }

    const worldManifold = contact.getWorldManifold()

    for (let i = 0; i < manifold.pointCount; ++i) {
      m_points.push({
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
      }
    }
  }

  class Seal extends Enemy {
    constructor(direction) {
      super({
        damage: SEAL_DAMAGE,
        health: SEAL_HEALTH,
      })

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

      this.body.type = ENEMY
      this.body.id = this.id
    }

    move() {
      this.body.setLinearVelocity(Vec2(
        this.velocity,
        this.body.getLinearVelocity().y
      ))
    }
  }

  class Gull extends Enemy {
    constructor(direction) {
      super({
        damage: GULL_DAMAGE,
        health: GULL_HEALTH,
      })

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

      this.body.type = ENEMY
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
      this.health = SPRITE_HEALTH
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

      this.jumps = 2
      this.speed = SPRITE_SPEED
      body = this.body
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) { return }

      this.health -= damage
      this.invincibilityTime = INVINCIBILITY_INTERVAL
      if (this.health <= 0) {
        world.destroyBody(this.body)
      }
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
        ? SPRINT_MULTIPLIER
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
      for (let i = 0; i < m_points.length; ++i) {
        const point = m_points[i]

        const body1 = point.fixtureA.getBody()
        const body2 = point.fixtureB.getBody()

        const types = [
          body1.type,
          body2.type,
        ]

        if (types.includes(GROUND)) {
          if (types.includes(SPRITE)) {
            if (sprite.body.getLinearVelocity().y <= 0) {
              sprite.jumps = 2
            }
          } else if (types.includes(FISH)) {
            const fish = fishes[[body1, body2].find(item => item.type === FISH).id]

            fish.destroy()
          }
        } else if (types.includes(ENEMY)) {
          const enemy = enemies[[body1, body2].find(item => item.type === ENEMY).id]

          if (types.includes(SPRITE)) {
            if (point.normal.y < 0 && Math.abs(point.normal.y) - Math.abs(point.normal.x) > 0.5) {
              enemy.takeDamage(sprite.damage)
              sprite.jumps = 2
            } else {
              sprite.takeDamage(enemy.damage)
            }
          } else if (types.includes(FISH)) {
            const fish = fishes[[body1, body2].find(item => item.type === FISH).id]

            enemy.takeDamage(fish.damage)
            fish.destroy()
          }
        }
      }

      m_points.length = 0
    }

    testbed.step = function () {
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

