/**
 * Basic surival game created using pixi.js and planck.js
 */

(function main() {
  let idPointer = 0;

  function createId() {
    idPointer += 1;
    return idPointer;
  }

  const LEFT = -1;
  const RIGHT = 1;
  const SPRITE = 'SPRITE';
  const GROUND = 'GROUND';
  const WALL = 'WALL';
  const ENEMY = 'ENEMY';
  const BASE_DAMAGE = 1;
  const INVINCIBILITY_WINDOW = 30;
  const ENEMY_SPEED = 10.0;
  const SPRITE_HEALTH = 10;
  const ENEMY_HEALTH = 1;
  const SPRITE_DAMAGE = 1;
  const SPRITE_SPEED = 25;
  const GRAVITY = -60;
  const SPRINT_MULTIPLIER = 1.75;

  const m_points = [];

  const Vec2 = planck.Vec2;

  const world = new planck.World({
    gravity: Vec2(0, GRAVITY)
  });

  world.on('pre-solve', function (contact, oldManifold) {
    const manifold = contact.getManifold();

    if (!manifold.pointCount) {
      return;
    }

    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();

    const types = [
      fixtureA.getBody().type,
      fixtureB.getBody().type,
    ]

    if (types.includes(WALL) && types.includes(ENEMY)) {
      contact.setEnabled(false);
    }

    const worldManifold = contact.getWorldManifold();

    for (let i = 0; i < manifold.pointCount; ++i) {
      m_points.push({
        fixtureA,
        fixtureB,
        position: worldManifold.points[i],
        normal: worldManifold.normal,
        normalImpulse: manifold.points[i].normalImpulse,
        tangentImpulse: manifold.points[i].tangentImpulse,
        separation: worldManifold.separations[i],
      });
    }
  });

  function setDefaults(testbed) {
    testbed.info('←/→: Accelerate sprite, ↑: jump, ↓: attack');
    testbed.speed = 2;
    testbed.hz = 50;
  }

  class Enemy {
    constructor(direction) {
      this.damage = BASE_DAMAGE;
      this.velocity = ENEMY_SPEED;
      this.health = ENEMY_HEALTH
      this.invincibilityTime = 0;

      if (direction === LEFT) {
        this.velocity *= -1
      }

      const x = direction === LEFT
        ? 35.0
        : -35.0

      this.body = world.createBody({
        position : Vec2(x, 5.0),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      });

      this.body.createFixture(planck.Circle(0.5), {
        friction: 0
      });

      this.body.type = ENEMY;
      this.id = createId();
      this.body.id = this.id;
      enemies[this.id] = this;
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) {
        return;
      }

      this.health -= damage
      this.invincibilityTime = INVINCIBILITY_WINDOW;

      if (this.health <= 0) {
        world.destroyBody(this.body)
      }
    }

    move() {
      this.body.setLinearVelocity(Vec2(
        this.velocity,
        this.body.getLinearVelocity().y
      ));
    }
  }
  class Sprite {
    constructor() {
      this.health = SPRITE_HEALTH;
      this.invincibilityTime = 0;
      this.damage = SPRITE_DAMAGE;
      this.sprinting = false;
      this.attacking = false;

      this.body = world.createBody({
        position : Vec2(0, 5.0),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      });

      this.body.type = SPRITE
      this.body.createFixture(planck.Polygon([
        Vec2(-1, -1),
        Vec2(1, -1),
        Vec2(1, 1),
        Vec2(-1, 1),
      ]), 1.0);

      this.jumps = 2;
      this.speed = SPRITE_SPEED
    }

    /**
     * @param {Integer} damage - damage dealt
     */
    takeDamage(damage) {
      if (this.invincibilityTime) {
        return;
      }

      this.health -= damage
      this.invincibilityTime = INVINCIBILITY_WINDOW;
      if (this.health <= 0) {
        world.destroyBody(this.body)
      }
    }

    attack() {
      this.attacking = true
      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        -70)
      );
    }

    /**
     * @param {Integer} direction - LEFT or RIGHT
     */
    move(direction) {
      const sprintMultiplier = this.sprinting
        ? SPRINT_MULTIPLIER
        : 1;

      this.body.setLinearVelocity(Vec2(
        direction * this.speed * sprintMultiplier,
        this.body.getLinearVelocity().y)
      );
    }

    jump() {
      if (!this.jumps) { return; }

      this.body.setLinearVelocity(Vec2(
        this.body.getLinearVelocity().x,
        35)
      );

      this.jumps -= 1;
    }
  }

  function createBorders() {
    const walls = world.createBody();
    const ground = world.createBody();

    ground.type = GROUND;
    walls.type = WALL;

    const groundOpts = {
      density: 0.0,
      friction: 7.5
    };

    const wallOpts = {
      density: 0.0,
      friction: 0.0
    };

    walls.createFixture(planck.Edge(Vec2(-30.0, -20.0), Vec2(-30.0, 30.0)), wallOpts);
    walls.createFixture(planck.Edge(Vec2(30.0, -20.0), Vec2(30.0, 30.0)), wallOpts);
    walls.createFixture(planck.Edge(Vec2(-30.0, 30.0), Vec2(30.0, 30.0)), wallOpts);
    ground.createFixture(planck.Edge(Vec2(-60.0, -20.0), Vec2(60.0, -20.0)), groundOpts);
  }

  const enemies = {};

  function createEnemy() {
    const direction = Math.random() < 0.5
      ? LEFT
      : RIGHT;

    new Enemy(direction);
  }

  function spawn() {
    if (Math.random() < 0.05) {
      createEnemy()
    }
  }

  function moveEnemies() {
    Object.keys(enemies).forEach((id) => {
      const enemy = enemies[id];
      enemy.move();

      if (enemy.invincibilityTime) {
        enemy.invincibilityTime -= 1;
      }
    })
  }

  planck.testbed('sprite', function (testbed) {
    setDefaults(testbed);
    createBorders(testbed);

    const sprite = new Sprite();

    testbed.keydown = function () {
      if (testbed.activeKeys.up) {
        sprite.jump()
      }
    };

    function evaluateActiveKeys() {
      sprite.sprinting = Boolean(testbed.activeKeys.fire)

      if (testbed.activeKeys.down) {
        sprite.attack()
      } else if (testbed.activeKeys.right) {
        sprite.move(RIGHT)
      } else if (testbed.activeKeys.left) {
        sprite.move(LEFT)
      }
    }

    function evaluateCollisions() {
      for (let i = 0; i < m_points.length; ++i) {
        const point = m_points[i];

        const body1 = point.fixtureA.getBody();
        const body2 = point.fixtureB.getBody();

        const types = [
          body1.type,
          body2.type,
        ]

        if (types.includes(GROUND) && types.includes(SPRITE)) {
          sprite.jumps = 2;
        }

        if (types.includes(ENEMY) && types.includes(SPRITE)) {
          console.log(point)

          const enemy = enemies[[body1, body2].find(item => item.type === ENEMY).id]

          if (point.normal.y < 0 && Math.abs(point.normal.y) - Math.abs(point.normal.x) > 0.5) {
            enemy.takeDamage(sprite.damage)
          } else {
            sprite.takeDamage(enemy.damage)
          }
        }
      }

      m_points.length = 0;
    }

    testbed.step = function () {
      evaluateCollisions()
      evaluateActiveKeys()
      spawn()
      moveEnemies()

      if (sprite.invincibilityTime) {
        sprite.invincibilityTime -= 1;
      }
    };

    return world;
  });
})()

