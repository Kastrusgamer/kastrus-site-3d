/* ========================================
   KASTRUS 3D - Interactive Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initParticles();
    initFloatingCubes();
    initNavigation();
    initScrollReveal();
    initTiltEffect();
    initHeroCube();
    initFormAnimation();
    initSmoothScroll();
    loadYouTubeVideos();
});

/* ========================================
   YouTube Dynamic Videos
   ======================================== */

const YOUTUBE_CHANNEL_ID = 'UCBYnAv5IkSBovWPNTb9YlCA';
const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function loadYouTubeVideos() {
    const grid = document.getElementById('youtubeGrid');
    
    try {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(YOUTUBE_RSS_URL)}`);
        const text = await response.text();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const entries = xml.querySelectorAll('entry');
        
        if (entries.length === 0) {
            throw new Error('Nenhum vídeo encontrado');
        }
        
        // Converter para array e embaralhar
        const videos = Array.from(entries).map(entry => ({
            id: entry.querySelector('yt\\:videoId, videoId')?.textContent || '',
            title: entry.querySelector('title')?.textContent || 'Sem título',
            thumbnail: entry.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') || '',
            views: entry.querySelector('media\\:statistics, statistics')?.getAttribute('views') || '0',
            published: entry.querySelector('published')?.textContent || ''
        })).filter(v => v.id);
        
        // Embaralhar e pegar 3 aleatórios
        const shuffled = videos.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        
        // Renderizar
        grid.innerHTML = selected.map(video => `
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" class="youtube-card-3d">
                <div class="video-thumbnail-3d">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="play-button-3d">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-views-3d">
                        <i class="fas fa-eye"></i> ${formatViews(video.views)}
                    </div>
                </div>
                <div class="video-info-3d">
                    <h4>${truncate(video.title, 50)}</h4>
                    <p>${timeAgo(video.published)}</p>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
        // Fallback com vídeos estáticos
        grid.innerHTML = `
            <a href="https://www.youtube.com/@KastrusGamer/shorts" target="_blank" class="youtube-card-3d">
                <div class="video-thumbnail-3d">
                    <div class="thumbnail-placeholder"><i class="fab fa-youtube"></i></div>
                    <div class="play-button-3d"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info-3d">
                    <h4>Gameplays & Clips</h4>
                    <p>Veja no canal</p>
                </div>
            </a>
            <a href="https://www.youtube.com/@KastrusGamer" target="_blank" class="youtube-card-3d">
                <div class="video-thumbnail-3d">
                    <div class="thumbnail-placeholder"><i class="fab fa-youtube"></i></div>
                    <div class="play-button-3d"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info-3d">
                    <h4>Últimos Uploads</h4>
                    <p>Inscreva-se!</p>
                </div>
            </a>
            <a href="https://www.youtube.com/@KastrusGamer/shorts" target="_blank" class="youtube-card-3d">
                <div class="video-thumbnail-3d">
                    <div class="thumbnail-placeholder"><i class="fab fa-youtube"></i></div>
                    <div class="play-button-3d"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info-3d">
                    <h4>Shorts Exclusivos</h4>
                    <p>Conteúdo rápido</p>
                </div>
            </a>
        `;
    }
}

function formatViews(views) {
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function truncate(str, len) {
    return str.length > len ? str.substring(0, len) + '...' : str;
}

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} dias atrás`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} meses atrás`;
    return `${Math.floor(diff / 31536000)} anos atrás`;
}

/* ========================================
   Particles System
   ======================================== */

function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;
    const hue = Math.random() > 0.5 ? 260 : 190; // Purple or cyan
    
    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        background: hsl(${hue}, 80%, 60%);
        box-shadow: 0 0 ${size * 2}px hsl(${hue}, 80%, 60%);
    `;
    
    container.appendChild(particle);
}

/* ========================================
   Floating Cubes
   ======================================== */

function initFloatingCubes() {
    const container = document.getElementById('floatingCubes');
    const cubeCount = 8;

    for (let i = 0; i < cubeCount; i++) {
        createFloatingCube(container, i);
    }
}

function createFloatingCube(container, index) {
    const cube = document.createElement('div');
    cube.className = 'floating-cube';
    
    const size = Math.random() * 40 + 40;
    const left = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = Math.random() * 20 + 20;
    
    cube.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
    `;
    
    // Create 6 faces for the cube
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    faces.forEach(face => {
        const side = document.createElement('div');
        side.className = `cube-side ${face}`;
        side.style.width = `${size}px`;
        side.style.height = `${size}px`;
        cube.appendChild(side);
    });
    
    container.appendChild(cube);
}

/* ========================================
   Navigation
   ======================================== */

function initNavigation() {
    const nav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link-3d').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

/* ========================================
   Scroll Reveal Animation
   ======================================== */

function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.section-title-3d, .tiktok-card-3d, .youtube-card-3d, ' +
        '.schedule-card-3d, .game-card-3d, .contact-content-3d, ' +
        '.info-card-3d, .player-frame-3d'
    );

    elements.forEach(el => {
        el.classList.add('scroll-reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ========================================
   Tilt Effect for Cards
   ======================================== */

function initTiltEffect() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

/* ========================================
   Hero Cube Interaction
   ======================================== */

function initHeroCube() {
    const cube = document.getElementById('heroCube');
    let isMouseDown = false;
    let startX, startY;
    let currentRotateX = 0;
    let currentRotateY = 0;

    cube.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        cube.style.animationPlayState = 'paused';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        currentRotateY += deltaX * 0.5;
        currentRotateX -= deltaY * 0.5;
        
        cube.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
        
        startX = e.clientX;
        startY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    // Touch support
    cube.addEventListener('touchstart', (e) => {
        isMouseDown = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        cube.style.animationPlayState = 'paused';
    });

    cube.addEventListener('touchmove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        currentRotateY += deltaX * 0.5;
        currentRotateX -= deltaY * 0.5;
        
        cube.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    cube.addEventListener('touchend', () => {
        isMouseDown = false;
    });
}

/* ========================================
   Form Animation
   ======================================== */

function initFormAnimation() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.submit-btn-3d');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span class="btn-text">ENVIANDO...</span>';
        btn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            btn.innerHTML = '<span class="btn-text">ENVIADO! ✓</span>';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 2000);
        }, 1500);
    });
}

/* ========================================
   Smooth Scroll
   ======================================== */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   Mouse Parallax Effect
   ======================================== */

document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    // Parallax for background elements
    const gridPlane = document.querySelector('.grid-plane');
    if (gridPlane) {
        gridPlane.style.transform = `rotateX(60deg) translate(${mouseX * 20}px, ${mouseY * 20}px)`;
    }

    // Subtle parallax for hero cube
    const heroCube = document.getElementById('heroCube');
    if (heroCube && !document.querySelector('#heroCube:active')) {
        heroCube.parentElement.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
    }
});

/* ========================================
   Dynamic Color Shift on Scroll
   ======================================== */

window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const hue = 260 + (scrollPercent * 60); // Shift from purple to pink
    
    document.documentElement.style.setProperty('--scroll-hue', hue);
});

/* ========================================
   Card Hover Sound Effect (Optional)
   ======================================== */

// Uncomment to enable subtle hover sounds
/*
const hoverSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVggoKIeGBIOGKP...');

document.querySelectorAll('.game-card-3d, .tiktok-card-3d, .youtube-card-3d').forEach(card => {
    card.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.volume = 0.1;
        hoverSound.play().catch(() => {});
    });
});
*/

/* ========================================
   Performance Optimization
   ======================================== */

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttled scroll handler
window.addEventListener('scroll', throttle(() => {
    // Additional scroll-based animations can be added here
}, 16)); // ~60fps

/* ========================================
   Lazy Loading for Iframes
   ======================================== */

const lazyLoadIframe = () => {
    const iframe = document.querySelector('.player-frame-3d iframe');
    if (iframe) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const src = iframe.getAttribute('src');
                    if (src && !iframe.src) {
                        iframe.src = src;
                    }
                }
            });
        }, { rootMargin: '200px' });
        
        observer.observe(iframe);
    }
};

lazyLoadIframe();

/* ========================================
   Easter Egg: Konami Code
   ======================================== */

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 5s linear';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        document.body.style.animation = '';
        style.remove();
    }, 5000);
}

/* ========================================
   Console Easter Egg
   ======================================== */

console.log('%c🎮 KASTRUS 3D EXPERIENCE 🎮', 'color: #9146ff; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
console.log('%cDesenvolvido com paixão para a comunidade gamer!', 'color: #a0a0b0; font-size: 14px;');
console.log('%c twitch.tv/kastrus | tiktok.com/@kastrusgamer | youtube.com/@KastrusGamer', 'color: #00d4ff; font-size: 12px;');
