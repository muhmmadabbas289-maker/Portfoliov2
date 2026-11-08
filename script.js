document.addEventListener('DOMContentLoaded', () => {
    // 1. Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // 2. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Lock scrolling while preloader runs
    lenis.stop();
    document.body.classList.add('loading');

    // Smooth scroll navigation links
    document.querySelectorAll('nav ul a[href^="#"], .mobile-menu a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: 0 });
            }
        });
    });

    // 3. Custom Cursor Track & Hover States
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring && window.matchMedia('(hover: hover)').matches) {
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        (function cursorLoop() {
            rx += (mx - rx) * 0.14;
            ry += (my - ry) * 0.14;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(cursorLoop);
        })();

        document.querySelectorAll('[data-hover], a, button, .skill-card, .proj').forEach((el) => {
            el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
        });
    }

    // 4. Mobile Menu Navigation
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;

    function toggleMenu(force) {
        menuOpen = typeof force === 'boolean' ? force : !menuOpen;
        burger.classList.toggle('open', menuOpen);
        burger.setAttribute('aria-expanded', menuOpen);

        if (menuOpen) {
            lenis.stop();
            gsap.set(mobileMenu, { visibility: 'visible' });
            gsap.to(mobileMenu, { clipPath: 'circle(150% at calc(100% - 3.2rem) 2.6rem)', duration: 0.8, ease: 'power4.inOut' });
            gsap.fromTo(
                '.mobile-menu .mm-link, .mobile-menu .mm-foot',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: 'power3.out', delay: 0.25 }
            );
        } else {
            lenis.start();
            gsap.to(mobileMenu, {
                clipPath: 'circle(0% at calc(100% - 3.2rem) 2.6rem)',
                duration: 0.7,
                ease: 'power4.inOut',
                onComplete: () => gsap.set(mobileMenu, { visibility: 'hidden' })
            });
        }
    }

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => toggleMenu());
        document.querySelectorAll('.mobile-menu .mm-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                toggleMenu(false);
                if (target) setTimeout(() => lenis.scrollTo(target, { offset: 0 }), 500);
            });
        });
    }

    // 5. Fullscreen Preloader (0% to 100%)
    const counterEl = document.querySelector('#preloader .counter span');
    const barFill = document.querySelector('#preloader .bar span');
    const loadProgress = { v: 0 };

    gsap.to(loadProgress, {
        v: 100,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate() {
            const val = Math.floor(loadProgress.v);
            if (counterEl) counterEl.textContent = val;
            if (barFill) barFill.style.width = val + '%';
        },
        onComplete: startSite
    });

    function startSite() {
        document.body.classList.remove('loading');
        lenis.start();

        const tl = gsap.timeline();
        tl.to('#preloader', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
            .set('#preloader', { display: 'none' })
            .from('#heroPhoto', { opacity: 0, y: 50, scale: 0.88, duration: 1.1, ease: 'power3.out' }, '-=.6')
            .to('.hero h1 .line span', { y: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '-=.9')
            .to('.hero .sub', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=.6')
            .from('.hero .meta > *', { opacity: 0, y: 20, stagger: 0.1, duration: 0.7 }, '-=.5')
            .from('nav', { y: -40, opacity: 0, duration: 0.7 }, '-=.6');
    }

    // 6. Hero Parallax & Background Animations
    gsap.to('.hero-photo .frame img', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    gsap.to('#heroPhoto', { y: -14, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    gsap.to('.blob.b1', { y: 120, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to('.blob.b2', { y: -100, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to('.bg-word', { xPercent: -15, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

    // 7. Infinite Marquee Loop & Scroll Skew
    const track = document.getElementById('marqueeTrack');
    if (track) {
        track.innerHTML += track.innerHTML;
        gsap.to(track, { xPercent: -50, ease: 'none', duration: 18, repeat: -1 });
    }

    let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter('.marquee', 'rotation', 'deg'),
        clamp = gsap.utils.clamp(-4, 4);

    ScrollTrigger.create({
        onUpdate(self) {
            const skew = clamp(self.getVelocity() / -400);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, {
                    skew: 0,
                    duration: 0.8,
                    ease: 'power3',
                    overwrite: true,
                    onUpdate: () => skewSetter(proxy.skew)
                });
            }
        }
    });

    // 8. Section Split Title Animations
    document.querySelectorAll('.split-title').forEach((h) => {
        gsap.to(h.querySelector('span'), {
            y: 0,
            duration: 1,
            ease: 'power4.out',
            scrollTrigger: { trigger: h, start: 'top 85%' }
        });
    });

    // 9. Generic Element Fade-Up Reveals
    document.querySelectorAll('.reveal').forEach((el) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' }
        });
    });

    // 10. Skill Card Hover Glow Follower
    document.querySelectorAll('.skill-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', e.clientX - r.left + 'px');
            card.style.setProperty('--my', e.clientY - r.top + 'px');
        });
    });

    // 11. Contact Section Title Reveal
    gsap.to('.contact h2 .ln span', {
        y: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.contact', start: 'top 70%' }
    });
});
