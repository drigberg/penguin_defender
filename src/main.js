"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./createjs.js");
var PIXI = require('./pixi.min.js');
var planck = require('./planckv0.1.45');
require("./pixi-layers.js");
require("./pixi-lights.js");
require("./pixi-shadows.js");
/**
 * Basic surival game created using pixi.js and planck.js
 */
(function main() {
    var _a;
    var Sound = createjs.Sound;
    /**
     * Constants
     */
    var CATEGORIES = Object.freeze({
        FOE: 0x0001,
        GROUND: 0x0002,
        HERO: 0x0004,
        FRIEND: 0x0008,
        WALLS: 0x0016,
        OFFSCREEN: 0x0032,
    });
    var GROUPS = Object.freeze({
        FOE: -2,
        HERO: -3,
    });
    var MASKS = Object.freeze({
        FOE: CATEGORIES.HERO | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND | CATEGORIES.FRIEND,
        FRIEND: CATEGORIES.FRIEND | CATEGORIES.FOE | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND,
        HERO: CATEGORIES.FOE | CATEGORIES.WALLS | CATEGORIES.OFFSCREEN | CATEGORIES.GROUND,
        GROUND: CATEGORIES.FOE | CATEGORIES.HERO | CATEGORIES.FRIEND,
        WALLS: CATEGORIES.HERO,
        OFFSCREEN: CATEGORIES.FOE | CATEGORIES.FRIEND,
    });
    var TYPES = Object.freeze({
        GROUND: 'GROUND',
        WALL: 'WALL',
        OFFSCREEN: 'OFFSCREEN',
        HERO: 'HERO',
        MALE: 'MALE',
        FISH: 'FISH',
        SEAL: 'SEAL',
        GULL: 'GULL',
    });
    var SLIDESHOW = {
        STATES: {
            FADING_IN: 'FADING_IN',
            SUSTAINING: 'SUSTAINING',
            FADING_OUT: 'FADING_OUT',
            WAITING: 'WAITING',
        },
        TIMELINE: [
            'FADING_IN',
            'SUSTAINING',
            'FADING_OUT',
            'WAITING',
        ]
    };
    var CONSTANTS = {
        INTRO: {
            TIME_INTERVALS: (_a = {},
                _a[SLIDESHOW.STATES.FADING_IN] = 80,
                _a[SLIDESHOW.STATES.SUSTAINING] = 240,
                _a[SLIDESHOW.STATES.FADING_OUT] = 80,
                _a[SLIDESHOW.STATES.WAITING] = 40,
                _a),
            SLIDES: [
                'Every winter, male Emperor Penguins huddle\n together at the South Pole for warmth,\n while the females fish out to sea.',
                'Times have changed. Emboldened by rising\n temperatures, fierce predators have moved\n further south.',
                'Your colony holds to tradition and refuses\n to find a new nesting ground. You alone\n stand between them and utter annihilation.',
                'Defend your penguin brothers\n until the females return.'
            ],
        },
        SCREEN: {
            WIDTH: 1152,
            HEIGHT: 630,
        },
        DISPLAYS: {
            POINTS: {
                X: 10,
                Y: 25,
            },
            WINTER: {
                X: 10,
                Y: 21.8,
            },
        },
        COLORS: {
            WHITE: '#eeeeee',
            RED: '#ee1111',
            BLUE: '#5555ee',
            YELLOW: '#aaaa22',
            GREEN: '#22aa22',
            BIT_RED: 0xEE5555,
            BIT_BLUE: 0x5555EE,
            BIT_YELLOW: 0xAAAA22,
            BIT_GREEN: 0x22AA22,
        },
        KEY_CODES: {
            32: 'SPACE',
            13: 'RETURN',
        },
        LEFT: -1,
        RIGHT: 1,
        POINT_BONUSES: {
            PER_MALE_REMAINING: 100,
            PERFECT_MALE_DEFENSE: 500,
        },
        ENEMY_TYPES: [
            TYPES.SEAL,
            TYPES.GULL,
        ],
        MALE: {
            SPAWN: {
                X: 0,
                Y: 0,
                SPREAD: 10.0,
            },
            JUMP: {
                MAGNITUDE: 20,
                MAX: 1,
            },
            HITBOX: {
                WIDTH: 0.5,
                HEIGHT: 1,
            },
            ANIMATION_SPEED: {
                STANDARD: 0.03,
                STRESSED: 0.1,
            },
            NUM: 10,
            SPEED: 2.0,
        },
        HERO: {
            TRAIL: {
                TEXTURE: PIXI.Texture.fromImage('assets/hero/trail.png'),
                SMOOTHNESS: 100,
                LENGTH: 10,
                THRESHOLD: 20,
                MIN_VELOCITY: 5,
            },
            ANIMATION_SPEED: {
                DIVING: 0.18,
                NEUTRAL: 0.03,
                RUNNING: 0.06,
                JUMPING: 0.24,
            },
            MOVEMENT_STATES: {
                RUNNING: 'RUNNING',
                NEUTRAL: 'NEUTRAL',
                DIVING: 'DIVING',
                JUMPING: 'JUMPING',
            },
            JUMP: {
                MAGNITUDE: 35,
                MAX: 3,
            },
            HEALTH: {
                MAX: 5,
            },
            HITBOX: {
                WIDTH: 1.5,
                HEIGHT: 2.0,
            },
            DIVE: {
                HITBOX: {
                    WIDTH: 8.0,
                    HEIGHT: 0.5,
                },
                SOUND_OVERFLOW: 200,
            },
            SPAWN: {
                X: 0.0,
                Y: 5.0,
            },
            INVINCIBILITY_INTERVAL: 30,
            DAMAGE: 1,
            SPEED: 15,
            THROW_INTERVAL: 25,
        },
        HEALTH_BAR: {
            X: -40,
            Y: 22,
            MAX_WIDTH: 10,
        },
        FISH: {
            HITBOX: {
                WIDTH: 1,
                HEIGHT: 0.6,
            },
            LAUNCH_VELOCITY: {
                X: 20,
                Y: 50,
            },
            DAMAGE: 1,
        },
        SEAL: {
            SPAWN: {
                X: 50,
                Y: 5,
                PROBABILITY: 0.01,
            },
            JUMP: {
                MAGNITUDE: 20,
                MAX: 1,
            },
            HITBOX: {
                WIDTH: 2,
                HEIGHT: 1,
            },
            ANIMATION_SPEED: {
                STANDARD: 0.15,
            },
            POINTS: 10,
            SPEED: 3.5,
            HEALTH: 1,
            DAMAGE: 1,
        },
        GULL: {
            SPAWN: {
                X: 50,
                Y: 20,
                PROBABILITY: 0.01,
            },
            FLAP: {
                STANDARD: {
                    POWER: 2.1,
                    INTERVAL: 15,
                },
                ABDUCTING: {
                    POWER: 30,
                    INTERVAL: 15,
                },
                FLYAWAY: {
                    POWER: 6,
                    INTERVAL: 15,
                },
            },
            HITBOX: {
                WIDTH: 1.5,
                HEIGHT: 0.6,
            },
            ANIMATION_SPEED: {
                STANDARD: 0.1,
            },
            SPEED: 3.0,
            HEALTH: 1,
            DAMAGE: 1.5,
            IMPULSE: 1.5,
            POINTS: 15,
        },
        SHAKE: {
            DURATION: 10,
            MAGNITUDE: 1.5,
        },
        BORDER: {
            LEFT: -40,
            RIGHT: 40,
            TOP: 30,
        },
        OFFSCREEN: {
            LEFT: -55,
            RIGHT: 55,
            BOTTOM: -20,
        },
        BACKGROUND: {
            DIFFUSE: 'assets/mountains.png',
            NORMAL: 'assets/mountains.normal.clouds.light.png',
        },
        WINTER: {
            COUNTDOWN: 50,
            INTERIM: 1500,
        },
        TIME_STEP: 1 / 30,
        GRAVITY: -60,
    };
    var BASE_TEXT_STYLE = new PIXI.TextStyle({
        fontFamily: 'Courier New',
        fontSize: 72,
        strokeThickness: 0,
        fontWeight: 'bold',
        fill: CONSTANTS.COLORS.BLUE,
    });
    /**
     * PIXI setup
     */
    var app = new PIXI.Application({
        backgroundColor: 0x000000,
        width: CONSTANTS.SCREEN.WIDTH,
        height: CONSTANTS.SCREEN.HEIGHT,
    });
    var stage = PIXI.shadows.init(app);
    PIXI.shadows.filter.ambientLight = 0.3;
    document.getElementById('content').appendChild(app.view);
    app.view.style.position = 'absolute';
    app.view.style.border = '1px solid #222222';
    /**
     * Helper functions
     */
    function assembleBasicSprite(diffuseSprite, normalSprite, shadowSprite) {
        var container = new PIXI.Container();
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
    function createShadowCastingLight(radius, intensity, color, point) {
        var container = new PIXI.Container();
        container.position.set(point.x, point.y);
        var pixiLight = new PIXI.lights.PointLight(color, intensity);
        container.addChild(pixiLight);
        var shadow = new PIXI.shadows.Shadow(radius, 0.2);
        shadow.pointCount = 5;
        shadow.range = 1000;
        shadow.scatterRange = 4;
        shadow.radialResolution = 600;
        shadow.depthResolution = 1;
        container.addChild(shadow);
        return container;
    }
    var Vec2 = planck.Vec2;
    function enforcePositive(num) {
        return num > 0
            ? num
            : 0;
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
        if (tangentFactor == null)
            tangentFactor = 1;
        var k = Math.floor(t);
        var m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
        var p = [clipInput(k, array), clipInput(k + 1, array)];
        t -= k;
        var t2 = t * t;
        var t3 = t * t2;
        return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
    }
    var pscale = 13;
    /**
     * Build sprite from spritesheet data
     */
    function getAnimatedSprite(nameTemplate, max) {
        var textures = [];
        for (var i = 1; i <= max; i++) {
            textures.push(PIXI.Texture.fromFrame(nameTemplate.replace('{i}', String(i))));
        }
        return new PIXI.extras.AnimatedSprite(textures);
    }
    /**
     * Scaling for render
     */
    function mpx(m) {
        return m * pscale + (CONSTANTS.SCREEN.WIDTH * 0.482);
    }
    function mpy(m) {
        return CONSTANTS.SCREEN.HEIGHT * (5 / 9) - (m * pscale);
    }
    var SoundManager = /** @class */ (function () {
        function SoundManager() {
            this.sounds = {};
        }
        SoundManager.prototype.play = function (key, _a) {
            var _b = (_a === void 0 ? {} : _a).loop, loop = _b === void 0 ? false : _b;
            if (this.sounds[key]) {
                this.sounds[key].stop();
            }
            else {
                this.sounds[key] = Sound.createInstance(key);
            }
            if (loop) {
                var that_1 = this;
                this.sounds[key].on("complete", function loop() {
                    that_1.sounds[key].play();
                });
            }
            this.sounds[key].play();
        };
        SoundManager.prototype.stop = function (key) {
            if (this.sounds[key]) {
                this.sounds[key].stop();
            }
        };
        SoundManager.prototype.pause = function (key) {
            if (this.sounds[key]) {
                this.sounds[key].paused = true;
            }
        };
        SoundManager.prototype.continue = function (key) {
            if (this.sounds[key]) {
                this.sounds[key].paused = false;
            }
        };
        return SoundManager;
    }());
    /**
   * Slideshow
   */
    var Slideshow = /** @class */ (function () {
        function Slideshow(_a) {
            var slides = _a.slides, intervals = _a.intervals, onComplete = _a.onComplete, game = _a.game;
            var that = this;
            this.complete = false;
            this.container = new PIXI.Container();
            this.game = game;
            this.onCompleteCallback = onComplete;
            this.slides = slides;
            this.intervals = intervals;
            this.currentSlideIndex = -1;
            this.state = SLIDESHOW.STATES.WAITING;
            this.timer = 1;
            stage.addChild(this.container);
            this.text = new Text({
                x: -40,
                y: 10,
                style: {
                    fill: CONSTANTS.COLORS.WHITE,
                    fontSize: 36,
                },
                container: this.container,
                centered: false,
            });
            new Text({
                x: 16,
                y: -12,
                style: {
                    fill: CONSTANTS.COLORS.BLUE,
                    fontSize: 24,
                },
                container: this.container,
                centered: false,
                show: 'press ENTER to skip'
            });
            window.requestAnimationFrame(function () {
                that.onStep();
            });
        }
        Slideshow.prototype.fadeIn = function () {
            this.text.text.alpha += 1 / this.intervals[SLIDESHOW.STATES.FADING_IN];
        };
        Slideshow.prototype.fadeOut = function () {
            this.text.text.alpha -= 1 / this.intervals[SLIDESHOW.STATES.FADING_IN];
        };
        Slideshow.prototype.nextState = function () {
            var nextIndex = SLIDESHOW.TIMELINE.indexOf(this.state) + 1;
            if (nextIndex === SLIDESHOW.TIMELINE.length) {
                nextIndex = 0;
            }
            this.state = SLIDESHOW.TIMELINE[nextIndex];
            this.timer = this.intervals[this.state];
            if (this.state === SLIDESHOW.STATES.FADING_IN) {
                this.currentSlideIndex += 1;
                if (this.currentSlideIndex === this.slides.length) {
                    this.onComplete();
                    return;
                }
                this.text.show(this.slides[this.currentSlideIndex], null);
                this.text.text.alpha = 0;
            }
        };
        Slideshow.prototype.onStep = function () {
            if (this.game.keys.down.RETURN) {
                this.onComplete();
                return;
            }
            var that = this;
            this.timer -= 1;
            if (!this.timer) {
                this.nextState();
            }
            switch (this.state) {
                case SLIDESHOW.STATES.FADING_IN:
                    this.fadeIn();
                    break;
                case SLIDESHOW.STATES.FADING_OUT:
                    this.fadeOut();
                    break;
                case SLIDESHOW.STATES.SUSTAINING:
                case SLIDESHOW.STATES.WAITING:
                    break;
            }
            if (that.complete) {
                return;
            }
            window.requestAnimationFrame(function () {
                that.onStep();
            });
        };
        Slideshow.prototype.onComplete = function () {
            this.complete = true;
            stage.removeChild(this.container);
            this.onCompleteCallback();
        };
        return Slideshow;
    }());
    /**
     * Game
     */
    var Game = /** @class */ (function () {
        function Game() {
            this.soundManager = new SoundManager();
            this.soundManager.play('theme', {
                loop: true,
            });
            this.setupInteractivity();
            this.setupCollisionHandlers();
            this.playIntro();
            this.setupWorld();
        }
        Game.prototype.playIntro = function () {
            var that = this;
            new Slideshow({
                game: this,
                slides: CONSTANTS.INTRO.SLIDES,
                intervals: CONSTANTS.INTRO.TIME_INTERVALS,
                onComplete: function () { return that.onIntroComplete(); }
            });
        };
        Game.prototype.onIntroComplete = function () {
            this.reset();
            this.showMainMenu();
        };
        Game.prototype.destroyMainMenu = function () {
            if (this.menu) {
                stage.removeChild(this.menu);
            }
        };
        Game.prototype.start = function () {
            this.destroyMainMenu();
            var that = this;
            window.requestAnimationFrame(function () {
                that.onStep();
            });
            this.startWinter();
        };
        Game.prototype.showMainMenu = function () {
            var that = this;
            this.menu = new PIXI.Container();
            stage.addChild(this.menu);
            new Text({
                x: 0,
                y: 10,
                style: {
                    fill: CONSTANTS.COLORS.GREEN,
                },
                container: this.menu,
                show: 'PENGUIN DEFENDER'
            });
            new Button({
                x: 0,
                y: 5,
                container: this.menu,
                show: {
                    fn: function () {
                        that.start();
                    },
                    text: 'PLAY',
                }
            });
        };
        Game.prototype.resetStats = function () {
            this.winter = 0;
            this.paused = true;
            this.idPointer = 1;
            this.objects = {};
            this.points = 0;
            this.over = false;
            this.inGame = false;
            this.gameDisplaysCreated = false;
        };
        Game.prototype.reset = function () {
            this.resetStats();
            this.setupContainer();
            this.createBorders();
        };
        Game.prototype.createBackground = function () {
            var diffuse = new PIXI.Sprite.fromImage(CONSTANTS.BACKGROUND.DIFFUSE, true);
            var normal = new PIXI.Sprite.fromImage(CONSTANTS.BACKGROUND.NORMAL, true);
            diffuse.width = app.screen.width;
            diffuse.height = app.screen.height;
            normal.width = app.screen.width;
            normal.height = app.screen.height;
            return assembleBasicSprite(diffuse, normal, null);
        };
        Game.prototype.createLights = function () {
            return [
                new PIXI.lights.AmbientLight(null, 10),
                new PIXI.lights.DirectionalLight(null, 10, new PIXI.Point(300, 300)),
                createShadowCastingLight(1000, 20, 0x1111cc, new PIXI.Point(0, 0)),
            ];
        };
        Game.prototype.setupContainer = function () {
            var _a;
            if (this.container) {
                stage.removeChild(this.container);
            }
            this.container = new PIXI.Container();
            (_a = this.container).addChild.apply(_a, [this.createBackground()].concat(this.createLights()));
            stage.addChild(this.container);
        };
        Game.prototype.startWinterCountdown = function () {
            this.winterCountdownTime = CONSTANTS.WINTER.COUNTDOWN;
            this.winterCountdownInterval = this.winterCountdownTime / 4;
        };
        Game.prototype.winterComplete = function () {
            var _this = this;
            return CONSTANTS.ENEMY_TYPES.reduce(function (acc, type) {
                return acc && _this.typeComplete(type);
            }, true);
        };
        Game.prototype.onWinterComplete = function () {
            var that = this;
            this.textDisplays[0].show("WINTER " + this.winter + " COMPLETE!", null);
            this.textDisplays[1].show('NOICE', null);
            this.paused = true;
            this.over = true;
            setTimeout(function () { return that.startWinter(); }, CONSTANTS.WINTER.INTERIM);
        };
        Game.prototype.typeComplete = function (type) {
            return this.winterStats[type].destroyed === this.winterStats[type].total;
        };
        Game.prototype.toCreateEnemy = function (type) {
            if (Math.random() > CONSTANTS[type].SPAWN.PROBABILITY) {
                return false;
            }
            return this.winterStats[type].created < this.winterStats[type].total;
        };
        Game.prototype.onEnemyDestroyed = function (type) {
            this.winterStats[type].destroyed += 1;
            if (!this.typeComplete(type)) {
                return;
            }
            this.enemyTypeDestroyed = true;
        };
        Game.prototype.destroyEntity = function (entity) {
            if (!entity) { // TODO: turn patch into fix
                return;
            }
            if (!entity.alive) {
                return;
            }
            if ((entity instanceof Gull || entity instanceof Seal) && entity.abducting) {
                entity.abducting.onLiberation();
            }
            entity.alive = false;
            this.world.destroyBody(entity.body);
            if (entity instanceof Gull || entity instanceof Seal || entity instanceof Fish || entity instanceof Hero || entity instanceof Male) {
                entity.destroySprites();
            }
            switch (entity.type) {
                case TYPES.MALE:
                    this.onMaleDestroyed();
                    break;
                case TYPES.HERO:
                    this.onHeroDestroyed();
                    break;
                case TYPES.FISH:
                    break;
                default:
                    if (CONSTANTS.ENEMY_TYPES.includes(entity.type)) {
                        this.onEnemyDestroyed(entity.type);
                    }
            }
        };
        Game.prototype.deferDestroyFixture = function (entity, key) {
            this.deferDestroy.fixtures.push({ entity: entity, key: key });
        };
        Game.prototype.destroyDeferred = function () {
            this.deferDestroy.fixtures.forEach(function (_a) {
                var entity = _a.entity, key = _a.key;
                if (entity[key]) {
                    entity.body.destroyFixture(entity[key]);
                    entity[key] = null;
                }
            });
        };
        Game.prototype.resetDeferredForDestroy = function () {
            this.deferDestroy = {
                fixtures: []
            };
        };
        Game.prototype.assignType = function (entity, type) {
            entity.type = type;
            if (entity.body) {
                entity.body.type = type;
            }
        };
        Game.prototype.onHeroDestroyed = function () {
            this.over = true;
            this.gameOverReason = 'YOU DIED';
        };
        Game.prototype.formatWinter = function (num) {
            return String(num).padStart(3, '0');
        };
        Game.prototype.startWinter = function () {
            this.destroyMainMenu();
            this.resetDisplay();
            this.resetBodies();
            this.over = false;
            this.paused = false;
            this.inGame = true;
            this.winter += 1;
            this.winterStats = this.getWinterStats();
            this.winterDisplay.show(this.formatWinter(this.winter), null);
            this.setupMales();
            this.createHero();
            this.startWinterCountdown();
        };
        Game.prototype.onMaleDestroyed = function () {
            this.winterStats[TYPES.MALE].destroyed += 1;
            if (this.typeComplete(TYPES.MALE)) {
                this.over = true;
                this.gameOverReason = 'COLONY ANNIHILATED';
            }
        };
        Game.prototype.winterCountdown = function () {
            if (this.winterCountdownTime > 0) {
                this.textDisplays[0].show('GET READY!', null);
                this.textDisplays[1].show(String(Math.floor(this.winterCountdownTime / this.winterCountdownInterval)) || 'GO!', null);
                this.winterCountdownTime -= 1;
                return this.winterCountdownTime;
            }
            return false;
        };
        Game.prototype.onStepPauseIndependent = function () {
            // nothing yet
        };
        Game.prototype.onStepPauseDependent = function () {
            var _this = this;
            var countingDown = this.winterCountdown();
            if (countingDown) {
                return;
            }
            if (countingDown === 0) {
                this.hero.sprite.visible = true;
                Object.keys(this.objects).forEach(function (key) {
                    _this.objects[key].sprite.visible = true;
                });
            }
            this.resetDeferredForDestroy();
            this.enemyTypeDestroyed = false;
            this.world.step(CONSTANTS.TIME_STEP);
            this.textDisplays.forEach(function (display) { return display.hide(); });
            this.evaluateCollisions();
            this.evaluateActiveKeys();
            this.spawnEnemies();
            this.moveObjects();
            this.destroyDeferred();
            this.hero.onStep();
            if (this.over) {
                this.gameOver();
                return;
            }
            if (this.enemyTypeDestroyed && this.winterComplete()) {
                this.onWinterComplete();
            }
            this.renderObjects();
        };
        Game.prototype.onStep = function () {
            var that = this;
            this.onStepPauseIndependent();
            if (!this.paused) {
                this.onStepPauseDependent();
            }
            if (!that.inGame) {
                return;
            }
            window.requestAnimationFrame(function () {
                that.onStep();
            });
        };
        Game.prototype.togglePause = function () {
            if (this.winterCountdownTime) {
                return;
            }
            this.paused = !this.paused;
            if (this.paused) {
                this.soundManager.play('pause');
                this.soundManager.pause('theme');
                this.textDisplays[0].show('PAUSED', {
                    fill: CONSTANTS.COLORS.BLUE,
                });
                return;
            }
            this.soundManager.continue('theme');
            this.textDisplays[0].hide();
        };
        Game.prototype.onKeyDown = function (key) {
            if (this.keys.down[key]) {
                return;
            }
            this.keys.down[key] = true;
            switch (key) {
                case 'P':
                    this.togglePause();
                    break;
                case 'W':
                    if (this.paused || !this.inGame) {
                        return;
                    }
                    this.hero.jump();
                    break;
                case 'SPACE':
                    if (this.paused || !this.inGame) {
                        return;
                    }
                    this.hero.throwFish();
                    break;
                case 'S':
                    if (this.paused || !this.inGame) {
                        return;
                    }
                    this.hero.dive();
                    break;
                default:
                // nothing
            }
        };
        Game.prototype.onKeyUp = function (key) {
            this.keys.down[key] = false;
            if (this.paused || !this.inGame) {
                return;
            }
            if (!this.keys.down.D && !this.keys.down.A && this.hero.state.action !== CONSTANTS.HERO.MOVEMENT_STATES.DIVING) {
                this.hero.state.action = CONSTANTS.HERO.MOVEMENT_STATES.NEUTRAL;
            }
        };
        Game.prototype.translateKeyCode = function (code) {
            var char = String.fromCharCode(code);
            if (/\w/.test(char)) {
                return char;
            }
            return CONSTANTS.KEY_CODES[code];
        };
        Game.prototype.setupInteractivity = function () {
            var that = this;
            this.keys = {
                down: {},
            };
            window.addEventListener('keydown', function (e) {
                that.onKeyDown(that.translateKeyCode(e.keyCode));
            });
            window.addEventListener('keyup', function (e) {
                that.onKeyUp(that.translateKeyCode(e.keyCode));
            });
        };
        Game.prototype.createHero = function () {
            // must be called AFTER background is set up
            this.hero = new Hero(this);
        };
        Game.prototype.resetCollisions = function () {
            this.collisions = [];
        };
        Game.prototype.hashTypes = function (type1, type2) {
            return [type1, type2]
                .sort(function (a, b) { return a > b ? 1 : 0; })
                .join('-');
        };
        Game.prototype.setupCollisionHandlers = function () {
            var _a;
            var that = this;
            this.resetCollisions();
            this.collisionHandlers = (_a = {},
                _a[that.hashTypes(TYPES.GROUND, TYPES.HERO)] = function () {
                    that.hero.land();
                },
                _a[that.hashTypes(TYPES.FISH, TYPES.GROUND)] = function (bodies) {
                    that.destroyEntity(that.objects[bodies.find(function (item) { return item.type === TYPES.FISH; }).id]);
                },
                _a[that.hashTypes(TYPES.GULL, TYPES.GROUND)] = function (bodies) {
                    var gull = that.objects[bodies.find(function (item) { return item.type === TYPES.GULL; }).id];
                    if (gull instanceof Gull) {
                        gull.flyAway();
                    }
                },
                _a[that.hashTypes(TYPES.GROUND, TYPES.SEAL)] = function (bodies) {
                    var seal = that.objects[bodies.find(function (item) { return item.type === TYPES.SEAL; }).id];
                    if (seal instanceof Seal) {
                        seal.jumps = CONSTANTS.SEAL.JUMP.MAX;
                    }
                },
                _a[that.hashTypes(TYPES.GROUND, TYPES.MALE)] = function (bodies) {
                    var male = that.objects[bodies.find(function (item) { return item.type === TYPES.MALE; }).id];
                    if (male instanceof Male) {
                        male.jumps = CONSTANTS.MALE.JUMP.MAX;
                    }
                },
                _a[that.hashTypes(TYPES.HERO, TYPES.SEAL)] = function (bodies, point, fixtures) {
                    var dive = Boolean(fixtures.find(function (item) { return item.dive === true; }));
                    var enemy = that.objects[bodies.find(function (item) { return item.type === TYPES.SEAL; }).id];
                    if (enemy instanceof Seal || enemy instanceof Gull) {
                        that.handleEnemyHeroCollision(enemy, point, dive);
                    }
                },
                _a[that.hashTypes(TYPES.GULL, TYPES.HERO)] = function (bodies, point, fixtures) {
                    var dive = Boolean(fixtures.find(function (item) { return item.dive === true; }));
                    var enemy = that.objects[bodies.find(function (item) { return item.type === TYPES.GULL; }).id];
                    if (enemy instanceof Seal || enemy instanceof Gull) {
                        that.handleEnemyHeroCollision(enemy, point, dive);
                    }
                },
                _a[that.hashTypes(TYPES.FISH, TYPES.SEAL)] = function (bodies) {
                    var seal = that.objects[bodies.find(function (item) { return item.type === TYPES.SEAL; }).id];
                    var fish = that.objects[bodies.find(function (item) { return item.type === TYPES.FISH; }).id];
                    if (seal instanceof Seal && fish instanceof Fish) {
                        that.handleEnemyFishCollision(seal, fish);
                    }
                },
                _a[that.hashTypes(TYPES.FISH, TYPES.GULL)] = function (bodies) {
                    var gull = that.objects[bodies.find(function (item) { return item.type === TYPES.GULL; }).id];
                    var fish = that.objects[bodies.find(function (item) { return item.type === TYPES.FISH; }).id];
                    if (gull instanceof Gull && fish instanceof Fish) {
                        that.handleEnemyFishCollision(gull, fish);
                    }
                },
                _a[that.hashTypes(TYPES.MALE, TYPES.MALE)] = function (bodies) {
                    if (!(that.objects[bodies[0].id] instanceof Male)) {
                        return;
                    }
                    if (Math.random() < 0.1) {
                        that.objects[bodies[0].id].jump();
                    }
                    else if (Math.random() < 0.1) {
                        that.objects[bodies[0].id].jump();
                    }
                },
                _a[that.hashTypes(TYPES.MALE, TYPES.OFFSCREEN)] = function (bodies) {
                    var male = that.objects[bodies.find(function (item) { return item.type === TYPES.MALE; }).id];
                    if (male instanceof Male) {
                        that.destroyEntity(male.abductor);
                        that.destroyEntity(male);
                    }
                },
                _a[that.hashTypes(TYPES.SEAL, TYPES.OFFSCREEN)] = function (bodies) {
                    var seal = that.objects[bodies.find(function (item) { return item.type === TYPES.SEAL; }).id];
                    if (seal instanceof Seal) {
                        that.destroyEntity(seal);
                        that.destroyEntity(seal.abducting);
                    }
                },
                _a[that.hashTypes(TYPES.GULL, TYPES.OFFSCREEN)] = function (bodies) {
                    var gull = that.objects[bodies.find(function (item) { return item.type === TYPES.GULL; }).id];
                    if (gull instanceof Gull) {
                        that.destroyEntity(gull);
                        that.destroyEntity(gull.abducting);
                    }
                },
                _a[that.hashTypes(TYPES.MALE, TYPES.GULL)] = function (bodies) {
                    var male = that.objects[bodies.find(function (item) { return item.type === TYPES.MALE; }).id];
                    var gull = that.objects[bodies.find(function (item) { return item.type === TYPES.GULL; }).id];
                    if (gull instanceof Gull && male instanceof Male) {
                        if (gull.abducting) {
                            if (!male.abductor) {
                                male.jump();
                            }
                        }
                        else {
                            gull.abduct(male);
                        }
                    }
                },
                _a[that.hashTypes(TYPES.MALE, TYPES.SEAL)] = function (bodies) {
                    var male = that.objects[bodies.find(function (item) { return item.type === TYPES.MALE; }).id];
                    var seal = that.objects[bodies.find(function (item) { return item.type === TYPES.SEAL; }).id];
                    if (seal instanceof Seal && male instanceof Male) {
                        if (seal.abducting) {
                            if (!male.abductor) {
                                male.jump();
                            }
                        }
                        else {
                            seal.abduct(male);
                        }
                    }
                },
                _a);
        };
        Game.prototype.createId = function () {
            this.idPointer += 1;
            return String(this.idPointer);
        };
        Game.prototype.setupMales = function () {
            for (var i = 0; i < this.winterStats[TYPES.MALE].total; i++) {
                new Male(this);
            }
        };
        Game.prototype.formatPoints = function (num) {
            return String(num).padStart(8, '0');
        };
        Game.prototype.addPoints = function (num) {
            this.points += num;
            this.pointDisplay.show(this.formatPoints(this.points), null);
        };
        Game.prototype.resetDisplay = function () {
            if (this.gameDisplaysCreated) {
                return;
            }
            this.textDisplays = [
                new Text({
                    x: 0,
                    y: 10,
                    style: {
                        fill: CONSTANTS.COLORS.GREEN,
                    },
                    container: this.container,
                }),
                new Text({
                    x: 0,
                    y: 4,
                    style: {
                        fill: CONSTANTS.COLORS.GREEN,
                    },
                    container: this.container,
                })
            ];
            // must be AFTER background
            this.pointDisplay = new Text({
                style: {
                    fontSize: 48,
                },
                prefix: 'SCORE:',
                x: CONSTANTS.DISPLAYS.POINTS.X,
                y: CONSTANTS.DISPLAYS.POINTS.Y,
                container: this.container,
                show: this.formatPoints(this.points),
                centered: false
            });
            this.winterDisplay = new Text({
                style: {
                    fontSize: 48,
                },
                prefix: 'WINTER:    ',
                x: CONSTANTS.DISPLAYS.WINTER.X,
                y: CONSTANTS.DISPLAYS.WINTER.Y,
                container: this.container,
                centered: false
            });
            this.healthBar = new HealthBar(this);
            this.gameDisplaysCreated = true;
        };
        Game.prototype.setupWorld = function () {
            var that = this;
            this.world = new planck.World({
                gravity: Vec2(0, CONSTANTS.GRAVITY)
            });
            this.world.on('pre-solve', function (contact) {
                var manifold = contact.getManifold();
                if (!manifold.pointCount) {
                    return;
                }
                var fixtureA = contact.getFixtureA();
                var fixtureB = contact.getFixtureB();
                var worldManifold = contact.getWorldManifold();
                for (var i = 0; i < manifold.pointCount; ++i) {
                    that.collisions.push({
                        fixtureA: fixtureA,
                        fixtureB: fixtureB,
                        position: worldManifold.points[i],
                        normal: worldManifold.normal,
                        normalImpulse: manifold.points[i].normalImpulse,
                        tangentImpulse: manifold.points[i].tangentImpulse,
                        separation: worldManifold.separations[i],
                    });
                }
            });
        };
        Game.prototype.handleEnemyHeroCollision = function (enemy, point, dive) {
            if (dive || Math.abs(point.normal.y) === 1) {
                enemy.takeDamage(this.hero.damage);
                this.hero.jumps = CONSTANTS.HERO.JUMP.MAX;
            }
            else {
                this.hero.takeDamage(enemy.damage);
            }
        };
        Game.prototype.handleEnemyFishCollision = function (enemy, fish) {
            enemy.takeDamage(fish.damage);
            this.destroyEntity(fish);
        };
        Game.prototype.evaluateCollisions = function () {
            for (var i = 0; i < this.collisions.length; i++) {
                var point = this.collisions[i];
                var fixtures = [
                    point.fixtureA,
                    point.fixtureB,
                ];
                var bodies = fixtures.map(function (fixture) { return fixture.getBody(); });
                if (!bodies[0] || !bodies[1]) {
                    continue;
                }
                var types = bodies.map(function (item) { return item.type; });
                var key = this.hashTypes(types[0], types[1]);
                var handler = this.collisionHandlers[key];
                if (handler) {
                    handler(bodies, point, fixtures);
                }
            }
            this.resetCollisions();
        };
        Game.prototype.createEnemy = function (type) {
            this.winterStats[type].created += 1;
            var direction = Math.random() < 0.5
                ? CONSTANTS.LEFT
                : CONSTANTS.RIGHT;
            switch (type) {
                case TYPES.SEAL:
                    new Seal(this, direction);
                    break;
                case TYPES.GULL:
                    new Gull(this, direction);
                    break;
                default:
                //nothing
            }
        };
        Game.prototype.gameOver = function () {
            var that = this;
            this.paused = true;
            this.inGame = false;
            this.textDisplays[0].show("GAME OVER: " + this.gameOverReason, {
                fill: CONSTANTS.COLORS.RED,
            });
            this.healthBar.hide();
            this.resetBodies();
            this.resetButton = new Button({
                x: 0,
                y: -2,
                container: this.container,
                style: {
                    fill: CONSTANTS.COLORS.GREEN,
                },
            });
            this.resetButton.show({
                text: 'PLAY AGAIN',
                fn: function () {
                    stage.removeChild(that.container);
                    that.reset();
                    that.start();
                }
            });
            this.menuButton = new Button({
                x: CONSTANTS.HEALTH_BAR.X,
                y: CONSTANTS.HEALTH_BAR.Y,
                container: this.container,
                style: {
                    fill: CONSTANTS.COLORS.YELLOW,
                }
            });
            this.menuButton.show({
                text: 'MENU',
                fn: function () {
                    stage.removeChild(that.container);
                    that.reset();
                    that.showMainMenu();
                }
            });
        };
        Game.prototype.resetBodies = function () {
            var _this = this;
            this.healthBar.graphics.clear();
            Object.keys(this.objects).forEach(function (id) {
                _this.destroyEntity(_this.objects[id]);
            });
            if (this.hero) {
                this.destroyEntity(this.hero);
            }
            this.objects = {};
        };
        Game.prototype.getWinterStats = function () {
            var _a;
            var seals = enforcePositive(this.winter * 2 + 10);
            var gulls = enforcePositive(this.winter * 3 - 10);
            return _a = {},
                _a[TYPES.SEAL] = {
                    total: seals,
                    created: 0,
                    destroyed: 0
                },
                _a[TYPES.GULL] = {
                    total: gulls,
                    created: 0,
                    destroyed: 0
                },
                _a[TYPES.MALE] = {
                    total: CONSTANTS.MALE.NUM,
                    created: CONSTANTS.MALE.NUM,
                    destroyed: 0
                },
                _a;
        };
        Game.prototype.spawnEnemies = function () {
            var _this = this;
            CONSTANTS.ENEMY_TYPES.forEach(function (type) {
                if (_this.toCreateEnemy(type)) {
                    _this.createEnemy(type);
                }
            });
        };
        Game.prototype.moveObjects = function () {
            var _this = this;
            Object.keys(this.objects).forEach(function (id) {
                var object = _this.objects[id];
                if (object instanceof Male || object instanceof Gull || object instanceof Seal) {
                    object.move();
                }
                if (object instanceof Hero) {
                    object.invincibilityTime -= 1;
                }
            });
        };
        Game.prototype.evaluateActiveKeys = function () {
            if (this.keys.down.D) {
                this.hero.move(CONSTANTS.RIGHT);
            }
            else if (this.keys.down.A) {
                this.hero.move(CONSTANTS.LEFT);
            }
        };
        Game.prototype.createBlockDisplay = function (graphics, x1, y1, x2, y2, color) {
            graphics.beginFill(color, 1);
            graphics.drawRect(mpx(x1), mpy(y1), mpx(x2) - mpx(x1), mpy(y2) - mpy(y1));
            graphics.endFill();
        };
        Game.prototype.createBlock = function (graphics, body, box2dOpts, display, x1, y1, x2, y2) {
            if (display) {
                this.createBlockDisplay(graphics, x1, y1, x2, y2, CONSTANTS.COLORS.BIT_BLUE);
            }
            body.createFixture(planck.Edge(Vec2(x1, y1), Vec2(x2, y2)), box2dOpts);
        };
        Game.prototype.createBorders = function () {
            var graphics = new PIXI.Graphics();
            this.container.addChild(graphics);
            var offscreenDetectors = this.world.createBody();
            var wall = this.world.createBody();
            var ground = this.world.createBody();
            this.assignType(ground, TYPES.GROUND);
            this.assignType(offscreenDetectors, TYPES.OFFSCREEN);
            this.assignType(wall, TYPES.WALL);
            var groundOpts = {
                density: 0.0,
                friction: 7.5,
                filterCategoryBits: CATEGORIES.GROUND,
                filterMaskBits: MASKS.GROUND,
            };
            var wallOpts = {
                density: 0.0,
                friction: 0.0,
                filterCategoryBits: CATEGORIES.WALLS,
                filterMaskBits: MASKS.WALLS,
            };
            var offscreenOpts = {
                density: 0.0,
                friction: 0.0,
                filterCategoryBits: CATEGORIES.OFFSCREEN,
                filterMaskBits: MASKS.OFFSCREEN,
            };
            // walls
            this.createBlock(graphics, wall, wallOpts, true, CONSTANTS.BORDER.LEFT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.BORDER.LEFT, CONSTANTS.BORDER.TOP);
            this.createBlock(graphics, wall, wallOpts, true, CONSTANTS.BORDER.RIGHT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.BORDER.RIGHT, CONSTANTS.BORDER.TOP);
            // off-screen detectors
            this.createBlock(graphics, offscreenDetectors, offscreenOpts, true, CONSTANTS.OFFSCREEN.LEFT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.OFFSCREEN.LEFT, CONSTANTS.BORDER.TOP);
            this.createBlock(graphics, offscreenDetectors, offscreenOpts, true, CONSTANTS.OFFSCREEN.RIGHT, CONSTANTS.OFFSCREEN.BOTTOM, CONSTANTS.OFFSCREEN.RIGHT, CONSTANTS.BORDER.TOP);
            // ceiling
            this.createBlock(graphics, wall, wallOpts, true, CONSTANTS.OFFSCREEN.LEFT, CONSTANTS.BORDER.TOP, CONSTANTS.OFFSCREEN.RIGHT, CONSTANTS.BORDER.TOP);
            // ground
            this.createBlock(graphics, ground, groundOpts, true, -100.0, CONSTANTS.OFFSCREEN.BOTTOM, 100.0, CONSTANTS.OFFSCREEN.BOTTOM);
        };
        Game.prototype.shake = function () {
            this.container.x = (Math.random() * CONSTANTS.SHAKE.MAGNITUDE - CONSTANTS.SHAKE.MAGNITUDE / 2) * pscale;
        };
        Game.prototype.renderObjects = function () {
            var _this = this;
            if (this.winterCountdownTime) {
                return;
            }
            this.hero.render();
            Object.keys(this.objects).forEach(function (id) {
                _this.objects[id].render();
            });
        };
        return Game;
    }());
    var HealthBar = /** @class */ (function () {
        function HealthBar(game) {
            this.game = game;
            this.graphics = new PIXI.Graphics();
            this.game.container.addChild(this.graphics);
        }
        HealthBar.prototype.hide = function () {
            this.game.container.removeChild(this.graphics);
        };
        HealthBar.prototype.update = function (health) {
            if (this.body) {
                this.game.world.destroyBody(this.body);
            }
            if (health) {
                this.body = this.game.world.createBody(Vec2(CONSTANTS.HEALTH_BAR.X, CONSTANTS.HEALTH_BAR.Y));
                this.body.createFixture(planck.Box(CONSTANTS.HEALTH_BAR.MAX_WIDTH * (health / CONSTANTS.HERO.HEALTH.MAX), 0.5), {
                    filterGroupIndex: 99,
                });
                var color = void 0;
                var bitColor = void 0;
                if (health > CONSTANTS.HERO.HEALTH.MAX * 0.67) {
                    color = CONSTANTS.COLORS.GREEN;
                    bitColor = CONSTANTS.COLORS.BIT_GREEN;
                }
                else if (health > CONSTANTS.HERO.HEALTH.MAX * 0.33) {
                    color = CONSTANTS.COLORS.YELLOW;
                    bitColor = CONSTANTS.COLORS.BIT_YELLOW;
                }
                else {
                    color = CONSTANTS.COLORS.RED;
                    bitColor = CONSTANTS.COLORS.BIT_RED;
                }
                this.graphics.clear();
                this.game.createBlockDisplay(this.graphics, CONSTANTS.HEALTH_BAR.X, CONSTANTS.HEALTH_BAR.Y, CONSTANTS.HEALTH_BAR.X + (CONSTANTS.HEALTH_BAR.MAX_WIDTH * (health / CONSTANTS.HERO.HEALTH.MAX)), CONSTANTS.HEALTH_BAR.Y + 2, bitColor);
                this.body.render = {
                    stroke: color,
                };
            }
        };
        return HealthBar;
    }());
    var Text = /** @class */ (function () {
        function Text(_a) {
            var _b = _a.prefix, prefix = _b === void 0 ? '' : _b, x = _a.x, y = _a.y, style = _a.style, container = _a.container, show = _a.show, _c = _a.centered, centered = _c === void 0 ? true : _c;
            this.centered = centered;
            this.container = container;
            this.prefix = prefix;
            this.x = x;
            this.y = y;
            this.style = __assign({}, BASE_TEXT_STYLE, style);
            if (show) {
                if (show instanceof Array) {
                    this.show(show[0], show[1]);
                }
                else {
                    this.show(show, null);
                }
            }
        }
        Text.prototype.show = function (text, style) {
            this.container.removeChild(this.text);
            this.text = new PIXI.Text(this.prefix + " " + text, __assign({}, this.style, style));
            if (this.centered) {
                this.text.anchor.set(0.5);
            }
            this.text.x = mpx(this.x);
            this.text.y = mpy(this.y);
            this.container.addChild(this.text);
        };
        Text.prototype.hide = function () {
            if (this.text) {
                this.container.removeChild(this.text);
                this.text = null;
            }
        };
        return Text;
    }());
    var Friend = /** @class */ (function () {
        function Friend(game) {
            this.game = game;
            this.id = this.game.createId();
            this.game.objects[this.id] = this;
        }
        Friend.prototype.render = function () {
            var pos = this.body.getPosition();
            this.sprite.position.set(mpx(pos.x), mpy(pos.y));
        };
        return Friend;
    }());
    var Male = /** @class */ (function (_super) {
        __extends(Male, _super);
        function Male(game) {
            var _this = _super.call(this, game) || this;
            _this.velocity = CONSTANTS.MALE.SPEED;
            _this.alive = true;
            _this.abductor = null;
            _this.filterData = {
                friction: 0,
                filterCategoryBits: CATEGORIES.FRIEND,
                filterMaskBits: MASKS.FRIEND,
                filterGroupIndex: 0,
            };
            _this.jumps = CONSTANTS.MALE.JUMP.MAX;
            var x = CONSTANTS.MALE.SPAWN.X + (CONSTANTS.MALE.SPAWN.SPREAD * Math.random() - CONSTANTS.MALE.SPAWN.SPREAD / 2);
            _this.body = _this.game.world.createBody({
                position: Vec2(x, CONSTANTS.MALE.SPAWN.Y),
                type: 'dynamic',
                fixedRotation: true,
                allowSleep: false
            });
            _this.body.createFixture(planck.Box(CONSTANTS.MALE.HITBOX.WIDTH, CONSTANTS.MALE.HITBOX.HEIGHT), __assign({}, _this.filterData));
            _this.body.render = {
                stroke: CONSTANTS.COLORS.GREEN
            };
            _this.game.assignType(_this, TYPES.MALE);
            _this.body.id = _this.id;
            _this.setupSprite();
            return _this;
        }
        Male.prototype.destroySprites = function () {
            this.game.container.removeChild(this.sprite);
        };
        Male.prototype.onLiberation = function () {
            this.sprite.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD;
            this.abductor = null;
            // if called during resetBodies, will be null if seal is
            // destroyed before abductor
            var fixtures = this.body.getFixtureList();
            if (!fixtures) {
                return;
            }
            fixtures.setFilterData({
                groupIndex: this.filterData.filterGroupIndex,
                categoryBits: this.filterData.filterCategoryBits,
                maskBits: this.filterData.filterMaskBits,
            });
        };
        Male.prototype.onAbduction = function (abductor) {
            this.game.soundManager.play('abduction');
            this.abductor = abductor;
            this.sprite.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STRESSED;
            this.body.getFixtureList().setFilterData({
                filterMaskBits: 0x0000
            });
        };
        Male.prototype.setupSprite = function () {
            var animationStartIndex = Math.floor(Math.random() * 2);
            var sprite = getAnimatedSprite('male:neutral:{i}.png', 2);
            sprite.gotoAndPlay(animationStartIndex);
            sprite.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD;
            sprite.anchor.set(0.5);
            var spriteNormals = getAnimatedSprite('male:neutral:normal:{i}.png', 2);
            spriteNormals.gotoAndPlay(animationStartIndex);
            spriteNormals.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD;
            spriteNormals.anchor.set(0.5);
            var spriteShadows = getAnimatedSprite('male:neutral:{i}.png', 2);
            spriteShadows.gotoAndPlay(animationStartIndex);
            spriteShadows.animationSpeed = CONSTANTS.MALE.ANIMATION_SPEED.STANDARD;
            spriteShadows.anchor.set(0.5);
            this.sprite = assembleBasicSprite(sprite, spriteNormals, spriteShadows);
            this.sprite.visible = false;
            this.game.container.addChild(this.sprite);
        };
        Male.prototype.move = function () {
            if (this.abductor) {
                return;
            }
            var pos = this.body.getPosition();
            var velocity = this.body.getLinearVelocity();
            if (pos.x < -1) {
                this.body.setLinearVelocity(Vec2(CONSTANTS.MALE.SPEED, velocity.y));
            }
            else if (pos.x > 1) {
                this.body.setLinearVelocity(Vec2(CONSTANTS.MALE.SPEED * -1, velocity.y));
            }
        };
        Male.prototype.jump = function () {
            if (!this.jumps) {
                return;
            }
            this.body.setLinearVelocity(Vec2(this.body.getLinearVelocity().x, CONSTANTS.MALE.JUMP.MAGNITUDE * (Math.random() / 2 + 0.5)));
            this.jumps -= 1;
        };
        return Male;
    }(Friend));
    var Foe = /** @class */ (function () {
        function Foe(_a) {
            var damage = _a.damage, health = _a.health, game = _a.game;
            this.alive = true;
            this.damage = damage;
            this.health = health;
            this.invincibilityTime = 0;
            this.game = game;
            this.id = this.game.createId();
            this.game.objects[this.id] = this;
        }
        /**
         * @param {Integer} damage - damage dealt
         */
        Foe.prototype.takeDamage = function (damage) {
            if (this.invincibilityTime) {
                return;
            }
            this.health -= damage;
            this.invincibilityTime = CONSTANTS.HERO.INVINCIBILITY_INTERVAL;
            if (this.health <= 0) {
                this.game.soundManager.play('kill');
                this.game.world.destroyBody(this.body);
                this.game.addPoints(this.points);
                this.game.destroyEntity(this);
            }
        };
        Foe.prototype.render = function () {
            var pos = this.body.getPosition();
            this.sprite.position.set(mpx(pos.x), mpy(pos.y));
        };
        return Foe;
    }());
    var Seal = /** @class */ (function (_super) {
        __extends(Seal, _super);
        function Seal(game, direction) {
            var _this = _super.call(this, {
                damage: CONSTANTS.SEAL.DAMAGE,
                health: CONSTANTS.SEAL.HEALTH,
                game: game,
            }) || this;
            _this.direction = direction;
            _this.points = CONSTANTS.SEAL.POINTS;
            _this.abducting = null;
            _this.velocity = direction === CONSTANTS.RIGHT
                ? CONSTANTS.SEAL.SPEED
                : CONSTANTS.SEAL.SPEED * -1;
            _this.setupBody();
            _this.game.assignType(_this, TYPES.SEAL);
            _this.body.id = _this.id;
            _this.setupSprite();
            return _this;
        }
        Seal.prototype.destroySprites = function () {
            this.game.container.removeChild(this.sprite);
        };
        Seal.prototype.setupSprite = function () {
            var animationStartIndex = Math.floor(Math.random() * 4);
            var sprite = getAnimatedSprite('seal:running:{i}.png', 4);
            sprite.gotoAndPlay(animationStartIndex);
            sprite.animationSpeed = CONSTANTS.SEAL.ANIMATION_SPEED.STANDARD;
            sprite.anchor.set(0.5);
            var spriteNormals = getAnimatedSprite('seal:running:normal:{i}.png', 4);
            spriteNormals.gotoAndPlay(animationStartIndex);
            spriteNormals.animationSpeed = CONSTANTS.SEAL.ANIMATION_SPEED.STANDARD;
            spriteNormals.anchor.set(0.5);
            var spriteShadows = getAnimatedSprite('seal:running:{i}.png', 4);
            spriteShadows.gotoAndPlay(animationStartIndex);
            spriteShadows.animationSpeed = CONSTANTS.SEAL.ANIMATION_SPEED.STANDARD;
            spriteShadows.anchor.set(0.5);
            this.sprite = assembleBasicSprite(sprite, spriteNormals, spriteShadows);
            this.game.container.addChild(this.sprite);
        };
        Seal.prototype.setupBody = function () {
            var x = this.direction === CONSTANTS.LEFT
                ? CONSTANTS.SEAL.SPAWN.X
                : CONSTANTS.SEAL.SPAWN.X * -1;
            this.body = this.game.world.createBody({
                position: Vec2(x, CONSTANTS.SEAL.SPAWN.Y),
                type: 'dynamic',
                fixedRotation: true,
                allowSleep: false
            });
            this.body.createFixture(planck.Box(CONSTANTS.SEAL.HITBOX.WIDTH, CONSTANTS.SEAL.HITBOX.HEIGHT), {
                friction: 0,
                filterCategoryBits: CATEGORIES.FOE,
                filterMaskBits: MASKS.FOE,
                filterGroupIndex: GROUPS.FOE,
            });
        };
        Seal.prototype.move = function () {
            var velocity = this.abducting
                ? this.velocity * -1
                : this.velocity;
            this.sprite.scale.x = velocity < 0
                ? -1
                : 1;
            this.body.setLinearVelocity(Vec2(velocity, this.body.getLinearVelocity().y));
        };
        Seal.prototype.abduct = function (male) {
            this.abducting = male;
            male.onAbduction(this);
            this.game.world.createJoint(planck.RevoluteJoint({
                collideConnected: false
            }, this.body, male.body, Vec2(0, 0)));
        };
        Seal.prototype.jump = function () {
            this.body.setLinearVelocity(Vec2(this.body.getLinearVelocity().x, CONSTANTS.SEAL.JUMP.MAGNITUDE * (Math.random() / 2 + 0.5)));
            this.jumps -= 1;
        };
        return Seal;
    }(Foe));
    var Gull = /** @class */ (function (_super) {
        __extends(Gull, _super);
        function Gull(game, direction) {
            var _this = _super.call(this, {
                damage: CONSTANTS.GULL.DAMAGE,
                health: CONSTANTS.GULL.HEALTH,
                game: game,
            }) || this;
            _this.direction = direction;
            _this.points = CONSTANTS.GULL.POINTS;
            _this.velocity = CONSTANTS.GULL.SPEED;
            _this.abducting = null;
            _this.flapPower = CONSTANTS.GULL.FLAP.STANDARD.POWER;
            _this.flapInterval = CONSTANTS.GULL.FLAP.STANDARD.INTERVAL;
            if (direction === CONSTANTS.LEFT) {
                _this.velocity *= -1;
            }
            _this.setupBody();
            _this.setupSprite();
            _this.game.assignType(_this, TYPES.GULL);
            _this.body.id = _this.id;
            _this.untilFlap = _this.flapInterval;
            return _this;
        }
        Gull.prototype.setupSprite = function () {
            var animationStartIndex = Math.floor(Math.random() * 2);
            var spriteDiffuse = getAnimatedSprite('gull:flying:{i}.png', 2);
            spriteDiffuse.gotoAndPlay(animationStartIndex);
            spriteDiffuse.animationSpeed = CONSTANTS.GULL.ANIMATION_SPEED.STANDARD;
            spriteDiffuse.anchor.set(0.5);
            var spriteNormals = getAnimatedSprite('gull:flying:normal:{i}.png', 2);
            spriteNormals.gotoAndPlay(animationStartIndex);
            spriteNormals.animationSpeed = CONSTANTS.GULL.ANIMATION_SPEED.STANDARD;
            spriteNormals.anchor.set(0.5);
            var spriteShadows = getAnimatedSprite('gull:flying:{i}.png', 2);
            spriteShadows.gotoAndPlay(animationStartIndex);
            spriteShadows.animationSpeed = CONSTANTS.GULL.ANIMATION_SPEED.STANDARD;
            spriteShadows.anchor.set(0.5);
            this.sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows);
            this.sprite.scale.x = this.direction;
            this.game.container.addChild(this.sprite);
        };
        Gull.prototype.setupBody = function () {
            var x = this.direction === CONSTANTS.LEFT
                ? CONSTANTS.GULL.SPAWN.X
                : CONSTANTS.GULL.SPAWN.X * -1;
            this.body = this.game.world.createBody({
                position: Vec2(x, CONSTANTS.GULL.SPAWN.Y),
                type: 'dynamic',
                fixedRotation: true,
                allowSleep: true,
            });
            this.body.createFixture(planck.Box(CONSTANTS.GULL.HITBOX.WIDTH, CONSTANTS.GULL.HITBOX.HEIGHT), {
                friction: 0,
                filterCategoryBits: CATEGORIES.FOE,
                filterMaskBits: MASKS.FOE,
                filterGroupIndex: GROUPS.FOE,
            });
            this.body.render = {
                stroke: CONSTANTS.COLORS.BLUE
            };
        };
        Gull.prototype.flyAway = function () {
            var stats = this.abducting
                ? CONSTANTS.GULL.FLAP.ABDUCTING
                : CONSTANTS.GULL.FLAP.FLYAWAY;
            this.flapPower = stats.POWER;
            this.flapInterval = stats.INTERVAL;
        };
        Gull.prototype.abduct = function (male) {
            this.abducting = male;
            male.onAbduction(this);
            this.flyAway();
            this.game.world.createJoint(planck.RevoluteJoint({
                collideConnected: false
            }, this.body, male.body, Vec2(0, 0)));
        };
        Gull.prototype.destroySprites = function () {
            this.game.container.removeChild(this.sprite);
        };
        Gull.prototype.move = function () {
            this.untilFlap -= 1;
            var yVelocity;
            if (this.untilFlap <= 0) {
                yVelocity = this.flapPower + Math.random() * 1 - 0.5;
                this.untilFlap = this.flapInterval;
            }
            else {
                yVelocity = this.body.getLinearVelocity().y;
            }
            this.body.setLinearVelocity(Vec2(this.velocity, yVelocity));
            var f = this.body.getWorldVector(Vec2(0.0, CONSTANTS.GULL.IMPULSE));
            var p = this.body.getWorldPoint(Vec2(0.0, 2.0));
            this.body.applyLinearImpulse(f, p, true);
        };
        return Gull;
    }(Foe));
    var Fish = /** @class */ (function () {
        function Fish(_a) {
            var x = _a.x, y = _a.y, direction = _a.direction, game = _a.game;
            this.alive = true;
            this.damage = CONSTANTS.FISH.DAMAGE;
            this.game = game;
            this.setupBody(x, y, direction);
            this.setupSprite();
            this.game.assignType(this, TYPES.FISH);
            this.id = this.game.createId();
            this.body.id = this.id;
            this.game.objects[this.id] = this;
        }
        Fish.prototype.setupBody = function (x, y, direction) {
            this.body = this.game.world.createBody({
                position: Vec2(x, y),
                type: 'dynamic',
                fixedRotation: false,
                allowSleep: false
            });
            this.body.createFixture(planck.Box(CONSTANTS.FISH.HITBOX.WIDTH, CONSTANTS.FISH.HITBOX.HEIGHT), {
                filterCategoryBits: CATEGORIES.HERO,
                filterMaskBits: MASKS.HERO,
                filterGroupIndex: GROUPS.HERO,
            });
            this.body.setLinearVelocity(Vec2(CONSTANTS.FISH.LAUNCH_VELOCITY.X * direction, CONSTANTS.FISH.LAUNCH_VELOCITY.Y));
            this.body.setAngularVelocity(Math.random() * Math.PI * 10 - (Math.PI * 5));
        };
        Fish.prototype.setupSprite = function () {
            var spriteDiffuse = new PIXI.Sprite(PIXI.Texture.fromImage('assets/fish.png'));
            spriteDiffuse.anchor.set(0.5);
            var spriteNormals = new PIXI.Sprite(PIXI.Texture.fromImage('assets/fish.normal.png'));
            spriteNormals.anchor.set(0.5);
            var spriteShadows = new PIXI.Sprite(PIXI.Texture.fromImage('assets/fish.png'));
            spriteShadows.anchor.set(0.5);
            this.sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows);
            this.game.container.addChild(this.sprite);
            this.sprite.visible = false;
        };
        Fish.prototype.destroySprites = function () {
            this.game.container.removeChild(this.sprite);
        };
        Fish.prototype.move = function () { };
        Fish.prototype.render = function () {
            var pos = this.body.getPosition();
            this.sprite.position.set(mpx(pos.x), mpy(pos.y));
            this.sprite.rotation = this.body.getAngle();
            this.sprite.visible = true;
        };
        return Fish;
    }());
    var Trail = /** @class */ (function () {
        function Trail(_a) {
            var _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.texture, texture = _d === void 0 ? CONSTANTS.HERO.TRAIL.TEXTURE : _d, _e = _a.smoothness, smoothness = _e === void 0 ? 100 : _e, _f = _a.length, length = _f === void 0 ? 20 : _f, game = _a.game;
            this.texture = texture;
            this.game = game;
            this.smoothness = smoothness;
            this.length = length;
            this.points = [];
            this.history = {
                x: new Array(this.length).fill(mpx(x)),
                y: new Array(this.length).fill(mpy(y)),
            };
            this.createRope(x, y);
        }
        Trail.prototype.destroy = function () {
            this.game.container.removeChild(this.rope);
        };
        Trail.prototype.createRope = function (x, y) {
            this.points = [];
            for (var i = 0; i < this.smoothness; i++) {
                this.points.push(new PIXI.Point(mpx(x), mpy(y)));
            }
            this.rope = new PIXI.mesh.Rope(this.texture, this.points);
            this.rope.blendMode = PIXI.BLEND_MODES.ADD;
            this.game.container.addChild(this.rope);
        };
        Trail.prototype.update = function (x, y, show) {
            this.rope.alpha = show ? 1 : 0;
            this.history.x.unshift(x);
            this.history.y.unshift(y);
            this.history.x.pop();
            this.history.y.pop();
            for (var i = 0; i < this.smoothness; i++) {
                var iterator = i / this.smoothness * this.length;
                var point = this.points[i];
                point.x = cubicInterpolation(this.history.x, iterator, null);
                point.y = cubicInterpolation(this.history.y, iterator, null);
            }
        };
        return Trail;
    }());
    var Hero = /** @class */ (function () {
        function Hero(game) {
            this.game = game;
            this.alive = true;
            this.health = CONSTANTS.HERO.HEALTH.MAX;
            this.invincibilityTime = 0;
            this.fishThrowTime = 0;
            this.damage = CONSTANTS.HERO.DAMAGE;
            this.jumps = CONSTANTS.HERO.JUMP.MAX;
            this.speed = CONSTANTS.HERO.SPEED;
            this.bodyOpts = {
                filterCategoryBits: CATEGORIES.HERO,
                filterMaskBits: MASKS.HERO,
                filterGroupIndex: GROUPS.HERO,
            };
            this.state = {
                airborne: true,
                action: 'NEUTRAL',
                direction: CONSTANTS.RIGHT,
            };
            this.setupSprite();
            this.setupBody();
            this.game.assignType(this, TYPES.HERO);
            this.game.healthBar.update(this.health);
        }
        Hero.prototype.setupBody = function () {
            this.body = this.game.world.createBody({
                position: Vec2(CONSTANTS.HERO.SPAWN.X, CONSTANTS.HERO.SPAWN.Y),
                type: 'dynamic',
                fixedRotation: true,
                allowSleep: false
            });
            this.body.createFixture(planck.Box(CONSTANTS.HERO.HITBOX.WIDTH, CONSTANTS.HERO.HITBOX.HEIGHT), this.bodyOpts);
            this.body.render = {
                stroke: CONSTANTS.COLORS.GREEN
            };
        };
        Hero.prototype.getNeutralSprite = function () {
            var states = CONSTANTS.HERO.MOVEMENT_STATES;
            var animationStartIndex = Math.floor(Math.random() * 2);
            var spriteDiffuse = getAnimatedSprite('hero:neutral:{i}.png', 2);
            spriteDiffuse.gotoAndPlay(animationStartIndex);
            spriteDiffuse.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.NEUTRAL];
            spriteDiffuse.anchor.set(0.5);
            var spriteNormals = getAnimatedSprite('hero:neutral:normal:{i}.png', 2);
            spriteNormals.gotoAndPlay(animationStartIndex);
            spriteNormals.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.NEUTRAL];
            spriteNormals.anchor.set(0.5);
            var spriteShadows = getAnimatedSprite('hero:neutral:{i}.png', 2);
            spriteShadows.gotoAndPlay(animationStartIndex);
            spriteShadows.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.NEUTRAL];
            spriteShadows.anchor.set(0.5);
            var sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows);
            this.game.container.addChild(sprite);
            sprite.visible = false;
            return sprite;
        };
        Hero.prototype.getRunningSprite = function () {
            var states = CONSTANTS.HERO.MOVEMENT_STATES;
            var animationStartIndex = Math.floor(Math.random() * 2);
            var spriteDiffuse = getAnimatedSprite('hero:running:{i}.png', 2);
            spriteDiffuse.gotoAndPlay(animationStartIndex);
            spriteDiffuse.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.RUNNING];
            spriteDiffuse.anchor.set(0.5);
            var spriteNormals = getAnimatedSprite('hero:running:normal:{i}.png', 2);
            spriteNormals.gotoAndPlay(animationStartIndex);
            spriteNormals.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.RUNNING];
            spriteNormals.anchor.set(0.5);
            var spriteShadows = getAnimatedSprite('hero:running:{i}.png', 2);
            spriteShadows.gotoAndPlay(animationStartIndex);
            spriteShadows.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.RUNNING];
            spriteShadows.anchor.set(0.5);
            var sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows);
            this.game.container.addChild(sprite);
            sprite.visible = false;
            return sprite;
        };
        Hero.prototype.getDivingSprite = function () {
            var states = CONSTANTS.HERO.MOVEMENT_STATES;
            var animationStartIndex = Math.floor(Math.random() * 4);
            var spriteDiffuse = getAnimatedSprite('hero:diving:{i}.png', 4);
            spriteDiffuse.gotoAndPlay(animationStartIndex);
            spriteDiffuse.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.DIVING];
            spriteDiffuse.anchor.set(0.5);
            var spriteNormals = getAnimatedSprite('hero:diving:normal:{i}.png', 4);
            spriteNormals.gotoAndPlay(animationStartIndex);
            spriteNormals.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.DIVING];
            spriteNormals.anchor.set(0.5);
            var spriteShadows = getAnimatedSprite('hero:diving:{i}.png', 4);
            spriteShadows.gotoAndPlay(animationStartIndex);
            spriteShadows.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED[states.DIVING];
            spriteShadows.anchor.set(0.5);
            var sprite = assembleBasicSprite(spriteDiffuse, spriteNormals, spriteShadows);
            this.game.container.addChild(sprite);
            sprite.visible = false;
            return sprite;
        };
        Hero.prototype.setupSprite = function () {
            var _a, _b;
            this.trail = new Trail({
                x: CONSTANTS.HERO.SPAWN.X,
                y: CONSTANTS.HERO.SPAWN.Y,
                texture: CONSTANTS.HERO.TRAIL.TEXTURE,
                smoothness: CONSTANTS.HERO.TRAIL.SMOOTHNESS,
                length: CONSTANTS.HERO.TRAIL.LENGTH,
                game: this.game,
            });
            var states = CONSTANTS.HERO.MOVEMENT_STATES;
            this.sprites = (_a = {},
                _a[states.DIVING] = this.getDivingSprite(),
                _a[states.NEUTRAL] = this.getNeutralSprite(),
                _a[states.RUNNING] = this.getRunningSprite(),
                _a);
            this.stateMappings = (_b = {},
                _b[states.DIVING] = this.sprites[states.DIVING],
                _b[states.JUMPING] = this.sprites[states.JUMPING],
                _b[states.NEUTRAL] = this.sprites[states.NEUTRAL],
                _b[states.RUNNING] = this.sprites[states.RUNNING],
                _b);
            this.setActiveSprite(false);
        };
        Hero.prototype.destroySprites = function () {
            var _this = this;
            Object.keys(this.sprites).forEach(function (key) {
                _this.game.container.removeChild(_this.sprites[key]);
            });
            this.trail.destroy();
        };
        Hero.prototype.onStep = function () {
            if (this.invincibilityTime) {
                if (this.invincibilityTime > (CONSTANTS.HERO.INVINCIBILITY_INTERVAL - CONSTANTS.SHAKE.DURATION)) {
                    this.game.shake();
                }
                this.invincibilityTime -= 1;
            }
            if (this.fishThrowTime) {
                this.fishThrowTime -= 1;
            }
        };
        /**
         * @param {Integer} damage - damage dealt
         */
        Hero.prototype.takeDamage = function (damage) {
            if (this.invincibilityTime) {
                return;
            }
            this.game.soundManager.play('damage');
            this.health -= damage;
            this.invincibilityTime = CONSTANTS.HERO.INVINCIBILITY_INTERVAL;
            if (this.health <= 0) {
                this.game.destroyEntity(this);
            }
            this.game.healthBar.update(this.health);
        };
        Hero.prototype.throwFish = function () {
            if (this.fishThrowTime) {
                return;
            }
            this.game.soundManager.play('pause');
            this.fishThrowTime = CONSTANTS.HERO.THROW_INTERVAL;
            var pos = this.body.getPosition();
            new Fish({
                x: pos.x,
                y: pos.y,
                direction: this.state.direction,
                game: this.game,
            });
        };
        Hero.prototype.dive = function () {
            if (this.diveFixture) {
                return;
            }
            this.game.soundManager.play('dive');
            this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.DIVING;
            this.body.setLinearVelocity(Vec2(this.body.getLinearVelocity().x, -70));
            var top = CONSTANTS.HERO.HITBOX.HEIGHT * -1;
            var left = CONSTANTS.HERO.DIVE.HITBOX.WIDTH * -0.5;
            var right = CONSTANTS.HERO.DIVE.HITBOX.WIDTH * 0.5;
            var height = CONSTANTS.HERO.DIVE.HITBOX.HEIGHT;
            this.diveFixture = this.body.createFixture(planck.Polygon([
                Vec2(left, top),
                Vec2(right, top),
                Vec2(right, top - height),
                Vec2(left, top - height),
            ]), this.bodyOpts);
            this.diveFixture.dive = true;
        };
        Hero.prototype.land = function () {
            var vel = this.body.getLinearVelocity();
            if (vel.y > 0) {
                return;
            }
            if (this.state.action === CONSTANTS.HERO.MOVEMENT_STATES.DIVING) {
                this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.NEUTRAL;
            }
            this.state.airborne = false;
            this.sprite.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED.RUNNING;
            this.jumps = CONSTANTS.HERO.JUMP.MAX;
            if (this.diveFixture) {
                this.game.deferDestroyFixture(this, 'diveFixture');
            }
        };
        /**
         * @param {Integer} direction - LEFT or RIGHT
         */
        Hero.prototype.move = function (direction) {
            this.state.direction = direction;
            if (this.state.action !== CONSTANTS.HERO.MOVEMENT_STATES.DIVING) {
                this.state.action = CONSTANTS.HERO.MOVEMENT_STATES.RUNNING;
            }
            this.body.setLinearVelocity(Vec2(direction * this.speed, this.body.getLinearVelocity().y));
        };
        Hero.prototype.jump = function () {
            if (!this.jumps) {
                return;
            }
            this.game.soundManager.play('jump');
            this.sprite.animationSpeed = CONSTANTS.HERO.ANIMATION_SPEED.JUMPING;
            this.state.airborne = true;
            this.body.setLinearVelocity(Vec2(this.body.getLinearVelocity().x, CONSTANTS.HERO.JUMP.MAGNITUDE));
            this.jumps -= 1;
        };
        Hero.prototype.setActiveSprite = function (visible) {
            if (visible === void 0) { visible = true; }
            var sprite = this.stateMappings[this.state.action];
            if (sprite === this.sprite) {
                this.sprite.scale.x = this.stateMappings[this.state.action] === this.stateMappings.RUNNING
                    ? this.state.direction
                    : 1;
                return;
            }
            if (this.sprite) {
                this.sprite.visible = false;
                sprite.animationSpeed = this.sprite.animationSpeed;
            }
            this.sprite = sprite;
            this.sprite.visible = visible;
            this.sprite.scale.x = this.stateMappings[this.state.action] === this.stateMappings.RUNNING
                ? this.state.direction
                : 1;
        };
        Hero.prototype.render = function () {
            var pos = this.body.getPosition();
            this.setActiveSprite();
            this.sprite.position.set(mpx(pos.x), mpy(pos.y));
            this.trail.update(mpx(pos.x), mpy(pos.y), this.state.airborne);
        };
        return Hero;
    }());
    var Button = /** @class */ (function (_super) {
        __extends(Button, _super);
        function Button(opts) {
            var _this = this;
            var show = opts.show, textOpts = __rest(opts, ["show"]);
            _this = _super.call(this, textOpts) || this;
            if (show) {
                _this.show(show);
            }
            return _this;
        }
        Button.prototype.show = function (args) {
            var text = args.text;
            var fn = args.fn;
            _super.prototype.show.call(this, text, null);
            this.text.interactive = true;
            this.text.buttonMode = true;
            this.text.on('pointerdown', function () { return fn(); });
        };
        return Button;
    }(Text));
    (function setupGame() {
        var sounds = {
            'jump': '/assets/audio/jump.mp3',
            'damage': '/assets/audio/damage.mp3',
            'kill': '/assets/audio/kill.mp3',
            'theme': '/assets/audio/theme.mp3',
            'throw': '/assets/audio/throw.mp3',
            'abduction': '/assets/audio/abduction.mp3',
            'pause': '/assets/audio/pause.mp3',
            'dive': '/assets/audio/dive.mp3',
        };
        var graphicsLoaded = false;
        var soundsLoaded = false;
        var soundfilesLoaded = 0;
        var soundfilesToLoad = Object.keys(sounds).length;
        Object.keys(sounds).forEach(function (key) {
            Sound.registerSound(sounds[key], key);
        });
        function startIfReady() {
            if (!graphicsLoaded || !soundsLoaded) {
                return;
            }
            new Game();
        }
        Sound.on("fileload", function () {
            soundfilesLoaded += 1;
            if (soundfilesLoaded === soundfilesToLoad) {
                soundsLoaded = true;
            }
            startIfReady();
        });
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
            .load(function () {
            graphicsLoaded = true;
            startIfReady();
        });
    })();
})();
//# sourceMappingURL=main.js.map