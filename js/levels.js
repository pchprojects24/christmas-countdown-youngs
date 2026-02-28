// ===== LEVEL SYSTEM =====

class Level {
  constructor(data) {
    this.width  = data.tiles[0].length;
    this.height = data.tiles.length;
    this.tiles  = data.tiles;
    this.widthPx  = this.width * TILE;
    this.heightPx = this.height * TILE;
    this.bgColor  = data.bgColor || '#e8d8c8';
    this.bgColor2 = data.bgColor2 || '#d8c8b8';
    this.name     = data.name || 'Room 1';
    this.music    = data.music || 'normal';
    this.enemies  = data.enemies || [];
    this.vegetables = data.vegetables || [];
    this.coins    = data.coins || [];
    this.spawnX   = (data.spawnX || 1) * TILE;
    this.spawnY   = (data.spawnY || 10) * TILE;
    this.scrollX  = 0;
    this.parallax1 = 0;
    this.parallax2 = 0;
    this.theme = data.theme || 'livingroom';
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return ty >= this.height ? T.GROUND : T.EMPTY;
    }
    return this.tiles[ty][tx];
  }

  getTileCollisions(entity) {
    const cols = [];
    const margin = 1;
    const x1 = Math.floor((entity.left + margin) / TILE);
    const x2 = Math.floor((entity.right - margin - 1) / TILE);
    const y1 = Math.floor((entity.top + margin) / TILE);
    const y2 = Math.floor((entity.bottom - 1) / TILE);

    for (let ty = y1; ty <= y2; ty++) {
      for (let tx = x1; tx <= x2; tx++) {
        const tile = this.getTile(tx, ty);
        if (SOLID_TILES.has(tile) || ONE_WAY_TILES.has(tile)) {
          cols.push({ tileX: tx, tileY: ty, tile });
        }
      }
    }
    return cols;
  }

  drawBackground(ctx, camX) {
    const W = CANVAS_W, H = CANVAS_H;

    switch(this.theme) {
      case 'livingroom':
        this._drawLivingRoomBG(ctx, camX, W, H);
        break;
      case 'kitchen':
        this._drawKitchenBG(ctx, camX, W, H);
        break;
      case 'backyard':
        this._drawBackyardBG(ctx, camX, W, H);
        break;
      case 'vetoffice':
        this._drawVetOfficeBG(ctx, camX, W, H);
        break;
      default:
        this._drawLivingRoomBG(ctx, camX, W, H);
    }
  }

  _drawLivingRoomBG(ctx, camX, W, H) {
    // Warm living room wall
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#e8d8c0');
    grad.addColorStop(1, '#d0c0a8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Wallpaper pattern (subtle)
    ctx.fillStyle = 'rgba(180,160,130,0.15)';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i+j) % 3 === 0) {
          ctx.fillRect(i*42 - (camX*0.1) % 42, j*42, 20, 20);
        }
      }
    }

    // Window with curtains (parallax)
    this.parallax1 = camX * 0.2;
    const winX = 300 - this.parallax1 % 600;
    // Window frame
    ctx.fillStyle = '#f0e8d8';
    ctx.fillRect(winX, 40, 120, 160);
    // Window glass (sky blue)
    ctx.fillStyle = '#a8d8f0';
    ctx.fillRect(winX+8, 48, 104, 144);
    // Window cross bars
    ctx.fillStyle = '#f0e8d8';
    ctx.fillRect(winX+56, 48, 8, 144);
    ctx.fillRect(winX+8, 116, 104, 8);
    // Curtains
    ctx.fillStyle = '#c04040';
    ctx.fillRect(winX-10, 32, 20, 176);
    ctx.fillRect(winX+110, 32, 20, 176);
    // Curtain rod
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(winX-16, 30, 152, 6);

    // Family photos on wall (parallax)
    this._drawWallDecor(ctx, camX);

    // Baseboard
    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(0, H-80, W, 6);
  }

  _drawKitchenBG(ctx, camX, W, H) {
    // Kitchen walls (lighter, clean)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#f0ece4');
    grad.addColorStop(1, '#e0d8c8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Tile backsplash
    ctx.fillStyle = 'rgba(200,210,220,0.3)';
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 6; j++) {
        ctx.fillRect(i*28 - (camX*0.15) % 28, 60+j*28, 26, 26);
      }
    }

    // Cabinets (upper)
    this.parallax1 = camX * 0.15;
    for (let i = 0; i < 4; i++) {
      const cx = (i * 200 - this.parallax1 % 800 + 800) % 800;
      ctx.fillStyle = '#a08060';
      ctx.fillRect(cx, 20, 140, 100);
      ctx.fillStyle = '#b09070';
      ctx.fillRect(cx+4, 24, 132, 92);
      // Handles
      ctx.fillStyle = '#ccc';
      ctx.fillRect(cx+62, 60, 16, 4);
    }

    // Counter line
    ctx.fillStyle = '#d4c4a4';
    ctx.fillRect(0, H-120, W, 8);
  }

  _drawBackyardBG(ctx, camX, W, H) {
    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#6ab0e8');
    grad.addColorStop(0.6, '#90d0f0');
    grad.addColorStop(1, '#c0e8a0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    this.parallax1 = camX * 0.3;
    this._drawClouds(ctx, this.parallax1, H);

    // Trees in background
    this.parallax2 = camX * 0.5;
    this._drawTrees(ctx, this.parallax2, H);

    // Fence
    ctx.fillStyle = '#c8a878';
    for (let i = 0; i < 30; i++) {
      const fx = i * 36 - (camX * 0.6) % (36*10);
      const adjFx = ((fx % (36*10)) + 36*10) % (36*10);
      if (adjFx < W + 36) {
        // Fence post
        ctx.fillRect(adjFx, H-200, 8, 80);
        // Fence board
        ctx.fillStyle = '#d8b888';
        ctx.fillRect(adjFx-4, H-190, 36, 6);
        ctx.fillRect(adjFx-4, H-160, 36, 6);
        ctx.fillStyle = '#c8a878';
      }
    }
  }

  _drawVetOfficeBG(ctx, camX, W, H) {
    // Clinical white/blue walls
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#e8f0f8');
    grad.addColorStop(1, '#d0e0f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Medical posters
    this.parallax1 = camX * 0.1;
    for (let i = 0; i < 3; i++) {
      const px2 = (i * 280 - this.parallax1 % 840 + 840) % 840;
      // Poster frame
      ctx.fillStyle = '#bbb';
      ctx.fillRect(px2, 40, 100, 80);
      ctx.fillStyle = '#fff';
      ctx.fillRect(px2+4, 44, 92, 72);
      // Cat silhouette on poster
      ctx.fillStyle = '#dde8f0';
      ctx.beginPath();
      ctx.ellipse(px2+50, 75, 20, 18, 0, 0, Math.PI*2);
      ctx.fill();
      // Cross symbol
      ctx.fillStyle = '#e04040';
      ctx.fillRect(px2+44, 60, 12, 30);
      ctx.fillRect(px2+34, 70, 32, 10);
    }

    // Floor line
    ctx.fillStyle = '#a0b0c0';
    ctx.fillRect(0, H-80, W, 4);
    // Baseboard
    ctx.fillStyle = '#88a0b8';
    ctx.fillRect(0, H-76, W, 8);
  }

  _drawClouds(ctx, offX, H) {
    const clouds = [
      {x: 60, y: 40, r: 28}, {x: 240, y: 25, r: 20},
      {x: 420, y: 55, r: 34}, {x: 600, y: 30, r: 22},
      {x: 750, y: 50, r: 26}, {x: 950, y: 38, r: 30},
      {x: 1100, y: 20, r: 18}, {x: 1300, y: 45, r: 32}
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

  _drawTrees(ctx, offX, H) {
    const trees = [
      {x: 100, h: 120}, {x: 300, h: 100}, {x: 500, h: 130},
      {x: 700, h: 110}, {x: 900, h: 125}
    ];
    for (const tr of trees) {
      const x = ((tr.x - offX % (this.widthPx)) + this.widthPx) % this.widthPx;
      if (x < -100 || x > CANVAS_W + 100) continue;
      // Trunk
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(x-6, H-tr.h, 12, tr.h*0.5);
      // Foliage
      ctx.fillStyle = 'rgba(60, 130, 40, 0.6)';
      ctx.beginPath();
      ctx.arc(x, H-tr.h, tr.h*0.35, 0, Math.PI*2);
      ctx.arc(x-15, H-tr.h+15, tr.h*0.25, 0, Math.PI*2);
      ctx.arc(x+15, H-tr.h+15, tr.h*0.25, 0, Math.PI*2);
      ctx.fill();
    }
  }

  _drawWallDecor(ctx, camX) {
    const decor = [
      {x: 100, y: 60, w: 50, h: 40},
      {x: 500, y: 50, w: 60, h: 50},
      {x: 700, y: 70, w: 40, h: 40}
    ];
    const offX = camX * 0.15;
    for (const d of decor) {
      const x = ((d.x - offX % 800) + 800) % 800;
      if (x < -80 || x > CANVAS_W + 80) continue;
      // Frame
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(x, d.y, d.w, d.h);
      // Photo/art (warm toned)
      ctx.fillStyle = '#c8b8a0';
      ctx.fillRect(x+3, d.y+3, d.w-6, d.h-6);
      // Little cat silhouette in frame
      ctx.fillStyle = '#a09080';
      ctx.beginPath();
      ctx.ellipse(x+d.w/2, d.y+d.h/2+4, 8, 6, 0, 0, Math.PI*2);
      ctx.fill();
      // Cat ears
      ctx.beginPath();
      ctx.moveTo(x+d.w/2-6, d.y+d.h/2-2);
      ctx.lineTo(x+d.w/2-3, d.y+d.h/2-8);
      ctx.lineTo(x+d.w/2, d.y+d.h/2-2);
      ctx.moveTo(x+d.w/2, d.y+d.h/2-2);
      ctx.lineTo(x+d.w/2+3, d.y+d.h/2-8);
      ctx.lineTo(x+d.w/2+6, d.y+d.h/2-2);
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
function makeRow(width, fill = T.EMPTY) {
  return new Array(width).fill(fill);
}

function buildRow(width, specs) {
  const row = makeRow(width, T.EMPTY);
  for (const [x1, x2, tid] of specs) {
    for (let x = x1; x <= x2; x++) row[x] = tid;
  }
  return row;
}

// ===========================
// LEVEL 1: THE LIVING ROOM
// ===========================
function createLevel1() {
  const W = 80;
  const H = 25;
  const rows = [];
  for (let r = 0; r < H; r++) rows.push(makeRow(W));

  // Row 22-24: Main hardwood floor (pits for challenge)
  rows[22] = buildRow(W, [[0,8,T.GROUND],[11,27,T.GROUND],[30,46,T.GROUND],[49,66,T.GROUND],[68,79,T.GROUND]]);
  rows[23] = buildRow(W, [[0,8,T.DIRT],[11,27,T.DIRT],[30,46,T.DIRT],[49,66,T.DIRT],[68,79,T.DIRT]]);
  rows[24] = buildRow(W, [[0,8,T.DIRT],[11,27,T.DIRT],[30,46,T.DIRT],[49,66,T.DIRT],[68,79,T.DIRT]]);

  // Row 19: Lower shelves (1 tile thick — 2 clear rows above floor for player to walk)
  // Leave door area (col 76+) clear of shelves so exit is reachable
  rows[19] = buildRow(W, [[1,8,T.SHELF],[12,20,T.SHELF],[30,38,T.SHELF],[44,53,T.SHELF],[58,67,T.SHELF],[71,74,T.SHELF]]);

  // Row 15: Cloud cushions (one-way — 3 clear rows above lower shelves)
  rows[15] = buildRow(W, [[0,7,T.CLOUD],[14,22,T.CLOUD],[32,41,T.CLOUD],[47,56,T.CLOUD],[62,70,T.CLOUD]]);

  // Row 11: Mid shelves (1 tile thick — 3 clear rows above clouds)
  rows[11] = buildRow(W, [[4,12,T.SHELF],[20,29,T.SHELF],[37,46,T.SHELF],[53,62,T.SHELF],[67,76,T.SHELF]]);

  // Row 7: High cloud cushions (one-way — 3 clear rows above mid shelves)
  rows[7] = buildRow(W, [[8,16,T.CLOUD],[26,35,T.CLOUD],[44,53,T.CLOUD],[61,70,T.CLOUD]]);

  // Row 3: Top shelves (1 tile thick — 3 clear rows above high clouds)
  rows[3] = buildRow(W, [[14,22,T.SHELF],[37,47,T.SHELF],[58,67,T.SHELF]]);

  // Treat spot visual markers (row 21, above floor surface)
  rows[21][4] = T.VEGE;
  rows[21][16] = T.VEGE;
  rows[21][50] = T.VEGE;
  rows[21][69] = T.VEGE;

  // Single cat door exit (row 21, far right — no shelf above blocking access)
  rows[21][77] = T.DOOR;

  return {
    tiles: rows,
    name: 'Living Room',
    theme: 'livingroom',
    bgColor: '#e8d8c0', bgColor2: '#d0c0a8',
    spawnX: 2, spawnY: 20,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 13, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.SHYGUY, tx: 24, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 36, ty: 18 },
      { type: ENEMY_TYPES.SHYGUY, tx: 47, ty: 21, color: 'pink' },
      { type: ENEMY_TYPES.SNIFIT, tx: 57, ty: 21 },
      { type: ENEMY_TYPES.NINJI,  tx: 66, ty: 14 },
      { type: ENEMY_TYPES.SHYGUY, tx: 70, ty: 21, color: 'green' },
    ],
    vegetables: [
      // Floor level (ty=22)
      { tx: 4,  ty: 22, type: 'yarn' },
      { tx: 16, ty: 22, type: 'mouse' },
      { tx: 50, ty: 22, type: 'feather' },
      { tx: 69, ty: 22, type: 'yarn' },
      // Lower shelf level (ty=19)
      { tx: 3,  ty: 19, type: 'mouse' },
      { tx: 15, ty: 19, type: 'yarn' },
      { tx: 33, ty: 19, type: 'feather' },
      { tx: 47, ty: 19, type: 'yarn' },
      { tx: 62, ty: 19, type: 'mouse' },
      // Mid shelf level (ty=11)
      { tx: 7,  ty: 11, type: 'feather' },
      { tx: 24, ty: 11, type: 'yarn' },
      { tx: 42, ty: 11, type: 'mouse' },
    ],
    coins: [
      // Coins floating in gap between clouds (row 15) and shelves (row 19)
      {tx:4,ty:17},{tx:5,ty:17},{tx:6,ty:17},
      {tx:14,ty:17},{tx:15,ty:17},{tx:16,ty:17},
      {tx:32,ty:17},{tx:33,ty:17},
      {tx:46,ty:17},{tx:47,ty:17},
      // Coins in gap between top shelves (row 3) and high clouds (row 7)
      {tx:28,ty:5},{tx:29,ty:5},
      {tx:47,ty:5},{tx:48,ty:5},
    ]
  };
}

// ===========================
// LEVEL 2: THE KITCHEN
// ===========================
function createLevel2() {
  const W = 90;
  const H = 25;
  const rows = [];
  for (let r = 0; r < H; r++) rows.push(makeRow(W));

  // Row 22-24: Kitchen tile floor (with pits)
  rows[22] = buildRow(W, [[0,9,T.BRICK],[13,29,T.BRICK],[33,50,T.BRICK],[54,70,T.BRICK],[74,89,T.BRICK]]);
  rows[23] = buildRow(W, [[0,9,T.DIRT],[13,29,T.DIRT],[33,50,T.DIRT],[54,70,T.DIRT],[74,89,T.DIRT]]);
  rows[24] = buildRow(W, [[0,9,T.DIRT],[13,29,T.DIRT],[33,50,T.DIRT],[54,70,T.DIRT],[74,89,T.DIRT]]);

  // Row 19: Counter platforms (1 tile thick — 2 clear rows above floor)
  // Leave door area (col 86+) clear of platforms so exit is reachable
  rows[19] = buildRow(W, [[1,9,T.SAND],[14,22,T.SAND],[32,41,T.SAND],[46,55,T.SAND],[60,69,T.SAND],[75,84,T.SAND]]);

  // Row 15: Cloud stepping platforms (one-way — 3 clear rows above counters)
  rows[15] = buildRow(W, [[0,8,T.CLOUD],[16,24,T.CLOUD],[34,43,T.CLOUD],[49,58,T.CLOUD],[65,74,T.CLOUD]]);

  // Row 11: Upper counters/cabinets (1 tile thick — 3 clear rows above clouds)
  rows[11] = buildRow(W, [[4,13,T.SAND],[21,30,T.SAND],[40,49,T.SAND],[56,65,T.SAND],[72,83,T.SAND]]);

  // Row 7: High cloud platforms (one-way — 3 clear rows above upper counters)
  rows[7] = buildRow(W, [[9,18,T.CLOUD],[29,38,T.CLOUD],[50,59,T.CLOUD],[67,76,T.CLOUD]]);

  // Row 3: Top cabinet shelves (1 tile thick — 3 clear rows above high clouds)
  rows[3] = buildRow(W, [[15,24,T.SAND],[42,52,T.SAND],[63,73,T.SAND]]);

  // Treat spot visual markers (row above floor)
  rows[21][5]  = T.VEGE;
  rows[21][20] = T.VEGE;
  rows[21][58] = T.VEGE;
  rows[21][77] = T.VEGE;

  // Single cat door exit (row 21, far right — no platform above blocking access)
  rows[21][87] = T.DOOR;

  return {
    tiles: rows,
    name: 'Kitchen',
    theme: 'kitchen',
    bgColor: '#f0ece4', bgColor2: '#e0d8c8',
    spawnX: 1, spawnY: 20,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 14, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 23, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 34, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,   tx: 46, ty: 18 },
      { type: ENEMY_TYPES.SNIFIT,  tx: 58, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 67, ty: 21, color: 'pink' },
      { type: ENEMY_TYPES.NINJI,   tx: 77, ty: 14 },
      { type: ENEMY_TYPES.SHYGUY, tx: 81, ty: 21, color: 'green' },
    ],
    vegetables: [
      // Floor level (ty=22)
      { tx: 5,  ty: 22, type: 'yarn' },
      { tx: 20, ty: 22, type: 'mouse' },
      { tx: 58, ty: 22, type: 'feather' },
      { tx: 77, ty: 22, type: 'yarn' },
      // Counter level (ty=19)
      { tx: 4,  ty: 19, type: 'mouse' },
      { tx: 17, ty: 19, type: 'yarn' },
      { tx: 35, ty: 19, type: 'feather' },
      { tx: 49, ty: 19, type: 'yarn' },
      { tx: 63, ty: 19, type: 'mouse' },
      { tx: 78, ty: 19, type: 'feather' },
      // Upper cabinet level (ty=11)
      { tx: 7,  ty: 11, type: 'feather' },
      { tx: 25, ty: 11, type: 'yarn' },
      { tx: 44, ty: 11, type: 'mouse' },
    ],
    coins: [
      // Coins in gap between clouds (row 15) and counters (row 19)
      {tx:4,ty:17},{tx:5,ty:17},{tx:6,ty:17},
      {tx:16,ty:17},{tx:17,ty:17},
      {tx:35,ty:17},{tx:36,ty:17},
      {tx:48,ty:17},{tx:49,ty:17},
      // Coins in gap between top cabinets (row 3) and high clouds (row 7)
      {tx:62,ty:9},{tx:63,ty:9},
      {tx:34,ty:9},{tx:35,ty:9},
    ]
  };
}

// ===========================
// LEVEL 3: THE BACKYARD (Big Dog Boss)
// ===========================
function createLevel3() {
  const W = 70;
  const H = 25;
  const rows = [];
  for (let r = 0; r < H; r++) rows.push(makeRow(W));

  // Row 22-24: Grass ground (with a couple pits)
  rows[22] = buildRow(W, [[0,8,T.GRASS],[12,28,T.GRASS],[32,48,T.GRASS],[52,62,T.GRASS],[65,69,T.GRASS]]);
  rows[23] = buildRow(W, [[0,8,T.DIRT],[12,28,T.DIRT],[32,48,T.DIRT],[52,62,T.DIRT],[65,69,T.DIRT]]);
  rows[24] = buildRow(W, [[0,8,T.DIRT],[12,28,T.DIRT],[32,48,T.DIRT],[52,62,T.DIRT],[65,69,T.DIRT]]);

  // Row 19: Low stumps/rocks (1 tile thick — 2 clear rows above ground)
  rows[19] = buildRow(W, [[1,8,T.GRASS],[14,21,T.GRASS],[31,39,T.GRASS],[44,52,T.GRASS],[56,63,T.GRASS]]);

  // Row 15: Cloud platforms (one-way — 3 clear rows above stumps)
  rows[15] = buildRow(W, [[0,7,T.CLOUD],[13,21,T.CLOUD],[30,39,T.CLOUD],[45,54,T.CLOUD],[59,69,T.CLOUD]]);

  // Row 11: Higher rocks/tree trunks (1 tile thick — 3 clear rows above clouds)
  rows[11] = buildRow(W, [[4,12,T.GRASS],[20,28,T.GRASS],[36,45,T.GRASS],[51,60,T.GRASS]]);

  // Row 7: High cloud platforms (one-way — 3 clear rows above rocks)
  rows[7] = buildRow(W, [[8,16,T.CLOUD],[26,35,T.CLOUD],[44,53,T.CLOUD],[58,69,T.CLOUD]]);

  // Row 3: Tree top platforms (1 tile thick — 3 clear rows above high clouds)
  rows[3] = buildRow(W, [[14,22,T.GRASS],[37,47,T.GRASS],[55,65,T.GRASS]]);

  // Treat spot visual markers
  rows[21][5]  = T.VEGE;
  rows[21][20] = T.VEGE;
  rows[21][47] = T.VEGE;
  rows[21][62] = T.VEGE;

  // No door - level exits via boss defeat

  return {
    tiles: rows,
    name: 'Backyard',
    theme: 'backyard',
    bgColor: '#6ab0e8', bgColor2: '#90d0f0',
    spawnX: 2, spawnY: 20,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 13, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 22, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 33, ty: 21, color: 'pink' },
      { type: ENEMY_TYPES.SNIFIT, tx: 44, ty: 21 },
      { type: ENEMY_TYPES.BIRDO,  tx: 55, ty: 20 },
    ],
    vegetables: [
      // Ground level (ty=22)
      { tx: 5,  ty: 22, type: 'yarn' },
      { tx: 20, ty: 22, type: 'mouse' },
      { tx: 47, ty: 22, type: 'feather' },
      { tx: 62, ty: 22, type: 'yarn' },
      // Low stump level (ty=19)
      { tx: 4,  ty: 19, type: 'mouse' },
      { tx: 17, ty: 19, type: 'yarn' },
      { tx: 34, ty: 19, type: 'feather' },
      { tx: 48, ty: 19, type: 'yarn' },
      { tx: 59, ty: 19, type: 'mouse' },
      // Higher rock level (ty=11)
      { tx: 7,  ty: 11, type: 'feather' },
      { tx: 24, ty: 11, type: 'yarn' },
      { tx: 40, ty: 11, type: 'mouse' },
    ],
    coins: [
      // Coins in gap between clouds (row 15) and stumps (row 19)
      {tx:4,ty:17},{tx:5,ty:17},{tx:6,ty:17},
      {tx:16,ty:17},{tx:17,ty:17},
      {tx:33,ty:17},{tx:34,ty:17},
      {tx:46,ty:17},{tx:47,ty:17},
      // Coins in gap between top platforms (row 3) and high clouds (row 7)
      {tx:28,ty:5},{tx:29,ty:5},
      {tx:45,ty:5},{tx:46,ty:5},
    ]
  };
}

// ===========================
// LEVEL 4: THE VET'S OFFICE (Final Boss)
// ===========================
function createLevel4() {
  const W = 60;
  const H = 25;
  const rows = [];
  for (let r = 0; r < H; r++) rows.push(makeRow(W));

  // Row 22-24: Tile floor (with a pit near the start to add tension)
  rows[22] = buildRow(W, [[0,7,T.BRICK],[11,27,T.BRICK],[30,46,T.BRICK],[49,59,T.BRICK]]);
  rows[23] = buildRow(W, [[0,7,T.DIRT],[11,27,T.DIRT],[30,46,T.DIRT],[49,59,T.DIRT]]);
  rows[24] = buildRow(W, [[0,7,T.DIRT],[11,27,T.DIRT],[30,46,T.DIRT],[49,59,T.DIRT]]);

  // Row 19: Exam tables (1 tile thick — 2 clear rows above floor)
  rows[19] = buildRow(W, [[1,8,T.BRICK],[13,21,T.BRICK],[29,38,T.BRICK],[43,51,T.BRICK],[55,59,T.BRICK]]);

  // Row 15: Cloud platforms (one-way — 3 clear rows above exam tables)
  rows[15] = buildRow(W, [[0,7,T.CLOUD],[14,22,T.CLOUD],[31,39,T.CLOUD],[46,54,T.CLOUD]]);

  // Row 11: Cabinet shelves (1 tile thick — 3 clear rows above clouds)
  rows[11] = buildRow(W, [[4,12,T.BRICK],[20,29,T.BRICK],[36,45,T.BRICK],[52,59,T.BRICK]]);

  // Row 7: High cloud platforms (one-way — 3 clear rows above cabinets)
  rows[7] = buildRow(W, [[8,16,T.CLOUD],[26,35,T.CLOUD],[44,53,T.CLOUD]]);

  // Row 3: Top cabinets (1 tile thick — 3 clear rows above high clouds)
  rows[3] = buildRow(W, [[14,22,T.BRICK],[37,47,T.BRICK]]);

  // Treat spot visual markers (row 21, above floor)
  rows[21][4]  = T.VEGE;
  rows[21][18] = T.VEGE;
  rows[21][42] = T.VEGE;

  // No door tile needed - level 4 exits via boss (Wart) defeat

  return {
    tiles: rows,
    name: "Vet's Office",
    theme: 'vetoffice',
    bgColor: '#e8f0f8', bgColor2: '#d0e0f0',
    spawnX: 2, spawnY: 20,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 12, ty: 21, color: 'red' },
      { type: ENEMY_TYPES.NINJI,  tx: 22, ty: 21 },
      { type: ENEMY_TYPES.SNIFIT, tx: 31, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 40, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 51, ty: 14 },
      { type: ENEMY_TYPES.WART,   tx: 50, ty: 21 },
    ],
    vegetables: [
      // Floor level (ty=22)
      { tx: 4,  ty: 22, type: 'yarn' },
      { tx: 18, ty: 22, type: 'mouse' },
      { tx: 42, ty: 22, type: 'feather' },
      // Exam table level (ty=19)
      { tx: 4,  ty: 19, type: 'mouse' },
      { tx: 16, ty: 19, type: 'yarn' },
      { tx: 32, ty: 19, type: 'feather' },
      { tx: 47, ty: 19, type: 'yarn' },
      { tx: 57, ty: 19, type: 'mouse' },
      // Cabinet shelf level (ty=11)
      { tx: 7,  ty: 11, type: 'feather' },
      { tx: 24, ty: 11, type: 'yarn' },
      { tx: 40, ty: 11, type: 'mouse' },
    ],
    coins: [
      // Coins in gap between clouds (row 15) and exam tables (row 19)
      {tx:3,ty:17},{tx:4,ty:17},{tx:5,ty:17},
      {tx:15,ty:17},{tx:16,ty:17},
      {tx:31,ty:17},{tx:32,ty:17},
      {tx:45,ty:17},{tx:46,ty:17},
      // Coins in gap between top cabinets (row 3) and high clouds (row 7)
      {tx:28,ty:5},{tx:29,ty:5},
    ]
  };
}

const LEVEL_BUILDERS = [createLevel1, createLevel2, createLevel3, createLevel4];
