// ===================================================
// puzzle.js — Part 1: Birthday Puzzle Entry
// ===================================================

// ===== BACKGROUND CANVAS: Floating hearts & stars =====
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let bgParticles = [];

function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

class BgParticle {
    constructor(randomY = true) {
        this.reset(randomY);
    }

    reset(randomY = false) {
        this.x = Math.random() * bgCanvas.width;
        this.y = randomY ? Math.random() * bgCanvas.height : bgCanvas.height + 20;
        this.size = Math.random() * 2.5 + 0.5;
        this.speed = Math.random() * 0.6 + 0.2;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.7 + 0.1;
        this.alphaDir = (Math.random() - 0.5) * 0.008;
        this.type = Math.random() < 0.35 ? 'heart' : 'star';
        this.color = ['#ff6b9d', '#ffd60a', '#ffffff', '#c9184a', '#ffb3c6'][Math.floor(Math.random() * 5)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.scale = Math.random() * 0.08 + 0.04;
    }

    update() {
        this.y -= this.speed;
        this.x += this.vx;
        this.rotation += this.rotSpeed;
        this.alpha += this.alphaDir;
        if (this.alpha > 0.8) this.alphaDir = -Math.abs(this.alphaDir);
        if (this.alpha < 0.05) this.alphaDir = Math.abs(this.alphaDir);
        if (this.y < -30 || this.x < -30 || this.x > bgCanvas.width + 30) this.reset();
    }

    drawHeart(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.bezierCurveTo(10, -22, 24, -14, 24, -4);
        ctx.bezierCurveTo(24, 10, 12, 22, 0, 32);
        ctx.bezierCurveTo(-12, 22, -24, 10, -24, -4);
        ctx.bezierCurveTo(-24, -14, -10, -22, 0, -10);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.restore();
    }

    drawStar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 3;
        ctx.fill();
        ctx.restore();
    }

    draw(ctx) {
        if (this.type === 'heart') this.drawHeart(ctx);
        else this.drawStar(ctx);
    }
}

// Init particles
for (let i = 0; i < 90; i++) bgParticles.push(new BgParticle(true));

function animateBg() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.globalAlpha = 1;
    bgParticles.forEach(p => {
        p.update();
        p.draw(bgCtx);
    });
    requestAnimationFrame(animateBg);
}
animateBg();

// ===== PUZZLE LOGIC =====
const VALID_ANSWERS = [
    '7/10', '07/10',
    '7/10/2004', '07/10/2004',
    '7102004', '07102004',
    '10/7', '10/07',
    '10/7/2004', '10/07/2004'
];

const dateInput   = document.getElementById('dateInput');
const unlockBtn   = document.getElementById('unlockBtn');
const errorMsg    = document.getElementById('errorMsg');
const successOverlay = document.getElementById('successOverlay');
const lockIcon    = document.getElementById('lockIcon');

// Auto-format input as DD/MM/YYYY
dateInput.addEventListener('input', function () {
    let raw = this.value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (raw.length > 0) formatted += raw.slice(0, 2);
    if (raw.length > 2) formatted += '/' + raw.slice(2, 4);
    if (raw.length > 4) formatted += '/' + raw.slice(4, 8);
    this.value = formatted;
    errorMsg.textContent = '';
    this.classList.remove('shake');
});

dateInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkAnswer();
});

unlockBtn.addEventListener('click', checkAnswer);

function checkAnswer() {
    const val = dateInput.value.trim().replace(/\s/g, '');
    if (!val) {
        showError('Em chưa nhập gì cả rồi... 🥺');
        return;
    }
    if (VALID_ANSWERS.includes(val)) {
        triggerSuccess();
    } else {
        showError('💔 Sai rồi pé ơi... thử lại đi nha!');
        lockIcon.style.filter = 'drop-shadow(0 0 20px rgba(255,77,77,0.8))';
        lockIcon.textContent = '😢';
        setTimeout(() => {
            lockIcon.textContent = '🔐';
            lockIcon.style.filter = 'drop-shadow(0 0 24px rgba(255,107,157,0.7))';
        }, 1800);
    }
}

function showError(msg) {
    errorMsg.textContent = msg;
    dateInput.classList.remove('shake');
    void dateInput.offsetWidth; // reflow to restart animation
    dateInput.classList.add('shake');
}

function triggerSuccess() {
    // Lock unlocks!
    lockIcon.textContent = '🔓';
    lockIcon.style.filter = 'drop-shadow(0 0 40px gold)';
    lockIcon.style.transform = 'scale(1.3)';
    unlockBtn.disabled = true;
    dateInput.disabled = true;

    setTimeout(() => {
        successOverlay.classList.add('active');
        startCelebration();
        // Redirect after 4.5s
        setTimeout(() => {
            window.location.href = './birthday.html';
        }, 4500);
    }, 600);
}

// ===== CELEBRATION PARTICLES =====
const celebCanvas = document.getElementById('celebCanvas');
const celebCtx    = celebCanvas.getContext('2d');
let celebParts = [];

function resizeCeleb() {
    celebCanvas.width  = window.innerWidth;
    celebCanvas.height = window.innerHeight;
}
resizeCeleb();

const CELEB_COLORS = ['#ff6b9d', '#ffd60a', '#ff4d6d', '#ffffff', '#c9184a', '#ffef80', '#ff9de2'];
const CELEB_EMOJIS = ['❤️', '🎂', '⭐', '🎉', '🌸', '💕'];

class CelebParticle {
    constructor() {
        const cx = celebCanvas.width / 2;
        const cy = celebCanvas.height / 2;
        this.x  = cx + (Math.random() - 0.5) * 100;
        this.y  = cy + (Math.random() - 0.5) * 60;
        const angle  = Math.random() * Math.PI * 2;
        const speed  = Math.random() * 14 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 6;
        this.gravity = 0.28;
        this.maxLife  = 120 + Math.random() * 80;
        this.life     = this.maxLife;
        this.size     = Math.random() * 7 + 3;
        this.isEmoji  = Math.random() < 0.25;
        this.emoji    = CELEB_EMOJIS[Math.floor(Math.random() * CELEB_EMOJIS.length)];
        this.color    = CELEB_COLORS[Math.floor(Math.random() * CELEB_COLORS.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.15;
        this.shape    = Math.random() < 0.5 ? 'circle' : 'rect';
    }

    update() {
        this.vx   *= 0.985;
        this.vy   += this.gravity;
        this.x    += this.vx;
        this.y    += this.vy;
        this.rotation += this.rotSpeed;
        this.life--;
    }

    draw() {
        if (this.life <= 0) return;
        const alpha = Math.min(1, (this.life / this.maxLife) * 1.5);
        celebCtx.globalAlpha = alpha;
        celebCtx.save();
        celebCtx.translate(this.x, this.y);
        celebCtx.rotate(this.rotation);

        if (this.isEmoji) {
            celebCtx.font = `${this.size * 2.5}px Arial`;
            celebCtx.textAlign = 'center';
            celebCtx.textBaseline = 'middle';
            celebCtx.fillText(this.emoji, 0, 0);
        } else if (this.shape === 'rect') {
            celebCtx.fillStyle = this.color;
            celebCtx.fillRect(-this.size / 2, -this.size * 1.5, this.size, this.size * 3);
        } else {
            celebCtx.fillStyle = this.color;
            celebCtx.beginPath();
            celebCtx.arc(0, 0, this.size, 0, Math.PI * 2);
            celebCtx.fill();
        }
        celebCtx.restore();
        celebCtx.globalAlpha = 1;
    }
}

function startCelebration() {
    // Burst in waves
    for (let wave = 0; wave < 8; wave++) {
        setTimeout(() => {
            for (let j = 0; j < 25; j++) {
                celebParts.push(new CelebParticle());
            }
        }, wave * 180);
    }
    animateCeleb();
}

function animateCeleb() {
    celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
    celebParts = celebParts.filter(p => p.life > 0);
    celebParts.forEach(p => { p.update(); p.draw(); });
    if (successOverlay.classList.contains('active')) {
        requestAnimationFrame(animateCeleb);
    }
}
