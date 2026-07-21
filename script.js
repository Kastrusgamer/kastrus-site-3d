/* ══════════════════════════════════════════════════════════════
   KASTRUS — ARC Raiders Interactive System
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initNavigation();
    initScrollReveal();
    initCounters();
    initYouTubeVideos();
    initFormHandler();
    initSmoothScroll();
    initMouseParallax();
});

/* ─── PARTICLE CANVAS ─── */
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.7 ? '#FF7B00' : '#4FAAFF';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse influence
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x -= dx * 0.002;
                this.y -= dy * 0.002;
            }

            if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
        }
    }

    // Create particles
    const count = Math.min(80, Math.floor(w * h / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    // Draw connections
    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 123, 0, ${0.08 * (1 - dist / 120)})`;
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    animate();

    // Track mouse
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
}

/* ─── NAVIGATION ─── */
function initNavigation() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('menuToggle');
    const links = document.getElementById('navLinks');
    const allLinks = document.querySelectorAll('.nav__link');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });

    // Mobile menu
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('active');
        document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active section tracking
    const sections = document.querySelectorAll('.section, .hero');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                allLinks.forEach(l => l.classList.remove('active'));
                const activeLink = document.querySelector(`.nav__link[data-section="${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => {
        if (section.id) observer.observe(section);
    });
}

/* ─── SCROLL REVEAL ─── */
function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal], .section__header, .panel, .schedule-card, .game-card, .clip-card, .contact');
    
    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ─── COUNTER ANIMATION ─── */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 2000;
    const start = performance.now();

    function update(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('pt-BR');
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ─── YOUTUBE VIDEOS ─── */
const YT_CHANNEL_ID = 'UCBYnAv5IkSBovWPNTb9YlCA';
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
const CORS = 'https://api.allorigins.win/raw?url=';

async function initYouTubeVideos() {
    const grid = document.getElementById('youtubeGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${CORS}${encodeURIComponent(YT_RSS)}`);
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const entries = xml.querySelectorAll('entry');

        if (!entries.length) throw new Error('No videos');

        const videos = Array.from(entries).map(e => ({
            id: e.querySelector('yt\\:videoId, videoId')?.textContent || '',
            title: e.querySelector('title')?.textContent || '',
            thumb: e.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') || '',
            views: e.querySelector('media\\:statistics, statistics')?.getAttribute('views') || '0',
            published: e.querySelector('published')?.textContent || ''
        })).filter(v => v.id);

        // Shuffle and pick 3
        const shuffled = [...videos].sort(() => Math.random() - 0.5).slice(0, 3);

        grid.innerHTML = shuffled.map(v => `
            <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" class="yt-card">
                <div class="yt-card__thumb">
                    <img src="${v.thumb}" alt="${v.title}" loading="lazy">
                    <div class="yt-card__play"><i class="fas fa-play"></i></div>
                    <div class="yt-card__views"><i class="fas fa-eye"></i> ${fmtViews(v.views)}</div>
                </div>
                <div class="yt-card__info">
                    <h4>${trunc(v.title, 55)}</h4>
                    <p>${timeAgo(v.published)}</p>
                </div>
            </a>
        `).join('');

    } catch (err) {
        console.error('YT Error:', err);
        grid.innerHTML = `
            <a href="https://www.youtube.com/@KastrusGamer/shorts" target="_blank" class="yt-card">
                <div class="yt-card__thumb">
                    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-metallic)">
                        <i class="fab fa-youtube" style="font-size:3rem;color:#ff0000;opacity:0.5"></i>
                    </div>
                    <div class="yt-card__play"><i class="fas fa-play"></i></div>
                </div>
                <div class="yt-card__info"><h4>Gameplays & Clips</h4><p>Veja no canal</p></div>
            </a>
            <a href="https://www.youtube.com/@KastrusGamer" target="_blank" class="yt-card">
                <div class="yt-card__thumb">
                    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-metallic)">
                        <i class="fab fa-youtube" style="font-size:3rem;color:#ff0000;opacity:0.5"></i>
                    </div>
                    <div class="yt-card__play"><i class="fas fa-play"></i></div>
                </div>
                <div class="yt-card__info"><h4>Últimos Uploads</h4><p>Inscreva-se!</p></div>
            </a>
            <a href="https://www.youtube.com/@KastrusGamer/shorts" target="_blank" class="yt-card">
                <div class="yt-card__thumb">
                    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-metallic)">
                        <i class="fab fa-youtube" style="font-size:3rem;color:#ff0000;opacity:0.5"></i>
                    </div>
                    <div class="yt-card__play"><i class="fas fa-play"></i></div>
                </div>
                <div class="yt-card__info"><h4>Shorts Exclusivos</h4><p>Conteúdo rápido</p></div>
            </a>
        `;
    }
}

function fmtViews(v) {
    const n = parseInt(v);
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n;
}
function trunc(s, l) { return s.length > l ? s.substring(0, l) + '...' : s; }
function timeAgo(d) {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} dias atrás`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} meses atrás`;
    return `${Math.floor(diff / 31536000)} anos atrás`;
}

/* ─── FORM ─── */
function initFormHandler() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn');
        const content = btn.querySelector('.btn__content');
        const origHTML = content.innerHTML;

        content.innerHTML = '<span>TRANSMITINDO...</span>';
        btn.disabled = true;

        setTimeout(() => {
            content.innerHTML = '<span>✓ MENSAGEM ENVIADA</span>';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                content.innerHTML = origHTML;
                btn.disabled = false;
                btn.style.pointerEvents = '';
                form.reset();
            }, 2500);
        }, 1500);
    });
}

/* ─── SMOOTH SCROLL ─── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });
}

/* ─── MOUSE PARALLAX ─── */
function initMouseParallax() {
    const hero = document.querySelector('.hero');
    const grid = document.querySelector('.hero__bg-grid');
    if (!hero || !grid) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        grid.style.transform = `perspective(500px) rotateX(60deg) translate(${x * 20}px, ${y * 10}px)`;
    });

    hero.addEventListener('mouseleave', () => {
        grid.style.transform = 'perspective(500px) rotateX(60deg) translate(0, 0)';
    });
}

/* ─── CONSOLE BRANDING ─── */
console.log(
    '%c◆ KASTRUS OPERATIONS %c ARC Raiders Edition',
    'background: #FF7B00; color: #050608; padding: 8px 16px; font-weight: bold; font-size: 14px;',
    'background: #1E242C; color: #FF7B00; padding: 8px 16px; font-size: 14px;'
);
