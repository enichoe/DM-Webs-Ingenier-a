
    // Initialize variables first
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursor-trail');
    const loader = document.getElementById('loader');
    const nav = document.getElementById('nav');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let trailX = 0;
    let trailY = 0;
    let particles = [];
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Loader
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        animateHeroElements();
      }, 2000);
    });

    // Custom Cursor
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      trailX += (mouseX - trailX) * 0.08;
      trailY += (mouseY - trailY) * 0.08;
      
      if (cursor) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
      }
      if (cursorTrail) {
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
      }
      
      requestAnimationFrame(animateCursor);
    }
    
    if (!prefersReducedMotion) {
      animateCursor();
    }

    // Cursor hover effect
    const hoverElements = document.querySelectorAll('a, button, .skill-card, .project-card');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hovering'));
    });

    // Navigation scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

    // Mobile menu
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-menu-links a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });

    // Hero animations
    function animateHeroElements() {
      const elements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-tagline, .hero-buttons, .hero-stats');
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }, i * 150);
      });
      
      // Animate counters
      setTimeout(() => animateCounters(), 800);
    }

    // Counter animation
    function animateCounters() {
      const counters = document.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current) + '+';
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + '+';
          }
        };
        
        if (!prefersReducedMotion) {
          updateCounter();
        } else {
          counter.textContent = target + '+';
        }
      });
    }

    // Scroll reveal
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Particles Canvas
    function initParticles() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      
      const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.fill();
        
        // Draw connections
        particles.forEach((p2, j) => {
          if (i !== j) {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              const alpha = Math.max(0, (1 - dist / 150) * 0.2);
              ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
              ctx.stroke();
            }
          }
        });
      });
      
      if (!prefersReducedMotion) {
        requestAnimationFrame(drawParticles);
      }
    }

    // Initialize particles
    initParticles();
    if (!prefersReducedMotion) {
      drawParticles();
    }

    // Resize handler
    window.addEventListener('resize', () => {
      initParticles();
    });

    // Form submission
    document.querySelector('.contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('.form-submit');
      btn.textContent = 'Enviando...';
      
      setTimeout(() => {
        btn.textContent = 'Mensaje enviado';
        btn.style.background = '#00d4ff';
        
        setTimeout(() => {
          btn.textContent = 'Enviar mensaje';
          btn.style.background = '';
          e.target.reset();
        }, 2000);
      }, 1500);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });


document.getElementById("contactForm").addEventListener("submit", function(e){

e.preventDefault();

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const phone = document.getElementById("phone").value;
const message = document.getElementById("message").value;

const page = window.location.href;
const time = new Date().toLocaleString();
const device = /Mobi|Android/i.test(navigator.userAgent) ? "📱 Móvil" : "💻 Computadora";

const text = `🚀 *Nuevo contacto desde tu portafolio*

👤 *Nombre:* ${name}
📧 *Email:* ${email}
📱 Teléfono: ${phone}

💬 *Mensaje:*
${message}

━━━━━━━━━━━━━━━
🌐 *Página:* ${page}
🕒 *Hora:* ${time}
${device}

📲 *Contacto generado automáticamente*`;

const url = "https://wa.me/51972498691?text=" + encodeURIComponent(text);

window.open(url, "_blank");

});

