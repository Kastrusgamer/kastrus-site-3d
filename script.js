/* ══════════════════════════════════════════════════════════════
   KASTRUS — AAA Interactive System
   Three.js + GSAP + Lenis
   ══════════════════════════════════════════════════════════════ */

(function(){
    'use strict';

    /* ─── LOADER ─── */
    const loader = document.getElementById('loader');
    const progress = document.getElementById('loaderProgress');
    const percent = document.getElementById('loaderPercent');
    let loadVal = 0;

    function updateLoader() {
        loadVal += Math.random() * 15;
        if (loadVal > 100) loadVal = 100;
        progress.style.width = loadVal + '%';
        percent.textContent = Math.floor(loadVal) + '%';
        if (loadVal < 100) {
            setTimeout(updateLoader, 100 + Math.random() * 200);
        } else {
            setTimeout(() => {
                loader.classList.add('hidden');
                init();
            }, 500);
        }
    }
    updateLoader();

    /* ─── MAIN INIT ─── */
    function init() {
        initLenis();
        initThreeScene();
        initGSAP();
        initNav();
        initYouTube();
        initForm();
        initCounters();
    }

    /* ─── LENIS SMOOTH SCROLL ─── */
    function initLenis() {
        window.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        function raf(time) {
            window.lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Sync Lenis with GSAP ScrollTrigger
        window.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { window.lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    /* ─── THREE.JS SCENE ─── */
    function initThreeScene() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050608, 0.0015);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 30);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x050608, 1);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x1B2430, 0.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xFF7A00, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        const pointLight1 = new THREE.PointLight(0xFF7A00, 1.5, 50);
        pointLight1.position.set(-10, 10, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x5AA9FF, 0.8, 40);
        pointLight2.position.set(15, 8, -10);
        scene.add(pointLight2);

        // Grid floor
        const gridHelper = new THREE.GridHelper(200, 80, 0xFF7A00, 0x1B2430);
        gridHelper.position.y = -5;
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Floating structures (towers / industrial)
        const structures = [];
        const structureMat = new THREE.MeshPhongMaterial({
            color: 0x0D1117,
            emissive: 0xFF7A00,
            emissiveIntensity: 0.05,
            wireframe: false,
            transparent: true,
            opacity: 0.8,
        });

        for (let i = 0; i < 20; i++) {
            const h = 5 + Math.random() * 25;
            const w = 1 + Math.random() * 3;
            const geo = new THREE.BoxGeometry(w, h, w);
            const mesh = new THREE.Mesh(geo, structureMat.clone());
            mesh.position.set(
                (Math.random() - 0.5) * 80,
                h / 2 - 5,
                (Math.random() - 0.5) * 80 - 20
            );
            mesh.material.emissiveIntensity = 0.02 + Math.random() * 0.06;
            scene.add(mesh);
            structures.push(mesh);
        }

        // Wireframe cubes floating
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xFF7A00, wireframe: true, transparent: true, opacity: 0.15 });
        const wireCubes = [];
        for (let i = 0; i < 12; i++) {
            const size = 1 + Math.random() * 3;
            const geo = new THREE.BoxGeometry(size, size, size);
            const mesh = new THREE.Mesh(geo, wireMat.clone());
            mesh.position.set(
                (Math.random() - 0.5) * 60,
                Math.random() * 20 - 5,
                (Math.random() - 0.5) * 60 - 10
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            scene.add(mesh);
            wireCubes.push(mesh);
        }

        // Particles
        const particleCount = 300;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 40 - 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            const isOrange = Math.random() > 0.6;
            colors[i * 3] = isOrange ? 1 : 0.35;
            colors[i * 3 + 1] = isOrange ? 0.48 : 0.66;
            colors[i * 3 + 2] = isOrange ? 0 : 1;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const particleMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Mouse tracking
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Scroll-based camera
        let scrollProgress = 0;
        window.addEventListener('scroll', () => {
            scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        });

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animate
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Camera movement
            camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 2 + 5 - camera.position.y) * 0.02;
            camera.position.z = 30 - scrollProgress * 40;
            camera.lookAt(0, 2 - scrollProgress * 10, -10);

            // Floating cubes rotation
            wireCubes.forEach((cube, i) => {
                cube.rotation.x += 0.003 + i * 0.0005;
                cube.rotation.y += 0.005 + i * 0.0003;
                cube.position.y += Math.sin(t + i) * 0.003;
            });

            // Particles drift
            const pos = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pos[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.005;
                if (pos[i * 3 + 1] > 35) pos[i * 3 + 1] = -5;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // Lights pulse
            pointLight1.intensity = 1.2 + Math.sin(t * 0.8) * 0.3;
            pointLight2.intensity = 0.6 + Math.sin(t * 1.2 + 1) * 0.2;

            renderer.render(scene, camera);
        }
        animate();
    }

    /* ─── GSAP ANIMATIONS ─── */
    function initGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance
        const heroTl = gsap.timeline({ delay: 0.3 });
        heroTl
            .to('.hero__badge', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to('.hero__line--sm', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.hero__line--lg', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
            .to('.hero__line--accent', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
            .to('.hero__sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.hero__ctas', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .to('.hero__scroll', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3');

        // Scroll-triggered reveals
        document.querySelectorAll('[data-anim="fade-up"]').forEach(el => {
            gsap.from(el, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                delay: parseFloat(el.dataset.delay) || 0,
            });
        });

        // Scale animations
        document.querySelectorAll('[data-anim="scale-x"]').forEach(el => {
            gsap.from(el, {
                scaleX: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                },
            });
        });

        // Parallax on sections
        gsap.utils.toArray('.about__bg').forEach(el => {
            gsap.to(el, {
                y: -50,
                scrollTrigger: {
                    trigger: el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        });

        // Opacity fade on hero scroll
        gsap.to('.hero__content', {
            opacity: 0,
            y: -80,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: '60% top',
                scrub: 1,
            },
        });

        // Stagger cards
        gsap.utils.toArray('.operacoes__grid, .clipes__grid, .agenda__grid').forEach(grid => {
            const cards = grid.children;
            gsap.from(cards, {
                opacity: 0,
                y: 60,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 80%',
                },
            });
        });
    }

    /* ─── NAVIGATION ─── */
    function initNav() {
        const nav = document.getElementById('nav');
        const burger = document.getElementById('burger');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileLinks = document.querySelectorAll('.mobile-menu__link');

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 80);
        });

        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Smooth scroll for nav links
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(a.getAttribute('href'));
                if (target && window.lenis) {
                    window.lenis.scrollTo(target, { offset: -80 });
                }
            });
        });
    }

    /* ─── YOUTUBE ─── */
    const YT_ID = 'UCBYnAv5IkSBovWPNTb9YlCA';
    const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_ID}`;
    const CORS = 'https://api.allorigins.win/raw?url=';

    async function initYouTube() {
        const grid = document.getElementById('ytGrid');
        if (!grid) return;

        try {
            const res = await fetch(`${CORS}${encodeURIComponent(YT_RSS)}`);
            const text = await res.text();
            const xml = new DOMParser().parseFromString(text, 'text/xml');
            const entries = xml.querySelectorAll('entry');
            if (!entries.length) throw new Error('No videos');

            const videos = Array.from(entries).map(e => ({
                id: e.querySelector('yt\\:videoId, videoId')?.textContent || '',
                title: e.querySelector('title')?.textContent || '',
                thumb: e.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') || '',
                views: e.querySelector('media\\:statistics, statistics')?.getAttribute('views') || '0',
                published: e.querySelector('published')?.textContent || ''
            })).filter(v => v.id);

            const picked = [...videos].sort(() => Math.random() - 0.5).slice(0, 3);

            grid.innerHTML = picked.map(v => `
                <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" class="yt-card">
                    <div class="yt-card__thumb">
                        <img src="${v.thumb}" alt="${v.title}" loading="lazy">
                        <div class="yt-card__play"><i class="fas fa-play"></i></div>
                        <div class="yt-card__views"><i class="fas fa-eye"></i> ${fmtV(v.views)}</div>
                    </div>
                    <div class="yt-card__info">
                        <h4>${v.title.length > 55 ? v.title.substring(0,55)+'...' : v.title}</h4>
                        <p>${ago(v.published)}</p>
                    </div>
                </a>
            `).join('');
        } catch(e) {
            grid.innerHTML = [1,2,3].map(() => `
                <a href="https://www.youtube.com/@KastrusGamer" target="_blank" class="yt-card">
                    <div class="yt-card__thumb">
                        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--detail)">
                            <i class="fab fa-youtube" style="font-size:3rem;color:#ff0000;opacity:0.4"></i>
                        </div>
                        <div class="yt-card__play"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="yt-card__info"><h4>Ver no canal</h4><p>Inscreva-se</p></div>
                </a>
            `).join('');
        }
    }

    function fmtV(v) { const n=parseInt(v); return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n; }
    function ago(d) {
        const s=(Date.now()-new Date(d).getTime())/1000;
        if(s<60)return'Agora';if(s<3600)return Math.floor(s/60)+'min';if(s<86400)return Math.floor(s/3600)+'h';
        if(s<2592000)return Math.floor(s/86400)+'d';if(s<31536000)return Math.floor(s/2592000)+'m';return Math.floor(s/31536000)+'a';
    }

    /* ─── FORM ─── */
    function initForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.cta');
            const txt = btn.querySelector('.cta__text');
            const orig = txt.innerHTML;
            txt.innerHTML = '<span>TRANSMITINDO...</span>';
            btn.disabled = true;
            setTimeout(() => {
                txt.innerHTML = '<span>✓ ENVIADO</span>';
                setTimeout(() => { txt.innerHTML = orig; btn.disabled = false; form.reset(); }, 2500);
            }, 1500);
        });
    }

    /* ─── COUNTERS ─── */
    function initCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(el.dataset.count);
                        const dur = 2000;
                        const start = performance.now();
                        (function tick(now) {
                            const p = Math.min((now - start) / dur, 1);
                            const eased = 1 - Math.pow(1 - p, 3);
                            el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
                            if (p < 1) requestAnimationFrame(tick);
                        })(start);
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(el);
        });
    }

})();
