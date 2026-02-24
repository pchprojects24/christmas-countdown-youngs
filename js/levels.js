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
  const rows = [];
  for (let r = 0; r < 8; r++) rows.push(makeRow(W));
  // Row 8: cushion platforms (soft spots to land on)
  rows.push(buildRow(W, [[10,13,T.CLOUD],[22,25,T.CLOUD],[35,39,T.CLOUD],[55,58,T.CLOUD],[68,72,T.CLOUD]]));
  rows.push(makeRow(W));
  // Row 10: shelf/furniture platforms
  rows.push(buildRow(W, [[5,8,T.SHELF],[18,22,T.SHELF],[30,34,T.SHELF],[45,50,T.SHELF],[62,67,T.SHELF]]));
  for (let r = 0; r < 3; r++) rows.push(makeRow(W));
  // Row 14: carpet/rug platforms
  rows.push(buildRow(W, [[0,4,T.GRASS],[8,14,T.GRASS],[20,28,T.GRASS],[33,40,T.GRASS],[44,52,T.GRASS],[57,65,T.GRASS],[70,79,T.GRASS]]));
  rows.push(buildRow(W, [[0,4,T.DIRT],[8,14,T.DIRT],[20,28,T.DIRT],[33,40,T.DIRT],[44,52,T.DIRT],[57,65,T.DIRT],[70,79,T.DIRT]]));
  for (let r = 0; r < 2; r++) rows.push(makeRow(W));
  // Row 18: lower floor platforms
  rows.push(buildRow(W, [[0,9,T.GRASS],[12,19,T.GRASS],[23,32,T.GRASS],[38,48,T.GRASS],[52,60,T.GRASS],[64,79,T.GRASS]]));
  rows.push(buildRow(W, [[0,9,T.DIRT],[12,19,T.DIRT],[23,32,T.DIRT],[38,48,T.DIRT],[52,60,T.DIRT],[64,79,T.DIRT]]));
  for (let r = 0; r < 2; r++) rows.push(makeRow(W));
  // Row 22: main hardwood floor
  rows.push(buildRow(W, [[0,79,T.GROUND]]));
  rows.push(buildRow(W, [[0,79,T.DIRT]]));
  rows.push(buildRow(W, [[0,79,T.DIRT]]));

  // Treat spots
  rows[13] = buildRow(W, [
    [5,5,T.VEGE],[18,18,T.VEGE],[31,31,T.VEGE],[47,47,T.VEGE],[63,63,T.VEGE]
  ]);

  // Cat door at end
  rows[21][77] = T.DOOR;

  return {
    tiles: rows,
    name: 'Living Room',
    theme: 'livingroom',
    bgColor: '#e8d8c0', bgColor2: '#d0c0a8',
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
      { tx: 5, ty: 13, type: 'yarn' },
      { tx: 18, ty: 13, type: 'mouse' },
      { tx: 31, ty: 13, type: 'feather' },
      { tx: 47, ty: 13, type: 'yarn' },
      { tx: 63, ty: 13, type: 'mouse' },
      { tx: 9, ty: 21, type: 'yarn' },
      { tx: 20, ty: 21, type: 'feather' },
      { tx: 45, ty: 21, type: 'yarn' },
      { tx: 58, ty: 21, type: 'mouse' },
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
// LEVEL 2: THE KITCHEN
// ===========================
function createLevel2() {
  const W = 90;
  const rows = [];
  for (let r = 0; r < 4; r++) rows.push(makeRow(W));
  // Upper cushion cloud platforms (row 4)
  rows.push(buildRow(W, [[8,12,T.CLOUD],[20,24,T.CLOUD],[33,38,T.CLOUD],[48,53,T.CLOUD],[63,68,T.CLOUD],[78,83,T.CLOUD]]));
  rows.push(makeRow(W));
  // High counter/shelf platforms (row 6)
  rows.push(buildRow(W, [[2,6,T.SAND],[10,15,T.SAND],[20,25,T.SAND],[30,36,T.SAND],[42,48,T.SAND],[54,61,T.SAND],[67,74,T.SAND],[80,87,T.SAND]]));
  rows.push(makeRow(W));
  // Mid-level platforms (row 8 - more generous spacing)
  rows.push(buildRow(W, [[0,7,T.SAND],[12,19,T.SAND],[24,31,T.SAND],[36,43,T.SAND],[48,55,T.SAND],[60,67,T.SAND],[72,79,T.SAND],[84,89,T.SAND]]));
  rows.push(makeRow(W));
  // Lower platforms (row 10 - wider platforms)
  rows.push(buildRow(W, [[0,9,T.SAND],[14,23,T.SAND],[28,37,T.SAND],[42,51,T.SAND],[56,65,T.SAND],[70,79,T.SAND],[84,89,T.SAND]]));
  rows.push(makeRow(W));
  // Additional stepping platforms for easier progression (row 12)
  rows.push(buildRow(W, [[4,11,T.CLOUD],[17,24,T.CLOUD],[30,37,T.CLOUD],[44,51,T.CLOUD],[58,65,T.CLOUD],[72,79,T.CLOUD]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  // Cat tower posts (row 15)
  rows.push(buildRow(W, [[15,15,T.PIPE_TL],[16,16,T.PIPE_TR],[45,45,T.PIPE_TL],[46,46,T.PIPE_TR],[75,75,T.PIPE_TL],[76,76,T.PIPE_TR]]));
  rows.push(buildRow(W, [[15,15,T.PIPE_BL],[16,16,T.PIPE_BR],[45,45,T.PIPE_BL],[46,46,T.PIPE_BR],[75,75,T.PIPE_BL],[76,76,T.PIPE_BR]]));
  rows.push(makeRow(W)); rows.push(makeRow(W)); rows.push(makeRow(W));
  // Kitchen tile floor (row 20)
  rows.push(buildRow(W, [[0,89,T.BRICK]]));
  rows.push(buildRow(W, [[0,89,T.DIRT]]));
  rows.push(buildRow(W, [[0,89,T.DIRT]]));
  rows.push(buildRow(W, [[0,89,T.DIRT]]));

  // Treat spots (adjusted to new row positions)
  rows[6] = buildRow(W, [[3,3,T.VEGE],[12,12,T.VEGE],[22,22,T.VEGE],[32,32,T.VEGE],[44,44,T.VEGE],[57,57,T.VEGE],[70,70,T.VEGE],[82,82,T.VEGE]]);

  while (rows.length < 25) rows.push(makeRow(W));

  rows[20][87] = T.DOOR;

  return {
    tiles: rows,
    name: 'Kitchen',
    theme: 'kitchen',
    bgColor: '#f0ece4', bgColor2: '#e0d8c8',
    spawnX: 1, spawnY: 19,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 10, ty: 19, color: 'red' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 20, ty: 19 },
      { type: ENEMY_TYPES.SHYGUY, tx: 30, ty: 19, color: 'blue' },
      { type: ENEMY_TYPES.SHYGUY, tx: 40, ty: 19, color: 'red' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 50, ty: 19 },
      { type: ENEMY_TYPES.NINJI,   tx: 58, ty: 19 },
      { type: ENEMY_TYPES.SHYGUY, tx: 68, ty: 19, color: 'pink' },
      { type: ENEMY_TYPES.SNIFIT,  tx: 76, ty: 19 },
      { type: ENEMY_TYPES.SHYGUY, tx: 84, ty: 19, color: 'green' },
    ],
    vegetables: [
      { tx: 3, ty: 6, type: 'yarn' },
      { tx: 12, ty: 6, type: 'mouse' },
      { tx: 22, ty: 6, type: 'feather' },
      { tx: 32, ty: 6, type: 'yarn' },
      { tx: 44, ty: 6, type: 'mouse' },
      { tx: 57, ty: 6, type: 'yarn' },
      { tx: 70, ty: 6, type: 'feather' },
      { tx: 82, ty: 6, type: 'mouse' },
      { tx: 5, ty: 19, type: 'yarn' },
      { tx: 26, ty: 19, type: 'mouse' },
      { tx: 53, ty: 19, type: 'feather' },
      { tx: 72, ty: 19, type: 'yarn' },
    ],
    coins: [
      {tx:10,ty:4},{tx:11,ty:4},
      {tx:22,ty:4},{tx:23,ty:4},
      {tx:35,ty:4},{tx:36,ty:4},
      {tx:50,ty:4},{tx:51,ty:4},
      {tx:65,ty:4},{tx:66,ty:4},
      {tx:80,ty:4},{tx:81,ty:4},
    ]
  };
}

// ===========================
// LEVEL 3: THE BACKYARD (Big Dog Boss)
// ===========================
function createLevel3() {
  const W = 70;
  const rows = [];
  for (let r = 0; r < 5; r++) rows.push(makeRow(W));
  // Cloud platforms with better spacing (row 5)
  rows.push(buildRow(W, [[0,6,T.CLOUD],[11,17,T.CLOUD],[22,28,T.CLOUD],[34,40,T.CLOUD],[46,53,T.CLOUD],[59,66,T.CLOUD]]));
  rows.push(makeRow(W));
  // Second row of clouds (row 7)
  rows.push(buildRow(W, [[2,7,T.CLOUD],[13,19,T.CLOUD],[24,30,T.CLOUD],[36,43,T.CLOUD],[49,56,T.CLOUD],[60,67,T.CLOUD]]));
  rows.push(makeRow(W));
  // Third row with wider platforms (row 9)
  rows.push(buildRow(W, [[0,4,T.CLOUD],[8,14,T.CLOUD],[18,25,T.CLOUD],[28,36,T.CLOUD],[40,48,T.CLOUD],[52,60,T.CLOUD],[63,69,T.CLOUD]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  // Lower platforms (row 12)
  rows.push(buildRow(W, [[0,9,T.CLOUD],[13,22,T.CLOUD],[26,35,T.CLOUD],[39,48,T.CLOUD],[52,61,T.CLOUD],[65,69,T.CLOUD]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  // Safe landing spots before ground (row 15)
  rows.push(buildRow(W, [[0,16,T.CLOUD],[20,37,T.CLOUD],[41,58,T.CLOUD],[62,69,T.CLOUD]]));
  rows.push(makeRow(W));
  // Ground (grass/dirt yard) (row 17)
  rows.push(buildRow(W, [[0,69,T.GRASS]]));
  rows.push(buildRow(W, [[0,69,T.GRASS]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));
  rows.push(buildRow(W, [[0,69,T.DIRT]]));

  // Treat spots
  rows[9] = buildRow(W, [[2,2,T.VEGE],[16,16,T.VEGE],[30,30,T.VEGE],[44,44,T.VEGE],[56,56,T.VEGE]]);

  while (rows.length < 25) rows.push(makeRow(W));

  rows[17][67] = T.DOOR;

  return {
    tiles: rows,
    name: 'Backyard',
    theme: 'backyard',
    bgColor: '#6ab0e8', bgColor2: '#90d0f0',
    spawnX: 2, spawnY: 16,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 8, ty: 21, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 16, ty: 21 },
      { type: ENEMY_TYPES.SHYGUY, tx: 24, ty: 21, color: 'pink' },
      { type: ENEMY_TYPES.SNIFIT, tx: 32, ty: 21 },
      { type: ENEMY_TYPES.BIRDO,  tx: 50, ty: 19 },
    ],
    vegetables: [
      { tx: 2, ty: 9, type: 'yarn' },
      { tx: 16, ty: 9, type: 'mouse' },
      { tx: 30, ty: 9, type: 'feather' },
      { tx: 44, ty: 9, type: 'yarn' },
      { tx: 56, ty: 9, type: 'mouse' },
      { tx: 5, ty: 21, type: 'yarn' },
      { tx: 20, ty: 21, type: 'feather' },
      { tx: 38, ty: 21, type: 'mouse' },
    ],
    coins: [
      {tx:4,ty:5},{tx:5,ty:5},
      {tx:15,ty:5},{tx:16,ty:5},
      {tx:26,ty:5},{tx:27,ty:5},
      {tx:38,ty:5},{tx:39,ty:5},
      {tx:50,ty:5},{tx:51,ty:5},
    ]
  };
}

// ===========================
// LEVEL 4: THE VET'S OFFICE (Final Boss)
// ===========================
function createLevel4() {
  const W = 60;
  const rows = [];
  for (let r = 0; r < 4; r++) rows.push(makeRow(W));
  // Examination table platforms (row 4)
  rows.push(buildRow(W, [[2,9,T.BRICK],[14,21,T.BRICK],[26,33,T.BRICK],[38,45,T.BRICK],[50,58,T.BRICK]]));
  rows.push(makeRow(W));
  // Mid-high platforms (row 6)
  rows.push(buildRow(W, [[0,6,T.BRICK],[11,18,T.BRICK],[23,30,T.BRICK],[35,42,T.BRICK],[47,59,T.BRICK]]));
  rows.push(makeRow(W));
  // Mid platforms (row 8)
  rows.push(buildRow(W, [[4,11,T.BRICK],[16,23,T.BRICK],[28,36,T.BRICK],[41,49,T.BRICK],[53,59,T.BRICK]]));
  rows.push(makeRow(W)); rows.push(makeRow(W));
  // Lower platforms (row 11)
  rows.push(buildRow(W, [[0,8,T.BRICK],[12,21,T.BRICK],[25,34,T.BRICK],[38,47,T.BRICK],[51,59,T.BRICK]]));
  rows.push(makeRow(W));
  // Main tile floor (row 13)
  rows.push(buildRow(W, [[0,59,T.BRICK]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));
  rows.push(buildRow(W, [[0,59,T.DIRT]]));

  rows[11] = buildRow(W, [[4,4,T.VEGE],[16,16,T.VEGE],[28,28,T.VEGE],[42,42,T.VEGE],[54,54,T.VEGE]]);

  while (rows.length < 25) rows.push(makeRow(W));

  rows[13][1] = T.DOOR;

  return {
    tiles: rows,
    name: "Vet's Office",
    theme: 'vetoffice',
    bgColor: '#e8f0f8', bgColor2: '#d0e0f0',
    spawnX: 2, spawnY: 18,
    enemies: [
      { type: ENEMY_TYPES.SHYGUY, tx: 6,  ty: 18, color: 'red' },
      { type: ENEMY_TYPES.NINJI,  tx: 12, ty: 18 },
      { type: ENEMY_TYPES.SNIFIT, tx: 18, ty: 18 },
      { type: ENEMY_TYPES.SHYGUY, tx: 26, ty: 18, color: 'blue' },
      { type: ENEMY_TYPES.NINJI,  tx: 32, ty: 18 },
      { type: ENEMY_TYPES.SNIFIT, tx: 38, ty: 18 },
      { type: ENEMY_TYPES.WART,   tx: 46, ty: 18 },
    ],
    vegetables: [
      { tx: 4, ty: 11, type: 'yarn' },
      { tx: 16, ty: 11, type: 'mouse' },
      { tx: 28, ty: 11, type: 'feather' },
      { tx: 42, ty: 11, type: 'yarn' },
      { tx: 54, ty: 11, type: 'mouse' },
      { tx: 5, ty: 18, type: 'yarn' },
      { tx: 17, ty: 18, type: 'feather' },
      { tx: 31, ty: 18, type: 'mouse' },
    ],
    coins: [
      {tx:5,ty:3},{tx:6,ty:3},
      {tx:18,ty:3},{tx:19,ty:3},
      {tx:30,ty:3},{tx:31,ty:3},
      {tx:44,ty:3},{tx:45,ty:3},
      {tx:54,ty:3},{tx:55,ty:3},
    ]
  };
}

const LEVEL_BUILDERS = [createLevel1, createLevel2, createLevel3, createLevel4];
