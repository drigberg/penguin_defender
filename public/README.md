### QUEUE
- AUDIO.2

### Gameplay Todos
LOGIC.1
- [x] sprite can move left/right
- [x] sprite can jump
- [x] code is separated cleanly
- [x] jumping is limited to 2
- [x] enemies are spawned
- [x] enemies move on their own
- [x] enemies can pass through walls

LOGIC.2
- [x] enemies do damage upon collisions
- [x] invincibility for one second after being hit
- [x] sprite disappears if dead
- [x] enemies can take damage when attacked
- [x] enemies disappear if dead

LOGIC.3
- [x] fine-tune movement
- [x] sprint
- [x] only damage enemies if actually on top
- [x] triple-jump bug: restores to 2 while leaving ground

LOGIC.4
- [x] damage effect: screen shakes? character flashes/dims?
- [x] new enemy class
- [x] fish class
- [x] limit fish frequency
- [x] allow fish to damage enemies
- [x] add and use sprite.direction

LOGIC.5
- [x] seals jump when piled up
- [x] differentiate enemy types
- [x] health bar
- [x] reset when game ends

LOGIC.6
- [x] three flaps
- [x] glide/sprint
- [x] allow more keys: F for stomp, G for glide
- [x] use masks for ignoring collisions

LOGIC.7
- [x] use one map for all objects besides sprite
- [x] rename sprite ==> hero to avoid naming confusing
- [x] males huddle up in the center
- [x] use a map of collision handlers instead of if-statements
- [x] males get killed by seals
- [x] refactor: as few globals as possible

LOGIC.8
- [x] hide testbed
- [x] isolate render/move
- [x] allow pause
- [x] refactor: type hashing
- [x] refactor: entity destruction

LOGIC.9
- [x] detection for how many males have been lost / are still left
- [x] defined waves with level formula
- [x] bug: standardize type assignment
- [x] display wave number
- [x] refactor: text display prefixes
- [x] detect wave completion
- [x] display success on wave completion
- [x] start new wave on success
- [x] countdown between waves

LOGIC.10
- [x] males get dragged away by seals
- [x] figure out how masks REALLY work, and do that
- [x] detect when enemies cross the screen
- [x] detect when males cross the screen
- [x] display final score when game is over
- [x] display gameover reason

LOGIC.11
- [x] fix masks
- [x] fix flying seals
- [x] display "PAUSED"
- [x] penguins definitely don't render at all until wave starts
- [x] males don't collide with anything while abducted
- [x] display "PAUSED"

LOGIC.12
- [x] all entities are destroyed at game over
- [x] males and hero don't collide
- [x] bug fix: keep pairs of seals from flying

LOGIC.13
- [x] bug fix: destruction order (see too)
- [x] bug fix: fish sometimes throw down or not at all
- [x] bug fix: splash damage fixture destruction
- [x] bug fix: slow-down with planck v0.2.2
- [x] bug fix: stomp doesn't always appear to work
- [x] bug fix: stomp "collides" above ground
- [x] dive sprite
- [x] bug fix: stomp animation disappears
- [x] bug fix: stomp animation can render on ground

LOGIC.14
- [x] gulls can carry away males
- [x] refine gull flying
- [x] bug fix: bird-summoning bug on stomp attack
- [x] bug fix: double-stomp

LOGIC.15
- [x] rename "stomp/attack" to "dive/diving"
- [x] clean up settings
- [x] rename settings -> constants
- [x] clean up Game methods

LOGIC.16
- [x] get rid of Menu, incorporate into Game
- [x] bug fix: fish appears at origin when created

LOGIC.17
- [ ] settings: shadows on/off
- [ ] settings: music on/off
- [ ] settings: sound effects on/off
- [ ] settings: song selection

LOGIC.18
- [ ] light class: implement fade method
- [ ] lights fade to black upon death
- [ ] lights fade in when created
- [ ] blink while invincible
- [ ] bounce off of enemies
- [ ] bug fix: "from top" calculation
- [ ] new enemy (bank: wolves, caribou, walrus, Putin-on-horse, lumberjack)

LOGIC.19
- [ ] eslint
- [ ] make testbed only differ by testbed and hidden pixi, not commented
- [ ] refine movement

LOGIC.20
- [ ] gulls fall when killed, are destroyed offscreen
- [ ] seals fall when killed, are destroyed offscreen
- [ ] fish fall after collisions, are destroyed offscreen
- [ ] standardize colors (alert, points, success, etc)
- [ ] post-wave movement

LOGIC.21
- [ ] orca summons
- [ ] hero.lives
- [ ] males don't regenerate back to max each winter

### UI Todos
UI.1
- [x] static hero texture
- [x] static fish texture
- [x] health bar
- [x] static seal texture
- [x] static gull texture
- [x] standard text display
- [x] wave countdown
- [x] points are displayed
- [x] background image

UI.2
- [x] make UI contactless
- [x] fit background to screen
- [x] cute static pixel image: penguin
- [x] cute static pixel image: seal
- [x] cute static pixel image: gull
- [x] cute static pixel image: fish
- [x] cute static pixel image: background

UI.3
- [x] main menu
- [x] show restart and menu buttons when game ends

UI.4
- [x] animation: hero neutral
- [x] animation: male neutral
- [x] male animation is faster when abducted
- [x] animation: seal running
- [x] rename wave => winter

UI.5
- [x] animation: hero left/right
- [x] animation: implement hero states
- [x] animation: hero speeds up when airborne
- [x] animation: hero attack
- [x] hero movement trail
- [x] prevent trail from showing at game start

UI.6
- [x] hero splash damage animation
- [x] animation: basic gull

UI.7
- [x] basic lighting
- [x] shadows
- [x] sprite normals: seal
- [x] sprite normals: male
- [x] sprite normals: gull
- [x] sprite normals: hero neutral
- [x] sprite normals: hero attacking
- [x] sprite normals: hero running
- [x] sprite normals: fish

UI.8
- [ ] sun rises and brightens between winters, sets during countdown
- [ ] snowstorm in background
- [ ] snowstorm stops with winter's end

UI.9
- [ ] responsive screen
- [ ] switch to better animation library (smoothie?)

UI.10
- [ ] enemy 3 assets (wolf?)
- [ ] enemy 4 assets (walrus?)

UI.11
- [ ] more congrulation text options
- [ ] controls screen
- [ ] high score table
- [ ] high score table input

UI.12
- [ ] enhance hero assets
- [ ] enhance male assets
- [ ] enhance fish assets
- [ ] enhance seal assets
- [ ] enhance gull assets
- [ ] enhance background assets
- [ ] enhance text displays

UI.12
- [ ] opening scene
- [ ] post-wave animation (female textures, cheering)
- [ ] refine lighting
- [ ] clouds?

### Audio Todos
AUDIO.1
- [x] set up SoundJS
- [x] basic jump sound
- [x] Penguin Defender theme
- [x] basic damage sound
- [x] basic enemy death sound
- [x] basic fish-throw sound

AUDIO.2
- [ ] basic stomp sound
- [ ] basic male death sound
- [ ] basic abduction sound
- [ ] basic pause sound

AUDIO.3
- [ ] current theme loops indefinitely
- [ ] theme pauses when game is paused

AUDIO.4
- [ ] basic victory sound
- [ ] basic gameover music
- [ ] basic menu music

AUDIO.5
- [ ] song 2
- [ ] glid music
- [ ] HQ jump sound
- [ ] HQ glide sound
- [ ] HQ stomp sound
- [ ] HQ damage sound

AUDIO.6
- [ ] HQ abduction sound
- [ ] HQ male death sound
- [ ] HQ seal death sound
- [ ] HQ gull death sound
- [ ] HQ game over sound

AUDIO.7
- [ ] song 3
- [ ] HQ gameplay music
- [ ] HQ gameover music
- [ ] HQ menu music
