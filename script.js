// ==================== CYBERPUNK PARTICLES + NETWORK ====================

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// === Hạt ===
let numParticles = window.innerWidth < 768 ? 90 : 160;
let numNetwork = window.innerWidth < 768 ? 50 : 80;

const particles = Array.from({ length: numParticles }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 2,
  dx: (Math.random() - 0.5) * 0.9,
  dy: (Math.random() - 0.5) * 0.9,
  color: Math.random() > 0.5 ? "#ff00ff" : "#00ffff"
}));

const networkParticles = Array.from({ length: numNetwork }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  vx: (Math.random() - 0.5) * 0.5,
  vy: (Math.random() - 0.5) * 0.5,
  r: Math.random() * 2 + 0.5
}));

let lasers = [];
function createLaser() {
  lasers.push({
    x: Math.random() * w,
    y: h,
    length: Math.random() * 100 + 60,
    speed: Math.random() * 6 + 3,
    color: Math.random() > 0.5 ? "#ff00ff" : "#00ffff"
  });
}
setInterval(createLaser, 200);

// === Mouse ===
const mouse = { x: -999, y: -999 };
canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

function draw() {
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#030010");
  bg.addColorStop(1, "#000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > w) p.dx *= -1;
    if (p.y < 0 || p.y > h) p.dy *= -1;
  }

  for (let i = 0; i < networkParticles.length; i++) {
    const p1 = networkParticles[i];
    p1.x += p1.vx;
    p1.y += p1.vy;
    if (p1.x < 0 || p1.x > w) p1.vx *= -1;
    if (p1.y < 0 || p1.y > h) p1.vy *= -1;

    ctx.beginPath();
    ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    for (let j = i + 1; j < networkParticles.length; j++) {
      const p2 = networkParticles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  for (let l of lasers) {
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x, l.y - l.length);
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = l.color;
    ctx.stroke();
    l.y -= l.speed;
  }
  lasers = lasers.filter(l => l.y + l.length > 0);

  requestAnimationFrame(draw);
}
draw();

// ==================== FPS COUNTER ====================
const fpsEl = document.getElementById('fps');
let last = performance.now(), frames = 0;
function updateFPS() {
  frames++;
  const now = performance.now();
  if (now - last >= 1000) {
    fpsEl.textContent = `FPS: ${frames}`;
    frames = 0;
    last = now;
  }
  requestAnimationFrame(updateFPS);
}
updateFPS();

// ==================== 🎶 MUSIC SYSTEM ====================
const playerEl = document.getElementById("player");
const input = document.getElementById("songInput");
const searchBtn = document.getElementById("searchBtn");
const resultsEl = document.getElementById("results");

// --- Playlist mặc định ---
const playlist = [
  "v1Pl8CzNzCw",
  "3JZ_D3ELwOQ",
  "xTlNMmZKwpA",
  "2Vv-BfVoq4g",
  "ZbZSe6N_BXs",
  "0KSOMA3QBU0",
  "kJQP7kiw5Fk",
];

// --- Auto play random ---
function getRandomSong() {
  return playlist[Math.floor(Math.random() * playlist.length)];
}
function autoPlayRandom() {
  const id = getRandomSong();
  playerEl.innerHTML = `
    <iframe width="100%" height="240"
      src="https://www.youtube.com/embed/${id}?autoplay=1&loop=1"
      frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
    </iframe>`;
  setTimeout(autoPlayRandom, 1000 * 60 * 4);
}
autoPlayRandom();

// ==================== 🔎 YOUTUBE SEARCH API ====================
// 👉 Cần API key thật để chạy được (thay vào dòng dưới)
const API_KEY = "AIzaSyBig36D7c9cNVHsNNaGxB26mPxcDEkJwc4";

async function searchMusic(query) {
  resultsEl.innerHTML = "<li>Đang tìm kiếm...</li>";
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEY}`
    );
    const data = await res.json();
    resultsEl.innerHTML = "";
    data.items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.snippet.title;
      li.onclick = () => {
        const vid = item.id.videoId;
        playerEl.innerHTML = `
          <iframe width="100%" height="240"
            src="https://www.youtube.com/embed/${vid}?autoplay=1"
            frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
          </iframe>`;
      };
      resultsEl.appendChild(li);
    });
  } catch (err) {
    resultsEl.innerHTML = "<li>Lỗi tìm kiếm hoặc API key chưa được bật.</li>";
  }
}

searchBtn.addEventListener("click", () => {
  const q = input.value.trim();
  if (q) searchMusic(q);
});
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
// --- Coding Days Counter ---
function typeEffect(el, text, speed = 60) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

function updateCodingDays() {
  const startDate = new Date("2023-09-25");
  const today = new Date();
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysText = `${diffDays} days since learning to code`;
  const el = document.getElementById("daysText");
  typeEffect(el, daysText);
}
updateCodingDays();
