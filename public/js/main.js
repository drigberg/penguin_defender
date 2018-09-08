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

  document.getElementById('content').appendChild(app.view);
  app.view.style.position = 'absolute';
  app.view.style.border = '1px solid #222222';

  const CATEGORIES = {
    CREATURE: 0x0001,
    GROUND: 0x0002,
    HERO: 0x0004,
    FISH: 0x0008,
    WALLS: 0x00016,
    OFFSCREEN: 0x00032,
  }

  const MASKS = {
    CREATURE: CATEGORIES.FISH | CATEGORIES.CREATURE | CATEGORIES.HERO | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND,
    HERO: ~CATEGORIES.FISH,
    FISH: CATEGORIES.CREATURE | CATEGORIES.GROUND,
    GROUND: CATEGORIES.FISH | CATEGORIES.CREATURE | CATEGORIES.HERO,
    WALLS: CATEGORIES.HERO,
    OFFSCREEN: CATEGORIES.CREATURE,
  }

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
    strokeThickness: 0,
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
    GROUND: 'GROUND',
    WALL: 'WALL',
    OFFSCREEN: 'OFFSCREEN',
    HERO: 'HERO',
    MALE: 'MALE',
    FISH: 'FISH',
    SEAL: 'SEAL',
    GULL: 'GULL',
  })

  const ENEMY_TYPES = Object.freeze([
    TYPES.SEAL,
    TYPES.GULL
  ]);

  const SETTINGS = Object.freeze({
    MALE: {
      NUM: 10,
      SPEED: 2.0,
      SPAWN_X: 0.0,
      SPAWN_Y: 0.0,
      SPAWN_SPREAD: 10.0,
      MAX_JUMPS: 1,
      TEXTURE: PIXI.Texture.fromImage('assets/male_neon.png'),
      JUMP: 20,
      BOX_WIDTH: 0.5,
      BOX_HEIGHT: 1,
      ANIMATION_SPEED_STANDARD: 0.03,
      ANIMATION_SPEED_STRESSED: 0.1,
    },
    HERO: {
      JUMP: 35,
      MAX_HEALTH: 5,
      DAMAGE: 1,
      SPEED: 15,
      MAX_JUMPS: 3,
      SPRINT_MULTIPLIER: 1.75,
      GLIDE_IMPULSE: 1,
      TEXTURE: PIXI.Texture.fromImage('assets/penguin.png'),
      BOX_WIDTH: 2.0,
      BOX_HEIGHT: 2.0,
      STOMP_BOX_WIDTH: 3.0,
      STOMP_BOX_HEIGHT: 1.0,
      ANIMATION_SPEED_NEUTRAL: 0.03,
      ANIMATION_SPEED_RUNNING: 0.06,
      START_X: 0.0,
      START_Y: 5.0,
      MOVEMENT_STATES: {
        RUNNING: 'RUNNING',
        GLIDING: 'GLIDING',
        NEUTRAL: 'NEUTRAL',
        ATTACKING: 'ATTACKING',
        JUMPING: 'JUMPING',
      }
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
      TEXTURE: PIXI.Texture.fromImage('assets/fish_neon.png'),
      BOX_WIDTH: 1,
      BOX_HEIGHT: 0.6,
    },
    SEAL: {
      SPEED: 3.5,
      HEALTH: 1,
      DAMAGE: 1,
      SPAWN_X: 50,
      SPAWN_Y: 5,
      PROBABILITY: 0.01,
      JUMP: 20,
      MAX_JUMPS: 1,
      POINTS: 10,
      TEXTURE: PIXI.Texture.fromImage('assets/seal_neon.png'),
      BOX_WIDTH: 1,
      BOX_HEIGHT: 0.6,
      ANIMATION_SPEED_STANDARD: 0.15,
    },
    GULL: {
      SPEED: 3.0,
      HEALTH: 1,
      DAMAGE: 2,
      SPAWN_X: 50,
      SPAWN_Y: 20,
      FLAP_POWER: 5,
      FLAP_INTERVAL: 45,
      IMPULSE: 1,
      PROBABILITY: 0.01,
      POINTS: 15,
      TEXTURE: PIXI.Texture.fromImage('assets/penguin.png'),
      BOX_WIDTH: 2.0,
      BOX_HEIGHT: 2.0,
    },
    GLOBAL: {
      TIME_STEP: 1 / 20,
      INVINCIBILITY_INTERVAL: 30,
      SHAKE_THRESHOLD: 20,
      GRAVITY: -60,
      BORDER_X_RIGHT: 40,
      BORDER_X_LEFT: -40,
      OFFSCREEN_X_RIGHT: 55,
      OFFSCREEN_X_LEFT: -55,
      BACKGROUND_TEXTURE: PIXI.Texture.fromImage('assets/mountains_neon.png'),
      WINTER_COUNTDOWN_TIME: 50,
      WINTER_INTERIM_TIME: 1500,
    },
    MENU: {
      TEXTURE: PIXI.Texture.fromImage('assets/menu.png'),
    },
  })

  const Vec2 = planck.Vec2

  function enforcePositive(num) {
    return num > 0
      ? num
      : 0
  }

  class Game {
    constructor() {
      this.reset()
    }

    reset() {
      this.winter = 0
      this.paused = true
      this.idPointer = 1
      this.objects = {}
      this.points = 0
      this.active = true

      this.setupContainer()
      this.setupWorld()
      this.setupDisplay()
      this.createBorders()
      this.setupCollisionHandlers()
      this.setupInteractivity()
      this.startWinter()
    }

    setupContainer() {
      if (this.container) {
        app.stage.removeChild(this.container)
      }

      this.container = new PIXI.Container();
      app.stage.addChild(this.container);
    }

    startWinterCountdown() {
      this.winterCountdownTime = SETTINGS.GLOBAL.WINTER_COUNTDOWN_TIME
      this.winterCountdownInterval = this.winterCountdownTime / 4
    }

    winterComplete() {
      return ENEMY_TYPES.reduce((acc, type) => {
        return acc && this.typeComplete(type)
      }, true)
    }

    onWinterComplete() {
      const that = this
      this.textDisplays[0].show(`WINTER ${this.winter} COMPLETE!`)
      this.textDisplays[1].show('NOICE')
      this.paused = true
      this.active = false

      setTimeout(() => that.startWinter(), SETTINGS.GLOBAL.WINTER_INTERIM_TIME)
    }

    toCreateEnemy(type) {
      if (Math.random() > SETTINGS[type].PROBABILITY) {
        return false
      }

      return this.winterStats[type].created < this.winterStats[type].total
    }

    onEnemyDestroyed(type) {
      this.winterStats[type].destroyed +=1

      if (!this.typeComplete(type)) {
        return
      }

      if (this.winterComplete()) {
        this.onWinterComplete()
      }
    }

    destroyEntity(entity) {
      if (!entity) { // TODO: turn patch into fix
        return
      }

      if (!entity.alive) {
        return
      }

      if (entity.abducting) {
        entity.abducting.onLiberation()
      }

      entity.alive = false
      this.world.destroyBody(entity.body)

      if (entity.sprites) { // TODO: clean this up
        Object.keys(entity.sprites).forEach((key) => {
          this.container.removeChild(entity.sprites[key])
        })
      } else {
        this.container.removeChild(entity.sprite)
      }

      switch (entity.type) {
        case TYPES.MALE:
          this.onMaleDestroyed()
          break
        case TYPES.HERO:
          this.onHeroDestroyed()
          break
        case TYPES.FISH:
          break
        default:
          if (ENEMY_TYPES.includes(entity.type)) {
            this.onEnemyDestroyed(entity.type)
          }
      }
    }

    assignType(entity, type) {
      entity.type = type

      if (entity.body) {
        entity.body.type = type
      }
    }

    onHeroDestroyed() {
      this.active = false
      this.gameOverReason = 'YOU DIED'
    }

    startWinter() {
      this.resetBodies()
      this.active = true
      this.paused = false

      this.winter += 1
      this.winterStats = this.getWinterStats()
      this.winterDisplay.show(this.winter)

      this.setupMales()
      this.createHero()

      this.startWinterCountdown()
    }

    onMaleDestroyed() {
      this.winterStats[TYPES.MALE].destroyed += 1
      if (this.typeComplete(TYPES.MALE)) {
        this.active = false
        this.gameOverReason = 'COLONY ANNIHILATED'
      }

    }

    onStepPauseIndependent() {
      // nothing yet
    }

    winterCountdown() {
      if (this.winterCountdownTime > 0) {
        this.textDisplays[0].show('GET READY!');
        this.textDisplays[1].show(Math.floor(this.winterCountdownTime / this.winterCountdownInterval) || 'GO!');

        this.winterCountdownTime -= 1
        return this.winterCountdownTime
      }

      return false
    }

    onStepPauseDependent() {
      const countingDown = this.winterCountdown()

      if (countingDown) {
        return
      } else if (countingDown === 0) {
        this.hero.activeSprite.visible = true
        Object.keys(this.objects).forEach((key) => {
          this.objects[key].sprite.visible = true
        })
      }

      if (!this.active) {
        this.gameOver()
        return
      }

      this.world.step(SETTINGS.GLOBAL.TIME_STEP);
      this.textDisplays.forEach(display => display.hide())

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

      this.renderObjects()
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
      if (this.keys.down[key]) {
        return
      }

      switch (key) {
        case 'P':
          this.paused = !this.paused

          if (!this.winterCountdownTime && this.paused) {
            this.textDisplays[0].show('PAUSED', {
              fill: BLUE,
            })
          } else if (!this.winterCountdownTime && !this.paused) {
            this.textDisplays[0].hide()
          }

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
      if (!this.keys.down.RIGHT && !this.keys.down.LEFT) {
        this.hero.state.action = SETTINGS.HERO.MOVEMENT_STATES.NEUTRAL
      }
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

    hashTypes(type1, type2) {
      return [type1, type2]
        .sort((a, b) => a > b)
        .join('-')
    }

    setupCollisionHandlers() {
      const that = this
      this.resetCollisions()

      this.collisionHandlers = {
        [that.hashTypes(TYPES.GROUND, TYPES.HERO)]: function() {
          that.hero.land()
        },
        [that.hashTypes(TYPES.FISH, TYPES.GROUND)]: function(bodies) {
          that.destroyEntity(that.objects[bodies.find(item => item.type === TYPES.FISH).id])
        },
        [that.hashTypes(TYPES.GROUND, TYPES.SEAL)]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.SEAL).id].jumps = SETTINGS.SEAL.MAX_JUMPS
        },
        [that.hashTypes(TYPES.GROUND, TYPES.MALE)]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.MALE).id].jumps = SETTINGS.MALE.MAX_JUMPS
        },
        [that.hashTypes(TYPES.HERO, TYPES.SEAL)]: function(bodies, point) {
          const enemy = that.objects[bodies.find(item => item.type === TYPES.SEAL).id];
          that.handleEnemyHeroCollision(enemy, point)
        },
        [that.hashTypes(TYPES.GULL, TYPES.HERO)]: function(bodies, point) {
          const enemy = that.objects[bodies.find(item => item.type === TYPES.GULL).id];
          that.handleEnemyHeroCollision(enemy, point)
        },
        [that.hashTypes(TYPES.SEAL, TYPES.SEAL)]: function(bodies) {
          if (that.objects[bodies[0].id].abducting) {
            that.objects[bodies[1].id].jump()
          } else if (that.objects[bodies[1].id].abducting) {
            that.objects[bodies[0].id].jump()
          } else if (Math.random() > 0.5) {
            that.objects[bodies[0].id].jump()
          } else {
            that.objects[bodies[1].id].jump()
          }
        },
        [that.hashTypes(TYPES.FISH, TYPES.SEAL)]: function(bodies) {
          that.handleEnemyFishCollision(
            that.objects[bodies.find(item => item.type === TYPES.SEAL).id],
            that.objects[bodies.find(item => item.type === TYPES.FISH).id],
          )
        },
        [that.hashTypes(TYPES.FISH, TYPES.GULL)]: function(bodies) {
          that.handleEnemyFishCollision(
            that.objects[bodies.find(item => item.type === TYPES.GULL).id],
            that.objects[bodies.find(item => item.type === TYPES.FISH).id],
          )
        },
        [that.hashTypes(TYPES.MALE, TYPES.MALE)]: function(bodies) {
          if (Math.random() < 0.1) {
            that.objects[bodies[0].id].jump()
          } else if (Math.random() < 0.1) {
            that.objects[bodies[1].id].jump()
          }
        },
        [that.hashTypes(TYPES.MALE, TYPES.OFFSCREEN)]: function(bodies) {
          const male = that.objects[bodies.find(item => item.type === TYPES.MALE).id];
          that.destroyEntity(male.abductor)
          that.destroyEntity(male)
        },
        [that.hashTypes(TYPES.SEAL, TYPES.OFFSCREEN)]: function(bodies) {
          const seal = that.objects[bodies.find(item => item.type === TYPES.SEAL).id];
          that.destroyEntity(seal)
          that.destroyEntity(seal.abducting)
        },
        [that.hashTypes(TYPES.GULL, TYPES.OFFSCREEN)]: function(bodies) {
          // const gull = that.objects[bodies.find(item => item.type === TYPES.GULL).id];
        },
        [that.hashTypes(TYPES.MALE, TYPES.SEAL)]: function(bodies) {
          const male = that.objects[bodies.find(item => item.type === TYPES.MALE).id];
          const seal = that.objects[bodies.find(item => item.type === TYPES.SEAL).id];


          if (seal.abducting) {
            if (!male.abductor) {
              male.jump()
            }
          } else {
            if (male.abductor) {
              if (male.id !== seal.abducting.id) {
                seal.jump()
              }
            } else {
              seal.abduct(male)
            }
          }
        },
      }
    }

    createId() {
      this.idPointer += 1
      return this.idPointer
    }

    setupMales() {
      for (let i = 0; i < this.winterStats[TYPES.MALE].total; i++) {
        new Male(this)
      }
    }

    setupDisplay() {
      this.textDisplays = [
        new Text({
          x: 0,
          y: 10,
          style: {
            fill: GREEN,
          },
          parent: this,
        }),
        new Text({
          x: 0,
          y: 4,
          style: {
            fill: GREEN,
          },
          parent: this,
        })
      ]

      this.background = new PIXI.Sprite(SETTINGS.GLOBAL.BACKGROUND_TEXTURE)
      this.background.zOrder = -3
      this.container.addChild(this.background)

      // must be AFTER background
      this.pointDisplay = new Text({
        prefix: 'SCORE: ',
        x: 30,
        y: 25,
        parent: this,
      })

      this.pointDisplay.show(String(this.points))

      this.winterDisplay = new Text({
        prefix: 'WINTER: ',
        x: 30,
        y: 20,
        parent: this,
      })

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
      this.destroyEntity(fish)
    }

    evaluateCollisions() {
      this.collisions.forEach((point) => {
        const bodies = [
          point.fixtureA.getBody(),
          point.fixtureB.getBody(),
        ]

        const key = this.hashTypes(...bodies.map(item => item.type))

        const handler = this.collisionHandlers[key]
        if (handler) {
          handler(bodies, point)
        }
      })

      this.resetCollisions()
    }

    createEnemy(type) {
      this.winterStats[type].created +=1
      const direction = Math.random() < 0.5
        ? LEFT
        : RIGHT

      switch (type) {
        case TYPES.SEAL:
          new Seal(this, direction)
          break
        case TYPES.GULL:
          new Gull(this, direction)
          break
        default:
          //nothing
      }
    }

    gameOver() {
      const that = this
      this.paused = true
      this.textDisplays[0].show(`GAME OVER: ${this.gameOverReason}`, {
        fill: RED,
      });

      this.healthBar.hide()

      this.resetButton = new Button({
        x: 0,
        y: -2,
        parent: this,
        style: {
          fill: GREEN,
        },
      })

      this.resetButton.show({
        text: 'PLAY AGAIN',
        fn: () => {
          that.reset()
        }
      })

      this.menuButton = new Button({
        x: SETTINGS.HEALTH_BAR.X,
        y: SETTINGS.HEALTH_BAR.Y,
        parent: this,
        style: {
          fill: YELLOW,
        }
      })

      this.menuButton.show({
        text: 'MENU',
        fn: () => {
          app.stage.removeChild(that.container)
          new Menu()
        }
      })
    }

    resetBodies() {
      this.healthBar.graphics.clear();

      Object.keys(this.objects).forEach((id) => {
        this.destroyEntity(this.objects[id])
      })

      if (this.hero) {
        this.destroyEntity(this.hero)
      }

      this.objects = {}
    }

    getWinterStats() {
      const seals = enforcePositive(this.winter * 2 + 10)
      const gulls = enforcePositive(this.winter * 3 - 10)

      return {
        [TYPES.SEAL]: {
          total: seals,
          created: 0,
          destroyed: 0
        },
        [TYPES.GULL]: {
          total: gulls,
          created: 0,
          destroyed: 0
        },
        [TYPES.MALE]: {
          total: SETTINGS.MALE.NUM,
          created: SETTINGS.MALE.NUM,
          destroyed: 0
        },
      }
    }

    addPoints(num) {
      this.points += num
      this.pointDisplay.show(String(this.points))
    }

    typeComplete(type) {
      return this.winterStats[type].destroyed === this.winterStats[type].total
    }

    spawnEnemies() {
      ENEMY_TYPES.forEach((type) => {
        if (this.toCreateEnemy(type)) {
          this.createEnemy(type)
        }
      })
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
      this.container.addChild(graphics);

      const offscreenDetectors = this.world.createBody()
      const wall = this.world.createBody()
      const ground = this.world.createBody()

      this.assignType(ground, TYPES.GROUND)
      this.assignType(offscreenDetectors, TYPES.OFFSCREEN)
      this.assignType(wall, TYPES.WALL)

      const groundOpts = {
        density: 0.0,
        friction: 7.5,
        filterCategoryBits: CATEGORIES.GROUND,
        filterMaskBits: MASKS.GROUND,
      }

      const wallOpts = {
        density: 0.0,
        friction: 0.0,
        filterCategoryBits: CATEGORIES.WALLS,
        filterMaskBits: MASKS.WALLS,
      }

      const offscreenOpts = {
        density: 0.0,
        friction: 0.0,
        filterCategoryBits: CATEGORIES.OFFSCREEN,
        filterMaskBits: MASKS.OFFSCREEN,
      }

      // walls
      this.createBlock(graphics, wall, wallOpts, true, SETTINGS.GLOBAL.BORDER_X_LEFT, -20.0, SETTINGS.GLOBAL.BORDER_X_LEFT, 30.0)
      this.createBlock(graphics, wall, wallOpts, true, SETTINGS.GLOBAL.BORDER_X_RIGHT, -20.0, SETTINGS.GLOBAL.BORDER_X_RIGHT, 30.0)

      // off-screen detectors
      this.createBlock(graphics, offscreenDetectors, offscreenOpts, true, SETTINGS.GLOBAL.OFFSCREEN_X_LEFT, -20.0, SETTINGS.GLOBAL.OFFSCREEN_X_LEFT, 30.0)
      this.createBlock(graphics, offscreenDetectors, offscreenOpts, true, SETTINGS.GLOBAL.OFFSCREEN_X_RIGHT, -20.0, SETTINGS.GLOBAL.OFFSCREEN_X_RIGHT, 30.0)

      // ceiling
      this.createBlock(graphics, wall, wallOpts, true, SETTINGS.GLOBAL.OFFSCREEN_X_LEFT, 30.0, SETTINGS.GLOBAL.OFFSCREEN_X_RIGHT, 30.0)
      this.createBlock(graphics, ground, groundOpts, true, -100.0, -20.0, 100.0, -20.0)
    }

    shake() {
      this.container.x = (Math.random() * 1.5 - 0.75) * pscale
    }

    renderObjects() {
      if (this.winterCountdownTime) {
        return
      }

      this.hero.render()

      Object.keys(this.objects).forEach((id) => {
        this.objects[id].render()
      })
    }
  }

  class HealthBar {
    constructor(parent) {
      this.game = parent
      this.graphics = new PIXI.Graphics();
      this.game.container.addChild(this.graphics);
    }

    hide() {
      this.game.container.removeChild(this.graphics);
    }

    update(health) {
      if (this.body) {
        this.game.world.destroyBody(this.body)
      }

      if (health) {
        this.body = this.game.world.createBody(Vec2(SETTINGS.HEALTH_BAR.X, SETTINGS.HEALTH_BAR.Y));

        this.body.createFixture(planck.Box(SETTINGS.HEALTH_BAR.MAX_WIDTH * (health / SETTINGS.HERO.MAX_HEALTH), 0.5), {
          filterGroupIndex: 99,
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
    constructor({
      prefix = '',
      x,
      y,
      style,
      parent
    }) {
      this.parent = parent
      this.prefix = prefix
      this.x = x
      this.y = y
      this.style = {
        ...BASE_TEXT_STYLE,
        ...style,
      }
    }

    show(text, style) {
      this.parent.container.removeChild(this.text)

      this.text = new PIXI.Text(`${this.prefix} ${text}`, {
        ...this.style,
        ...style,
      });

      this.text.anchor.set(0.5)
      this.text.x = mpx(this.x)
      this.text.y = mpy(this.y)

      this.parent.container.addChild(this.text);
    }

    hide() {
      if (this.text) {
        this.parent.container.removeChild(this.text)
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

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  class Male extends Friend {
    constructor(parent) {
      super(parent)
      this.velocity = SETTINGS.MALE.SPEED
      this.alive = true
      this.abductor = null
      this.filterData = {
        friction: 0,
        filterCategoryBits: CATEGORIES.CREATURE,
        filterMaskBits: MASKS.CREATURE,
        filterGroupIndex: 0,
      }

      this.jumps = SETTINGS.MALE.MAX_JUMPS

      const x = SETTINGS.MALE.SPAWN_X + (SETTINGS.MALE.SPAWN_SPREAD * Math.random() - SETTINGS.MALE.SPAWN_SPREAD / 2)

      this.body = this.game.world.createBody({
        position : Vec2(x, SETTINGS.MALE.SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.createFixture(planck.Box(SETTINGS.MALE.BOX_WIDTH, SETTINGS.MALE.BOX_HEIGHT), {
        ...this.filterData
      })

      this.body.render = {
        stroke: GREEN
      }

      this.game.assignType(this, TYPES.MALE)

      this.body.id = this.id

      this.setupSprite()
    }

    onLiberation() {
      this.sprite.animationSpeed = SETTINGS.MALE.ANIMATION_SPEED_STANDARD
      this.abductor = null
      this.body.getFixtureList().setFilterData({
        groupIndex: this.filterData.filterGroupIndex,
        categoryBits: this.filterData.filterCategoryBits,
        maskBits: this.filterData.filterMaskBits,
      })
    }

    onAbduction() {
      this.abductor = this
      this.sprite.animationSpeed = SETTINGS.MALE.ANIMATION_SPEED_STRESSED

      this.body.getFixtureList().setFilterData({
        filterMaskBits: 0x0000
      })
    }

    setupSprite() {
      const textures = [];

      for (let i = 1; i <= 2; i++) {
        textures.push(PIXI.Texture.fromFrame(`male:neutral:${i}.png`));
      }

      this.sprite = new PIXI.extras.AnimatedSprite(textures);

      this.sprite.anchor.set(0.5)
      this.sprite.visible = false
      this.sprite.play();
      this.sprite.animationSpeed = SETTINGS.MALE.ANIMATION_SPEED_STANDARD

      this.game.container.addChild(this.sprite)
    }

    move() {
      if (this.abductor) {
        return
      }

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

    jump() {
      if (!this.jumps) {
        return
      }

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
      this.alive = true
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
        this.game.destroyEntity(this)
      }
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

      this.direction = direction
      this.points = SETTINGS.SEAL.POINTS
      this.abducting = false

      this.velocity = direction === RIGHT
        ? SETTINGS.SEAL.SPEED
        : SETTINGS.SEAL.SPEED * -1

      this.setupBody()

      this.game.assignType(this, TYPES.SEAL)
      this.body.id = this.id

      this.setupSprite()
    }

    setupSprite() {
      const textures = [];

      for (let i = 1; i <= 4; i++) {
        textures.push(PIXI.Texture.fromFrame(`seal:running:${i}.png`));
      }

      this.sprite = new PIXI.extras.AnimatedSprite(textures);

      this.sprite.anchor.set(0.5)
      this.sprite.gotoAndPlay(Math.floor(Math.random() * 4));
      this.sprite.animationSpeed = SETTINGS.SEAL.ANIMATION_SPEED_STANDARD

      this.game.container.addChild(this.sprite)
    }

    setupBody() {
      const x = this.direction === LEFT
      ? SETTINGS.SEAL.SPAWN_X
      : SETTINGS.SEAL.SPAWN_X * -1

      this.body = this.game.world.createBody({
        position : Vec2(x, SETTINGS.SEAL.SPAWN_Y),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.body.createFixture(planck.Box(SETTINGS.SEAL.BOX_WIDTH, SETTINGS.SEAL.BOX_HEIGHT), {
        friction: 0,
        filterCategoryBits: CATEGORIES.CREATURE,
        filterMaskBits: MASKS.CREATURE,
      })
    }

    move() {
      const velocity = this.abducting
        ? this.velocity * -1
        : this.velocity

      this.sprite.scale.x = velocity < 0
        ? -1
        : 1

      this.body.setLinearVelocity(Vec2(
        velocity,
        this.body.getLinearVelocity().y
      ))
    }

    abduct(male) {
      this.abducting = male
      male.onAbduction()

      this.game.world.createJoint(planck.RevoluteJoint(
        {
          collideConnected: false
        },
        this.body,
        male.body,
        Vec2(0, 0)
      ));
    }

    jump() {
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

      this.body.createFixture(planck.Box(SETTINGS.GULL.BOX_WIDTH, SETTINGS.GULL.BOX_HEIGHT), {
        friction: 0,
        filterCategoryBits: CATEGORIES.CREATURE,
        filterMaskBits: MASKS.CREATURE,
      })

      this.body.render = {
        stroke: BLUE
      }

      this.game.assignType(this, TYPES.GULL)

      this.body.id = this.id
      this.untilFlap = SETTINGS.GULL.FLAP_INTERVAL
      this.sprite = new PIXI.Sprite(SETTINGS.GULL.TEXTURE)
      this.sprite.scale.set(0.9)
      this.sprite.anchor.set(0.5);
      this.game.container.addChild(this.sprite)
    }

    move() {
      this.untilFlap -= 1
      let yVelocity

      if (this.untilFlap <= 0) {
        yVelocity = SETTINGS.GULL.FLAP_POWER + Math.random() * 5 - 2.5
        this.untilFlap = SETTINGS.GULL.FLAP_INTERVAL + Math.random() * 5 - 2.5
      } else {
        yVelocity = this.body.getLinearVelocity().y
      }

      this.body.setLinearVelocity(Vec2(
        this.velocity,
        yVelocity
      ))

      var f = this.body.getWorldVector(Vec2(0.0, SETTINGS.GULL.IMPULSE))
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
      this.alive = true
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
      this.sprite.anchor.set(0.5);
      this.game.container.addChild(this.sprite)

      this.body.setAngularVelocity(Math.random() * Math.PI * 10 - (Math.PI * 5));

      this.game.assignType(this, TYPES.FISH)

      this.body.createFixture(planck.Box(SETTINGS.FISH.BOX_WIDTH, SETTINGS.FISH.BOX_HEIGHT), {
        filterCategoryBits: CATEGORIES.FISH,
        filterMaskBits: MASKS.FISH,
      })

      this.id = this.game.createId()
      this.game.objects[this.id] = this
      this.body.id = this.id
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
      this.alive = true
      this.health = SETTINGS.HERO.MAX_HEALTH
      this.invincibilityTime = 0
      this.fishThrowTime = 0
      this.damage = SETTINGS.HERO.DAMAGE
      this.sprinting = false

      this.state = {
        airborne: true,
        action: 'NEUTRAL',
        direction: RIGHT,
      }

      this.setupSprite()

      this.body = this.game.world.createBody({
        position : Vec2(SETTINGS.HERO.START_X, SETTINGS.HERO.START_Y,),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      })

      this.game.assignType(this, TYPES.HERO)

      this.body.createFixture(planck.Box(SETTINGS.HERO.BOX_WIDTH, SETTINGS.HERO.BOX_HEIGHT), {
        filterCategoryBits: CATEGORIES.HERO,
        filterMaskBits: MASKS.HERO,
      })

      this.body.render = {
        stroke: GREEN
      }

      this.jumps = SETTINGS.HERO.MAX_JUMPS
      this.speed = SETTINGS.HERO.SPEED

      this.game.healthBar.update(this.health)
    }

    setupSprite() {
      const neutralTextures = [];
      const runningTextures = [];

      for (let i = 1; i <= 2; i++) {
        neutralTextures.push(PIXI.Texture.fromFrame(`hero:neutral:${i}.png`));
      }

      for (let i = 1; i <= 2; i++) {
        runningTextures.push(PIXI.Texture.fromFrame(`hero:running:${i}.png`));
      }

      this.sprites = {
        neutral: new PIXI.extras.AnimatedSprite(neutralTextures),
        running: new PIXI.extras.AnimatedSprite(runningTextures),
      }

      this.stateMappings = {
        [SETTINGS.HERO.MOVEMENT_STATES.ATTACKING]: this.sprites.neutral,
        [SETTINGS.HERO.MOVEMENT_STATES.GLIDING]: this.sprites.neutral,
        [SETTINGS.HERO.MOVEMENT_STATES.JUMPING]: this.sprites.neutral,
        [SETTINGS.HERO.MOVEMENT_STATES.NEUTRAL]: this.sprites.neutral,
        [SETTINGS.HERO.MOVEMENT_STATES.RUNNING]: this.sprites.running,
      }

      this.sprites.neutral.anchor.set(0.5)
      this.sprites.running.anchor.set(0.5)
      this.sprites.neutral.visible = false
      this.sprites.running.visible = false
      this.sprites.neutral.animationSpeed = SETTINGS.HERO.ANIMATION_SPEED_NEUTRAL
      this.sprites.running.animationSpeed = SETTINGS.HERO.ANIMATION_SPEED_RUNNING

      this.setActiveSprite(false)

      this.game.container.addChild(this.sprites.neutral)
      this.game.container.addChild(this.sprites.running)
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
        this.game.destroyEntity(this)
      }

      this.game.healthBar.update(this.health)
    }

    throwFish() {
      if (this.fishThrowTime) {
        return
      }

      const pos = this.body.getPosition()

      new Fish({
        x: pos.x,
        y: pos.y,
        direction: this.state.direction,
        parent: this.game,
      })

      this.fishThrowTime = SETTINGS.FISH.THROW_INTERVAL
    }

    stomp() {
      this.state.action = SETTINGS.HERO.MOVEMENT_STATES.ATTACKING

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        -70)
      )

      this.stompFixture = this.body.createFixture(planck.Box(SETTINGS.HERO.STOMP_BOX_WIDTH, SETTINGS.HERO.STOMP_BOX_HEIGHT), 1.0);
    }

    glide() {
      this.state.action = SETTINGS.HERO.MOVEMENT_STATES.GLIDING
      this.jumps = 0

      const f = this.body.getWorldVector(Vec2(0.0, SETTINGS.HERO.GLIDE_IMPULSE))
      const p = this.body.getWorldPoint(Vec2(0.0, 0.0))
      this.body.applyLinearImpulse(f, p, true)
    }

    land() {
      this.state.airborne = false

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
      this.state.direction = direction
      this.state.action = SETTINGS.HERO.MOVEMENT_STATES.RUNNING

      const sprintMultiplier = this.sprinting
        ? SETTINGS.HERO.SPRINT_MULTIPLIER
        : 1

      this.body.setLinearVelocity(Vec2(
        direction * this.speed * sprintMultiplier,
        this.body.getLinearVelocity().y)
      )
    }

    jump() {
      this.state.airborne = true

      if (!this.jumps) {
        return
      }

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        SETTINGS.HERO.JUMP)
      )

      this.jumps -= 1
    }

    setActiveSprite(visible = true) {
      const sprite = this.stateMappings[this.state.action]


      if (sprite === this.activeSprite) {
        this.activeSprite.scale.x = this.state.direction
        return
      }

      if (this.activeSprite) {
        this.activeSprite.visible = false
        this.activeSprite.stop()
      }

      this.activeSprite = sprite
      this.activeSprite.visible = visible
      this.activeSprite.scale.x = this.state.direction
      this.activeSprite.play()
    }

    render() {
      const pos = this.body.getPosition()

      this.setActiveSprite()

      this.activeSprite.position.set(mpx(pos.x), mpy(pos.y))
    }
  }

  class Button extends Text {
    constructor(opts) {
      super(opts)
    }

    show({ text, fn }) {
      super.show(text)

      this.text.interactive = true
      this.text.buttonMode = true
      this.text.on('pointerdown', () => fn())
    }
  }

  class Menu {
    constructor() {
      const that = this
      this.container = new PIXI.Container();
      app.stage.addChild(this.container);

      this.background = new PIXI.Sprite(SETTINGS.MENU.TEXTURE)
      this.background.zOrder = -3

      this.container.addChild(this.background)

      this.title = new Text({
        x: 0,
        y: 10,
        style: {
          fill: GREEN,
        },
        parent: this,
      })

      this.startButton = new Button({
        x: 0,
        y: 5,
        parent: this,
      })

      this.startButton.show({
        fn: () => {
          that.startGame()
        },
        text: 'PLAY',
      })

      this.title.show('PENGUIN DEFENDER')
    }

    startGame() {
      app.stage.removeChild(this.container)

      const game = new Game()

      window.requestAnimationFrame(function() {
        game.onStep()
      });
    }
  }

  (function setupGame() {
    PIXI.loader
    .add('hero_neutral_spritesheet', '/assets/hero/spritesheets/neutral.json')
    .add('hero_running_spritesheet', '/assets/hero/spritesheets/running.json')
    .add('male_neutral_spritesheet', '/assets/male/spritesheets/neutral.json')
    .add('seal_running_spritesheet', '/assets/seal/spritesheets/running.json')
    .load(() => {
      new Menu()
    });
  })()
})()

