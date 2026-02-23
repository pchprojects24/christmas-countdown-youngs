// ===== PIXEL ART SPRITE RENDERER =====
// All sprites drawn procedurally on a small canvas then cached

const SpriteCache = {};

function px(ctx, color, x, y, w = 1, h = 1, scale = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

// ---- Character sprites (16x24 pixel art, scaled) ----
function drawMarioSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Hat
  px(ctx, '#e83a00', 4,0, 8,2, s);
  // Hair
  px(ctx, '#3d1c00', 3,2, 10,1, s);
  // Face
  px(ctx, '#f5c58a', 3,3, 10,4, s);
  // Eyes
  px(ctx, '#000', dir > 0 ? 11 : 4, 4, 2, 2, s);
  // Mustache
  px(ctx, '#3d1c00', dir > 0 ? 6 : 4, 6, 6, 2, s);
  // Overalls
  px(ctx, '#3a6fff', 3,8, 10,8, s);
  px(ctx, '#e83a00', 5,8, 6,4, s);
  // Buttons
  px(ctx, '#fff', 5,10, 2,2, s);
  px(ctx, '#fff', 9,10, 2,2, s);
  // Arms (frame-based)
  const armY = frame === 1 ? 9 : 8;
  px(ctx, '#e83a00', dir > 0 ? 1 : 13, armY, 2, 4, s);
  px(ctx, '#f5c58a', dir > 0 ? 1 : 13, armY+3, 2, 2, s);
  // Legs
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#3a6fff', 3+legOff, 16, 4, 5, s);
  px(ctx, '#3a6fff', 9-legOff, 16, 4, 5, s);
  px(ctx, '#3d1c00', 3+legOff, 20, 4, 2, s);
  px(ctx, '#3d1c00', 9-legOff, 20, 4, 2, s);
  // Shoes
  px(ctx, '#3d1c00', 2+legOff, 21, 5, 3, s);
  px(ctx, '#3d1c00', 8-legOff, 21, 6, 3, s);
}

function drawLuigiSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  px(ctx, '#2a9e00', 4,0, 8,2, s);
  px(ctx, '#1a6a00', 3,2, 10,1, s);
  px(ctx, '#f5c58a', 3,3, 10,4, s);
  px(ctx, '#000', dir > 0 ? 11 : 4, 4, 2, 2, s);
  px(ctx, '#1a6a00', dir > 0 ? 6 : 4, 6, 6, 2, s);
  px(ctx, '#3a6fff', 3,8, 10,8, s);
  px(ctx, '#2a9e00', 5,8, 6,4, s);
  px(ctx, '#fff', 5,10, 2,2, s);
  px(ctx, '#fff', 9,10, 2,2, s);
  const armY = frame === 1 ? 9 : 8;
  px(ctx, '#2a9e00', dir > 0 ? 1 : 13, armY, 2, 4, s);
  px(ctx, '#f5c58a', dir > 0 ? 1 : 13, armY+3, 2, 2, s);
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#3a6fff', 3+legOff, 16, 4, 5, s);
  px(ctx, '#3a6fff', 9-legOff, 16, 4, 5, s);
  px(ctx, '#1a6a00', 3+legOff, 20, 4, 2, s);
  px(ctx, '#1a6a00', 9-legOff, 20, 4, 2, s);
  px(ctx, '#1a6a00', 2+legOff, 21, 5, 3, s);
  px(ctx, '#1a6a00', 8-legOff, 21, 6, 3, s);
}

function drawToadSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Mushroom cap
  px(ctx, '#fff', 2,0, 12,3, s);
  px(ctx, '#f44', 2,0, 4,3, s);
  px(ctx, '#f44', 8,0, 4,3, s);
  px(ctx, '#f44', 0,1, 2,2, s);
  px(ctx, '#f44', 14,1, 2,2, s);
  // Face
  px(ctx, '#f9d8b0', 3,3, 10,5, s);
  px(ctx, '#000', dir > 0 ? 10 : 4, 4, 2, 2, s);
  // Vest
  px(ctx, '#f44', 4,8, 8,5, s);
  px(ctx, '#fff', 5,8, 6,3, s);
  // Arms
  const armY = frame === 1 ? 9 : 8;
  px(ctx, '#fff', dir > 0 ? 1 : 13, armY, 3, 4, s);
  px(ctx, '#f9d8b0', dir > 0 ? 1 : 13, armY+3, 3, 2, s);
  // Pants
  px(ctx, '#3a6fff', 3,13, 10,5, s);
  // Legs
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#3a6fff', 3+legOff, 18, 4, 4, s);
  px(ctx, '#3a6fff', 9-legOff, 18, 4, 4, s);
  px(ctx, '#3d1c00', 2+legOff, 21, 5, 3, s);
  px(ctx, '#3d1c00', 8-legOff, 21, 5, 3, s);
}

function drawPeachSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Crown
  px(ctx, '#ffe04b', 4,0, 8,2, s);
  px(ctx, '#ffe04b', 3,1, 1,2, s);
  px(ctx, '#ffe04b', 12,1, 1,2, s);
  px(ctx, '#f44', 5,0, 1,1, s);
  px(ctx, '#f44', 8,0, 1,1, s);
  px(ctx, '#f44', 11,0, 1,1, s);
  // Hair
  px(ctx, '#ffe04b', 2,2, 12,2, s);
  px(ctx, '#ffe04b', 0,4, 2,3, s);
  px(ctx, '#ffe04b', 14,4, 2,3, s);
  // Face
  px(ctx, '#f9d8c0', 3,4, 10,4, s);
  px(ctx, '#000', dir > 0 ? 11 : 4, 5, 2, 2, s);
  // Lips
  px(ctx, '#e84060', dir > 0 ? 8 : 6, 7, 4, 1, s);
  // Dress top
  px(ctx, '#f9a0c0', 2,8, 12,7, s);
  // Arms
  px(ctx, '#f9a0c0', dir > 0 ? 0 : 14, 9, 2, 5, s);
  px(ctx, '#f9d8c0', dir > 0 ? 0 : 14, 13, 2, 2, s);
  // Dress skirt
  px(ctx, '#f9a0c0', 1,15, 14,7, s);
  // Feet
  px(ctx, '#f9d8c0', 4,22, 3, 2, s);
  px(ctx, '#f9d8c0', 9,22, 3, 2, s);
}

// Draw character to a canvas element (for select screen)
function renderCharPreview(char, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  const scale = 4;
  switch (char) {
    case 'mario': drawMarioSprite(ctx, 0, 1, scale); break;
    case 'luigi': drawLuigiSprite(ctx, 0, 1, scale); break;
    case 'toad':  drawToadSprite(ctx, 0, 1, scale);  break;
    case 'peach': drawPeachSprite(ctx, 0, 1, scale); break;
  }
}

// ---- Tile drawing ----
function drawTile(ctx, tileId, x, y) {
  const s = TILE;
  switch (tileId) {
    case T.GROUND:
      ctx.fillStyle = '#5d8a3c';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#4a7230';
      ctx.fillRect(x, y+s*0.3, s, s*0.7);
      ctx.fillStyle = '#6aaa42';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i*8, y, 6, 4);
      }
      break;
    case T.BRICK:
      ctx.fillStyle = '#c8441a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#e85a2a';
      ctx.fillRect(x+1, y+1, s-2, s*0.4);
      ctx.fillRect(x+1, y+s*0.5+1, s-2, s*0.4);
      ctx.fillStyle = '#a03410';
      ctx.fillRect(x, y+s*0.45, s, 2);
      ctx.fillRect(x+s*0.5, y, 2, s*0.45);
      ctx.fillRect(x, y+s*0.5+s*0.45, s, 2);
      ctx.fillRect(x+s*0.25, y+s*0.5, 2, s*0.45);
      break;
    case T.DIRT:
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#6b4020';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        ctx.fillRect(x+2+i*10, y+2+j*10, 6, 6);
      }
      break;
    case T.CLOUD:
      ctx.fillStyle = '#a0d8f0';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x+s*0.5, y+s*0.6, s*0.35, 0, Math.PI*2);
      ctx.arc(x+s*0.25, y+s*0.7, s*0.25, 0, Math.PI*2);
      ctx.arc(x+s*0.75, y+s*0.7, s*0.25, 0, Math.PI*2);
      ctx.fill();
      break;
    case T.GRASS:
      ctx.fillStyle = '#4a9e2a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3a7e1a';
      ctx.fillRect(x, y+6, s, s-6);
      ctx.fillStyle = '#5abe3a';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(x+2+i*6, y, 3, 6);
      }
      break;
    case T.SAND:
      ctx.fillStyle = '#d4b56a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#c4a558';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        ctx.fillRect(x+1+i*8, y+1+j*8, 5, 5);
      }
      break;
    case T.PIPE_TL:
      ctx.fillStyle = '#2a8a00';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3ab000';
      ctx.fillRect(x+2, y, s-2, s);
      ctx.fillStyle = '#1a6a00';
      ctx.fillRect(x, y, s, 2);
      break;
    case T.PIPE_TR:
      ctx.fillStyle = '#2a8a00';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3ab000';
      ctx.fillRect(x, y, s-2, s);
      ctx.fillStyle = '#1a6a00';
      ctx.fillRect(x, y, s, 2);
      break;
    case T.PIPE_BL:
      ctx.fillStyle = '#2a8a00';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3ab000';
      ctx.fillRect(x+2, y, s-2, s);
      break;
    case T.PIPE_BR:
      ctx.fillStyle = '#2a8a00';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3ab000';
      ctx.fillRect(x, y, s-2, s);
      break;
    case T.VEGE:
      // Background grow spot (just a hint of green mound)
      ctx.fillStyle = '#3a8a1a';
      ctx.beginPath();
      ctx.arc(x+s/2, y+s, s*0.35, Math.PI, Math.PI*2);
      ctx.fill();
      break;
    case T.DOOR:
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x+4, y+2, s-8, s-2);
      ctx.fillStyle = '#6b3010';
      ctx.fillRect(x+6, y+4, s-12, s-6);
      ctx.fillStyle = '#ffe04b';
      ctx.fillRect(x+s-10, y+s/2-3, 4, 6);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x+s-8, y+s/2, 3, 0, Math.PI*2);
      ctx.fill();
      break;
    case T.COIN:
      ctx.fillStyle = '#ffe04b';
      ctx.beginPath();
      ctx.arc(x+s/2, y+s/2, s*0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ffb800';
      ctx.beginPath();
      ctx.arc(x+s/2, y+s/2, s*0.2, 0, Math.PI*2);
      ctx.fill();
      break;
  }
}
