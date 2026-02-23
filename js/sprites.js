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
  // Hat brim
  px(ctx, '#c82800', 3,2, 11,1, s);
  // Hat top
  px(ctx, '#e83a00', 4,0, 8,2, s);
  // Hat highlight
  px(ctx, '#ff5a20', 5,0, 4,1, s);
  // Hat "M" emblem
  px(ctx, '#fff', 7,1, 2,1, s);
  // Hair sideburns
  px(ctx, '#3d1c00', 2,2, 1,2, s);
  px(ctx, '#3d1c00', 14,2, 1,2, s);
  // Hair under hat
  px(ctx, '#3d1c00', 3,2, 1,1, s);
  px(ctx, '#3d1c00', 13,2, 1,1, s);
  // Face
  px(ctx, '#f5c58a', 3,3, 10,4, s);
  // Face highlight (cheek)
  px(ctx, '#fdd9a0', 4,4, 2,2, s);
  // Nose
  px(ctx, '#e0a870', dir > 0 ? 12 : 3, 5, 2, 2, s);
  // Eyes - white
  px(ctx, '#fff', dir > 0 ? 10 : 4, 3, 3, 3, s);
  // Eyes - pupil
  px(ctx, '#000', dir > 0 ? 11 : 5, 4, 2, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 12 : 5, 4, 1, 1, s);
  // Eyebrow
  px(ctx, '#3d1c00', dir > 0 ? 10 : 4, 3, 3, 1, s);
  // Mustache
  px(ctx, '#3d1c00', dir > 0 ? 7 : 4, 6, 6, 1, s);
  px(ctx, '#3d1c00', dir > 0 ? 6 : 4, 7, 7, 1, s);
  // Shirt (red)
  px(ctx, '#e83a00', 4,8, 8,4, s);
  // Shirt highlight
  px(ctx, '#ff5020', 5,8, 4,2, s);
  // Overalls
  px(ctx, '#3a6fff', 3,10, 10,6, s);
  // Overall straps
  px(ctx, '#3a6fff', 4,8, 2,2, s);
  px(ctx, '#3a6fff', 10,8, 2,2, s);
  // Overall buttons (gold)
  px(ctx, '#ffe04b', 5,9, 1,1, s);
  px(ctx, '#ffe04b', 10,9, 1,1, s);
  // Belt
  px(ctx, '#2a1c00', 3,12, 10,1, s);
  px(ctx, '#ffe04b', 7,12, 2,1, s);
  // Arms (frame-based)
  const armY = frame === 1 ? 9 : 8;
  px(ctx, '#e83a00', dir > 0 ? 1 : 13, armY, 2, 4, s);
  px(ctx, '#ff5020', dir > 0 ? 1 : 13, armY, 1, 3, s);
  // Gloves
  px(ctx, '#fff', dir > 0 ? 1 : 13, armY+3, 2, 2, s);
  // Legs
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#3a6fff', 3+legOff, 16, 4, 5, s);
  px(ctx, '#3a6fff', 9-legOff, 16, 4, 5, s);
  // Overall leg highlight
  px(ctx, '#4a80ff', 4+legOff, 16, 2, 3, s);
  px(ctx, '#4a80ff', 10-legOff, 16, 2, 3, s);
  // Shoes
  px(ctx, '#3d1c00', 2+legOff, 21, 5, 3, s);
  px(ctx, '#3d1c00', 8-legOff, 21, 6, 3, s);
  // Shoe soles
  px(ctx, '#2a1200', 2+legOff, 23, 5, 1, s);
  px(ctx, '#2a1200', 8-legOff, 23, 6, 1, s);
  // Shoe highlight
  px(ctx, '#5a3010', 3+legOff, 21, 3, 1, s);
  px(ctx, '#5a3010', 9-legOff, 21, 3, 1, s);
}

function drawLuigiSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Hat brim
  px(ctx, '#1a8000', 3,2, 11,1, s);
  // Hat top
  px(ctx, '#2a9e00', 4,0, 8,2, s);
  // Hat highlight
  px(ctx, '#3abe20', 5,0, 4,1, s);
  // Hat "L" emblem
  px(ctx, '#fff', 7,1, 2,1, s);
  // Hair sideburns
  px(ctx, '#1a6a00', 2,2, 1,2, s);
  px(ctx, '#1a6a00', 14,2, 1,2, s);
  px(ctx, '#1a6a00', 3,2, 1,1, s);
  px(ctx, '#1a6a00', 13,2, 1,1, s);
  // Face
  px(ctx, '#f5c58a', 3,3, 10,4, s);
  // Face highlight
  px(ctx, '#fdd9a0', 4,4, 2,2, s);
  // Nose
  px(ctx, '#e0a870', dir > 0 ? 12 : 3, 5, 2, 2, s);
  // Eyes - white
  px(ctx, '#fff', dir > 0 ? 10 : 4, 3, 3, 3, s);
  // Eyes - pupil
  px(ctx, '#000', dir > 0 ? 11 : 5, 4, 2, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 12 : 5, 4, 1, 1, s);
  // Eyebrow
  px(ctx, '#1a6a00', dir > 0 ? 10 : 4, 3, 3, 1, s);
  // Mustache
  px(ctx, '#1a6a00', dir > 0 ? 7 : 4, 6, 6, 1, s);
  px(ctx, '#1a6a00', dir > 0 ? 6 : 4, 7, 7, 1, s);
  // Shirt (green)
  px(ctx, '#2a9e00', 4,8, 8,4, s);
  px(ctx, '#3abe20', 5,8, 4,2, s);
  // Overalls
  px(ctx, '#3a6fff', 3,10, 10,6, s);
  // Overall straps
  px(ctx, '#3a6fff', 4,8, 2,2, s);
  px(ctx, '#3a6fff', 10,8, 2,2, s);
  // Buttons (gold)
  px(ctx, '#ffe04b', 5,9, 1,1, s);
  px(ctx, '#ffe04b', 10,9, 1,1, s);
  // Belt
  px(ctx, '#2a1c00', 3,12, 10,1, s);
  px(ctx, '#ffe04b', 7,12, 2,1, s);
  // Arms
  const armY = frame === 1 ? 9 : 8;
  px(ctx, '#2a9e00', dir > 0 ? 1 : 13, armY, 2, 4, s);
  px(ctx, '#3abe20', dir > 0 ? 1 : 13, armY, 1, 3, s);
  // Gloves
  px(ctx, '#fff', dir > 0 ? 1 : 13, armY+3, 2, 2, s);
  // Legs
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#3a6fff', 3+legOff, 16, 4, 5, s);
  px(ctx, '#3a6fff', 9-legOff, 16, 4, 5, s);
  px(ctx, '#4a80ff', 4+legOff, 16, 2, 3, s);
  px(ctx, '#4a80ff', 10-legOff, 16, 2, 3, s);
  // Shoes
  px(ctx, '#1a6a00', 2+legOff, 21, 5, 3, s);
  px(ctx, '#1a6a00', 8-legOff, 21, 6, 3, s);
  // Shoe soles
  px(ctx, '#0a4a00', 2+legOff, 23, 5, 1, s);
  px(ctx, '#0a4a00', 8-legOff, 23, 6, 1, s);
  // Shoe highlight
  px(ctx, '#2a8a10', 3+legOff, 21, 3, 1, s);
  px(ctx, '#2a8a10', 9-legOff, 21, 3, 1, s);
}

function drawToadSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Mushroom cap - white base
  px(ctx, '#fff', 2,0, 12,3, s);
  // Cap highlight
  px(ctx, '#f0f0ff', 5,0, 6,1, s);
  // Red spots on cap
  px(ctx, '#e82020', 2,0, 4,3, s);
  px(ctx, '#e82020', 8,0, 4,3, s);
  // Spot highlights
  px(ctx, '#ff4040', 3,0, 2,1, s);
  px(ctx, '#ff4040', 9,0, 2,1, s);
  // Cap edges
  px(ctx, '#e82020', 0,1, 2,2, s);
  px(ctx, '#e82020', 14,1, 2,2, s);
  // Cap shadow
  px(ctx, '#d0d0e0', 2,2, 12,1, s);
  // Face
  px(ctx, '#f9d8b0', 3,3, 10,5, s);
  // Face highlight
  px(ctx, '#fde8c8', 5,4, 3,2, s);
  // Eyes - white
  px(ctx, '#fff', dir > 0 ? 9 : 4, 3, 4, 4, s);
  // Eyes - pupil (large, round - Toad style)
  px(ctx, '#000', dir > 0 ? 10 : 5, 4, 3, 3, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 11 : 5, 4, 1, 1, s);
  // Mouth (small smile)
  px(ctx, '#c08060', dir > 0 ? 9 : 5, 7, 3, 1, s);
  // Vest (red with white front)
  px(ctx, '#e82020', 3,8, 10,5, s);
  // Vest front panel (white)
  px(ctx, '#fff', 5,8, 6,4, s);
  // Vest highlight
  px(ctx, '#ff4040', 3,8, 2,3, s);
  px(ctx, '#ff4040', 11,8, 2,3, s);
  // Vest gold trim
  px(ctx, '#ffe04b', 5,8, 1,4, s);
  px(ctx, '#ffe04b', 10,8, 1,4, s);
  // Arms
  const armY = frame === 1 ? 9 : 8;
  px(ctx, '#fff', dir > 0 ? 1 : 13, armY, 2, 4, s);
  // Hands
  px(ctx, '#f9d8b0', dir > 0 ? 1 : 13, armY+3, 2, 2, s);
  // Pants (white)
  px(ctx, '#f0f0f0', 3,13, 10,5, s);
  // Pants shadow
  px(ctx, '#d8d8e0', 3,16, 10,2, s);
  // Legs
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#f0f0f0', 3+legOff, 18, 4, 3, s);
  px(ctx, '#f0f0f0', 9-legOff, 18, 4, 3, s);
  // Shoes
  px(ctx, '#3d1c00', 2+legOff, 21, 5, 3, s);
  px(ctx, '#3d1c00', 8-legOff, 21, 5, 3, s);
  // Shoe soles
  px(ctx, '#2a1200', 2+legOff, 23, 5, 1, s);
  px(ctx, '#2a1200', 8-legOff, 23, 5, 1, s);
  // Shoe highlight
  px(ctx, '#5a3010', 3+legOff, 21, 3, 1, s);
  px(ctx, '#5a3010', 9-legOff, 21, 3, 1, s);
}

function drawPeachSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Crown spires
  px(ctx, '#ffe04b', 5,0, 2,1, s);
  px(ctx, '#ffe04b', 8,0, 2,1, s);
  px(ctx, '#ffe04b', 11,0, 1,1, s);
  // Crown band
  px(ctx, '#ffe04b', 4,1, 8,1, s);
  // Crown jewels
  px(ctx, '#4444ff', 6,1, 1,1, s);
  px(ctx, '#f44', 9,1, 1,1, s);
  // Crown highlight
  px(ctx, '#fff8a0', 5,0, 1,1, s);
  px(ctx, '#fff8a0', 8,0, 1,1, s);
  // Hair
  px(ctx, '#f0c040', 2,2, 12,2, s);
  // Hair highlight
  px(ctx, '#ffe880', 4,2, 4,1, s);
  // Hair sides (flowing)
  px(ctx, '#f0c040', 1,4, 2,4, s);
  px(ctx, '#f0c040', 13,4, 2,4, s);
  // Hair side highlight
  px(ctx, '#ffe880', 1,4, 1,2, s);
  px(ctx, '#ffe880', 14,4, 1,2, s);
  // Face
  px(ctx, '#f9d8c0', 3,4, 10,4, s);
  // Face highlight
  px(ctx, '#fde8d0', 5,5, 3,2, s);
  // Blush (cheeks)
  px(ctx, '#f0a0a0', 3,6, 2,1, s);
  px(ctx, '#f0a0a0', 11,6, 2,1, s);
  // Eyes - white
  px(ctx, '#fff', dir > 0 ? 10 : 4, 4, 3, 3, s);
  // Eyes - pupil (blue)
  px(ctx, '#2060c0', dir > 0 ? 11 : 5, 5, 2, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 12 : 5, 4, 1, 1, s);
  // Eyelashes
  px(ctx, '#000', dir > 0 ? 10 : 4, 4, 3, 1, s);
  // Lips
  px(ctx, '#e84060', dir > 0 ? 8 : 5, 7, 4, 1, s);
  // Earrings
  px(ctx, '#4444ff', 2,5, 1,1, s);
  px(ctx, '#4444ff', 13,5, 1,1, s);
  // Dress bodice
  px(ctx, '#f080a0', 3,8, 10,4, s);
  // Dress bodice highlight
  px(ctx, '#f9a0c0', 5,8, 6,3, s);
  // Dress neckline (jewel brooch)
  px(ctx, '#4444ff', 7,8, 2,1, s);
  // Dress waist sash
  px(ctx, '#d060a0', 3,12, 10,1, s);
  // Arms (puff sleeves)
  px(ctx, '#f9a0c0', dir > 0 ? 1 : 14, 8, 2, 2, s);
  px(ctx, '#f080a0', dir > 0 ? 0 : 14, 10, 2, 4, s);
  // Gloves
  px(ctx, '#fff', dir > 0 ? 0 : 14, 13, 2, 2, s);
  // Dress skirt
  px(ctx, '#f9a0c0', 1,13, 14,7, s);
  // Skirt shadow/fold detail
  px(ctx, '#e080a0', 3,15, 2,5, s);
  px(ctx, '#e080a0', 11,15, 2,5, s);
  // Skirt highlight
  px(ctx, '#ffc0d0', 6,14, 4,4, s);
  // Skirt bottom trim
  px(ctx, '#d060a0', 1,19, 14,1, s);
  // Feet (pink shoes)
  px(ctx, '#e06090', 4,20, 3, 2, s);
  px(ctx, '#e06090', 9,20, 3, 2, s);
  // Shoe highlight
  px(ctx, '#f080b0', 5,20, 1, 1, s);
  px(ctx, '#f080b0', 10,20, 1, 1, s);
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
