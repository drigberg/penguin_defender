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

  const NON_INTERACTIVE = -1
  const NON_INTERACTIVE_BITS = 0x0002
  const NON_INTERACTIVE_MASK = 0xFFFF;

  const INTERACTIVE_SPRITE = 90
  const INTERACTIVE_SPRITE_BITS = 0x0004
  const INTERACTIVE_SPRITE_MASK = 0xFFFF ^ NON_INTERACTIVE_BITS;

  const RED = '#ee1111'
  const BLUE = '#5555ee'
  const YELLOW = '#aaaa22'
  const GREEN = '#22aa22'

  const BIT_RED = 0xEE5555
  const BIT_BLUE = 0x5555EE
  const BIT_YELLOW = 0xAAAA22
  const BIT_GREEN = 0x22AA22

  const BASE_TEXT_STYLE = new PIXI.TextStyle({
    fontFamily: 'Courier New',
    fontSize: 72,
    stroke: '#000000',
    strokeThickness: 5,
    fontWeight: 'bold',
    fill: BLUE,
  });

  const KEY_CODE_MAP = {
    39: 'RIGHT',
    37: 'LEFT',
    38: 'UP',
    40: 'DOWN',
    32: 'SPACE',
    13: 'RETURN',
  }

  const LEFT = -1
  const RIGHT = 1

  const TYPES = Object.freeze({
    SPRITE: 'SPRITE',
    GROUND: 'GROUND',
    WALL: 'WALL',
    MALE: 'MALE',
    FISH: 'FISH',
    SEAL: 'SEAL',
    GULL: 'GULL',
  })

  const SETTINGS = Object.freeze({
    MALE: {
      SPEED: 2.0,
      SPAWN_X: 0.0,
      SPAWN_Y: 0.0,
      SPAWN_SPREAD: 5.0,
      MAX_JUMPS: 1,
      TEXTURE: PIXI.Texture.fromImage('assets/penguin.png'),
      JUMP: 10,
    },
    HERO: {
      JUMP: 35,
      MAX_HEALTH: 5,
      DAMAGE: 1,
      SPEED: 25,
      MAX_JUMPS: 3,
      SPRINT_MULTIPLIER: 1.75,
      GLIDE_IMPULSE: 1.5,
      TEXTURE: PIXI.Texture.fromImage('assets/penguin.png'),
    },
    HEALTH_BAR: {
      X: -40,
      Y: 26,
      MAX_WIDTH: 10,
    },
    FISH: {
      DAMAGE: 1,
      THROW_X: 20,
      THROW_Y: 50,
      THROW_INTERVAL: 25,
      TEXTURE: PIXI.Texture.fromImage('assets/fish.png'),
    },
    SEAL: {
      SPEED: 5.0,
      HEALTH: 1,
      DAMAGE: 1,
      SPAWN_X: 60,
      SPAWN_Y: 5,
      PROBABILITY: 0.01,
      JUMP: 7,
      MAX_JUMPS: 1,
      POINTS: 10,
      TEXTURE: PIXI.Texture.fromImage('assets/penguin.png'),
    },
    GULL: {
      SPEED: 3.0,
      HEALTH: 1,
      DAMAGE: 2,
      SPAWN_X: 60,
      SPAWN_Y: 20,
      FLAP: 7,
      FLAP_INTERVAL: 45,
      PROBABILITY: 0.01,
      POINTS: 15,
      TEXTURE: PIXI.Texture.fromImage('assets/penguin.png'),
    },
    GLOBAL: {
      TIME_STEP: 1 / 50,
      INVINCIBILITY_INTERVAL: 30,
      SHAKE_THRESHOLD: 20,
      GRAVITY: -60,
      BORDER_X_RIGHT: 40,
      BORDER_X_LEFT: -40,
      BACKGROUND_TEXTURE: PIXI.Texture.fromImage('assets/sierra.jpg'),
    }
  })

  let waveCountdown = 100

  const Vec2 = planck.Vec2

  class Game {
    constructor({
      males = 0,
    }) {
      this.paused = false
      this.idPointer = 1
      this.objects = {}
      this.points = 0
      this.active = true

      this.setupWorld()
      this.setupDisplay()
      this.setupMales(males)
      this.createBorders()
      this.createHero()
      this.setupCollisionHandlers()
      this.setupInteractivity()
    }

    onStepPauseIndependent() {
      this.hero.render()
      this.renderObjects()
    }

    onStepPauseDependent() {
      if (waveCountdown > 0) {
        this.textDisplay.show(String(Math.floor(waveCountdown / 25)));

        waveCountdown -= 1
        return;
      }

      if (!this.active) {
        this.gameOver()
        return
      }

      this.world.step(SETTINGS.GLOBAL.TIME_STEP);
      this.textDisplay.hide()


      this.evaluateCollisions()
      this.evaluateActiveKeys()
      this.spawnEnemies()
      this.moveObjects()

      if (this.hero.invincibilityTime) {
        if (this.hero.invincibilityTime > SETTINGS.GLOBAL.SHAKE_THRESHOLD) {
          this.shake()
        }

        this.hero.invincibilityTime -= 1
      }

      if (this.hero.fishThrowTime > 0) {
        this.hero.fishThrowTime -= 1
      } else {
        this.hero.fishThrowTime = 0
      }
    }

    onStep() {
      const that = this

      this.onStepPauseIndependent()

      if (!this.paused) {
        this.onStepPauseDependent()
      }

      window.requestAnimationFrame(function() {
        that.onStep()
      });
    }

    onKeyDown(key) {
      switch (key) {
        case 'P':
          this.paused = !this.paused
          break
        case 'UP':
          this.hero.jump()
          break
        case 'SPACE':
          this.hero.throwFish()
          break
        case 'F':
          this.hero.stomp()
          break
        default:
          // nothing
      }

      this.keys.down[key] = true
    }

    onKeyUp(key) {
      this.keys.down[key] = false
    }

    translateKeyCode(code) {
      const char = String.fromCharCode(code)

      if (/\w/.test(char)) {
        return char
      }

      return KEY_CODE_MAP[code]
    }

    setupInteractivity() {
      const that = this

      this.keys = {
        down: {},
      };

      window.addEventListener('keydown', function(e) {
        that.onKeyDown(that.translateKeyCode(e.keyCode))
      });

      window.addEventListener('keyup', function(e) {
        that.onKeyUp(that.translateKeyCode(e.keyCode))
      });
    }

    createHero() {
      // must be called AFTER background is set up
      this.hero = new Hero(this)
    }

    resetCollisions() {
      this.collisions = []
    }

    setupCollisionHandlers() {
      const that = this
      this.resetCollisions()

      this.collisionHandlers = {
        [`${TYPES.GROUND}-${TYPES.SPRITE}`]: function() {
          that.hero.land()
        },
        [`${TYPES.FISH}-${TYPES.GROUND}`]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.FISH).id].destroy()
        },
        [`${TYPES.GROUND}-${TYPES.SEAL}`]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.SEAL).id].jumps = SETTINGS.SEAL.MAX_JUMPS
        },
        [`${TYPES.GROUND}-${TYPES.MALE}`]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.MALE).id].jumps = SETTINGS.MALE.MAX_JUMPS
        },
        [`${TYPES.SEAL}-${TYPES.SPRITE}`]: function(bodies, point) {
          const enemy = that.objects[bodies.find(item => item.type === TYPES.SEAL).id];
          that.handleEnemyHeroCollision(enemy, point)
        },
        [`${TYPES.GULL}-${TYPES.SPRITE}`]: function(bodies, point) {
          const enemy = that.objects[bodies.find(item => item.type === TYPES.GULL).id];
          that.handleEnemyHeroCollision(enemy, point)
        },
        [`${TYPES.SEAL}-${TYPES.SEAL}`]: function(bodies) {
          if (Math.random() > 0.5) {
            that.objects[bodies[0].id].jump()
          } else {
            that.objects[bodies[1].id].jump()
          }
        },
        [`${TYPES.FISH}-${TYPES.SEAL}`]: function(bodies) {
          that.handleEnemyFishCollision(
            that.objects[bodies.find(item => item.type === TYPES.SEAL).id],
            that.objects[bodies.find(item => item.type === TYPES.FISH).id],
          )
        },
        [`${TYPES.FISH}-${TYPES.GULL}`]: function(bodies) {
          that.handleEnemyFishCollision(
            that.objects[bodies.find(item => item.type === TYPES.GULL).id],
            that.objects[bodies.find(item => item.type === TYPES.FISH).id],
          )
        },
        [`${TYPES.MALE}-${TYPES.MALE}`]: function(bodies) {
          if (Math.random() < 0.5) {
            that.objects[bodies[0].id].jump()
          } else {
            that.objects[bodies[1].id].jump()
          }
        },
        [`${TYPES.MALE}-${TYPES.SEAL}`]: function(bodies) {
          that.objects[bodies[0].id].destroy()
          that.objects[bodies[0].id].destroy()
        },
      }
    }

    createId() {
      this.idPointer += 1
      return this.idPointer
    }

    setupMales(num) {
      for (let i = 0; i < num; i++) {
        new Male(this)
      }
    }

    setupDisplay() {
      this.textDisplay = new Text(0, 10, {
        ...BASE_TEXT_STYLE,
        fill: GREEN,
      })

      this.background = new PIXI.Sprite(SETTINGS.GLOBAL.BACKGROUND_TEXTURE)
      this.background.scale.x = 1.1
      this.background.scale.y = 1.01
      this.background.zOrder = -3
      container.addChild(this.background)

      // must be AFTER background
      this.pointDisplay = new Text(40, 25, BASE_TEXT_STYLE)
      this.pointDisplay.show(String(this.points))
      this.healthBar = new HealthBar(this);
    }

    setupWorld() {
      const that = this
      this.world = new planck.World({
        gravity: Vec2(0, SETTINGS.GLOBAL.GRAVITY)
      })

      this.world.on('pre-solve', function (contact, oldManifold) {
        const manifold = contact.getManifold()

        if (!manifold.pointCount) {
          return
        }

        const fixtureA = contact.getFixtureA()
        const fixtureB = contact.getFixtureB()

        const worldManifold = contact.getWorldManifold()

        for (let i = 0; i < manifold.pointCount; ++i) {
          that.collisions.push({
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
    }

    handleEnemyHeroCollision(enemy, point) {
      if (point.normal.y < 0 && Math.abs(point.normal.y) - Math.abs(point.normal.x) > 0.5) {
        enemy.takeDamage(this.hero.damage)
        this.hero.jumps = SETTINGS.HERO.MAX_JUMPS
      } else {
        this.hero.takeDamage(enemy.damage)
      }
    }

    handleEnemyFishCollision(enemy, fish) {
      enemy.takeDamage(fish.damage)
      fish.destroy()
    }

    evaluateCollisions() {
      for (let i = 0; i < this.collisions.length; ++i) {
        const point = this.collisions[i]

        const bodies = [
          point.fixtureA.getBody(),
          point.fixtureB.getBody(),
        ]

        const key = bodies
          .map(item => item.type)
          .sort((a, b) => a > b)
          .join('-')

        const handler = this.collisionHandlers[key]
        if (handler) {
          handler(bodies, point)
        }
      }

      this.resetCollisions()
    }

    createSeal() {
      const direction = Math.random() < 0.5
        ? LEFT
        : RIGHT

      new Seal(this, direction)
    }

    createGull() {
      const direction = Math.random() < 0.5
        ? LEFT
        : RIGHT

      new Gull(this, direction)
    }

    gameOver() {
      this.resetBodies()
      this.textDisplay.show('GAME OVER', {
        fill: RED
      });
    }

    resetBodies() {
      this.healthBar.graphics.clear();

      Object.keys(this.objects).forEach((id) => {
        this.objects[id].destroy()
      })

      this.hero.destroy()
      this.objects = {}
    }


    addPoints(num) {
      this.points += num
      this.pointDisplay.show(String(this.points))
    }

    spawnEnemies() {
      if (Math.random() < SETTINGS.SEAL.PROBABILITY) {
        this.createSeal()
      }

      if (Math.random() < SETTINGS.GULL.PROBABILITY) {
        this.createGull()
      }
    }

    moveObjects() {
      Object.keys(this.objects).forEach((id) => {
        const object = this.objects[id]
        if (object.move && typeof object.move === 'function') {
          object.move()
        }

        if (object.invincibilityTime) {
          object.invincibilityTime -= 1
        }
      })
    }

    evaluateActiveKeys() {
      if (this.keys.down.G) {
        this.hero.glide()
      }

      if (this.keys.down.RIGHT) {
        this.hero.move(RIGHT)
      } else if (this.keys.down.LEFT) {
        this.hero.move(LEFT)
      }
    }

    createBlockDisplay(graphics, x1, y1, x2, y2, color) {
      graphics.beginFill(color, 1);
      graphics.drawRect(
        mpx(x1),
        mpy(y1),
        mpx(x2) - mpx(x1),
        mpy(y2) - mpy(y1)
      )
      graphics.endFill();
    }

    createBlock(graphics, body, box2dOpts, display, x1, y1, x2, y2) {
      if (display) {
        this.createBlockDisplay(graphics, x1, y1, x2, y2, BIT_BLUE)
      }

      body.createFixture(planck.Edge(Vec2(x1, y1), Vec2(x2, y2)), box2dOpts)
    }

    createBorders() {
      const graphics = new PIXI.Graphics();
      container.addChild(graphics);

      const wall = this.world.createBody()
      const ground = this.world.createBody()

      ground.type = TYPES.GROUND
      wall.type = TYPES.WALL

      const groundOpts = {
        density: 0.0,
        friction: 7.5
      }

      const wallOpts = {
        density: 0.0,
        friction: 0.0,
        filterGroupIndex: NON_INTERACTIVE,
        filterCategoryBits: NON_INTERACTIVE_BITS,
        filterMaskBits: NON_INTERACTIVE_MASK,
      }

      this.createBlock(graphics, wall, wallOpts, true, SETTINGS.GLOBAL.BORDER_X_LEFT, -20.0, SETTINGS.GLOBAL.BORDER_X_LEFT, 30.0)
      this.createBlock(graphics, wall, wallOpts, true, SETTINGS.GLOBAL.BORDER_X_RIGHT, -20.0, SETTINGS.GLOBAL.BORDER_X_RIGHT, 30.0)
      this.createBlock(graphics, wall, wallOpts, true, SETTINGS.GLOBAL.BORDER_X_LEFT, 30.0, SETTINGS.GLOBAL.BORDER_X_RIGHT, 30.0)
      this.createBlock(graphics, ground, groundOpts, true, -100.0, -20.0, 100.0, -20.0)
    }

    shake() {
      container.x = (Math.random() * 1.5 - 0.75) * pscale
    }

    renderObjects() {
      Object.keys(this.objects).forEach((id) => {
        this.objects[id].render()
      })
    }
  }

  class HealthBar {
    constructor(parent) {
      this.game = parent
      this.graphics = new PIXI.Graphics();
      container.addChild(this.graphics);
    }

    update(health) {
      if (this.body) {
        this.game.world.destroyBody(this.body)
      }

      if (health) {
        this.body = this.game.world.createBody(Vec2(SETTINGS.HEALTH_BAR.X, SETTINGS.HEALTH_BAR.Y));

        this.body.createFixture(planck.Box(SETTINGS.HEALTH_BAR.MAX_WIDTH * (health / SETTINGS.HERO.MAX_HEALTH), 0.5), {
          filterGroupIndex: NON_INTERACTIVE,
          filterCategoryBits: NON_INTERACTIVE_BITS,
          filterMaskBits: NON_INTERACTIVE_MASK,
        });

        let color
        let bitColor

        if (health > SETTINGS.HERO.MAX_HEALTH * 0.67) {
          color = GREEN
          bitColor = BIT_GREEN
        } else if (health > SETTINGS.HERO.MAX_HEALTH * 0.33) {
          color = YELLOW
          bitColor = BIT_YELLOW
        } else {
          color = RED
          bitColor = BIT_RED
        }

        this.graphics.clear();

        this.game.createBlockDisplay(
          this.graphics,
          SETTINGS.HEALTH_BAR.X,
          SETTINGS.HEALTH_BAR.Y,
          SETTINGS.HEALTH_BAR.X + (SETTINGS.HEALTH_BAR.MAX_WIDTH * (health / SETTINGS.HERO.MAX_HEALTH)),
          SETTINGS.HEALTH_BAR.Y + 2,
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
    constructor(parent) {
      this.game = parent
      this.id = this.game.createId()
      this.game.objects[this.id] = this
    }

    destroy() {
      this.game.world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  class Male extends Friend {
    constructor(parent) {
      super(parent)
      this.velocity = SETTINGS.MALE.SPEED
      this.abducted = false

      this.jumps = SETTINGS.MALE.MAX_JUMPS

      const x = SETTINGS.MALE.SPAWN_X + (SETTINGS.MALE.SPAWN_SPREAD * Math.random() - SETTINGS.MALE.SPAWN_SPREAD / 2)

      this.body = this.game.world.createBody({
        position : Vec2(x, SETTINGS.MALE.SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.createFixture(planck.Circle(0.5), {
        friction: 0,
        filterGroupIndex: INTERACTIVE_SPRITE,
        filterCategoryBits: INTERACTIVE_SPRITE_BITS,
        filterMaskBits: INTERACTIVE_SPRITE_MASK,
      })

      this.body.render = {
        stroke: GREEN
      }

      this.body.type = TYPES.MALE
      this.body.id = this.id

      this.sprite = new PIXI.Sprite(SETTINGS.MALE.TEXTURE)
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
            SETTINGS.MALE.SPEED,
            velocity.y
          ))
        } else if (pos.x > 1) {
          this.body.setLinearVelocity(Vec2(
            SETTINGS.MALE.SPEED * -1,
            velocity.y
          ))
        }
      }
    }

    jump() {
      if (!this.jumps) { return }

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        SETTINGS.MALE.JUMP * (Math.random() / 2 + 0.5))
      )

      this.jumps -= 1
    }
  }

  class Foe {
    constructor({
      damage,
      health,
      parent,
    }) {
      this.damage = damage
      this.health = health
      this.invincibilityTime = 0

      this.game = parent
      this.id = this.game.createId()
      this.game.objects[this.id] = this
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) {
        return
      }

      this.health -= damage
      this.invincibilityTime = SETTINGS.GLOBAL.INVINCIBILITY_INTERVAL

      if (this.health <= 0) {
        this.game.world.destroyBody(this.body)
        this.game.addPoints(this.points)
        this.destroy()
      }
    }

    destroy() {
      this.game.world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  class Seal extends Foe {
    constructor(parent, direction) {
      super({
        damage: SETTINGS.SEAL.DAMAGE,
        health: SETTINGS.SEAL.HEALTH,
        parent,
      })

      this.points = SETTINGS.SEAL.POINTS
      this.velocity = SETTINGS.SEAL.SPEED
      if (direction === LEFT) {
        this.velocity *= -1
      }

      const x = direction === LEFT
        ? SETTINGS.SEAL.SPAWN_X
        : SETTINGS.SEAL.SPAWN_X * -1

      this.body = this.game.world.createBody({
        position : Vec2(x, SETTINGS.SEAL.SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.createFixture(planck.Circle(0.5), {
        friction: 0,
        filterGroupIndex: INTERACTIVE_SPRITE,
        filterCategoryBits: INTERACTIVE_SPRITE_BITS,
        filterMaskBits: INTERACTIVE_SPRITE_MASK,
      })

      this.body.render = {
        stroke: RED
      }

      this.body.type = TYPES.SEAL
      this.body.id = this.id

      this.sprite = new PIXI.Sprite(SETTINGS.SEAL.TEXTURE)
      this.sprite.scale.set(0.13)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)
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
        SETTINGS.SEAL.JUMP * (Math.random() / 2 + 0.5))
      )

      this.jumps -= 1
    }
  }

  class Gull extends Foe {
    constructor(parent, direction) {
      super({
        damage: SETTINGS.GULL.DAMAGE,
        health: SETTINGS.GULL.HEALTH,
        parent,
      })

      this.points = SETTINGS.GULL.POINTS
      this.velocity = SETTINGS.GULL.SPEED
      if (direction === LEFT) {
        this.velocity *= -1
      }

      const x = direction === LEFT
        ? SETTINGS.GULL.SPAWN_X
        : SETTINGS.GULL.SPAWN_X * -1

      this.body = this.game.world.createBody({
        position : Vec2(x, SETTINGS.GULL.SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : true,
      })

      this.body.createFixture(planck.Circle(0.4), {
        friction: 0,
        filterGroupIndex: INTERACTIVE_SPRITE,
        filterCategoryBits: INTERACTIVE_SPRITE_BITS,
        filterMaskBits: INTERACTIVE_SPRITE_MASK,
      })

      this.body.render = {
        stroke: BLUE
      }

      this.body.type = TYPES.GULL
      this.body.id = this.id
      this.untilFlap = SETTINGS.GULL.FLAP_INTERVAL
      this.sprite = new PIXI.Sprite(SETTINGS.GULL.TEXTURE)
      this.sprite.scale.set(0.13)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)
    }

    move() {
      this.untilFlap -= 1
      let yVelocity

      if (this.untilFlap <= 0) {
        yVelocity = SETTINGS.GULL.FLAP + Math.random() * 5 - 2.5
        this.untilFlap = SETTINGS.GULL.FLAP_INTERVAL + Math.random() * 5 - 2.5
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
    constructor({
      x,
      y,
      direction,
      parent,
    }) {
      this.damage = SETTINGS.FISH.DAMAGE
      this.game = parent

      this.body = this.game.world.createBody({
        position : Vec2(x, y),
        type : 'dynamic',
        fixedRotation : false,
        allowSleep : false
      })

      this.body.setLinearVelocity(Vec2(
        SETTINGS.FISH.THROW_X * direction,
        SETTINGS.FISH.THROW_Y
      ))

      this.sprite = new PIXI.Sprite(SETTINGS.FISH.TEXTURE)
      this.sprite.scale.set(0.13)
      this.sprite.anchor.set(0.5);
      container.addChild(this.sprite)

      this.body.setAngularVelocity(Math.random() * Math.PI * 10 - (Math.PI * 5));

      this.body.type = TYPES.FISH
      this.body.createFixture(planck.Polygon([
        Vec2(-1, 0),
        Vec2(1, 0),
        Vec2(1, 1),
        Vec2(-1, 1),
      ]), {
        filterGroupIndex: NON_INTERACTIVE,
        filterCategoryBits: INTERACTIVE_SPRITE_BITS,
        filterMaskBits: INTERACTIVE_SPRITE_MASK,
      })

      this.id = this.game.createId()
      this.game.objects[this.id] = this
      this.body.id = this.id
    }

    destroy() {
      this.game.world.destroyBody(this.body)
      container.removeChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
      this.sprite.rotation = this.body.getAngle()
    }
  }

  class Hero {
    constructor(parent) {
      this.game = parent
      this.health = SETTINGS.HERO.MAX_HEALTH
      this.invincibilityTime = 0
      this.fishThrowTime = 0
      this.damage = SETTINGS.HERO.DAMAGE
      this.sprinting = false
      this.direction = RIGHT

      this.sprite = new PIXI.Sprite(SETTINGS.HERO.TEXTURE)
      this.sprite.scale.set(0.2)
      this.sprite.anchor.set(0.5)
      container.addChild(this.sprite)

      this.body = this.game.world.createBody({
        position : Vec2(0, 5.0),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.type = TYPES.SPRITE
      this.body.createFixture(planck.Polygon([
        Vec2(-1, -1),
        Vec2(1, -1),
        Vec2(1, 1),
        Vec2(-1, 1),
      ]))

      this.body.render = {
        stroke: GREEN
      }

      this.jumps = SETTINGS.HERO.MAX_JUMPS
      this.speed = SETTINGS.HERO.SPEED

      this.game.healthBar.update(this.health)
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) { return }

      this.health -= damage
      this.invincibilityTime = SETTINGS.GLOBAL.INVINCIBILITY_INTERVAL
      if (this.health <= 0) {
        this.destroy()
      }

      this.game.healthBar.update(this.health)
    }

    throwFish() {
      if (this.fishThrowTime) { return }

      const pos = this.body.getPosition()

      new Fish({
        x: pos.x,
        y: pos.y,
        direction: this.direction,
        parent: this.game,
      })

      this.fishThrowTime = SETTINGS.FISH.THROW_INTERVAL
    }

    destroy() {
      this.game.world.destroyBody(this.body)
      container.removeChild(this.sprite)
      this.game.active = false
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

      const f = this.body.getWorldVector(Vec2(0.0, SETTINGS.HERO.GLIDE_IMPULSE))
      const p = this.body.getWorldPoint(Vec2(0.0, 0.0))
      this.body.applyLinearImpulse(f, p, true)
    }

    land() {
      if (this.body.getLinearVelocity().y <= 0) {
        this.jumps = SETTINGS.HERO.MAX_JUMPS
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
        ? SETTINGS.HERO.SPRINT_MULTIPLIER
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
        SETTINGS.HERO.JUMP)
      )

      this.jumps -= 1
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  function setupGame() {
    const game = new Game({
      males: 20
    })

    window.requestAnimationFrame(function() {
      game.onStep()
    });
  }

  setupGame()
})()

