// ===== PIXEL ART SPRITE RENDERER =====
// All sprites drawn procedurally on a small canvas then cached

const SpriteCache = {};

function px(ctx, color, x, y, w = 1, h = 1, scale = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

// ---- MARICE: Human woman with dark hair, white coat, blue scarf ----
// Based on photo: dark-haired woman with white coat and blue scarf
function drawMariceSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Hair (dark brown, flowing)
  px(ctx, '#3a2010', 3,0, 10,3, s);
  px(ctx, '#4a2a14', 5,0, 6,1, s); // highlight
  // Hair sides
  px(ctx, '#3a2010', 2,1, 1,4, s);
  px(ctx, '#3a2010', 13,1, 1,4, s);
  // Hair flowing down past shoulders
  px(ctx, '#3a2010', 1,3, 2,5, s);
  px(ctx, '#3a2010', 13,3, 2,5, s);
  // Face
  px(ctx, '#f5c8a8', 3,3, 10,5, s);
  // Face highlight
  px(ctx, '#fdd8b8', 5,4, 4,2, s);
  // Eyes - white
  px(ctx, '#fff', dir > 0 ? 9 : 4, 4, 4, 3, s);
  // Eyes - iris (brown)
  px(ctx, '#6a4020', dir > 0 ? 10 : 5, 5, 2, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 11 : 5, 4, 1, 1, s);
  // Eyebrow
  px(ctx, '#3a2010', dir > 0 ? 9 : 4, 3, 4, 1, s);
  // Eyelashes
  px(ctx, '#222', dir > 0 ? 9 : 4, 4, 4, 1, s);
  // Nose
  px(ctx, '#e0a880', dir > 0 ? 11 : 4, 5, 1, 2, s);
  // Smile
  px(ctx, '#d08a70', dir > 0 ? 8 : 5, 7, 4, 1, s);
  // Blush
  px(ctx, '#f0a0a0', 3,6, 2,1, s);
  px(ctx, '#f0a0a0', 11,6, 2,1, s);
  // Blue scarf
  px(ctx, '#4a7ab5', 3,8, 10,2, s);
  px(ctx, '#5a8ac5', 5,8, 6,1, s); // scarf highlight
  px(ctx, '#3a6aa5', 2,9, 2,2, s); // scarf tail
  px(ctx, '#3a6aa5', 12,9, 2,2, s);
  // White coat
  px(ctx, '#eee', 3,10, 10,6, s);
  px(ctx, '#fff', 5,10, 6,4, s); // coat front highlight
  // Coat buttons
  px(ctx, '#4a7ab5', 7,11, 2,1, s);
  px(ctx, '#4a7ab5', 7,13, 2,1, s);
  // Coat belt/waist
  px(ctx, '#ddd', 3,14, 10,1, s);
  // Arms
  const armY = frame === 1 ? 11 : 10;
  px(ctx, '#eee', dir > 0 ? 1 : 13, armY, 2, 5, s);
  px(ctx, '#fff', dir > 0 ? 1 : 13, armY, 1, 3, s);
  // Hands
  px(ctx, '#f5c8a8', dir > 0 ? 1 : 13, armY+4, 2, 2, s);
  // Coat skirt / lower coat
  px(ctx, '#eee', 2,15, 12,3, s);
  px(ctx, '#ddd', 4,16, 2,2, s); // fold shadow
  px(ctx, '#ddd', 10,16, 2,2, s);
  // Legs (dark pants/jeans)
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#2a3a5a', 3+legOff, 18, 4, 4, s);
  px(ctx, '#2a3a5a', 9-legOff, 18, 4, 4, s);
  // Boots
  px(ctx, '#3a2010', 2+legOff, 21, 5, 3, s);
  px(ctx, '#3a2010', 8-legOff, 21, 6, 3, s);
  // Boot soles
  px(ctx, '#2a1200', 2+legOff, 23, 5, 1, s);
  px(ctx, '#2a1200', 8-legOff, 23, 6, 1, s);
}

// ---- BEATRICE: Black cat with white neck/chest ----
function drawBeatriceSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Ears (tall, pointed - black cat)
  px(ctx, '#1a1a1a', 3,0, 3,4, s);
  px(ctx, '#1a1a1a', 10,0, 3,4, s);
  // Inner ears (pink)
  px(ctx, '#d08080', 4,1, 1,2, s);
  px(ctx, '#d08080', 11,1, 1,2, s);
  // Head (round, black)
  px(ctx, '#1a1a1a', 2,3, 12,6, s);
  // Head highlight (slight dark grey sheen)
  px(ctx, '#2a2a2a', 5,4, 6,3, s);
  // Eyes (large, golden-green - cat eyes)
  px(ctx, '#111', dir > 0 ? 8 : 4, 4, 5, 4, s); // eye outline
  px(ctx, '#111', dir > 0 ? 3 : 8, 4, 5, 4, s);
  px(ctx, '#d0e040', dir > 0 ? 9 : 5, 5, 3, 2, s); // iris right
  px(ctx, '#d0e040', dir > 0 ? 4 : 9, 5, 3, 2, s); // iris left
  // Pupils (vertical slits)
  px(ctx, '#000', dir > 0 ? 10 : 6, 5, 1, 2, s);
  px(ctx, '#000', dir > 0 ? 5 : 10, 5, 1, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 9 : 5, 5, 1, 1, s);
  px(ctx, '#fff', dir > 0 ? 4 : 9, 5, 1, 1, s);
  // Nose (tiny pink)
  px(ctx, '#e88888', 7,7, 2,1, s);
  // Whisker dots
  px(ctx, '#333', 5,8, 1,1, s);
  px(ctx, '#333', 10,8, 1,1, s);
  // White chest/neck (distinctive white bib)
  px(ctx, '#f0f0f0', 5,9, 6,4, s);
  px(ctx, '#fff', 6,9, 4,3, s); // bright white center
  // Body (black, sleek)
  px(ctx, '#1a1a1a', 3,9, 10,8, s);
  // Re-draw white bib on top
  px(ctx, '#f0f0f0', 5,9, 6,4, s);
  px(ctx, '#fff', 6,10, 4,2, s);
  // Body highlight
  px(ctx, '#2a2a2a', 4,13, 8,2, s);
  // Tail (curling up on side)
  px(ctx, '#1a1a1a', dir > 0 ? 0 : 14, 10, 2, 6, s);
  px(ctx, '#1a1a1a', dir > 0 ? 0 : 15, 10, 1, 2, s);
  // Front legs/paws
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#1a1a1a', 3+legOff, 17, 4, 5, s);
  px(ctx, '#1a1a1a', 9-legOff, 17, 4, 5, s);
  // Paws (white toes on Beatrice)
  px(ctx, '#f0f0f0', 3+legOff, 21, 4, 2, s);
  px(ctx, '#f0f0f0', 9-legOff, 21, 4, 2, s);
  // Paw pads
  px(ctx, '#e88888', 4+legOff, 22, 2, 1, s);
  px(ctx, '#e88888', 10-legOff, 22, 2, 1, s);
}

// ---- ALICE: White/cream cat with black mark on nose ----
function drawAliceSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Ears (cream/white with some dark patches)
  px(ctx, '#f0e0c8', 3,0, 3,4, s);
  px(ctx, '#f0e0c8', 10,0, 3,4, s);
  // Dark patch on one ear
  px(ctx, '#4a3020', 3,0, 2,2, s);
  // Inner ears
  px(ctx, '#e8a8a0', 4,1, 1,2, s);
  px(ctx, '#e8a8a0', 11,1, 1,2, s);
  // Head (white/cream)
  px(ctx, '#f5ead8', 2,3, 12,6, s);
  // Head highlight
  px(ctx, '#fff0e0', 5,4, 6,3, s);
  // Dark markings on head (patches like in photo)
  px(ctx, '#5a4030', 2,3, 3,3, s); // dark patch left
  px(ctx, '#5a4030', 11,3, 3,3, s); // dark patch right
  // Eyes (big, round green eyes)
  px(ctx, '#fff', dir > 0 ? 8 : 3, 4, 5, 4, s);
  px(ctx, '#fff', dir > 0 ? 3 : 8, 4, 5, 4, s);
  px(ctx, '#60b040', dir > 0 ? 9 : 4, 5, 3, 2, s); // green iris
  px(ctx, '#60b040', dir > 0 ? 4 : 9, 5, 3, 2, s);
  // Pupils
  px(ctx, '#000', dir > 0 ? 10 : 5, 5, 1, 2, s);
  px(ctx, '#000', dir > 0 ? 5 : 10, 5, 1, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 9 : 4, 4, 1, 1, s);
  px(ctx, '#fff', dir > 0 ? 4 : 9, 4, 1, 1, s);
  // DISTINCTIVE BLACK NOSE MARK (Alice's signature feature)
  px(ctx, '#222', 6,7, 4,2, s); // big dark nose mark
  px(ctx, '#111', 7,7, 2,1, s); // nose center
  // Whisker dots
  px(ctx, '#aaa', 4,8, 1,1, s);
  px(ctx, '#aaa', 11,8, 1,1, s);
  // Mouth
  px(ctx, '#d0a0a0', 7,8, 2,1, s);
  // Body (cream/white)
  px(ctx, '#f0e0c8', 3,9, 10,8, s);
  // Body highlight
  px(ctx, '#f8edd8', 5,10, 6,4, s);
  // Some dark patches on body
  px(ctx, '#5a4030', 3,11, 3,3, s);
  px(ctx, '#5a4030', 11,13, 2,3, s);
  // Belly (lighter)
  px(ctx, '#fff0e0', 5,12, 6,3, s);
  // Tail
  px(ctx, '#f0e0c8', dir > 0 ? 0 : 14, 11, 2, 5, s);
  px(ctx, '#5a4030', dir > 0 ? 0 : 14, 11, 2, 2, s); // dark tail tip
  // Legs
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#f0e0c8', 3+legOff, 17, 4, 5, s);
  px(ctx, '#f0e0c8', 9-legOff, 17, 4, 5, s);
  // Paws
  px(ctx, '#fff0e0', 3+legOff, 21, 4, 2, s);
  px(ctx, '#fff0e0', 9-legOff, 21, 4, 2, s);
  // Paw pads
  px(ctx, '#e8a8a0', 4+legOff, 22, 2, 1, s);
  px(ctx, '#e8a8a0', 10-legOff, 22, 2, 1, s);
}

// ---- OLIVE: Fluffy grey/tabby cat ----
function drawOliveSprite(ctx, frame = 0, dir = 1, scale = 2) {
  const s = scale;
  // Ears (rounded, fluffy - grey/tabby)
  px(ctx, '#a09080', 3,0, 3,4, s);
  px(ctx, '#a09080', 10,0, 3,4, s);
  // Inner ears
  px(ctx, '#d0a8a0', 4,1, 1,2, s);
  px(ctx, '#d0a8a0', 11,1, 1,2, s);
  // Fluffy tufts on ear tips
  px(ctx, '#c8b898', 3,0, 1,1, s);
  px(ctx, '#c8b898', 12,0, 1,1, s);
  // Head (fluffy, round - warm grey)
  px(ctx, '#b8a898', 2,3, 12,6, s);
  // Head fluff (extra round, lighter)
  px(ctx, '#c8b8a8', 4,3, 8,4, s);
  // Tabby stripes on forehead
  px(ctx, '#8a7a6a', 5,3, 2,2, s);
  px(ctx, '#8a7a6a', 9,3, 2,2, s);
  px(ctx, '#8a7a6a', 7,3, 2,1, s);
  // Eyes (big, round amber/golden eyes)
  px(ctx, '#fff', dir > 0 ? 8 : 3, 4, 5, 4, s);
  px(ctx, '#fff', dir > 0 ? 3 : 8, 4, 5, 4, s);
  px(ctx, '#d0a030', dir > 0 ? 9 : 4, 5, 3, 2, s); // amber iris
  px(ctx, '#d0a030', dir > 0 ? 4 : 9, 5, 3, 2, s);
  // Pupils
  px(ctx, '#000', dir > 0 ? 10 : 5, 5, 1, 2, s);
  px(ctx, '#000', dir > 0 ? 5 : 10, 5, 1, 2, s);
  // Eye highlight
  px(ctx, '#fff', dir > 0 ? 9 : 4, 4, 1, 1, s);
  px(ctx, '#fff', dir > 0 ? 4 : 9, 4, 1, 1, s);
  // Nose (pink)
  px(ctx, '#e8a0a0', 7,7, 2,1, s);
  // Whisker dots
  px(ctx, '#999', 4,8, 1,1, s);
  px(ctx, '#999', 11,8, 1,1, s);
  // Fluffy chest ruff (lighter)
  px(ctx, '#d8c8b0', 4,9, 8,4, s);
  px(ctx, '#e0d0b8', 5,9, 6,3, s); // extra fluff highlight
  // Body (fluffy grey/tabby)
  px(ctx, '#b0a090', 3,9, 10,8, s);
  // Re-draw fluffy chest
  px(ctx, '#d8c8b0', 4,9, 8,4, s);
  px(ctx, '#e0d0b8', 5,10, 6,2, s);
  // Tabby stripes on body
  px(ctx, '#8a7a6a', 3,13, 2,2, s);
  px(ctx, '#8a7a6a', 7,14, 2,2, s);
  px(ctx, '#8a7a6a', 11,13, 2,2, s);
  // Fluffy tail (big and bushy!)
  px(ctx, '#b0a090', dir > 0 ? 0 : 13, 9, 3, 7, s);
  px(ctx, '#c8b898', dir > 0 ? 0 : 14, 10, 2, 4, s); // tail highlight
  px(ctx, '#8a7a6a', dir > 0 ? 0 : 13, 9, 1, 2, s); // tail stripe
  // Legs (fluffy)
  const legOff = frame === 1 ? 1 : 0;
  px(ctx, '#b0a090', 3+legOff, 17, 4, 5, s);
  px(ctx, '#b0a090', 9-legOff, 17, 4, 5, s);
  // Leg fluff
  px(ctx, '#c8b898', 3+legOff, 17, 4, 2, s);
  px(ctx, '#c8b898', 9-legOff, 17, 4, 2, s);
  // Paws (round, with toe beans)
  px(ctx, '#c8b898', 3+legOff, 21, 4, 2, s);
  px(ctx, '#c8b898', 9-legOff, 21, 2, 2, s);
  // Paw pads
  px(ctx, '#e8a8a0', 4+legOff, 22, 2, 1, s);
  px(ctx, '#e8a8a0', 10-legOff, 22, 2, 1, s);
}

// Draw character to a canvas element (for select screen)
function renderCharPreview(char, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  const scale = 4;
  switch (char) {
    case 'marice':   drawMariceSprite(ctx, 0, 1, scale); break;
    case 'beatrice': drawBeatriceSprite(ctx, 0, 1, scale); break;
    case 'alice':    drawAliceSprite(ctx, 0, 1, scale);  break;
    case 'olive':    drawOliveSprite(ctx, 0, 1, scale); break;
  }
}

// ---- Tile drawing ----
function drawTile(ctx, tileId, x, y) {
  const s = TILE;
  switch (tileId) {
    case T.GROUND:
      // Hardwood floor
      ctx.fillStyle = '#8b6b4a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(x, y+s*0.5, s, 1);
      ctx.fillStyle = '#9b7b5a';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i*8, y+1, 7, s*0.48);
      }
      break;
    case T.BRICK:
      // Stone/tile floor (kitchen, vet)
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#b0b0b8';
      ctx.fillRect(x+1, y+1, s-2, s*0.4);
      ctx.fillRect(x+1, y+s*0.5+1, s-2, s*0.4);
      ctx.fillStyle = '#888890';
      ctx.fillRect(x, y+s*0.45, s, 2);
      ctx.fillRect(x+s*0.5, y, 2, s*0.45);
      break;
    case T.DIRT:
      // Under-floor / foundation
      ctx.fillStyle = '#6b4e3c';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#5b3e2c';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        ctx.fillRect(x+2+i*10, y+2+j*10, 6, 6);
      }
      break;
    case T.CLOUD:
      // Cushion/pillow platform
      ctx.fillStyle = '#d8c8e8';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#e8d8f0';
      ctx.beginPath();
      ctx.arc(x+s*0.5, y+s*0.5, s*0.38, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#c8b8d8';
      ctx.fillRect(x, y+s*0.8, s, s*0.2);
      break;
    case T.GRASS:
      // Carpet/rug
      ctx.fillStyle = '#6a8a4a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#5a7a3a';
      ctx.fillRect(x, y+6, s, s-6);
      ctx.fillStyle = '#7aaa5a';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(x+2+i*6, y, 3, 6);
      }
      break;
    case T.SAND:
      // Countertop / light surface
      ctx.fillStyle = '#d4c4a4';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#c4b494';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        ctx.fillRect(x+1+i*8, y+1+j*8, 5, 5);
      }
      break;
    case T.PIPE_TL:
      // Cat tower left
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#9a7a50';
      ctx.fillRect(x+2, y, s-2, s);
      ctx.fillStyle = '#7a5a30';
      ctx.fillRect(x, y, s, 2);
      break;
    case T.PIPE_TR:
      // Cat tower right
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#9a7a50';
      ctx.fillRect(x, y, s-2, s);
      ctx.fillStyle = '#7a5a30';
      ctx.fillRect(x, y, s, 2);
      break;
    case T.PIPE_BL:
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#9a7a50';
      ctx.fillRect(x+2, y, s-2, s);
      break;
    case T.PIPE_BR:
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#9a7a50';
      ctx.fillRect(x, y, s-2, s);
      break;
    case T.VEGE:
      // Treat spawn spot (little bowl/dish)
      ctx.fillStyle = '#c8a060';
      ctx.beginPath();
      ctx.arc(x+s/2, y+s, s*0.35, Math.PI, Math.PI*2);
      ctx.fill();
      break;
    case T.DOOR:
      // Cat door / exit
      ctx.fillStyle = '#6a5a4a';
      ctx.fillRect(x+4, y+2, s-8, s-2);
      ctx.fillStyle = '#5a4a3a';
      ctx.fillRect(x+6, y+4, s-12, s-6);
      // Cat flap
      ctx.fillStyle = '#8a7a6a';
      ctx.fillRect(x+8, y+s/2, s-16, s/2-2);
      // Paw print icon
      ctx.fillStyle = '#c8a060';
      ctx.beginPath();
      ctx.arc(x+s/2, y+s/3, 4, 0, Math.PI*2);
      ctx.fill();
      break;
    case T.COIN:
      // Fish treat
      ctx.fillStyle = '#f0a860';
      ctx.beginPath();
      ctx.ellipse(x+s/2, y+s/2, s*0.25, s*0.18, 0.2, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#e09040';
      ctx.beginPath();
      ctx.ellipse(x+s/2, y+s/2, s*0.15, s*0.1, 0.2, 0, Math.PI*2);
      ctx.fill();
      break;
    case T.CARPET:
      // Warm carpet platform
      ctx.fillStyle = '#9a4040';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#aa5050';
      ctx.fillRect(x+1, y+1, s-2, s-2);
      // Pattern
      ctx.fillStyle = '#8a3030';
      ctx.fillRect(x+4, y+4, 4, 4);
      ctx.fillRect(x+s-8, y+4, 4, 4);
      ctx.fillRect(x+s/2-2, y+s/2-2, 4, 4);
      break;
    case T.SHELF:
      // Bookshelf / shelf
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(x+1, y+1, s-2, 4);
      // Books on shelf
      ctx.fillStyle = '#c44';
      ctx.fillRect(x+3, y+5, 4, s-6);
      ctx.fillStyle = '#4a8';
      ctx.fillRect(x+8, y+5, 5, s-6);
      ctx.fillStyle = '#88c';
      ctx.fillRect(x+14, y+5, 4, s-6);
      ctx.fillStyle = '#ca4';
      ctx.fillRect(x+19, y+5, 5, s-6);
      ctx.fillStyle = '#4a4';
      ctx.fillRect(x+25, y+5, 4, s-6);
      break;
  }
}
