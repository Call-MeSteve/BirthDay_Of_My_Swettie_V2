// ===================================================
// puzzle.js — Part 1: Birthday Puzzle Entry
// Optimized for Ultra-smooth 60FPS Confetti & Seamless Audio
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
        // Soft outer glow without expensive shadowBlur
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha * 0.35;
        ctx.fill();

        // Core star
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.restore();
    }

    draw(ctx) {
        if (this.type === 'heart') this.drawHeart(ctx);
        else this.drawStar(ctx);
    }
}

// Init particles
for (let i = 0; i < 70; i++) bgParticles.push(new BgParticle(true));

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

const dateInput      = document.getElementById('dateInput');
const unlockBtn      = document.getElementById('unlockBtn');
const errorMsg       = document.getElementById('errorMsg');
const successOverlay = document.getElementById('successOverlay');
const lockIcon       = document.getElementById('lockIcon');
const masterAudio    = document.getElementById('masterAudio');
const flowFrame      = document.getElementById('flowFrame');

// Master Audio Controller
window.isMasterAudioPlaying = false;
function playMasterMusic() {
    if (masterAudio) {
        window.isMasterAudioPlaying = true;
        masterAudio.volume = 0.85;
        masterAudio.play().then(() => {
            console.log('Chăm Hoa.mp3 playing smoothly');
        }).catch(e => {
            console.log('Audio autoplay prevented:', e);
        });

        // Continuously synchronize current time
        setInterval(() => {
            if (!masterAudio.paused) {
                sessionStorage.setItem('bgMusicTime', masterAudio.currentTime);
                sessionStorage.setItem('bgMusicActive', 'true');
            }
        }, 300);
    }
}

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
    // Start music immediately on this direct user click gesture!
    playMasterMusic();

    // Lock unlocks!
    lockIcon.textContent = '🔓';
    lockIcon.style.filter = 'drop-shadow(0 0 40px gold)';
    lockIcon.style.transform = 'scale(1.3)';
    unlockBtn.disabled = true;
    dateInput.disabled = true;

    setTimeout(() => {
        successOverlay.classList.add('active');
        startCelebration();

        // Seamless transition after 4.5s - master audio stays alive!
        setTimeout(() => {
            if (flowFrame) {
                flowFrame.src = './birthday.html';
                flowFrame.style.display = 'block';
                requestAnimationFrame(() => {
                    flowFrame.style.opacity = '1';
                });
            } else {
                window.location.href = './birthday.html';
            }
        }, 4500);
    }, 600);
}

// ===================================================
// ULTRA-SMOOTH 3D CELEBRATION CONFETTI CANNONS
// ===================================================
const celebCanvas = document.getElementById('celebCanvas');
const celebCtx    = celebCanvas.getContext('2d');
let celebParts = [];

function resizeCeleb() {
    celebCanvas.width  = window.innerWidth;
    celebCanvas.height = window.innerHeight;
}
resizeCeleb();
window.addEventListener('resize', resizeCeleb);

const CONFETTI_COLORS = [
    { front: '#ff4d6d', back: '#c9184a' }, // Pink / Deep Rose
    { front: '#ffd166', back: '#f39c12' }, // Radiant Gold / Amber
    { front: '#ff758f', back: '#ff4d6d' }, // Blush Pink / Coral
    { front: '#ffffff', back: '#f8edeb' }, // Pure Diamond / Pearl
    { front: '#ffd60a', back: '#e6b800' }, // Brilliant Gold
    { front: '#a855f7', back: '#7c3aed' }, // Royal Violet / Purple
    { front: '#00f2fe', back: '#0984e3' }  // Shimmer Aqua
];

class CelebParticle {
    constructor(originType) {
        const W = celebCanvas.width;
        const H = celebCanvas.height;

        this.colorObj = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        this.shape = Math.random() < 0.65 ? 'ribbon' : (Math.random() < 0.6 ? 'star' : 'heart');

        if (originType === 'left') {
            // Cannon blasting from bottom-left up and inwards
            this.x = Math.random() * 40;
            this.y = H - Math.random() * 50;
            const angle = -(Math.PI / 4) + (Math.random() - 0.5) * 0.45;
            const speed = Math.random() * 15 + 14;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else if (originType === 'right') {
            // Cannon blasting from bottom-right up and inwards
            this.x = W - Math.random() * 40;
            this.y = H - Math.random() * 50;
            const angle = -(3 * Math.PI / 4) + (Math.random() - 0.5) * 0.45;
            const speed = Math.random() * 15 + 14;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            // Fountain burst across the upper area
            this.x = W / 2 + (Math.random() - 0.5) * (W * 0.6);
            this.y = H * 0.35 + (Math.random() - 0.5) * 100;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 4;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 6;
        }

        this.size = Math.random() * 7 + 6;
        this.gravity = 0.22;
        this.friction = 0.965;
        this.terminalVelocity = 4.2;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.12;

        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.14 + 0.08;
        this.flutter = Math.random() * 1.5 + 0.8;

        this.maxLife = 140 + Math.random() * 60;
        this.life = this.maxLife;
    }

    update() {
        this.vx *= this.friction;
        this.vy = (this.vy * this.friction) + this.gravity;
        if (this.vy > this.terminalVelocity) this.vy = this.terminalVelocity;

        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * this.flutter;
        this.y += this.vy;

        this.rotation += this.rotSpeed;
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const progress = this.life / this.maxLife;
        const alpha = Math.min(1, progress * 1.8);
        const cosWobble = Math.cos(this.wobble);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(cosWobble, 1); // 3D perspective flip!

        ctx.globalAlpha = alpha;
        // Two-tone 3D paper effect: front color vs back shadow color
        ctx.fillStyle = cosWobble > 0 ? this.colorObj.front : this.colorObj.back;

        if (this.shape === 'ribbon') {
            // Elegant rectangular 3D confetti strip
            const w = this.size;
            const h = this.size * 2.2;
            ctx.fillRect(-w / 2, -h / 2, w, h);
        } else if (this.shape === 'star') {
            // Shimmering 4-point sparkle
            const r = this.size * 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.quadraticCurveTo(0, 0, 0, r);
            ctx.quadraticCurveTo(0, 0, -r, 0);
            ctx.quadraticCurveTo(0, 0, 0, -r);
            ctx.closePath();
            ctx.fill();
        } else {
            // Romantic floating heart
            const s = this.size * 0.08;
            ctx.scale(s, s);
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.bezierCurveTo(10, -22, 24, -14, 24, -4);
            ctx.bezierCurveTo(24, 10, 12, 22, 0, 32);
            ctx.bezierCurveTo(-12, 22, -24, 10, -24, -4);
            ctx.bezierCurveTo(-24, -14, -10, -22, 0, -10);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

function startCelebration() {
    celebParts = [];

    // Wave 1: Immediate powerful double cannon salvo from left & right
    for (let i = 0; i < 45; i++) {
        celebParts.push(new CelebParticle('left'));
        celebParts.push(new CelebParticle('right'));
    }

    // Wave 2: Center radiant burst
    setTimeout(() => {
        for (let i = 0; i < 50; i++) celebParts.push(new CelebParticle('center'));
    }, 280);

    // Wave 3: Secondary cannon blast
    setTimeout(() => {
        for (let i = 0; i < 35; i++) {
            celebParts.push(new CelebParticle('left'));
            celebParts.push(new CelebParticle('right'));
        }
    }, 650);

    // Wave 4: Gentle finishing flutter
    setTimeout(() => {
        for (let i = 0; i < 40; i++) celebParts.push(new CelebParticle('center'));
    }, 1300);

    animateCeleb();
}

function animateCeleb() {
    celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
    celebParts = celebParts.filter(p => p.life > 0 && p.y < celebCanvas.height + 40);

    for (let i = 0; i < celebParts.length; i++) {
        celebParts[i].update();
        celebParts[i].draw(celebCtx);
    }

    if (successOverlay.classList.contains('active') && celebParts.length > 0) {
        requestAnimationFrame(animateCeleb);
    }
}
