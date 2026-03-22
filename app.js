
    /* 
       AGENCIA ELITE ENGINE - DM WEBS
       INTERACTIVITY & ANIMATION 
    */
    (function() {
      'use strict';

      // 1. ELITE CURSOR SYSTEM
      const cursor = document.getElementById('cursor');
      const trail = document.getElementById('cursor-trail');
      let isMoving = false;

      document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        trail.style.transform = `translate(${x}px, ${y}px)`;
        
        isMoving = true;
      });

      // Hover Effect for Cursor
      const eliteLinks = document.querySelectorAll('a, button, .pain-card, .result-card');
      eliteLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          trail.style.width = '60px';
          trail.style.height = '60px';
          trail.style.background = 'rgba(0, 168, 232, 0.1)';
          trail.style.border = 'none';
          cursor.style.transform = `translate(-50%, -50%) scale(1.5)`;
        });
        link.addEventListener('mouseleave', () => {
          trail.style.width = '40px';
          trail.style.height = '40px';
          trail.style.background = 'transparent';
          trail.style.border = '1px solid rgba(255,255,255,0.2)';
          cursor.style.transform = `translate(-50%, -50%) scale(1)`;
        });
      });

      // 2. PARALLAX HERO (WOW EFFECT)
      const heroMockup = document.querySelector('.hero-mockup');
      if (heroMockup) {
        document.addEventListener('mousemove', (e) => {
          const x = (window.innerWidth / 2 - e.pageX) / 45;
          const y = (window.innerHeight / 2 - e.pageY) / 45;
          heroMockup.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
        });
      }

      // 3. NAV SCROLL LOGIC
      const nav = document.getElementById('nav');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      });

      // 4. MOBILE MENU SYNC
      const mobileToggle = document.getElementById('mobile-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileClose = document.getElementById('mobile-close');
      const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

      function closeMobileMenu() {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }

      mobileToggle.addEventListener('click', () => {
        const isActive = mobileToggle.classList.contains('active');
        if (isActive) {
          closeMobileMenu();
        } else {
          mobileToggle.classList.add('active');
          mobileMenu.classList.add('active');
          document.body.classList.add('no-scroll');
        }
      });

      if (mobileClose) {
        mobileClose.addEventListener('click', closeMobileMenu);
      }

      mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });


      // 5. OBSERVER REVEAL SYSTEM
      const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -80px 0px' };
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target); // Performance: stop watching once revealed
          }
        });
      }, observerOptions);

      document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

      // 7. PREMIUN LIKE SYSTEM
      const likeButtons = document.querySelectorAll('.like-btn');
      
      // Seed initial data if not exists (for demo impact)
      const projectSeeds = {
        'pideclick': 142,
        'tactica': 98,
        'taller': 64,
        'veterinaria': 87,
        'vargas': 52,
        'nails': 41,
        'notaria': 33,
        'policlinico': 56,
        'menuclick': 124,
        'storeclick': 110,
        'ayem': 29
      };

      function initLikes() {
        likeButtons.forEach(btn => {
          const projectId = btn.dataset.project;
          let likes = localStorage.getItem(`likes_${projectId}`);
          let hasLiked = localStorage.getItem(`hasLiked_${projectId}`) === 'true';
          
          if (!likes) {
            likes = projectSeeds[projectId] || 0;
            localStorage.setItem(`likes_${projectId}`, likes);
          }
          
          btn.querySelector('.like-count').textContent = likes;
          if (hasLiked) btn.classList.add('liked');
          
          btn.onclick = (e) => {
            e.preventDefault();
            toggleLike(btn, projectId);
          };
        });
      }

      function toggleLike(btn, id) {
        let likes = parseInt(localStorage.getItem(`likes_${id}`));
        let hasLiked = localStorage.getItem(`hasLiked_${id}`) === 'true';
        
        if (hasLiked) {
          likes--;
          localStorage.setItem(`hasLiked_${id}`, 'false');
          btn.classList.remove('liked');
        } else {
          likes++;
          localStorage.setItem(`hasLiked_${id}`, 'true');
          btn.classList.add('liked');
          // Simple shockwave effect
          createLikeParticle(btn);
        }
        
        localStorage.setItem(`likes_${id}`, likes);
        btn.querySelector('.like-count').textContent = likes;
      }

      function createLikeParticle(btn) {
        const particle = document.createElement('span');
        particle.textContent = '❤️';
        particle.style.position = 'absolute';
        particle.style.left = '50%';
        particle.style.top = '0';
        particle.style.transform = 'translate(-50%, 0)';
        particle.style.pointerEvents = 'none';
        particle.style.animation = 'floatUp 1s ease-out forwards';
        btn.style.position = 'relative';
        btn.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }

      // Add particle animation to CSS via JS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -40px) scale(1.5); }
        }
      `;
      document.head.appendChild(style);

      initLikes();

    })();
