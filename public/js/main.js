/**
 * Basic surival game created using pixi.js and planck.js
 */
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

  let idPointer = 0

  function createId() {
    idPointer += 1
    return idPointer
  }

  const NON_INTERACTABLE = -1
  const NON_INTERACTABLE_BITS = 0x0002
  const NON_INTERACTABLE_MASK = 0xFFFF;

  const INTERACTABLE_SPRITE = 90
  const INTERACTABLE_SPRITE_BITS = 0x0004
  const INTERACTABLE_SPRITE_MASK = 0xFFFF ^ NON_INTERACTABLE_BITS;

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
  const MALE = 'MALE'
  const FISH = 'FISH'
  const SEAL = 'SEAL'
  const GULL = 'GULL'

  const INVINCIBILITY_INTERVAL = 30
  const SHAKE_THRESHOLD = 20
  const GRAVITY = -60
  const BORDER_X_RIGHT = 40
  const BORDER_X_LEFT = -40
  const BACKGROUND_TEXTURE = PIXI.Texture.fromImage('assets/sierra.jpg')

  const HEALTH_BAR_X = -40
  const HEALTH_BAR_Y = 26
  const HEALTH_BAR_MAX_WIDTH = 10

  const MALE_SPEED = 2.0
  const MALE_SPAWN_X = 0.0
  const MALE_SPAWN_Y = 0.0
  const MALE_SPAWN_SPREAD = 5.0
  const MALE_MAX_JUMPS = 1
  const MALE_TEXTURE = PIXI.Texture.fromImage('assets/penguin.png')
  const MALE_JUMP = 10

  const SPRITE_JUMP = 35
  const SPRITE_MAX_HEALTH = 5
  const SPRITE_DAMAGE = 1
  const SPRITE_SPEED = 25
  const SPRITE_MAX_JUMPS = 3
  const SPRITE_SPRINT_MULTIPLIER = 1.75
  const SPRITE_GLIDE_IMPULSE = 1.5
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

  let hero
  let objects = {}
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

    Object.keys(objects).forEach((id) => {
      objects[id].destroy()
    })

    hero.destroy()

    objects = {}
  }

  function addPoints(num) {
    points += num
    pointDisplay.show(String(points))
  }

  world.on('pre-solve', function (contact, oldManifold) {
    const manifold = contact.getManifold()

    if (!manifold.pointCount) {
      return
    }

    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()


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
    testbed.info('←/→: Accelerate hero, ↑: jump, ↓: attack')
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

        this.body.createFixture(planck.Box(HEALTH_BAR_MAX_WIDTH * (health / SPRITE_MAX_HEALTH), 0.5), {
          filterGroupIndex: NON_INTERACTABLE,
          filterCategoryBits: NON_INTERACTABLE_BITS,
          filterMaskBits: NON_INTERACTABLE_MASK,
        });

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


  class Friend {
    constructor() {
      this.id = createId()
      objects[this.id] = this
    }

    destroy() {
      world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  class Male extends Friend {
    constructor() {
      super()
      this.velocity = MALE_SPEED
      this.abducted = false

      this.jumps = MALE_MAX_JUMPS

      const x = MALE_SPAWN_X + (MALE_SPAWN_SPREAD * Math.random() - MALE_SPAWN_SPREAD / 2)

      this.body = world.createBody({
        position : Vec2(x, MALE_SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.createFixture(planck.Circle(0.5), {
        friction: 0,
        filterGroupIndex: INTERACTABLE_SPRITE,
        filterCategoryBits: INTERACTABLE_SPRITE_BITS,
        filterMaskBits: INTERACTABLE_SPRITE_MASK,
      })

      this.body.render = {
        stroke: GREEN
      }

      this.body.type = MALE
      this.body.id = this.id

      this.sprite = new PIXI.Sprite(MALE_TEXTURE)
      this.sprite.scale.set(0.1)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)
    }

    move() {
      if (!this.abducted) {
        const pos = this.body.getPosition()
        const velocity = this.body.getLinearVelocity()
        if (pos.x < -1) {
          this.body.setLinearVelocity(Vec2(
            MALE_SPEED,
            velocity.y
          ))
        } else if (pos.x > 1) {
          this.body.setLinearVelocity(Vec2(
            MALE_SPEED * -1,
            velocity.y
          ))
        }
      }

      this.render()
    }

    jump() {
      if (!this.jumps) { return }

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        MALE_JUMP * (Math.random() / 2 + 0.5))
      )

      this.jumps -= 1
    }
  }

  class Foe {
    constructor({
      damage,
      health,
    }) {
      this.damage = damage
      this.health = health
      this.invincibilityTime = 0

      this.id = createId()
      objects[this.id] = this
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

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  class Seal extends Foe {
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
        friction: 0,
        filterGroupIndex: INTERACTABLE_SPRITE,
        filterCategoryBits: INTERACTABLE_SPRITE_BITS,
        filterMaskBits: INTERACTABLE_SPRITE_MASK,
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

  class Gull extends Foe {
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
        friction: 0,
        filterGroupIndex: INTERACTABLE_SPRITE,
        filterCategoryBits: INTERACTABLE_SPRITE_BITS,
        filterMaskBits: INTERACTABLE_SPRITE_MASK,
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
      ]), {
        filterGroupIndex: NON_INTERACTABLE,
        filterCategoryBits: INTERACTABLE_SPRITE_BITS,
        filterMaskBits: INTERACTABLE_SPRITE_MASK,
      })

      this.id = createId()
      objects[this.id] = this
      this.body.id = this.id
    }

    destroy() {
      world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    move() {
      // movement is all gravity
      this.render()
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
      this.sprite.rotation = this.body.getAngle()
    }
  }

  class Hero {
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
      ]))

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
    }

    glide() {
      this.jumps = 0

      var f = this.body.getWorldVector(Vec2(0.0, SPRITE_GLIDE_IMPULSE))
      var p = this.body.getWorldPoint(Vec2(0.0, 0.0))
      this.body.applyLinearImpulse(f, p, true)
    }

    land() {
      if (this.body.getLinearVelocity().y <= 0) {
        this.jumps = SPRITE_MAX_JUMPS
      }

      if (this.stompFixture) {
        // this.body.destroyFixture(this.stompFixture)
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
      friction: 0.0,
      filterGroupIndex: NON_INTERACTABLE,
      filterCategoryBits: NON_INTERACTABLE_BITS,
      filterMaskBits: NON_INTERACTABLE_MASK,
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

  function moveObjects() {
    Object.keys(objects).forEach((id) => {
      const object = objects[id]
      object.move()

      if (object.invincibilityTime) {
        object.invincibilityTime -= 1
      }
    })
  }

  planck.testbed('penguin_defender', function (testbed) {
    setDefaults(testbed)
    createBorders(testbed)

    background = new PIXI.Sprite(BACKGROUND_TEXTURE)
    background.scale.x = 1.1
    background.scale.y = 1.01
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

    pointDisplay.show(String(points))

    hero = new Hero()
    healthBar = new HealthBar()
    healthBar.update(hero.health)

    for (let i = 0; i < 20; i++) {
      new Male()
    }

    testbed.keydown = function () {
      if (testbed.activeKeys.up) {
        hero.jump()
      }
    }

    function evaluateActiveKeys() {
      if (testbed.activeKeys.fire) {
        hero.throwFish()
      }

      if (testbed.activeKeys.G) {
        hero.glide()
      }

      // if (testbed.activeKeys.F) {
      //   hero.stomp()
      // }

      if (testbed.activeKeys.right) {
        hero.move(RIGHT)
      } else if (testbed.activeKeys.left) {
        hero.move(LEFT)
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
            hero.land()
          } else if (other.type === FISH) {
            const fish = objects[other.id]

            fish.destroy()
          } else if (other.type === SEAL) {
            const enemy = objects[other.id]
            enemy.jumps = SEAL_MAX_JUMPS
          } else if (other.type === MALE) {
            const male = objects[other.id]
            male.jumps = MALE_MAX_JUMPS
          }
        } else if (types.includes(SPRITE)) {
          const other = bodies.find(item => item.type !== SPRITE)
          if (ENEMY_TYPES.includes(other.type)) {
            const enemy = objects[other.id];
            if (point.normal.y < 0 && Math.abs(point.normal.y) - Math.abs(point.normal.x) > 0.5) {
              enemy.takeDamage(hero.damage)
              hero.jumps = SPRITE_MAX_JUMPS
            } else {
              hero.takeDamage(enemy.damage, healthBar)
            }
          }
        } else if (types.filter(item => item === SEAL).length === 2) {
          let enemy1 = objects[bodies[0].id]
          let enemy2 = objects[bodies[1].id]

          if (Math.random() > 0.5) {
            enemy1.jump()
          } else {
            enemy2.jump()
          }
        } else if (types.includes(FISH) && types.filter(item => item === FISH).length === 1) {
          const fish = objects[bodies.find(item => item.type === FISH).id]
          const other = bodies.find(item => item.type !== FISH)

          if (ENEMY_TYPES.includes(other.type)) {
            objects[other.id].takeDamage(fish.damage)
            fish.destroy()
          }
        } else if (types.includes(MALE)) {
          const male = bodies.find(item => item.type === MALE)
          const other = bodies.find(item => item.id !== male.id)
          if (other.type === MALE) {
            if (Math.random() < 0.5) {
              objects[male.id].jump()
            } else {
              objects[other.id].jump()
            }
          } else if (other.type === SEAL) {
            objects[male.id].destroy()
            objects[other.id].destroy()
          }
        }
      }

      collisions.length = 0
    }

    testbed.step = function () {
      hero.render()

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
      moveObjects()

      if (hero.invincibilityTime) {
        if (hero.invincibilityTime > SHAKE_THRESHOLD) {
          shake()
        }

        hero.invincibilityTime -= 1
      }

      if (hero.fishThrowTime > 0) {
        hero.fishThrowTime -= 1
      } else {
        hero.fishThrowTime = 0
      }
    }

    return world
  })
})()

