const game = document.getElementById("game");
const water = document.getElementById("water");
const timeText = document.getElementById("time");
const player = document.getElementById("player");
const waterDropsContainer = document.getElementById("waterDrops");

let waterLevel = 0;
let maxWater = 140; // Match the max-height of water in CSS
let gameOver = false;
let time = 0;

// ================= TAP / CLICK TO REMOVE WATER =================
game.addEventListener("click", removeWater);
game.addEventListener("touchstart", removeWater);

function removeWater(e) {
  if (gameOver) return;

  // Animate player bailing water
  player.classList.add("bailing");
  setTimeout(() => player.classList.remove("bailing"), 300);

  // Create splash effect at click position
  createSplash(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);

  waterLevel -= 15;
  if (waterLevel < 0) waterLevel = 0;
  updateWater();
}

function createSplash(x, y) {
  const splash = document.createElement("div");
  splash.className = "splash";
  const rect = game.getBoundingClientRect();
  splash.style.left = (x - rect.left) + "px";
  splash.style.top = (y - rect.top) + "px";
  game.appendChild(splash);
  
  setTimeout(() => splash.remove(), 500);
}

// ================= ENEMY =================
function spawnEnemy() {
  if (gameOver) return;

  const enemy = document.createElement("div");
  enemy.className = "enemy";
  // Position enemy on opposite side of boat from hero
  const enemyX = 400 + Math.random() * 80;
  enemy.style.left = enemyX + "px";
  
  // Create enemy parts
  enemy.innerHTML = `
    <div class="enemy-body">
      <img src="duck.png" class="enemy-face" alt="Duck Enemy">
    </div>
    <div class="enemy-bucket"></div>
  `;
  
  game.appendChild(enemy);

  let attacks = 0;

  const attackInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(attackInterval);
      enemy.remove();
      return;
    }

    // Trigger pouring animation
    enemy.classList.add("pouring");
    setTimeout(() => enemy.classList.remove("pouring"), 800);

    // Create water drops animation from enemy position
    const rect = enemy.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();
    createWaterDrops(rect.left - gameRect.left + 22, rect.top - gameRect.top + 50);

    waterLevel += 10;
    updateWater();
    attacks++;

    if (attacks > 5) {
      clearInterval(attackInterval);
      enemy.remove();
    }
  }, 800);
}

function createWaterDrops(x, y) {
  // Create multiple water drops that fall inside the boat
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const drop = document.createElement("div");
      drop.className = "waterDrop";
      // Constrain drops to fall inside boat boundaries (120-570px)
      const dropX = Math.max(140, Math.min(550, x + Math.random() * 30 - 15));
      drop.style.left = dropX + "px";
      drop.style.top = y + "px";
      waterDropsContainer.appendChild(drop);
      
      setTimeout(() => drop.remove(), 1000);
    }, i * 80);
  }
}

// ================= WATER =================
function updateWater() {
  water.style.height = waterLevel + "px";

  if (waterLevel >= maxWater) {
    endGame();
  }
}

// ================= TIME SCORE =================
setInterval(() => {
  if (!gameOver) {
    time++;
    timeText.innerText = time;
  }
}, 1000);

// ================= SPAWN RATE =================
setInterval(spawnEnemy, 2000);

// ================= GAME OVER =================
function endGame() {
  gameOver = true;
  
  // Generate score image
  generateScoreImage();
  
  // Show modal
  const modal = document.getElementById("gameOverModal");
  modal.style.display = "flex";
}

function generateScoreImage() {
  const canvas = document.getElementById('scoreCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 400;
  canvas.height = 350;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 350);
  gradient.addColorStop(0, '#006A4E');
  gradient.addColorStop(1, '#00563E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 350);
  
  // Red circle (Bangladesh flag)
  ctx.fillStyle = '#F42A41';
  ctx.beginPath();
  ctx.arc(200, 100, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🚤 Boat Saver', 200, 200);
  
  // Time label
  ctx.font = '24px Arial';
  ctx.fillText('⏱️ Time Survived', 200, 240);
  
  // Score value
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(time + 's', 200, 290);
  
  // Date
  const now = new Date();
  ctx.font = '16px Arial';
  ctx.fillStyle = '#CCCCCC';
  ctx.fillText(now.toLocaleDateString() + ' ' + now.toLocaleTimeString(), 200, 320);
}

// ================= MODAL BUTTON HANDLERS =================
document.getElementById("saveScoreBtn").addEventListener("click", function() {
  const canvas = document.getElementById('scoreCanvas');
  
  // Download the image
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boat-saver-score-' + time + 's.png';
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("playAgainBtn").addEventListener("click", function() {
  location.reload();
});
