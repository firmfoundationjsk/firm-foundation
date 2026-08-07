function qs(sel, root = document) { return root.querySelector(sel); }

function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }



document.documentElement.classList.add('js-enabled');



function setActiveNav() {

  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  qsa('nav a[data-nav]').forEach(a => {

    const href = (a.getAttribute("href") || "").toLowerCase();

    if (href === path) a.setAttribute("aria-current", "page");

    else a.removeAttribute("aria-current");

  });

}



function setupNavbarScroll() {

  const topbar = qs('.topbar');

  if (!topbar) return;



  const onScroll = () => {

    topbar.classList.toggle('is-scrolled', window.scrollY > 20);

  };



  onScroll();

  window.addEventListener('scroll', onScroll, { passive: true });

}



function setupMobileNav() {

  const btn = qs('[data-menu-btn]');

  const nav = qs('[data-nav-wrap]');

  if (!btn || !nav) return;



  btn.addEventListener("click", () => {

    const open = nav.getAttribute("data-open") === "true";

    nav.setAttribute("data-open", String(!open));

    btn.setAttribute("aria-expanded", String(!open));

  });



  qsa("a", nav).forEach(a => a.addEventListener("click", () => {

    nav.setAttribute("data-open", "false");

    btn.setAttribute("aria-expanded", "false");

  }));

}



function setupFilters() {

  qsa('[data-filter-group]').forEach(group => {

    const chips = qsa('[data-filter]', group);

    const cards = qsa('[data-card]', document);



    function apply(filter) {

      chips.forEach(c => c.setAttribute("aria-pressed", String(c.getAttribute("data-filter") === filter)));

      cards.forEach(card => {

        const kind = (card.getAttribute("data-kind") || "").toLowerCase();

        const ok = filter === "all" || kind.includes(filter);

        card.style.display = ok ? "" : "none";

      });

    }



    chips.forEach(chip => chip.addEventListener("click", () => {

      apply((chip.getAttribute("data-filter") || "all").toLowerCase());

    }));



    const pressed = chips.find(c => c.getAttribute("aria-pressed") === "true");

    apply((pressed?.getAttribute("data-filter") || "all").toLowerCase());

  });

}



function setupAccordion() {

  qsa('[data-accordion] .acc').forEach(acc => {

    const btn = qs("button", acc);

    if (!btn) return;

    btn.addEventListener("click", () => {

      const open = acc.getAttribute("data-open") === "true";

      acc.setAttribute("data-open", String(!open));

    });

  });

}



function setupReveal() {

  const revealItems = qsa('[data-reveal]');

  if (!revealItems.length) return;



  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');

      observer.unobserve(entry.target);

    });

  }, { threshold: 0.15 });



  revealItems.forEach((item, i) => {

    item.style.transitionDelay = `${i % 3 * 80}ms`;

    observer.observe(item);

  });

}



function setupSkillBars() {

  const bars = qsa('.bar[data-target]');

  if (!bars.length) return;



  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      const bar = entry.target;

      const fill = qs('.fill', bar);

      const target = Number(bar.getAttribute('data-target') || '0');

      if (fill) fill.style.width = `${target}%`;

      observer.unobserve(bar);

    });

  }, { threshold: 0.3 });



  bars.forEach(bar => {

    const fill = qs('.fill', bar);

    if (fill) fill.style.width = '0';

    observer.observe(bar);

  });

}



function setupCounters() {
  const counters = qsa('[data-counter] .count');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute('data-target') || '0');
      const suffix = el.getAttribute('data-suffix') || '';
      let start = null;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / 1400, 1);
        el.textContent = Math.floor(easeOut(progress) * target) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}



function setupContactForm() {

  const form = document.getElementById("contact-form");

  if (!form) return;



  if (typeof emailjs !== 'undefined') {

    emailjs.init("CMGZGPy6hAEksoFPX");

  }



  const statusMessage = qs('#status-message');

  const submitBtn = qs('#submit-btn');

  const defaultSubmitText = submitBtn ? submitBtn.textContent : null;

  let hideTimer = null;



  function setLoading(isLoading) {

    if (!submitBtn) return;

    submitBtn.disabled = isLoading;

    submitBtn.textContent = isLoading ? (submitBtn.dataset.loadingText || defaultSubmitText) : defaultSubmitText;

  }



  function showStatus(message, type = 'success') {

    if (!statusMessage) return;

    statusMessage.textContent = message;

    statusMessage.className = `status-message alert ${type} visible`;

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {

      statusMessage.classList.remove('visible');

    }, 4500);

  }



  form.addEventListener("submit", function (e) {

    e.preventDefault();

    setLoading(true);



    if (typeof emailjs === 'undefined') {

      form.submit();

      return;

    }



    emailjs.send("service_m9avwg2", "template_ydrtr2w", {

      name: document.getElementById("name").value,

      email: document.getElementById("email").value,

      project: document.getElementById("project").value,

      message: document.getElementById("message").value,

    })

    .then(function () {

      showStatus("Message envoyé avec succès !", 'success');

      form.reset();

    })

    .catch(function (error) {

      console.log(error);

      showStatus("Erreur lors de l'envoi", 'error');

    })

    .finally(function () {

      setLoading(false);

    });

  });

}



function setupConfirmation() {

  const box = qs('[data-confirmation]');

  if (!box) return;



  let data = null;

  try { data = JSON.parse(sessionStorage.getItem("ff_last_contact") || "null"); } catch (_) {}



  const name = (data?.name || "").split(" ")[0].trim();

  const line = name ? `Merci, ${name}.` : "Merci.";

  const el = qs('[data-confirmation-line]', box);

  if (el) el.textContent = line;

}



function setupParticles() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let width = 0;
  let height = 0;
  let animId = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles(count) {
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.5 ? '124, 58, 237' : '59, 130, 246',
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${p.opacity})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animId = window.requestAnimationFrame(draw);
  }

  resize();
  createParticles(Math.min(60, Math.floor(width * height / 18000)));
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles(Math.min(60, Math.floor(width * height / 18000)));
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) window.cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });
}



document.addEventListener("DOMContentLoaded", () => {

  setActiveNav();

  setupNavbarScroll();

  setupMobileNav();

  setupFilters();

  setupAccordion();

  setupReveal();

  setupSkillBars();

  setupCounters();

  setupContactForm();

  setupConfirmation();

  setupParticles();

  setupLightbox();

});

/* Lightbox setup */
function setupLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lightbox__img');
  const lbCaption = lb.querySelector('.lightbox__caption');
  const closeBtn = lb.querySelector('.lightbox__close');

  let lastFocused = null;

  function open(src, alt) {
    lastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCaption.textContent = alt || '';
    lb.setAttribute('aria-hidden', 'false');
    lb.focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    lbCaption.textContent = '';
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // Close interactions
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') e.stopPropagation();
    }
  });

  // Bind to images in portfolio grids
  qsa('.portfolio-grid .media img').forEach(img => {
    img.setAttribute('tabindex', '0');
    img.addEventListener('click', () => open(img.src, img.alt));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(img.src, img.alt);
      }
    });
  });
}


