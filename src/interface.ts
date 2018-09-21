export interface Constants {
  [index: string]: any,
  readonly ENEMY_TYPES: string[],
  readonly MALE: {
    readonly SPAWN: {
      [index: string]: number
      readonly X: number,
      readonly Y: number,
      readonly SPREAD: number,
    },
    readonly JUMP: {
      [index: string]: number
      readonly MAGNITUDE: number,
      readonly MAX: number,
    },
    readonly HITBOX: {
      [index: string]: number
      readonly WIDTH: number,
      readonly HEIGHT: number,
    },
    readonly ANIMATION_SPEED: {
      [index: string]: number
      readonly STANDARD: number,
      readonly STRESSED: number,
    },
    readonly NUM: number,
    readonly SPEED: number,
  },
  readonly HERO: {
    [index: string]: any
    readonly TRAIL: {
      [index: string]: any
      readonly TEXTURE: PIXI.Texture,
      readonly SMOOTHNESS: number,
      readonly LENGTH: number,
      readonly THRESHOLD: number,
      readonly MIN_VELOCITY: number,
    },
    readonly ANIMATION_SPEED: {
      [index: string]: number
      readonly DIVING: number,
      readonly NEUTRAL: number,
      readonly RUNNING: number,
      readonly JUMPING: number,
    },
    readonly MOVEMENT_STATES: {
      [index: string]: string
      readonly RUNNING: string,
      readonly GLIDING: string,
      readonly NEUTRAL: string,
      readonly DIVING: string,
      readonly JUMPING: string,
    },
    readonly JUMP: {
      [index: string]: number
      readonly MAGNITUDE: number,
      readonly MAX: number,
    },
    readonly HEALTH: {
      [index: string]: number
      readonly MAX: number,
    },
    readonly HITBOX: {
      [index: string]: number
      readonly WIDTH: number,
      readonly HEIGHT: number,
    },
    readonly DIVE: {
      [index: string]: any
      readonly HITBOX: {
        [index: string]: number
        readonly WIDTH: number,
        readonly HEIGHT: number,
      },
      readonly SOUND_OVERFLOW: number,
    },
    readonly SPAWN: {
      [index: string]: number
      readonly X: number,
      readonly Y: number,
    },
    readonly GLIDE: {
      [index: string]: number
      readonly IMPULSE: number,
    },
    readonly INVINCIBILITY_INTERVAL: number,
    readonly DAMAGE: number,
    readonly SPEED: number,
    readonly THROW_INTERVAL: number,
  },
  readonly HEALTH_BAR: {
    [index: string]: number
    readonly X: number,
    readonly Y: number,
    readonly MAX_WIDTH: number,
  },
  readonly FISH: {
    [index: string]: any
    readonly HITBOX: {
      [index: string]: number
      readonly WIDTH: number,
      readonly HEIGHT: number,
    },
    readonly LAUNCH_VELOCITY: {
      [index: string]: number
      readonly X: number,
      readonly Y: number,
    },
    readonly DAMAGE: number,
  },
  readonly SEAL: {
    [index: string]: any
    readonly SPAWN: {
      [index: string]: number
      readonly X: number,
      readonly Y: number,
      readonly PROBABILITY: number,
    },
    readonly JUMP: {
      [index: string]: number
      readonly MAGNITUDE: number,
      readonly MAX: number,
    },
    readonly HITBOX: {
      [index: string]: number
      readonly WIDTH: number,
      readonly HEIGHT: number,
    },
    readonly ANIMATION_SPEED: {
      [index: string]: number
      readonly STANDARD: number,
    },
    readonly POINTS: number,
    readonly SPEED: number,
    readonly HEALTH: number,
    readonly DAMAGE: number,
  },
  readonly GULL: {
    [index: string]: any
    readonly SPAWN: {
      [index: string]: number
      readonly X: number,
      readonly Y: number,
      readonly PROBABILITY: number,
    },
    readonly FLAP: {
      readonly STANDARD: {
        [index: string]: number
        readonly POWER: number,
        readonly INTERVAL: number,
      },
      readonly ABDUCTING: {
        [index: string]: number
        readonly POWER: number,
        readonly INTERVAL: number,
      },
      readonly FLYAWAY: {
        [index: string]: number
        readonly POWER: number,
        readonly INTERVAL: number,
      },
    },
    readonly HITBOX: {
      [index: string]: number
      readonly WIDTH: number,
      readonly HEIGHT: number,
    },
    readonly ANIMATION_SPEED: {
      [index: string]: number
      readonly STANDARD: number,
    },
    readonly SPEED: number,
    readonly HEALTH: number,
    readonly DAMAGE: number,
    readonly IMPULSE: number,
    readonly POINTS: number,
  },
  readonly SHAKE: {
    [index: string]: number
    readonly DURATION: number,
    readonly MAGNITUDE: number,
  },
  readonly BORDER: {
    [index: string]: number
    readonly LEFT: number,
    readonly RIGHT: number,
    readonly TOP: number,
  },
  readonly OFFSCREEN: {
    [index: string]: number
    readonly LEFT: number,
    readonly RIGHT: number,
    readonly BOTTOM: number,
  },
  readonly BACKGROUND: {
    [index: string]: string
    readonly DIFFUSE: string,
    readonly NORMAL: string,
  },
  readonly WINTER: {
    [index: string]: number
    readonly COUNTDOWN: number,
    readonly INTERIM: number,
  },
  readonly TIME_STEP: number,
  readonly GRAVITY: number,
}

export interface ShadowEnabledSprite {
  parentGroup: PIXI.display.Layer
}