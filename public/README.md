
### Gameplay Todos
GAMEPLAY.1
- [x] sprite can move left/right
- [x] sprite can jump
- [x] code is separated cleanly
- [x] jumping is limited to 2
- [x] enemies are spawned
- [x] enemies move on their own
- [x] enemies can pass through walls

GAMEPLAY.2
- [x] enemies do damage upon collisions
- [x] invincibility for one second after being hit
- [x] sprite disappears if dead
- [x] enemies can take damage when attacked
- [x] enemies disappear if dead

GAMEPLAY.3
- [x] fine-tune movement
- [x] sprint
- [x] only damage enemies if actually on top
- [x] triple-jump bug: restores to 2 while leaving ground

GAMEPLAY.4
- [x] damage effect: screen shakes? character flashes/dims?
- [x] new enemy class
- [x] fish class
- [x] limit fish frequency
- [x] allow fish to damage enemies
- [x] add and use sprite.direction

GAMEPLAY.5
- [x] seals jump when piled up
- [x] differentiate enemy types
- [x] health bar
- [x] reset when game ends

GAMEPLAY.6
- [x] three flaps
- [x] glide/sprint
- [x] allow more keys: F for stomp, G for glide
- [x] use masks for ignoring collisions

GAMEPLAY.7
- [x] use one map for all objects besides sprite
- [x] rename sprite ==> hero to avoid naming confusing
- [x] males huddle up in the center
- [x] use a map of collision handlers instead of if-statements
- [x] males get killed by seals
- [x] refactor: as few globals as possible

GAMEPLAY.8
- [x] hide testbed
- [x] isolate render/move
- [x] allow pause
- [x] refactor: type hashing
- [x] refactor: entity destruction

GAMEPLAY.9
- [x] detection for how many males have been lost / are still left
- [x] defined waves with level formula
- [x] bug: standardize type assignment
- [x] display wave number
- [x] refactor: text display prefixes
- [x] detect wave completion
- [x] display success on wave completion
- [x] start new wave on success
- [x] countdown between waves

GAMEPLAY.10
- [x] males get dragged away by seals
- [x] figure out how masks REALLY work, and do that
- [x] detect when enemies cross the screen
- [x] detect when males cross the screen
- [x] display final score when game is over
- [x] display gameover reason

GAMEPLAY.11
- [x] fix masks
- [x] fix flying seals
- [x] display "PAUSED"
- [x] penguins definitely don't render at all until wave starts
- [x] males don't collide with anything while abducted
- [x] display "PAUSED"

GAMEPLAY.12
- [x] all entities are destroyed at game over
- [x] males and hero don't collide
- [x] bug fix: keep pairs of seals from flying

GAMEPLAY.13
- [x] bug fix: destruction order (see too)
- [x] bug fix: fish sometimes throw down or not at all
- [x] bug fix: splash damage fixture destruction
- [x] bug fix: slow-down with planck v0.2.2
- [x] bug fix: stomp doesn't always appear to work
- [x] bug fix: stomp "collides" above ground
- [x] dive sprite
- [x] bug fix: stomp animation disappears
- [x] bug fix: stomp animation can render on ground

GAMEPLAY.14
- [x] gulls can carry away males
- [x] refine gull flying

GAMEPLAY.15
- [ ] rename "stomp/attack" to "dive/diving"
- [ ] clean up Game methods
- [ ] clean up settings
- [ ] separate all pixi and planck methods
- [ ] make testbed only differ by testbed and hidden pixi, not commented
- [ ] refine movement

GAMEPLAY.16
- [ ] gulls change color and fall when killed
- [ ] seals get launched offscreen when stomped
- [ ] standardize colors (alert, points, success, etc)
- [ ] post-wave movement

GAMEPLAY.17
- [ ] Putin-on-a-Horse
- [ ] foxes

GAMEPLAY.DIFFICULT
- [ ] bug fix: bird-summoning bug on stomp attack

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
- [ ] animation: seal attack
- [ ] animation: seal death
- [ ] animation: hero death
- [ ] snowstorm in background
- [ ] snowstorm stops with winter's end

UI.8
- [ ] responsive screen
- [ ] switch to better animation library (smoothie?)

UI.9
- [ ] basic lighting
- [ ] sun rises between winters, sets during countdown

UI.10
- [ ] opening scene
- [ ] post-wave animation (female textures, cheering)


### Audio Todos
AUDIO.1
- [ ] basic jump sound
- [ ] basic glide sound
- [ ] basic stomp sound
- [ ] basic damage sound

AUDIO.2
- [ ] basic abduction sound
- [ ] basic male death sound
- [ ] basic seal death sound
- [ ] basic gull death sound
- [ ] basic game over sound

AUDIO.3
- [ ] basic gameplay music
- [ ] basic gameover music
- [ ] basic menu music

AUDIO.4
- [ ] high-quality jump sound
- [ ] high-quality glide sound
- [ ] high-quality stomp sound
- [ ] high-quality damage sound

AUDIO.5
- [ ] high-quality abduction sound
- [ ] high-quality male death sound
- [ ] high-quality seal death sound
- [ ] high-quality gull death sound
- [ ] high-quality game over sound

AUDIO.6
- [ ] high-quality gameplay music
- [ ] high-quality gameover music
- [ ] high-quality menu music
