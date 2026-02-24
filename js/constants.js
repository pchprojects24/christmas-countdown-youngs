// ===== GAME CONSTANTS =====
const TILE = 32;          // tile size in pixels
const GRAVITY = 0.55;
const TERMINAL_VEL = 14;
const CANVAS_W = 800;
const CANVAS_H = 800;

// Physics tuning
const COYOTE_FRAMES = 6;
const JUMP_BUFFER_FRAMES = 8;
const APEX_THRESHOLD = 2.0;
const APEX_GRAVITY_MULT = 0.4;
const GROUND_ACCEL = 0.65;
const GROUND_DECEL = 0.78;
const AIR_ACCEL = 0.45;
const AIR_DECEL = 0.92;
const CAM_LOOKAHEAD = 60;
const CAM_LOOKAHEAD_SPEED = 0.04;

// Character definitions
const CHARACTERS = {
  marice: {
    name: 'MARICE',
    color: '#4a7ab5',      // blue coat accent
    hatColor: '#f5e6d0',   // hair color (dark blonde/brown)
    overallColor: '#eee',  // white coat
    speed: 3.4,
    jumpPower: -11.5,
    jumpHold: 0.45,
    liftSpeed: 1.0,
    floatAbility: false,
    spriteKey: 'marice',
    desc: 'Cat mom! Balanced speed and jumping to rescue treats.',
    stats: { speed: 3, jump: 3, grab: 3 }
  },
  beatrice: {
    name: 'BEATRICE',
    color: '#1a1a1a',      // black fur
    hatColor: '#fff',      // white neck
    overallColor: '#1a1a1a',
    speed: 3.0,
    jumpPower: -13.2,
    jumpHold: 0.6,
    liftSpeed: 1.0,
    floatAbility: false,
    spriteKey: 'beatrice',
    desc: 'Graceful leaper! Highest jumps with elegant air-time.',
    stats: { speed: 2, jump: 4, grab: 3 }
  },
  alice: {
    name: 'ALICE',
    color: '#f0e8d8',      // cream/white fur
    hatColor: '#222',      // black nose mark
    overallColor: '#e8dcc8',
    speed: 4.2,
    jumpPower: -9.8,
    jumpHold: 0.35,
    liftSpeed: 1.35,
    floatAbility: false,
    spriteKey: 'alice',
    desc: 'Speedy pouncer! Fastest runner with strong grabbing.',
    stats: { speed: 4, jump: 2, grab: 4 }
  },
  olive: {
    name: 'OLIVE',
    color: '#c8b898',      // warm grey/tabby
    hatColor: '#d8c8a8',   // lighter fur
    overallColor: '#b8a888',
    speed: 2.8,
    jumpPower: -11.0,
    jumpHold: 0.5,
    liftSpeed: 0.85,
    floatAbility: true,
    floatDuration: 90,
    spriteKey: 'olive',
    desc: 'Fluffy floater! Hold jump to drift gracefully down.',
    stats: { speed: 2, jump: 3, grab: 2 }
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
  VEGE:    12,  // treat spawn tile
  DOOR:    13,  // level exit (cat door)
  COIN:    14,
  SOLID_INVISIBLE: 15,
  CARPET:  16,
  SHELF:   17
};

// Solid tiles set
const SOLID_TILES = new Set([T.GROUND, T.BRICK, T.DIRT, T.GRASS, T.SAND,
  T.PIPE_TL, T.PIPE_TR, T.PIPE_BL, T.PIPE_BR, T.SOLID_INVISIBLE,
  T.CARPET, T.SHELF]);

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
  SHYGUY:   'vacuum',
  BIRDO:    'bigdog',
  SNIFIT:   'spraybottle',
  TROUTER:  'trouter',
  NINJI:    'cucumber',
  SPARKY:   'sparky'
};

// Projectile types
const PROJ_TYPES = {
  VEGGIE:     'treat',
  BIRDO_EGG:  'tennis_ball',
  SNIFIT_BALL: 'water_spray'
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
