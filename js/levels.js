// ===== LEVEL SYSTEM =====

class Level {
  constructor(data) {
    this.width  = data.tiles[0].length;
    this.height = data.tiles.length;
    this.tiles  = data.tiles;
    this.widthPx  = this.width * TILE;
    this.heightPx = this.height * TILE;
    this.bgColor  = data.bgColor || '#5ac8f5';
    this.bgColor2 = data.bgColor2 || '#a0d8f0';
    this.name     = data.name || 'World 1-1';
    this.music    = data.music || 'normal';
    this.enemies  = data.enemies || [];
    this.vegetables = data.vegetables || [];
    this.coins    = data.coins || [];
    this.spawnX   = (data.spawnX || 1) * TILE;
    this.spawnY   = (data.spawnY || 10) * TILE;
    this.scrollX  = 0;
    this.parallax1 = 0; // cloud layer
    this.parallax2 = 0; // mountain layer
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return ty >= this.height ? T.GROUND : T.EMPTY;
    }
    return this.tiles[ty][tx];
  }

  getTileCollisions(entity) {
    const cols = [];
    const margin = 2;
    const x1 = Math.floor((entity.left + margin) / TILE);
    const x2 = Math.floor((entity.right - margin - 1) / TILE);
    const y1 = Math.floor((entity.top + margin) / TILE);
    const y2 = Math.floor((entity.bottom - 1) / TILE);

    for (let ty = y1; ty <= y2; ty++) {
      for (let tx = x1; tx <= x2; tx++) {
        const tile = this.getTile(tx, ty);
        if (SOLID_TILES.has(tile)) {
          cols.push({ tileX: tx, tileY: ty, tile });
        }
      }
    }
    return cols;
  }

  drawBackground(ctx, camX) {
    const W = CANVAS_W, H = CANVAS_H;
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, this.bgColor);
    grad.addColorStop(1, this.bgColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Parallax clouds
    this.parallax1 = camX * 0.3;
    this._drawClouds(ctx, this.parallax1, H);

    // Parallax mountains / hills
    this.parallax2 = camX * 0.6;
    this._drawHills(ctx, this.parallax2, H);
  }

  _drawClouds(ctx, offX, H) {
    const clouds = [
      {x: 60, y: 40, r: 28},
      {x: 240, y: 25, r: 20},
      {x: 420, y: 55, r: 34},
      {x: 600, y: 30, r: 22},
      {x: 750, y: 50, r: 26},
      {x: 950, y: 38, r: 30},
      {x: 1100, y: 20, r: 18},
      {x: 1300, y: 45, r: 32}
    ];
    for (const cl of clouds) {
      const x = ((cl.x - offX % (this.widthPx)) + this.widthPx) % this.widthPx;
      if (x < -80 || x > CANVAS_W + 80) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(x, cl.y, cl.r, 0, Math.PI*2);
      ctx.arc(x - cl.r*0.6, cl.y + cl.r*0.3, cl.r*0.65, 0, Math.PI*2);
      ctx.arc(x + cl.r*0.6, cl.y + cl.r*0.3, cl.r*0.65, 0, Math.PI*2);
      ctx.fill();
    }
  }

  _drawHills(ctx, offX, H) {
    const hills = [
      {x: 100, h: 80, w: 120},
      {x: 350, h: 60, w: 100},
      {x: 600, h: 90, w: 140},
      {x: 850, h: 70, w: 110},
      {x: 1100, h: 85, w: 130}
    ];
    for (const hi of hills) {
      const x = ((hi.x - offX % (this.widthPx)) + this.widthPx) % this.widthPx;
      if (x < -200 || x > CANVAS_W + 200) continue;
      ctx.fillStyle = 'rgba(80, 160, 50, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x, H - hi.h*0.5, hi.w*0.5, hi.h*0.5, 0, 0, Math.PI*2);
      ctx.fill();
    }
  }

  drawTiles(ctx, camX) {
    const startTX = Math.max(0, Math.floor(camX / TILE) - 1);
    const endTX   = Math.min(this.width, startTX + Math.ceil(CANVAS_W / TILE) + 2);

    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = startTX; tx < endTX; tx++) {
        const tile = this.tiles[ty][tx];
        if (tile === T.EMPTY) continue;
        const px = tx * TILE - camX;
        const py = ty * TILE;
        drawTile(ctx, tile, px, py);
      }
    }
  }
}

// ===== LEVEL DATA =====
// Using shorthand: build map rows as arrays of tile IDs
// Each level is 25 rows tall (25*32=800px), variable width

function makeRow(width, fill = T.EMPTY) {
  return new Array(width).fill(fill);
}

function buildRow(width, specs) {
  // specs: [[startX, endX, tileId], ...]
  const row = makeRow(width, T.EMPTY);
  for (const [x1, x2, tid] of specs) {
    for (let x = x1; x <= x2; x++) row[x] = tid;
  }
  return row;
}

// ===========================
// LEVEL 1-1: Grass Plains
// ===========================
function createLevel1() {
  const W = 80;
  const rows = [];
  // Sky rows
  for (let r = 0; r < 8; r++) rows.push(makeRow(W));
  // Row 8: clouds as platforms
  rows.push(buildRow(W, [[10,13,T.CLOUD],[22,25,T.CLOUD],[35,39,T.CLOUD],[55,58,T.CLOUD],[68,72,T.CLOUD]]));
  // Row 9: empty
  rows.push(makeRow(W));
  // Row 10: floating platforms
  rows.push(buildRow(W, [[5,8,T.BRICK],[18,22,T.BRICK],[30,34,T.BRICK],[45,50,T.BRICK],[62,67,T.BRICK]]));
  // Row 11-13: empty
  for (let r = 0; r < 3; r++) rows.push(makeRow(W));
  // Row 14: main platform level
  rows.push(buildRow(W, [[0,4,T.GRASS],[8,14,T.GRASS],[20,28,T.GRASS],[33,40,T.GRASS],[44,52,T.GRASS],[57,65,T.GRASS],[70,79,T.GRASS]]));
  // Row 15: dirt under grass
  rows.push(buildRow(W, [[0,4,T.DIRT],[8,14,T.DIRT],[20,28,T.DIRT],[33,40,T.DIRT],[44,52,T.DIRT],[57,65,T.DIRT],[70,79,T.DIRT]]));
  // Row 16-17
  for (let r = 0; r < 2; r++) rows.push(makeRow(W));
  // Row 18: lower platform
  rows.push(buildRow(W, [[0,9,T.GRASS],[12,19,T.GRASS],[23,32,T.GRASS],[38,48,T.GRASS],[52,60,T.GRASS],[64,79,T.GRASS]]));
  rows.push(buildRow(W, [[0,9,T.DIRT],[12,19,T.DIRT],[23,32,T.DIRT],[38,48,T.DIRT],[52,60,T.DIRT],[64,79,T.DIRT]]));
  // Row 20-21 empty
  for (let r = 0; r < 2; r++) rows.push(makeRow(W));
  // Row 22: ground floor
  rows.push(buildRow(W, [[0,79,T.GROUND]]));
  rows.push(buildRow(W, [[0,79,T.DIRT]]));
  rows.push(buildRow(W, [[0,79,T.DIRT]]));

  // Add veggie tiles at certain platform edges
  rows[13] = buildRow(W, [
    [5,5,T.VEGE],[18,18,T.VEGE],[31,31,T.VEGE],[47,47,T.VEGE],[63,63,T.VEGE]
  ]);

  // Door at end
  rows[21][77] = T.DOOR;

  return {
    tiles: rows,
    name: 'World 1-1',
    bgColor: '#5ac8f5', bgColor2: '#a0e8ff',
    spawnX: 2, spawnY: 20,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 14, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.SHYGUY, tx: 25, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.SHYGUY, tx: 35, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.NINJI,  tx: 42, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 50, ty: 21, color: 'pink' },
      { type: ENEMY_TYPES.SHYGUY, tx: 60, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.NINJI,  tx: 68, ty: 17 },
      { type: ENEMY_TYPES.SHYGUY, tx: 72, ty: 21, color: 'green' },
    ],
    vegetables: [
      { tx: 5, ty: 13, type: 'turnip' },
      { tx: 18, ty: 13, type: 'carrot' },
      { tx: 31, ty: 13, type: 'radish' },
      { tx: 47, ty: 13, type: 'turnip' },
      { tx: 63, ty: 13, type: 'carrot' },
      // Ground level veggies
      { tx: 9, ty: 21, type: 'turnip' },
      { tx: 20, ty: 21, type: 'radish' },
      { tx: 45, ty: 21, type: 'turnip' },
      { tx: 58, ty: 21, type: 'carrot' },
    ],
    coins: [
      {tx:6,ty:9},{tx:7,ty:9},{tx:8,ty:9},
      {tx:19,ty:9},{tx:20,ty:9},{tx:21,ty:9},
      {tx:36,ty:9},{tx:37,ty:9},{tx:38,ty:9},
      {tx:46,ty:9},{tx:47,ty:9},{tx:48,ty:9},
    ]
  };
}

// ===========================
// LEVEL 1-2: Desert Ruins
// ===========================
function createLevel2() {
  const W = 90;
  const rows = [];
  for (let r = 0; r < 6; r++) rows.push(makeRow(W));
  // Clouds
  rows.push(buildRow(W, [[8,11,T.CLOUD],[25,28,T.CLOUD],[45,48,T.CLOUD],[65,68,T.CLOUD],[80,84,T.CLOUD]]));
  rows.push(makeRow(W));
  // Stair-like platforms
  rows.push(buildRow(W, [[2,5,T.SAND],[10,14,T.SAND],[18,22,T.SAND],[30,35,T.SAND],[42,48,T.SAND],[55,62,T.SAND],[68,76,T.SAND],[82,89,T.SAND]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,6,T.SAND],[12,18,T.SAND],[24,30,T.SAND],[36,43,T.SAND],[50,58,T.SAND],[64,72,T.SAND],[78,89,T.SAND]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,8,T.SAND],[14,22,T.SAND],[28,36,T.SAND],[42,50,T.SAND],[56,65,T.SAND],[70,79,T.SAND],[84,89,T.SAND]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  // Pipes
  rows.push(buildRow(W, [[15,15,T.PIPE_TL],[16,16,T.PIPE_TR],[45,45,T.PIPE_TL],[46,46,T.PIPE_TR],[75,75,T.PIPE_TL],[76,76,T.PIPE_TR]]));
  rows.push(buildRow(W, [[15,15,T.PIPE_BL],[16,16,T.PIPE_BR],[45,45,T.PIPE_BL],[46,46,T.PIPE_BR],[75,75,T.PIPE_BL],[76,76,T.PIPE_BR]]));
  // Ground
  rows.push(buildRow(W, [[0,89,T.SAND]]));
  rows.push(buildRow(W, [[0,89,T.DIRT]]));
  rows.push(buildRow(W, [[0,89,T.DIRT]]));
  rows.push(buildRow(W, [[0,89,T.DIRT]]));

  // Veggie spots
  rows[8] = buildRow(W, [[3,3,T.VEGE],[12,12,T.VEGE],[20,20,T.VEGE],[32,32,T.VEGE],[44,44,T.VEGE],[57,57,T.VEGE],[70,70,T.VEGE]]);

  // Pad to 25 rows
  while (rows.length < 25) rows.push(makeRow(W));

  rows[22][87] = T.DOOR;

  return {
    tiles: rows,
    name: 'World 2-1',
    bgColor: '#e8c87a', bgColor2: '#d4a84a',
    spawnX: 1, spawnY: 20,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 12, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 20, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 30, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.SHYGUY, tx: 38, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 48, ty: 21 },
      { type: ENEMY_TYPES.NINJI,   tx: 55, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 65, ty: 21, color: 'pink' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 75, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 82, ty: 21, color: 'green' },
    ],
    vegetables: [
      { tx: 3, ty: 8, type: 'turnip' },
      { tx: 12, ty: 8, type: 'carrot' },
      { tx: 20, ty: 8, type: 'radish' },
      { tx: 32, ty: 8, type: 'turnip' },
      { tx: 44, ty: 8, type: 'carrot' },
      { tx: 57, ty: 8, type: 'turnip' },
      { tx: 70, ty: 8, type: 'radish' },
      { tx: 5, ty: 21, type: 'turnip' },
      { tx: 25, ty: 21, type: 'carrot' },
      { tx: 50, ty: 21, type: 'radish' },
      { tx: 70, ty: 21, type: 'turnip' },
    ],
    coins: [
      {tx:4,ty:7},{tx:5,ty:7},
      {tx:18,ty:7},{tx:19,ty:7},
      {tx:32,ty:7},{tx:33,ty:7},
      {tx:50,ty:7},{tx:51,ty:7},
      {tx:64,ty:7},{tx:65,ty:7},
    ]
  };
}

// ===========================
// LEVEL 1-3: Sky World (Birdo boss)
// ===========================
function createLevel3() {
  const W = 70;
  const rows = [];
  for (let r = 0; r < 5; r++) rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,5,T.CLOUD],[10,15,T.CLOUD],[20,26,T.CLOUD],[32,38,T.CLOUD],[45,52,T.CLOUD],[58,64,T.CLOUD]]));
  rows.push(makeRow(W));
  rows.push(buildRow(W, [[1,6,T.CLOUD],[12,17,T.CLOUD],[22,28,T.CLOUD],[34,41,T.CLOUD],[47,53,T.CLOUD],[58,65,T.CLOUD]]));
  rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,3,T.CLOUD],[7,12,T.CLOUD],[16,22,T.CLOUD],[26,33,T.CLOUD],[38,46,T.CLOUD],[50,58,T.CLOUD],[62,69,T.CLOUD]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,8,T.CLOUD],[12,20,T.CLOUD],[24,32,T.CLOUD],[36,44,T.CLOUD],[48,56,T.CLOUD],[60,69,T.CLOUD]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,14,T.CLOUD],[18,34,T.CLOUD],[38,54,T.CLOUD],[58,69,T.CLOUD]]));
  rows.push(makeRow(W));
  // Boss floor
  rows.push(buildRow(W, [[0,69,T.BRICK]]));
  rows.push(buildRow(W, [[0,69,T.BRICK]]));
  rows.push(buildRow(W, [[0,69,T.BRICK]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));

  // Veggie spots on cloud platforms
  rows[9] = buildRow(W, [[2,2,T.VEGE],[14,14,T.VEGE],[28,28,T.VEGE],[42,42,T.VEGE],[54,54,T.VEGE]]);

  while (rows.length < 25) rows.push(makeRow(W));

  // Door (no door - Birdo defeated opens exit)
  rows[18][67] = T.DOOR;

  return {
    tiles: rows,
    name: 'World 3-1',
    bgColor: '#1a3a8a', bgColor2: '#3a6acf',
    spawnX: 2, spawnY: 17,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 8, ty: 22, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 15, ty: 22 },
      { type: ENEMY_TYPES.SHYGUY, tx: 22, ty: 22, color: 'pink' },
      { type: ENEMY_TYPES.SNIFIT, tx: 30, ty: 22 },
      { type: ENEMY_TYPES.BIRDO,  tx: 48, ty: 20 },
    ],
    vegetables: [
      { tx: 2, ty: 9, type: 'turnip' },
      { tx: 14, ty: 9, type: 'carrot' },
      { tx: 28, ty: 9, type: 'radish' },
      { tx: 42, ty: 9, type: 'turnip' },
      { tx: 54, ty: 9, type: 'carrot' },
      { tx: 5, ty: 22, type: 'turnip' },
      { tx: 18, ty: 22, type: 'radish' },
      { tx: 35, ty: 22, type: 'carrot' },
    ],
    coins: [
      {tx:4,ty:6},{tx:5,ty:6},
      {tx:15,ty:6},{tx:16,ty:6},
      {tx:27,ty:6},{tx:28,ty:6},
      {tx:40,ty:6},{tx:41,ty:6},
    ]
  };
}

// ===========================
// LEVEL 1-4: Wart's Castle (Final Boss)
// ===========================
function createLevel4() {
  const W = 60;
  const rows = [];
  // Dark castle interior
  for (let r = 0; r < 4; r++) rows.push(makeRow(W));
  // High platforms
  rows.push(buildRow(W, [[2,8,T.BRICK],[14,20,T.BRICK],[26,32,T.BRICK],[38,44,T.BRICK],[50,57,T.BRICK]]));
  rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,5,T.BRICK],[10,16,T.BRICK],[22,28,T.BRICK],[34,40,T.BRICK],[46,58,T.BRICK]]));
  rows.push(makeRow(W));
  rows.push(buildRow(W, [[4,10,T.BRICK],[16,22,T.BRICK],[28,35,T.BRICK],[40,47,T.BRICK],[52,59,T.BRICK]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  rows.push(buildRow(W, [[0,7,T.BRICK],[12,20,T.BRICK],[24,32,T.BRICK],[36,44,T.BRICK],[48,59,T.BRICK]]));
  rows.push(makeRow(W));
  // Throne floor
  rows.push(buildRow(W, [[0,59,T.BRICK]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));

  rows[11] = buildRow(W, [[3,3,T.VEGE],[15,15,T.VEGE],[27,27,T.VEGE],[41,41,T.VEGE],[53,53,T.VEGE]]);

  while (rows.length < 25) rows.push(makeRow(W));

  rows[13][1] = T.DOOR; // Exit door (appears after Wart defeated)

  return {
    tiles: rows,
    name: 'World 4-4',
    bgColor: '#0a0a1a', bgColor2: '#1a0a2a',
    spawnX: 2, spawnY: 19,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 6,  ty: 19, color: 'red' },
      { type: ENEMY_TYPES.NINJI,  tx: 12, ty: 19 },
      { type: ENEMY_TYPES.SNIFIT, tx: 18, ty: 19 },
      { type: ENEMY_TYPES.SHYGUY, tx: 24, ty: 19, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 30, ty: 19 },
      { type: ENEMY_TYPES.SNIFIT, tx: 36, ty: 19 },
      { type: ENEMY_TYPES.WART,   tx: 44, ty: 19 },
    ],
    vegetables: [
      { tx: 3, ty: 11, type: 'turnip' },
      { tx: 15, ty: 11, type: 'carrot' },
      { tx: 27, ty: 11, type: 'radish' },
      { tx: 41, ty: 11, type: 'turnip' },
      { tx: 53, ty: 11, type: 'carrot' },
      { tx: 5, ty: 19, type: 'turnip' },
      { tx: 16, ty: 19, type: 'radish' },
      { tx: 30, ty: 19, type: 'carrot' },
    ],
    coins: [
      {tx:5,ty:3},{tx:6,ty:3},
      {tx:18,ty:3},{tx:19,ty:3},
      {tx:30,ty:3},{tx:31,ty:3},
      {tx:44,ty:3},{tx:45,ty:3},
    ]
  };
}

const LEVEL_BUILDERS = [createLevel1, createLevel2, createLevel3, createLevel4];
