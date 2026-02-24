// ===== GAME CONSTANTS =====
const TILE = 32;          // tile size in pixels
const GRAVITY = 0.55;
const TERMINAL_VEL = 14;
const CANVAS_W = 800;
const CANVAS_H = 800;

// Physics tuning - Improved for better feel and responsiveness
const COYOTE_FRAMES = 8;           // Increased from 6 for more forgiving jumps
const JUMP_BUFFER_FRAMES = 10;     // Increased from 8 for more responsive input
const APEX_THRESHOLD = 2.5;        // Increased from 2.0 for more hang time
const APEX_GRAVITY_MULT = 0.35;    // Reduced from 0.4 for stronger apex hang
const GROUND_ACCEL = 0.7;          // Increased from 0.65 for snappier movement
const GROUND_DECEL = 0.75;         // Reduced from 0.78 for more control
const AIR_ACCEL = 0.5;             // Increased from 0.45 for better air control
const AIR_DECEL = 0.90;            // Reduced from 0.92 for more air momentum
const JUMP_CUT_MULT = 0.5;         // New: Jump cut when releasing jump button
const CAM_LOOKAHEAD = 60;
const CAM_LOOKAHEAD_SPEED = 0.04;

// Character definitions
const CHARACTERS = {
  marice: {
    name: 'MARICE',
    color: '#4a7ab5',      // blue coat accent
    hatColor: '#f5e6d0',   // hair color (dark blonde/brown)
    overallColor: '#eee',  // white coat
    speed: 3.5,            // Slightly increased for better feel
    jumpPower: -12.0,      // Increased for more height
    jumpHold: 0.48,        // Slightly increased for smoother control
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
    speed: 3.2,            // Increased from 3.0 for better mobility
    jumpPower: -13.5,      // Slightly increased for higher jumps
    jumpHold: 0.62,        // Increased for more control at apex
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
    speed: 4.3,            // Slightly increased for speedier feel
    jumpPower: -10.5,      // Increased from -9.8 for more viable jumps
    jumpHold: 0.38,        // Slightly increased for better control
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
    speed: 3.0,            // Increased from 2.8 for better mobility
    jumpPower: -11.5,      // Increased from -11.0 for better jumps
    jumpHold: 0.52,        // Increased for smoother control
    liftSpeed: 0.85,
    floatAbility: true,
    floatDuration: 100,    // Increased from 90 for more float time
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
