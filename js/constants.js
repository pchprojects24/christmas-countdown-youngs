// ===== GAME CONSTANTS =====
const TILE = 32;          // tile size in pixels
const GRAVITY = 0.55;
const TERMINAL_VEL = 14;
const CANVAS_W = 800;
const CANVAS_H = 480;

// Character definitions
const CHARACTERS = {
  mario: {
    name: 'MARIO',
    color: '#e83a00',
    hatColor: '#e83a00',
    overallColor: '#3a6fff',
    speed: 3.4,
    jumpPower: -11.5,
    jumpHold: 0.45,    // air control multiplier
    liftSpeed: 1.0,
    floatAbility: false,
    spriteKey: 'mario'
  },
  luigi: {
    name: 'LUIGI',
    color: '#2a9e00',
    hatColor: '#2a9e00',
    overallColor: '#2a6fff',
    speed: 3.0,
    jumpPower: -13.2,
    jumpHold: 0.6,
    liftSpeed: 1.0,
    floatAbility: false,
    spriteKey: 'luigi'
  },
  toad: {
    name: 'TOAD',
    color: '#e8e8e8',
    hatColor: '#fff',
    overallColor: '#f44',
    speed: 4.2,
    jumpPower: -9.8,
    jumpHold: 0.35,
    liftSpeed: 1.35,
    floatAbility: false,
    spriteKey: 'toad'
  },
  peach: {
    name: 'PEACH',
    color: '#f9a0c0',
    hatColor: '#f9a0c0',
    overallColor: '#f9a0c0',
    speed: 2.8,
    jumpPower: -11.0,
    jumpHold: 0.5,
    liftSpeed: 0.85,
    floatAbility: true,
    floatDuration: 90,   // frames
    spriteKey: 'peach'
  }
};

// Tile IDs
const T = {
  EMPTY:   0,
  GROUND:  1,
  BRICK:   2,
  DIRT:    3,
  CLOUD:   4,
  GRASS:   5,
  SAND:    6,
  WATER:   7,
  PIPE_TL: 8,
  PIPE_TR: 9,
  PIPE_BL: 10,
  PIPE_BR: 11,
  VEGE:    12,  // veggie spawn tile (background)
  DOOR:    13,  // level exit door
  COIN:    14,
  SOLID_INVISIBLE: 15
};

// Solid tiles set
const SOLID_TILES = new Set([T.GROUND, T.BRICK, T.DIRT, T.GRASS, T.SAND,
  T.PIPE_TL, T.PIPE_TR, T.PIPE_BL, T.PIPE_BR, T.SOLID_INVISIBLE]);

// Score values
const SCORE = {
  ENEMY_STOMP:  200,
  ENEMY_THROW:  800,
  COIN:         100,
  VEGGIE:       50,
  CHERRY:       500,
  LEVEL_CLEAR:  3000
};

// Enemy types
const ENEMY_TYPES = {
  SHYGUY:   'shyguy',
  BIRDO:    'birdo',
  SNIFIT:   'snifit',
  TROUTER:  'trouter',
  NINJI:    'ninji',
  SPARKY:   'sparky'
};

// Projectile types
const PROJ_TYPES = {
  VEGGIE:  'veggie',
  BIRDO_EGG: 'birdo_egg',
  SNIFIT_BALL: 'snifit_ball'
};

// States
const STATE = {
  SELECT:   'select',
  PLAYING:  'playing',
  PAUSED:   'paused',
  DEAD:     'dead',
  WIN:      'win',
  GAMEOVER: 'gameover'
};

// Input keys
const KEYS = {};
const KEYS_DOWN = {};
