/* ============================================================
   NUNESCAR — Lógica da página pública
   ============================================================ */
(function () {
  'use strict';

  var NS = window.NunesCar;

  function q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var FALLBACK_IMG = 'https://picsum.photos/seed/nunescar-fallback/800/600';

  function applyTheme() {
    NS.applyTheme(NS.getSettings());
  }

  function initBrand() {
    var s = NS.getSettings();
    var logo = NS.logoHTML(s);
    q('#logoMark').innerHTML = logo;
    q('#footerMark').innerHTML = logo;
    q('#logoTitle').textContent = s.title;
    q('#logoSub').textContent = s.subtitle;
    q('#footerTitle').textContent = s.title;
    q('#footerSub').textContent = s.subtitle;
    q('#footerTel').href = NS.waLink('Olá, Nunescar! Vim pelo site e gostaria de um atendimento.');
    q('#socialWhats').href = NS.waLink('Olá, Nunescar! Vim pelo site.');
    q('#year').textContent = new Date().getFullYear();
  }

  /* ---------- Partículas ---------- */
  function initParticles() {
    var canvas = q('#fxCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, dots = [];
    var COLOR = NS.hexToRgba(NS.getSettings().accent, 0.6);

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function build(n) {
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.6,
          vy: Math.random() * 0.35 + 0.08,
          vx: (Math.random() - 0.5) * 0.25,
          a: Math.random() * 0.4 + 0.15,
          tw: Math.random() * Math.PI * 2
        });
      }
    }

    build(Math.min(70, Math.max(24, Math.floor(W * H / 22000))));

    var raf;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y -= d.vy;
        d.x += d.vx;
        d.tw += 0.02;
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        var alpha = d.a * (0.6 + 0.4 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.replace(/[\d.]+\)$/, alpha + ')');
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener('beforeunload', function () { cancelAnimationFrame(raf); });
  }

  /* ---------- Header / menu ---------- */
  function initHeader() {
    var header = q('#siteHeader');
    var navToggle = q('#navToggle');

    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });

    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    qa('#siteNav .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    setActiveNav();
    window.addEventListener('scroll', setActiveNav, { passive: true });
  }

  function setActiveNav() {
    var links = qa('#siteNav .nav-link');
    var ids = links.map(function (l) { return l.getAttribute('href'); });
    var pos = window.scrollY + 140;
    var current = 'inicio';
    ids.forEach(function (id) {
      var el = q(id);
      if (el && el.offsetTop <= pos) current = id.replace('#', '');
    });
    links.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  /* ---------- Renderização ---------- */
  function observeNew(el, i) {
    var IO = window.NunesCar_IO;
    if (!IO || !el) return;
    el.setAttribute('data-reveal', '');
    el.style.animationDelay = (i * 70) + 'ms';
    IO.observe(el);
  }

  function renderServices() {
    var grid = q('#servicesGrid');
    var data = NS.getServices();
    if (!data.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Nenhum serviço cadastrado ainda.</div>';
      return;
    }
    grid.innerHTML = data.map(function (s, i) {
      var price = NS.formatBRL(s.valor);
      var kind = (s.valor != null && !isNaN(s.valor)) ? 'valor estimado' : 'consulte';
      var icon = NS.iconSvg(s.icone, 30);
      return '' +
        '<article class="card" data-reveal>' +
          '<div class="svc-head">' +
            '<span class="svc-icon">' + icon + '</span>' +
            '<h3 class="svc-title">' + NS.escapeHtml(s.nome) + '</h3>' +
          '</div>' +
          '<p class="svc-desc">' + NS.escapeHtml(s.descricao) + '</p>' +
          '<div class="svc-footer">' +
            '<span class="price-chip"><span class="price-chip-kind">' + kind + '</span> ' + NS.escapeHtml(price) + '</span>' +
            '<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="' + NS.waLink(NS.msgService(s.nome)) + '">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.55 3.63 1.5 5.12L2 22l5.05-1.49A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.5 13.9c-.2.6-1.2 1.1-1.7 1.15-.44.05-.99.07-1.58-.1-.36-.1-.82-.27-1.42-.53-2.6-1.13-4.3-3.77-4.43-3.94-.13-.17-1.06-1.41-1.06-2.7 0-1.28.67-1.91.91-2.17.24-.26.52-.33.69-.33.17 0 .35 0 .5.01.16.01.38-.06.6.46.23.53.73 1.83.78 1.97.05.13.09.29.02.46-.07.17-.1.28-.21.43-.11.15-.23.34-.32.45-.11.12-.22.24-.09.48.13.24.57 1 1.23 1.62.85.8 1.56 1.05 1.78 1.16.22.11.35.1.48-.05.13-.16.55-.64.7-.86.15-.22.29-.18.49-.11.2.07 1.27.6 1.5.71.22.11.37.17.43.27.05.09.05.55-.15 1.05z"/></svg>' +
              'Orçamento' +
            '</a>' +
          '</div>' +
        '</article>';
    }).join('');
    grid.querySelectorAll('.card').forEach(observeNew);
  }

  function renderProducts() {
    var grid = q('#productsGrid');
    var data = NS.getProducts();
    if (!data.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Nenhum produto cadastrado ainda.</div>';
      return;
    }
    grid.innerHTML = data.map(function (p, i) {
      var price = NS.formatBRL(p.preco);
      return '' +
        '<article class="card product-card" data-reveal>' +
          '<div class="product-media">' +
            '<span class="product-badge">À venda</span>' +
            '<img loading="lazy" src="' + NS.escapeHtml(p.foto) + '" alt="' + NS.escapeHtml(p.nome) + '" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\';">' +
          '</div>' +
          '<div class="product-info">' +
            '<h3 class="product-name">' + NS.escapeHtml(p.nome) + '</h3>' +
            '<p class="product-desc">' + NS.escapeHtml(p.descricao) + '</p>' +
            '<div class="product-price">' + NS.escapeHtml(price) + '</div>' +
            '<a class="btn btn-primary btn-block" target="_blank" rel="noopener" href="' + NS.waLink(NS.msgProduct(p.nome, price)) + '">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 7V6a3 3 0 0 1 6 0v1M6 7h12l-1 13H7z"/></svg>' +
              'Comprar pelo WhatsApp' +
            '</a>' +
          '</div>' +
        '</article>';
    }).join('');
    grid.querySelectorAll('.card').forEach(observeNew);
  }

  function renderGallery() {
    var grid = q('#galleryGrid');
    var data = NS.getGallery();
    if (!data.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Nenhuma foto na galeria ainda.</div>';
      return;
    }
    grid.innerHTML = data.map(function (g, i) {
      return '' +
        '<figure class="g-item" data-reveal tabindex="0" role="button" data-id="' + g.id + '" aria-label="Ampliar foto">' +
          '<img loading="lazy" src="' + NS.escapeHtml(g.foto) + '" alt="' + NS.escapeHtml(g.legenda) + '" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\';">' +
          '<figcaption class="g-cap">' + NS.escapeHtml(g.legenda) + '</figcaption>' +
        '</figure>';
    }).join('');
    grid.querySelectorAll('.g-item').forEach(function (el, i) {
      observeNew(el, i);
      el.addEventListener('click', function () { openLightbox(Number(el.getAttribute('data-id'))); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(Number(el.getAttribute('data-id'))); }
      });
    });
  }

  /* ---------- Modal de agendamento ---------- */
  var chosenService = null;

  function scheduleMessage(service) {
    if (service && service.nome) return NS.msgService(service.nome);
    return 'Olá, Nunescar! Gostaria de agendar um atendimento ou solicitar um orçamento em Brasilinha - GO.';
  }

  function openSchedule() {
    var modal = q('#scheduleModal');
    var opts = q('#serviceOptions');
    var services = NS.getServices();
    opts.innerHTML = services.length
      ? services.map(function (s) {
          return '<button class="svc-choice" data-service="' + s.id + '">' +
            '<span>' + NS.escapeHtml(s.nome) + '</span>' +
            '<span style="color:var(--accent);font-weight:700;font-size:0.9rem;">' + NS.escapeHtml(NS.formatBRL(s.valor)) + '</span>' +
          '</button>';
        }).join('')
      : '<p class="empty">Nenhum serviço cadastrado.</p>';

    chosenService = null;
    opts.querySelectorAll('.svc-choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opts.querySelectorAll('.svc-choice').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var id = btn.getAttribute('data-service');
        chosenService = services.filter(function (s) { return String(s.id) === id; })[0] || null;
        q('#scheduleMessage').textContent = scheduleMessage(chosenService);
      });
    });

    var msg = scheduleMessage(chosenService);
    q('#scheduleMessage').textContent = msg;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function initModals() {
    q('#btnAgendar').addEventListener('click', openSchedule);
    q('#btnOrcamento').addEventListener('click', openSchedule);

    q('#btnConfirmSchedule').addEventListener('click', function () {
      var msg = scheduleMessage(chosenService);
      window.open(NS.waLink(msg), '_blank', 'noopener');
    });

    qa('[data-close-modal]').forEach(function (b) {
      b.addEventListener('click', function () {
        closeModal(b.closest('.modal'));
      });
    });

    qa('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) {
        if (e.target === m) closeModal(m);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        qa('.modal.open').forEach(closeModal);
      }
    });
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(id) {
    var item = NS.getGallery().filter(function (g) { return g.id === id; })[0];
    if (!item) return;
    q('#lightboxImg').src = item.foto;
    q('#lightboxImg').alt = item.legenda || 'Trabalho realizado';
    q('#lightboxImg').onerror = function () { this.onerror = null; this.src = FALLBACK_IMG; };
    q('#lightboxCap').textContent = item.legenda || '';
    var modal = q('#lightbox');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    qa('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var val = Math.floor(p * target);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            obs.unobserve(el);
            requestAnimationFrame(step);
          }
        });
      }, { threshold: 0.4 });
      obs.observe(el);
    });
  }

  /* ---------- Revelação ao rolar ---------- */
  function initReveal() {
    var IO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
          IO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    window.NunesCar_IO = IO;
    qa('[data-reveal]').forEach(function (el) { IO.observe(el); });
  }

  /* ---------- Inicialização ---------- */
  function init() {
    applyTheme();
    initBrand();
    initParticles();
    initHeader();
    renderServices();
    renderProducts();
    renderGallery();
    initModals();
    initCounters();
    initReveal();
    q('#fabWhats').href = NS.waLink('Olá, Nunescar! Vim pelo site e gostaria de um atendimento.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();