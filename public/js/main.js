/**
 * Basic surival game created using pixi.js and planck.js
 */
(function main() {
  /**
   * Constants
   */

  const CATEGORIES = Object.freeze({
    FOE: 0x0001,
    GROUND: 0x0002,
    HERO: 0x0004,
    FRIEND: 0x0008,
    WALLS: 0x0016,
    OFFSCREEN: 0x0032,
  })

  const GROUPS = Object.freeze({
    FOE: -2,
    HERO: -3,
  })

  const MASKS = Object.freeze({
    FOE: CATEGORIES.HERO | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND | CATEGORIES.FRIEND,
    FRIEND: CATEGORIES.FRIEND | CATEGORIES.FOE | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND,
    HERO: CATEGORIES.FOE | CATEGORIES.WALLS | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND,
    GROUND: CATEGORIES.FOE | CATEGORIES.HERO | CATEGORIES.FRIEND,
    WALLS: CATEGORIES.HERO,
    OFFSCREEN: CATEGORIES.FOE | CATEGORIES.FRIEND,
  })

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

  const CONSTANTS = Object.freeze({
    ENEMY_TYPES: Object.freeze([
      TYPES.SEAL,
      TYPES.GULL
    ]),
    MALE: Object.freeze({
      SPAWN: Object.freeze({
        X: 0,
        Y: 0,
        SPREAD: 10.0,
      }),
      JUMP: Object.freeze({
        MAGNITUDE: 20,
        MAX: 1,
      }),
      HITBOX: Object.freeze({
        WIDTH: 0.5,
        HEIGHT: 1,
      }),
      ANIMATION_SPEED: Object.freeze({
        STANDARD: 0.03,
        STRESSED: 0.1,
      }),
      NUM: 10,
      SPEED: 2.0,
    }),
    HERO: Object.freeze({
      TRAIL: Object.freeze({
        TEXTURE: PIXI.Texture.fromImage('assets/hero/trail.png'),
        SMOOTHNESS: 100,
        LENGTH: 10,
        THRESHOLD: 20,
        MIN_VELOCITY: 5,
      }),
      ANIMATION_SPEED: Object.freeze({
        DIVING: 0.18,
        NEUTRAL: 0.03,
        RUNNING: 0.06,
        JUMPING: 0.24,
      }),
      MOVEMENT_STATES: Object.freeze({
        RUNNING: 'RUNNING',
        GLIDING: 'GLIDING',
        NEUTRAL: 'NEUTRAL',
        DIVING: 'DIVING',
        JUMPING: 'JUMPING',
      }),
      JUMP: Object.freeze({
        MAGNITUDE: 35,
        MAX: 3,
      }),
      HEALTH: Object.freeze({
        MAX: 5,
      }),
      HITBOX: Object.freeze({
        WIDTH: 1.5,
        HEIGHT: 2.0,
      }),
      DIVE: Object.freeze({
        HITBOX: Object.freeze({
          WIDTH: 8.0,
          HEIGHT: 0.5,
        }),
      }),
      SPAWN: Object.freeze({
        X: 0.0,
        Y: 5.0,
      }),
      GLIDE: Object.freeze({
        IMPULSE: 2,
      }),
      INVINCIBILITY_INTERVAL: 30,
      DAMAGE: 1,
      SPEED: 15,
      THROW_INTERVAL: 25,
    }),
    HEALTH_BAR: Object.freeze({
      X: -40,
      Y: 26,
      MAX_WIDTH: 10,
    }),
    FISH: Object.freeze({
      HITBOX: Object.freeze({
        WIDTH: 1,
        HEIGHT: 0.6,
      }),
      LAUNCH_VELOCITY: Object.freeze({
        X: 20,
        Y: 50,
      }),
      DAMAGE: 1,
    }),
    SEAL: Object.freeze({
      SPAWN: Object.freeze({
        X: 50,
        Y: 5,
        PROBABILITY: 0.01,
      }),
      JUMP: Object.freeze({
        MAGNITUDE: 20,
        MAX: 1,
      }),
      HITBOX: Object.freeze({
        WIDTH: 2,
        HEIGHT: 1,
      }),
      ANIMATION_SPEED: Object.freeze({
        STANDARD: 0.15,
      }),
      POINTS: 10,
      SPEED: 3.5,
      HEALTH: 1,
      DAMAGE: 1,
    }),
    GULL: Object.freeze({
      SPAWN: Object.freeze({
        X: 50,
        Y: 20,
        PROBABILITY: 0.01,
      }),
      FLAP: Object.freeze({
        STANDARD: Object.freeze({
          POWER: 2.1,
          INTERVAL: 15,
        }),
        ABDUCTING: Object.freeze({
          POWER: 30,
          INTERVAL: 15,
        }),
        FLYAWAY: Object.freeze({
          POWER: 6,
          INTERVAL: 15,
        }),
      }),
      HITBOX: Object.freeze({
        WIDTH: 1.5,
        HEIGHT: 0.6,
      }),
      ANIMATION_SPEED: Object.freeze({
        STANDARD: 0.1,
      }),
      SPEED: 3.0,
      HEALTH: 1,
      DAMAGE: 1.5,
      IMPULSE: 1.5,
      POINTS: 15,
    }),
    SHAKE: Object.freeze({
      DURATION: 20,
      MAGNITUDE: 1.5,
    }),
    BORDER: Object.freeze({
      LEFT: -40,
      RIGHT: 40,
      TOP: 30,
    }),
    OFFSCREEN: Object.freeze({
      LEFT: -55,
      RIGHT: 55,
      BOTTOM: -20,
    }),
    BACKGROUND: Object.freeze({
      DIFFUSE: 'assets/mountains.png',
      NORMAL: 'assets/mountains.normal.clouds.light.png',
    }),
    WINTER: Object.freeze({
      COUNTDOWN: 50,
      INTERIM: 1500,
    }),
    TIME_STEP: 1 / 30,
    GRAVITY: -60,
  })

  /**
   * PIXI setup
   */

  const app = new PIXI.Application({
    backgroundColor: 0x000000,
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9,
  });

  stage = PIXI.shadows.init(app);
  PIXI.shadows.filter.ambientLight = 0.3;

  document.getElementById('content').appendChild(app.view);
  app.view.style.position = 'absolute';
  app.view.style.border = '1px solid #222222';


  /**
   * Helper functions
   */

  function assembleBasicSprite(diffuseSprite, normalSprite, shadowSprite) {
    const container = new PIXI.Container();

    diffuseSprite.parentGroup = PIXI.lights.diffuseGroup;
    container.addChild(diffuseSprite);

    normalSprite.parentGroup = PIXI.lights.normalGroup;
    container.addChild(normalSprite);

    if (shadowSprite) {
      shadowSprite.parentGroup = PIXI.shadows.casterGroup;
        container.addChild(shadowSprite);
    }

    return container;
  }

  function createShadowCastingLight(radius, intensity, color) {
    const container = new PIXI.Container();

    const pixiLight = new PIXI.lights.PointLight(color, intensity);
    container.addChild(pixiLight);

    const shadow = new PIXI.shadows.Shadow(radius, 0.2);
    shadow.pointCount = 5
    shadow.range = 1000
    shadow.scatterRange = 4
    shadow.radialResolution = 600
    shadow.depthResolution = 1
    container.addChild(shadow);

    return container;
}

  const Vec2 = planck.Vec2

  function enforcePositive(num) {
    return num > 0
      ? num
      : 0
  }

  /**
   * Cubic interpolation based on https://github.com/osuushi/Smooth.js
   * @param	k
   * @return
   */
  function clipInput(k, arr) {
    if (k <= 0) {
      return arr[0];
    }
    if (k >= arr.length - 1) {
      return arr[arr.length - 1];
    }

    return arr[k];
  }

  function getTangent(k, factor, array) {
    return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
  }

  function cubicInterpolation(array, t, tangentFactor) {
    if (tangentFactor == null) tangentFactor = 1;

    const k = Math.floor(t);
    const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
    const p = [clipInput(k, array), clipInput(k + 1, array)];
    t -= k;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + ( -2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
  }

  const pscale = 13;

  /**
   * Build sprite from spritesheet data
   */
  function getAnimatedSprite(nameTemplate, max) {
    const textures = [];

    for (let i = 1; i <= max; i++) {
      textures.push(PIXI.Texture.fromFrame(nameTemplate.replace('{i}', i)));
    }

    return new PIXI.extras.AnimatedSprite(textures)
  }

  /**
   * Scaling for render
   */

  function mpx(m) {
    return m * pscale + (window.innerWidth / 2.3);
  }

  function mpy(m) {
    return window.innerHeight * 0.5 - (m * pscale);
  }

  /**
   * Game
   */
  class Game {
    constructor() {
      this.reset()
    }

    reset() {
      this.winter = 6
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
        stage.removeChild(this.container)
      }

      this.container = new PIXI.Container()
      stage.addChild(this.container)

      // resetStage()

      // move into single background object
      const backgroundDiffuse = new PIXI.Sprite.fromImage(CONSTANTS.BACKGROUND.DIFFUSE, true);
      backgroundDiffuse.width = app.screen.width;
      backgroundDiffuse.height = app.screen.height;
      backgroundDiffuse.zOrder = -3

      const backgroundNormals = new PIXI.Sprite.fromImage(CONSTANTS.BACKGROUND.NORMAL);
      backgroundNormals.width = app.screen.width;
      backgroundNormals.height = app.screen.height;
      backgroundNormals.zOrder = -3

      const background = assembleBasicSprite(backgroundDiffuse, backgroundNormals)

      this.ambientLight = new PIXI.lights.AmbientLight(null, 10)
      this.directionalLight = new PIXI.lights.DirectionalLight(null, 10, new PIXI.Point(300, 300));

      this.shadowCastingLight = createShadowCastingLight(1000, 20, 0x1111cc);
      this.shadowCastingLight.position.set(0, 0);

      this.container.addChild(
        background,
        this.ambientLight,
        this.directionalLight,
        this.shadowCastingLight,
      );

      // app.stage.addChild(
      //     // put all layers for deferred rendering of normals
      //     new PIXI.display.Layer(PIXI.lights.diffuseGroup),
      //     new PIXI.display.Layer(PIXI.lights.normalGroup),
      //     new PIXI.display.Layer(PIXI.lights.lightGroup),
      //     // Add the lights and images
      //     this.container
      // );
    }

    startWinterCountdown() {
      this.winterCountdownTime = CONSTANTS.WINTER.COUNTDOWN
      this.winterCountdownInterval = this.winterCountdownTime / 4
    }

    winterComplete() {
      return CONSTANTS.ENEMY_TYPES.reduce((acc, type) => {
        return acc && this.typeComplete(type)
      }, true)
    }

    onWinterComplete() {
      const that = this
      this.textDisplays[0].show(`WINTER ${this.winter} COMPLETE!`)
      this.textDisplays[1].show('NOICE')
      this.paused = true
      this.active = false

      setTimeout(() => that.startWinter(), CONSTANTS.WINTER.INTERIM)
    }

    toCreateEnemy(type) {
      if (Math.random() > CONSTANTS[type].SPAWN.PROBABILITY) {
        return false
      }

      return this.winterStats[type].created < this.winterStats[type].total
    }

    onEnemyDestroyed(type) {
      this.winterStats[type].destroyed +=1

      if (!this.typeComplete(type)) {
        return
      }

      this.enemyTypeDestroyed = true
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

      entity.destroySprites()

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
          if (CONSTANTS.ENEMY_TYPES.includes(entity.type)) {
            this.onEnemyDestroyed(entity.type)
          }
      }
    }

    deferDestroyFixture(entity, key) {
      this.deferDestroy.fixtures.push({ entity, key })
    }

    destroyDeferred() {
      this.deferDestroy.fixtures.forEach(({ entity, key }) => {
        if (entity[key]) {
          entity.body.destroyFixture(entity[key])
          entity[key] = null
        }
      })
    }

    resetDeferredForDestroy() {
      this.deferDestroy = {
        fixtures: []
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

    moveSun() {
      this.spotlight.color = `0x${String(Math.floor(50 - this.spotlight.x * (50 / app.screen.width))).padStart(2, '0')}${String(Math.floor(this.spotlight.x * (100 / app.screen.width))).padStart(2, '0')}ff`
      this.spotlight.x = this.hero.activeSprite.x
    }

    onStepPauseIndependent() {
      // this.moveSun()
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

      this.resetDeferredForDestroy()
      this.enemyTypeDestroyed = false
      this.world.step(CONSTANTS.TIME_STEP);
      this.textDisplays.forEach(display => display.hide())

      this.evaluateCollisions()
      this.evaluateActiveKeys()
      this.spawnEnemies()
      this.moveObjects()
      this.destroyDeferred()

      if (this.hero.invincibilityTime) {
        if (this.hero.invincibilityTime > CONSTANTS.SHAKE.DURATION) {
          this.shake()
        }

        this.hero.invincibilityTime -= 1
      }

      if (this.hero.fishThrowTime > 0) {
        this.hero.fishThrowTime -= 1
      } else {
        this.hero.fishThrowTime = 0
      }

      if (!this.active) {
        this.gameOver()
        return
      }

      if (this.enemyTypeDestroyed && this.winterComplete()) {
        this.onWinterComplete()
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
          this.hero.dive()
          break
        default:
          // nothing
      }

      this.keys.down[key] = true
    }

    onKeyUp(key) {
      this.keys.down[key] = false
      if (!this.keys.down.RIGHT && !this.keys.down.LEFT && this.hero.state.action !== CONSTANTS.HERO.MOVEMENT_STATES.DIVING) {
        this.hero.state.action = CONSTANTS.HERO.MOVEMENT_STATES.NEUTRAL
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
        [that.hashTypes(TYPES.GULL, TYPES.GROUND)]: function(bodies) {
          const gull = that.objects[bodies.find(item => item.type === TYPES.GULL).id];
          gull.flyAway()
        },
        [that.hashTypes(TYPES.GROUND, TYPES.SEAL)]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.SEAL).id].jumps = CONSTANTS.SEAL.JUMP.MAX
        },
        [that.hashTypes(TYPES.GROUND, TYPES.MALE)]: function(bodies) {
          that.objects[bodies.find(item => item.type === TYPES.MALE).id].jumps = CONSTANTS.MALE.JUMP.MAX
        },
        [that.hashTypes(TYPES.HERO, TYPES.SEAL)]: function(bodies, point, fixtures) {
          const dive = Boolean(fixtures.find(item => item.dive === true))
          const enemy = that.objects[bodies.find(item => item.type === TYPES.SEAL).id];

          that.handleEnemyHeroCollision(enemy, point, dive)
        },
        [that.hashTypes(TYPES.GULL, TYPES.HERO)]: function(bodies, point) {
          const enemy = that.objects[bodies.find(item => item.type === TYPES.GULL).id];
          that.handleEnemyHeroCollision(enemy, point)
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
          const gull = that.objects[bodies.find(item => item.type === TYPES.GULL).id];
          that.destroyEntity(gull)
          that.destroyEntity(gull.abducting)
        },
        [that.hashTypes(TYPES.MALE, TYPES.GULL)]: function(bodies) {
          const male = that.objects[bodies.find(item => item.type === TYPES.MALE).id];
          const gull = that.objects[bodies.find(item => item.type === TYPES.GULL).id];

          if (gull.abducting) {
            if (!male.abductor) {
              male.jump()
            }
          } else {
            gull.abduct(male)
          }
        },
        [that.hashTypes(TYPES.MALE, TYPES.SEAL)]: function(bodies) {
          const male = that.objects[bodies.find(item => item.type === TYPES.MALE).id];
          const seal = that.objects[bodies.find(item => item.type === TYPES.SEAL).id];


          if (seal.abducting) {
            if (!male.abductor) {
              male.jump()
            }
          } else {
            seal.abduct(male)
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
        gravity: Vec2(0, CONSTANTS.GRAVITY)
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

    handleEnemyHeroCollision(enemy, point, dive) {
      if (dive || Math.abs(point.normal.y) === 1) {
        enemy.takeDamage(this.hero.damage)
        this.hero.jumps = CONSTANTS.HERO.JUMP.MAX
      } else {
        this.hero.takeDamage(enemy.damage)
      }
    }

    handleEnemyFishCollision(enemy, fish) {
      enemy.takeDamage(fish.damage)
      this.destroyEntity(fish)
    }

    evaluateCollisions() {
      for (let i = 0; i < this.collisions.length; i++) {
        const point = this.collisions[i]

        const fixtures = [
          point.fixtureA,
          point.fixtureB,
        ]

        const bodies = fixtures.map(fixture => fixture.getBody())

        if (!bodies[0] || !bodies[1]) {
          continue
        }

        const key = this.hashTypes(...bodies.map(item => item.type))

        const handler = this.collisionHandlers[key]
        if (handler) {
          handler(bodies, point, fixtures)
        }
      }

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

      this.resetBodies()

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
        x: CONSTANTS.HEALTH_BAR.X,
        y: CONSTANTS.HEALTH_BAR.Y,
        parent: this,
        style: {
          fill: YELLOW,
        }
      })

      this.menuButton.show({
        text: 'MENU',
        fn: () => {
          stage.removeChild(that.container)
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
          total: CONSTANTS.MALE.NUM,
          created: CONSTANTS.MALE.NUM,
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
      CONSTANTS.ENEMY_TYPES.forEach((type) => {
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
      this.createBlock(graphics, wall, wallOpts, true, CONSTANTS.BORDER.LEFT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.BORDER.LEFT, CONSTANTS.BORDER.TOP)
      this.createBlock(graphics, wall, wallOpts, true, CONSTANTS.BORDER.RIGHT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.BORDER.RIGHT, CONSTANTS.BORDER.TOP)

      // off-screen detectors
      this.createBlock(graphics, offscreenDetectors, offscreenOpts, true, CONSTANTS.OFFSCREEN.LEFT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.OFFSCREEN.LEFT, CONSTANTS.BORDER.TOP)
      this.createBlock(graphics, offscreenDetectors, offscreenOpts, true, CONSTANTS.OFFSCREEN.RIGHT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.OFFSCREEN.RIGHT, CONSTANTS.BORDER.TOP)

      // ceiling
      this.createBlock(graphics, wall, wallOpts, true, CONSTANTS.OFFSCREEN.LEFT, CONSTANTS.BORDER.TOP, CONSTANTS.OFFSCREEN.RIGHT, CONSTANTS.BORDER.TOP)

      // ground
      this.createBlock(graphics, ground, groundOpts, true, -100.0, CONSTANTS.OFFSCREEN.BOTTOM, 100.0, CONSTANTS.OFFSCREEN.BOTTOM)
    }

    shake() {
      this.container.x = (Math.random() * CONSTANTS.SHAKE.MAGNITUDE - CONSTANTS.SHAKE.MAGNITUDE / 2) * pscale
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
        this.body = this.game.world.createBody(Vec2(CONSTANTS.HEALTH_BAR.X, CONSTANTS.HEALTH_BAR.Y));

        this.body.createFixture(planck.Box(CONSTANTS.HEALTH_BAR.MAX_WIDTH * (health / CONSTANTS.HERO.HEALTH.MAX), 0.5), {
          filterGroupIndex: 99,
        });

        let color
        let bitColor

        if (health > CONSTANTS.HERO.HEALTH.MAX * 0.67) {
          color = GREEN
          bitColor = BIT_GREEN
        } else if (health > CONSTANTS.HERO.HEALTH.MAX * 0.33) {
          color = YELLOW
          bitColor = BIT_YELLOW
        } else {
          color = RED
          bitColor = BIT_RED
        }

        this.graphics.clear();

        this.game.createBlockDisplay(
          this.graphics,
          CONSTANTS.HEALTH_BAR.X,
          CONSTANTS.HEALTH_BAR.Y,
          CONSTANTS.HEALTH_BAR.X + (CONSTANTS.HEALTH_BAR.MAX_WIDTH * (health / CONSTANTS.HERO.HEALTH.MAX)),
          CONSTANTS.HEALTH_BAR.Y + 2,
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
      this.velocity = CONSTANTS.MALE.SPEED
      this.alive = true
      this.abductor = null

      this.filterData = {
        friction: 0,
        filterCategoryBits: CATEGORIES.FRIEND,
        filterMaskBits: MASKS.FRIEND,
        filterGroupIndex: 0,
      }

      this.jumps = CONSTANTS.MALE.JUMP.MAX

      const x = CONSTANTS.MALE.SPAWN.X + (CONSTANTS.MALE.SPAWN.SPREAD * Math.random() - CONSTANTS.MALE.SPAWN.SPREAD / 2)

      this.body = this.game.world.createBody({
        position: Vec2(x, CONSTANTS.MALE.SPAWN.Y),
        type: 'dynamic',
        fixedRotation: true,
        allowSleep: false
      })

      this.body.createFixture(planck.Box(CONSTANTS.MALE.HITBOX.WIDTH, CONSTANTS.MALE.HITBOX.HEIGHT), {
        ...this.filterData
      })

      this.body.render = {
        stroke: GREEN
      }

      this.game.assignType(this, TYPES.MALE)

      this.body.id = this.id

      this.setupSprite()
    }


    destroySprites() {
      this.game.container.removeChild(this.sprite)
    }

    onLiberation() {
      this.sprite.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD
      this.abductor = null

      // if called during resetBodies, will be null if seal is
      // destroyed before abductor
      const fixtures = this.body.getFixtureList()
      if (!fixtures) {
        return
      }

      fixtures.setFilterData({
        groupIndex: this.filterData.filterGroupIndex,
        categoryBits: this.filterData.filterCategoryBits,
        maskBits: this.filterData.filterMaskBits,
      })
    }

    onAbduction() {
      this.abductor = this
      this.sprite.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STRESSED

      this.body.getFixtureList().setFilterData({
        filterMaskBits: 0x0000
      })
    }

    setupSprite() {
      const animationStartIndex = Math.floor(Math.random() * 2)
      const sprite = getAnimatedSprite('male:neutral:{i}.png', 2)
      sprite.gotoAndPlay(animationStartIndex);
      sprite.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD
      sprite.anchor.set(0.5)

      const spriteNormals = getAnimatedSprite('male:neutral:normal:{i}.png', 2)
      spriteNormals.gotoAndPlay(animationStartIndex);
      spriteNormals.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD
      spriteNormals.anchor.set(0.5)

      const spriteShadows = getAnimatedSprite('male:neutral:{i}.png', 2)
      spriteShadows.gotoAndPlay(animationStartIndex);
      spriteShadows.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD
      spriteShadows.anchor.set(0.5)

      this.sprite = assembleBasicSprite(sprite, spriteNormals, spriteShadows)
      this.sprite.visible = false
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
          CONSTANTS.MALE.SPEED,
          velocity.y
        ))
      } else if (pos.x > 1) {
        this.body.setLinearVelocity(Vec2(
          CONSTANTS.MALE.SPEED * -1,
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
        CONSTANTS.MALE.JUMP.MAGNITUDE * (Math.random() / 2 + 0.5))
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
      this.invincibilityTime = CONSTANTS.HERO.INVINCIBILITY_INTERVAL

      if (this.health <= 0) {
        this.game.world.destroyBody(this.body)
        this.game.addPoints(this.points)
        this.game.destroyEntity(this)
      }
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
      if (this.spriteNormals) {
        this.spriteNormals.position.set(mpx(pos.x), mpy(pos.y))
      }
    }
  }

  class Seal extends Foe {
    constructor(parent, direction) {
      super({
        damage: CONSTANTS.SEAL.DAMAGE,
        health: CONSTANTS.SEAL.HEALTH,
        parent,
      })

      this.direction = direction
      this.points = CONSTANTS.SEAL.POINTS
      this.abducting = false

      this.velocity = direction === RIGHT
        ? CONSTANTS.SEAL.SPEED
        : CONSTANTS.SEAL.SPEED * -1

      this.setupBody()

      this.game.assignType(this, TYPES.SEAL)
      this.body.id = this.id

      this.setupSprite()
    }

    destroySprites() {
      this.game.container.removeChild(this.sprite)
      this.game.container.removeChild(this.spriteNormals)
    }

    setupSprite() {
      const animationStartIndex = Math.floor(Math.random() * 4)
      const sprite = getAnimatedSprite('seal:running:{i}.png', 4)
      sprite.gotoAndPlay(animationStartIndex);
      sprite.animationSpeed = CONSTANTS.SEAL.ANIMATION_SPEED.STANDARD
      sprite.anchor.set(0.5)

      const spriteNormals = getAnimatedSprite('seal:running:normal:{i}.png', 4)
      spriteNormals.gotoAndPlay(animationStartIndex);
      spriteNormals.animationSpeed = CONSTANTS.SEAL.ANIMATION_SPEED.STANDARD
      spriteNormals.anchor.set(0.5)

      const spriteShadows = getAnimatedSprite('seal:running:{i}.png', 4)
      spriteShadows.gotoAndPlay(animationStartIndex);
      spriteShadows.animationSpeed = CONSTANTS.SEAL.ANIMATION_SPEED.STANDARD
      spriteShadows.anchor.set(0.5)

      this.sprite = assembleBasicSprite(sprite, spriteNormals, spriteShadows)
      this.game.container.addChild(this.sprite)
    }

    setupBody() {
      const x = this.direction === LEFT
      ? CONSTANTS.SEAL.SPAWN.X
      : CONSTANTS.SEAL.SPAWN.X * -1

      this.body = this.game.world.createBody({
        position: Vec2(x, CONSTANTS.SEAL.SPAWN.Y),
        type: 'dynamic',
        fixedRotation: true,
        allowSleep: false
      })

      this.body.createFixture(planck.Box(CONSTANTS.SEAL.HITBOX.WIDTH, CONSTANTS.SEAL.HITBOX.HEIGHT), {
        friction: 0,
        filterCategoryBits: CATEGORIES.FOE,
        filterMaskBits: MASKS.FOE,
        filterGroupIndex: GROUPS.FOE,
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
        CONSTANTS.SEAL.JUMP.MAGNITUDE * (Math.random() / 2 + 0.5))
      )

      this.jumps -= 1
    }
  }

  class Gull extends Foe {
    constructor(parent, direction) {
      super({
        damage: CONSTANTS.GULL.DAMAGE,
        health: CONSTANTS.GULL.HEALTH,
        parent,
      })

      this.direction = direction
      this.points = CONSTANTS.GULL.POINTS
      this.velocity = CONSTANTS.GULL.SPEED
      this.abducting = false

      this.flapPower = CONSTANTS.GULL.FLAP.STANDARD.POWER
      this.flapInterval = CONSTANTS.GULL.FLAP.STANDARD.INTERVAL

      if (direction === LEFT) {
        this.velocity *= -1
      }

      this.setupBody()
      this.setupSprite()

      this.game.assignType(this, TYPES.GULL)

      this.body.id = this.id
      this.untilFlap = this.flapInterval
    }

    setupSprite() {
      const animationStartIndex = Math.floor(Math.random() * 2)
      const spriteDiffuse = getAnimatedSprite('gull:flying:{i}.png', 2)
      spriteDiffuse.gotoAndPlay(animationStartIndex);
      spriteDiffuse.animationSpeed = CONSTANTS.GULL.ANIMATION_SPEED.STANDARD
      spriteDiffuse.anchor.set(0.5)

      const spriteNormals = getAnimatedSprite('gull:flying:normal:{i}.png', 2)
      spriteNormals.gotoAndPlay(animationStartIndex);
      spriteNormals.animationSpeed = CONSTANTS.GULL.ANIMATION_SPEED.STANDARD
      spriteNormals.anchor.set(0.5)

      const spriteShadows = getAnimatedSprite('gull:flying:{i}.png', 2)
      spriteShadows.gotoAndPlay(animationStartIndex);
      spriteShadows.animationSpeed = CONSTANTS.GULL.ANIMATION_SPEED.STANDARD
      spriteShadows.anchor.set(0.5)

      this.sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows)
      this.sprite.scale.x = this.direction
      this.game.container.addChild(this.sprite)
    }

    setupBody() {
      const x = this.direction === LEFT
        ? CONSTANTS.GULL.SPAWN.X
        : CONSTANTS.GULL.SPAWN.X * -1

      this.body = this.game.world.createBody({
        position: Vec2(x, CONSTANTS.GULL.SPAWN.Y),
        type: 'dynamic',
        fixedRotation: true,
        allowSleep: true,
      })

      this.body.createFixture(planck.Box(CONSTANTS.GULL.HITBOX.WIDTH, CONSTANTS.GULL.HITBOX.HEIGHT), {
        friction: 0,
        filterCategoryBits: CATEGORIES.FOE,
        filterMaskBits: MASKS.FOE,
        filterGroupIndex: GROUPS.FOE,
      })

      this.body.render = {
        stroke: BLUE
      }
    }

    flyAway() {
      const stats = this.abducting
        ? CONSTANTS.GULL.FLAP.ABDUCTING
        : CONSTANTS.GULL.FLAP.FLYAWAY

      this.flapPower = stats.POWER
      this.flapInterval = stats.INTERVAL
    }

    abduct(male) {
      this.abducting = male
      male.onAbduction()

      this.flyAway()

      this.game.world.createJoint(planck.RevoluteJoint(
        {
          collideConnected: false
        },
        this.body,
        male.body,
        Vec2(0, 0)
      ));
    }

    destroySprites() {
      this.game.container.removeChild(this.sprite)
    }

    move() {
      this.untilFlap -= 1
      let yVelocity

      if (this.untilFlap <= 0) {
        yVelocity = this.flapPower + Math.random() * 1 - 0.5
        this.untilFlap = this.flapInterval
      } else {
        yVelocity = this.body.getLinearVelocity().y
      }

      this.body.setLinearVelocity(Vec2(
        this.velocity,
        yVelocity
      ))

      const f = this.body.getWorldVector(Vec2(0.0, CONSTANTS.GULL.IMPULSE))
      const p = this.body.getWorldPoint(Vec2(0.0, 2.0))
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
      this.damage = CONSTANTS.FISH.DAMAGE
      this.game = parent

      this.body = this.game.world.createBody({
        position: Vec2(x, y),
        type: 'dynamic',
        fixedRotation: false,
        allowSleep: false
      })

      this.body.setLinearVelocity(Vec2(
        CONSTANTS.FISH.LAUNCH_VELOCITY.X * direction,
        CONSTANTS.FISH.LAUNCH_VELOCITY.Y
      ))

      this.setupSprite()

      this.body.setAngularVelocity(Math.random() * Math.PI * 10 - (Math.PI * 5));

      this.game.assignType(this, TYPES.FISH)

      const boxOpts = {
        filterCategoryBits: CATEGORIES.HERO,
        filterMaskBits: MASKS.HERO,
        filterGroupIndex: GROUPS.HERO,
      }

      this.body.createFixture(planck.Box(CONSTANTS.FISH.HITBOX.WIDTH, CONSTANTS.FISH.HITBOX.HEIGHT), boxOpts)
      this.id = this.game.createId()
      this.game.objects[this.id] = this
      this.body.id = this.id
    }

    setupSprite() {
      const spriteDiffuse = new PIXI.Sprite(PIXI.Texture.fromImage('assets/fish.png'))
      spriteDiffuse.anchor.set(0.5)

      const spriteNormals = new PIXI.Sprite(PIXI.Texture.fromImage('assets/fish.normal.png'))
      spriteNormals.anchor.set(0.5)

      const spriteShadows = new PIXI.Sprite(PIXI.Texture.fromImage('assets/fish.png'))
      spriteShadows.anchor.set(0.5)

      this.sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows)
      this.game.container.addChild(this.sprite)
    }

    destroySprites() {
      this.game.container.removeChild(this.sprite)
    }

    render() {
      const pos = this.body.getPosition()
      this.sprite.position.set(mpx(pos.x), mpy(pos.y))
      this.sprite.rotation = this.body.getAngle()
    }
  }

  class Trail {
    constructor({
      x = 0,
      y = 0,
      texture = CONSTANTS.HERO.TRAIL.TEXTURE,
      smoothness = 100,
      length = 20,
      parent,
    }) {
      this.texture = texture
      this.parent = parent
      this.smoothness = smoothness
      this.length = length
      this.points = [];

      this.history = {
        x: new Array(this.length).fill(mpx(x)),
        y: new Array(this.length).fill(mpy(y)),
      }

      this.createRope(x, y)
    }

    destroy() {
      this.parent.container.removeChild(this.rope)
    }

    createRope(x, y) {
      this.points = [];

      for (let i = 0; i < this.smoothness; i++) {
        this.points.push(new PIXI.Point(mpx(x), mpy(y)));
      }

      this.rope = new PIXI.mesh.Rope(this.texture, this.points);
      this.rope.blendmode = PIXI.BLEND_MODES.ADD;
      this.parent.container.addChild(this.rope);
    }

    update(x, y, show) {
      this.rope.alpha = show ? 1 : 0

      this.history.x.unshift(x);
      this.history.y.unshift(y);
      this.history.x.pop();
      this.history.y.pop();

      for (let i = 0; i < this.smoothness; i++) {
        const iterator = i / this.smoothness * this.length
        const point = this.points[i]

        point.x = cubicInterpolation(this.history.x, iterator);
        point.y = cubicInterpolation(this.history.y, iterator);
      }
    }
  }

  class Hero {
    constructor(parent) {
      this.game = parent
      this.alive = true
      this.health = CONSTANTS.HERO.HEALTH.MAX
      this.invincibilityTime = 0
      this.fishThrowTime = 0
      this.damage = CONSTANTS.HERO.DAMAGE
      this.bodyOpts = {
        filterCategoryBits: CATEGORIES.HERO,
        filterMaskBits: MASKS.HERO,
        filterGroupIndex: GROUPS.HERO,
      }

      this.state = {
        airborne: true,
        action: 'NEUTRAL',
        direction: RIGHT,
      }

      this.setupSprite()

      this.body = this.game.world.createBody({
        position: Vec2(CONSTANTS.HERO.SPAWN.X, CONSTANTS.HERO.SPAWN.Y),
        type: 'dynamic',
        fixedRotation: true,
        allowSleep: false
      })

      this.game.assignType(this, TYPES.HERO)

      this.body.createFixture(planck.Box(CONSTANTS.HERO.HITBOX.WIDTH, CONSTANTS.HERO.HITBOX.HEIGHT), this.bodyOpts)

      this.body.render = {
        stroke: GREEN
      }

      this.jumps = CONSTANTS.HERO.JUMP.MAX
      this.speed = CONSTANTS.HERO.SPEED

      this.game.healthBar.update(this.health)
    }

    getNeutralSprite() {
      const states = CONSTANTS.HERO.MOVEMENT_STATES

      const animationStartIndex = Math.floor(Math.random() * 2)
      const spriteDiffuse = getAnimatedSprite('hero:neutral:{i}.png', 2)
      spriteDiffuse.gotoAndPlay(animationStartIndex);
      spriteDiffuse.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.NEUTRAL]
      spriteDiffuse.anchor.set(0.5)

      const spriteNormals = getAnimatedSprite('hero:neutral:normal:{i}.png', 2)
      spriteNormals.gotoAndPlay(animationStartIndex);
      spriteNormals.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.NEUTRAL]
      spriteNormals.anchor.set(0.5)

      const spriteShadows = getAnimatedSprite('hero:neutral:{i}.png', 2)
      spriteShadows.gotoAndPlay(animationStartIndex);
      spriteShadows.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.NEUTRAL]
      spriteShadows.anchor.set(0.5)

      const sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows)
      this.game.container.addChild(sprite)
      sprite.visible = false
      return sprite
    }

    getRunningSprite() {
      const states = CONSTANTS.HERO.MOVEMENT_STATES

      const animationStartIndex = Math.floor(Math.random() * 2)
      const spriteDiffuse = getAnimatedSprite('hero:running:{i}.png', 2)
      spriteDiffuse.gotoAndPlay(animationStartIndex);
      spriteDiffuse.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.RUNNING]
      spriteDiffuse.anchor.set(0.5)

      const spriteNormals = getAnimatedSprite('hero:running:normal:{i}.png', 2)
      spriteNormals.gotoAndPlay(animationStartIndex);
      spriteNormals.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.RUNNING]
      spriteNormals.anchor.set(0.5)

      const spriteShadows = getAnimatedSprite('hero:running:{i}.png', 2)
      spriteShadows.gotoAndPlay(animationStartIndex);
      spriteShadows.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.RUNNING]
      spriteShadows.anchor.set(0.5)

      const sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows)
      this.game.container.addChild(sprite)
      sprite.visible = false
      return sprite
    }

    getDivingSprite() {
      const states = CONSTANTS.HERO.MOVEMENT_STATES

      const animationStartIndex = Math.floor(Math.random() * 4)
      const spriteDiffuse = getAnimatedSprite('hero:diving:{i}.png', 4)
      spriteDiffuse.gotoAndPlay(animationStartIndex);
      spriteDiffuse.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.DIVING]
      spriteDiffuse.anchor.set(0.5)

      const spriteNormals = getAnimatedSprite('hero:diving:normal:{i}.png', 4)
      spriteNormals.gotoAndPlay(animationStartIndex);
      spriteNormals.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.DIVING]
      spriteNormals.anchor.set(0.5)

      const spriteShadows = getAnimatedSprite('hero:diving:{i}.png', 4)
      spriteShadows.gotoAndPlay(animationStartIndex);
      spriteShadows.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.DIVING]
      spriteShadows.anchor.set(0.5)

      const sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows)
      this.game.container.addChild(sprite)
      sprite.visible = false
      return sprite
    }

    setupSprite() {
      this.trail = new Trail({
        x: CONSTANTS.HERO.SPAWN.X,
        y: CONSTANTS.HERO.SPAWN.Y,
        texture: CONSTANTS.HERO.TRAIL.TEXTURE,
        smoothness: CONSTANTS.HERO.TRAIL.SMOOTHNESS,
        length: CONSTANTS.HERO.TRAIL.LENGTH,
        parent: this.game,
      })

      const states = CONSTANTS.HERO.MOVEMENT_STATES

      this.sprites = {
        [states.DIVING]: this.getDivingSprite(),
        [states.NEUTRAL]: this.getNeutralSprite(),
        [states.RUNNING]: this.getRunningSprite(),
      }

      this.stateMappings = {
        [states.DIVING]: this.sprites[states.DIVING],
        [states.GLIDING]: this.sprites[states.NEUTRAL],
        [states.JUMPING]: this.sprites[states.JUMPING],
        [states.NEUTRAL]: this.sprites[states.NEUTRAL],
        [states.RUNNING]: this.sprites[states.RUNNING],
      }

      this.setActiveSprite(false)
    }

    destroySprites() {
      Object.keys(this.sprites).forEach((key) => {
        this.game.container.removeChild(this.sprites[key])
      })

      this.trail.destroy()
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) {
        return
      }

      this.health -= damage
      this.invincibilityTime = CONSTANTS.HERO.INVINCIBILITY_INTERVAL

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

      this.fishThrowTime = CONSTANTS.HERO.THROW_INTERVAL
    }

    dive() {
      if (this.diveFixture) {
        return
      }

      this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.DIVING

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        -70)
      )

      const top = CONSTANTS.HERO.HITBOX.HEIGHT * -1
      const left = CONSTANTS.HERO.DIVE.HITBOX.WIDTH * -0.5
      const right = CONSTANTS.HERO.DIVE.HITBOX.WIDTH * 0.5
      const height = CONSTANTS.HERO.DIVE.HITBOX.HEIGHT

      this.diveFixture = this.body.createFixture(
        planck.Polygon([
          Vec2(left, top),
          Vec2(right, top),
          Vec2(right, top - height),
          Vec2(left, top - height),
        ]),
        this.bodyOpts
      )

      this.diveFixture.dive = true
    }

    glide() {
      this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.GLIDING
      this.jumps = 0

      const f = this.body.getWorldVector(Vec2(0.0, CONSTANTS.HERO.GLIDE.IMPULSE))
      const p = this.body.getWorldPoint(Vec2(0.0, 0.0))
      this.body.applyLinearImpulse(f, p, true)
    }

    land() {
      const vel = this.body.getLinearVelocity()
      if (vel.y > 0) {
        return
      }

      if (this.state.action === CONSTANTS.HERO.MOVEMENT_STATES.DIVING) {
        this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.NEUTRAL
      }

      this.state.airborne = false
      this.activeSprite.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED.RUNNING
      this.jumps = CONSTANTS.HERO.JUMP.MAX

      if (this.diveFixture) {
        this.game.deferDestroyFixture(this, 'diveFixture')
      }
    }

    /**
     * @param {Integer} direction - LEFT or RIGHT
     */
    move(direction) {
      this.state.direction = direction
      if (this.state.action !== CONSTANTS.HERO.MOVEMENT_STATES.DIVING) {
        this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.RUNNING
      }

      this.body.setLinearVelocity(Vec2(
        direction * this.speed,
        this.body.getLinearVelocity().y)
      )
    }

    jump() {
      if (!this.jumps) {
        return
      }

      this.activeSprite.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED.JUMPING
      this.state.airborne = true

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        CONSTANTS.HERO.JUMP.MAGNITUDE)
      )

      this.jumps -= 1
    }

    setActiveSprite(visible = true) {
      const sprite = this.stateMappings[this.state.action]

      if (sprite === this.activeSprite) {
        this.activeSprite.scale.x = this.stateMappings[this.state.action] === this.stateMappings.RUNNING
          ? this.state.direction
          : 1
        return
      }

      if (this.activeSprite) {
        this.activeSprite.visible = false
        sprite.animationSpeed = this.activeSprite.animationSpeed
      }

      this.activeSprite = sprite
      this.activeSprite.visible = visible
      this.activeSprite.scale.x = this.stateMappings[this.state.action] === this.stateMappings.RUNNING
        ? this.state.direction
        : 1
    }

    render() {
      const pos = this.body.getPosition()

      this.setActiveSprite()
      this.activeSprite.position.set(mpx(pos.x), mpy(pos.y))

      this.trail.update(mpx(pos.x), mpy(pos.y), this.state.airborne)
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
      this.container = new PIXI.Container()
      stage.addChild(this.container)

      // resetStage()

      const diffuse = new PIXI.Sprite.fromImage(CONSTANTS.BACKGROUND.DIFFUSE);
      const normals = new PIXI.Sprite.fromImage(CONSTANTS.BACKGROUND.NORMAL);
      diffuse.parentGroup = PIXI.lights.diffuseGroup;
      normals.parentGroup = PIXI.lights.normalGroup;

      const light = new PIXI.lights.PointLight(0xffffff, 200);
      light.x = 100;
      light.y = 0;

      this.container.addChild(
          normals,
          diffuse,
          light
      );

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
      stage.removeChild(this.container)

      const game = new Game()

      window.requestAnimationFrame(function() {
        game.onStep()
      });
    }
  }

  (function setupGame() {
    PIXI.loader
      .add('hero_neutral_spritesheet', '/assets/hero/spritesheets/neutral.json')
      .add('hero_neutral_normal_spritesheet', '/assets/hero/spritesheets/neutral.normal.json')
      .add('hero_running_spritesheet', '/assets/hero/spritesheets/running.json')
      .add('hero_running_normal_spritesheet', '/assets/hero/spritesheets/running.normal.json')
      .add('hero_diving_spritesheet', '/assets/hero/spritesheets/diving.json')
      .add('hero_diving_normal_spritesheet', '/assets/hero/spritesheets/diving.normal.json')
      .add('male_neutral_spritesheet', '/assets/male/spritesheets/neutral.json')
      .add('male_neutral_normal_spritesheet', '/assets/male/spritesheets/neutral.normal.json')
      .add('seal_running_spritesheet', '/assets/seal/spritesheets/running.json')
      .add('seal_running_normal_spritesheet', '/assets/seal/spritesheets/running.normal.json')
      .add('gull_flying_spritesheet', '/assets/gull/spritesheets/flying.json')
      .add('gull_flying_normal_spritesheet', '/assets/gull/spritesheets/flying.normal.json')
      .load(() => {
        new Menu()
      });
  })()
})()

