/**
 * Basic surival game created using pixi.js and planck.js
 */

(function main() {
  const LEFT = -1;
  const RIGHT = 1;
  const SPRITE = 'SPRITE';
  const GROUND = 'GROUND';
  const WALL = 'WALL';
  const ENEMY = 'ENEMY';

  const m_points = [];

  const Vec2 = planck.Vec2;

  const world = new planck.World({
    gravity: Vec2(0, -30)
  });

  world.on('pre-solve', function (contact, oldManifold) {
    var manifold = contact.getManifold();

    if (manifold.pointCount == 0) {
      return;
    }

    var fixtureA = contact.getFixtureA();
    var fixtureB = contact.getFixtureB();


    const types = [
      fixtureA.getBody().type,
      fixtureB.getBody().type,
    ]

    if (types.includes(WALL) && types.includes(ENEMY)) {
      contact.setEnabled(false);
    }

    var worldManifold = contact.getWorldManifold();

    for (var i = 0; i < manifold.pointCount; ++i) {
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
      this.direction = direction;

      let x;
      if (direction === LEFT) {
        x = 35.0
      } else {
        x = -35.0
      }

      this.body = world.createBody({
        position : Vec2(x, 5.0),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      });

      this.body.createFixture(planck.Circle(0.5), 20.0);
      this.body.type = ENEMY;
    }

    move() {
      this.body.applyForce(
        Vec2(300.0 * this.direction, 0.0),
        this.body.getPosition(),
        false
      );
    }
  }

  class Sprite {
    constructor() {
      this.body = world.createBody({
        position : Vec2(0, 5.0),
        type : 'dynamic',
        fixedRotation : true,
        allowSleep : false
      });

      this.body.type = SPRITE
      this.body.createFixture(planck.Polygon([
        Vec2(-2, -2),
        Vec2(2, -2),
        Vec2(2, 2),
        Vec2(-2, 2),
      ]), 1.0);
      this.jumps = 2;
      this.speed = 15.0
    }

    /**
     * @param {Integer} direction - -1 for left, 1 for right
     */
    accelerate(direction) {
      this.body.applyLinearImpulse(
        this.body.getWorldVector(Vec2(direction * this.speed, 0.0)),
        this.body.getWorldPoint(Vec2(0.0, 0.0)),
        true
      );
    }

    jump() {
      if (!this.jumps) {
        return;
      }

      this.body.applyLinearImpulse(
        this.body.getWorldVector(Vec2(0.0, 400.0)),
        this.body.getWorldPoint(Vec2(0, 0.5)),
        true
      );

      this.jumps -= 1;
    }
  }

  function createBorders() {
    const walls = world.createBody();
    const ground = world.createBody();

    ground.type = GROUND;
    walls.type = WALL;

    const opts = {
      density: 0.0,
      friction: 0.5
    };

    walls.createFixture(planck.Edge(Vec2(-30.0, -20.0), Vec2(-30.0, 30.0)), opts);
    walls.createFixture(planck.Edge(Vec2(30.0, -20.0), Vec2(30.0, 30.0)), opts);
    walls.createFixture(planck.Edge(Vec2(-30.0, 30.0), Vec2(30.0, 30.0)), opts);
    ground.createFixture(planck.Edge(Vec2(-60.0, -20.0), Vec2(60.0, -20.0)), opts);
  }

  const enemies = []

  function createEnemy() {
    const direction = Math.random() < 0.5
      ? LEFT
      : RIGHT;

    enemies.push(new Enemy(direction));
  }

  function spawn() {
    if (Math.random() < 0.05) {
      createEnemy()
    }
  }

  function moveEnemies() {
    enemies.forEach((enemy) => {
      enemy.move();
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
      if (testbed.activeKeys.right && testbed.activeKeys.left) {
        // eh?
      } else if (testbed.activeKeys.right) {
        sprite.accelerate(RIGHT)
      } else if (testbed.activeKeys.left) {
        sprite.accelerate(LEFT)
      }
    }

    function evaluateCollisions() {
      for (var i = 0; i < m_points.length; ++i) {
        var point = m_points[i];

        var body1 = point.fixtureA.getBody();
        var body2 = point.fixtureB.getBody();

        const types = [
          body1.type,
          body2.type,
        ]

        if (types.includes(GROUND) && types.includes(SPRITE)) {
          sprite.jumps = 2;
        }

        if (types.includes(ENEMY) && types.includes(SPRITE)) {
          console.log("DAMAGE!")
        }
      }

      m_points.length = 0;
    }

    testbed.step = function () {
      evaluateCollisions()
      evaluateActiveKeys()
      spawn()
      moveEnemies()
    };

    return world;
  });
})()

