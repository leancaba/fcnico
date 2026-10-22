/* =========================================================
   REGALO · navegación horizontal + carga de discos
   ========================================================= */
(() => {
  const cfg = window.REGALO_CONFIG || {};
  const track = document.getElementById('track');
  const counter = document.getElementById('counter');
  const bar = document.getElementById('progress-bar');
  const btnPrev = document.getElementById('prev');
  const btnNext = document.getElementById('next');

  const DUR = 1050;           // igual a --dur en CSS
  let slides = [];
  let idx = 0;
  let locked = false;

  /* ---------- Textos y links desde config ---------- */
  document.querySelectorAll('[data-nombre]').forEach(el => { el.textContent = cfg.nombre || 'Nico'; });
  document.querySelectorAll('[data-link]').forEach(el => {
    const url = (cfg.links || {})[el.dataset.link];
    if (url) el.href = url;
  });

  /* ---------- Utilidades ---------- */
  const safeUrl = (u) => {
    try {
      const url = new URL(String(u || '').trim());
      return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : '';
    } catch { return ''; }
  };
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Discos ---------- */
  async function fetchDiscos() {
    const sb = cfg.supabase || {};
    try {
      if (sb.url && sb.anonKey) {
        const res = await fetch(`${sb.url.replace(/\/$/, '')}/rest/v1/discos?select=*&order=creado.asc`, {
          headers: { apikey: sb.anonKey, Authorization: `Bearer ${sb.anonKey}` }
        });
        if (!res.ok) throw new Error(res.status);
        return await res.json();
      }
      const res = await fetch('discos.json', { cache: 'no-store' });
      return res.ok ? await res.json() : [];
    } catch (e) {
      console.warn('No se pudieron cargar los discos:', e);
      return [];
    }
  }

  function buildAlbum(d) {
    const img = safeUrl(d.imagen);
    const link = safeUrl(d.link);

    const s = document.createElement('section');
    s.className = 'slide slide--album';

    const bg = document.createElement('div');
    bg.className = 'album-bg';
    bg.setAttribute('aria-hidden', 'true');
    if (img) bg.style.backgroundImage = `url("${img.replace(/"/g, '%22')}")`;

    const shade = document.createElement('div');
    shade.className = 'album-shade';
    shade.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('div');
    inner.className = 'slide-inner center';

    const cover = document.createElement('img');
    cover.className = 'album-cover rv';
    cover.style.setProperty('--i', 0);
    cover.alt = `Portada de ${d.titulo || 'disco'}`;
    cover.referrerPolicy = 'no-referrer';
    cover.decoding = 'async';
    if (img) cover.src = img;

    const h = document.createElement('h2');
    h.className = 'album-title rv';
    h.style.setProperty('--i', 1);
    h.textContent = (d.titulo || '').toUpperCase();

    inner.append(cover, h);

    if (d.comentario) {
      const p = document.createElement('p');
      p.className = 'album-note rv';
      p.style.setProperty('--i', 2);
      p.textContent = String(d.comentario).split('\n').slice(0, 3).join('\n');
      inner.append(p);
    }

    if (link) {
      const a = document.createElement('a');
      a.className = 'btn-dl rv';
      a.style.setProperty('--i', 3);
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'DESCARGAR';
      inner.append(a);
    }

    s.append(bg, shade, inner);
    return s;
  }

  /* ---------- Navegación ---------- */
  function render(animate = true) {
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translate3d(${-idx * 100}vw,0,0)`;
    if (!animate) { track.offsetHeight; track.style.transition = ''; }

    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
      s.classList.toggle('is-before', i < idx);
      s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      s.inert = i !== idx;
    });

    counter.textContent = `${pad(idx + 1)} / ${pad(slides.length)}`;
    bar.style.transform = `scaleX(${slides.length > 1 ? idx / (slides.length - 1) : 1})`;
    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === slides.length - 1;
  }

  function go(n) {
    const target = Math.max(0, Math.min(slides.length - 1, n));
    if (target === idx || locked) { snapBack(); return; }
    idx = target;
    locked = true;
    render();
    setTimeout(() => { locked = false; }, DUR * .85);
  }
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  function snapBack() {
    track.classList.remove('is-dragging');
    track.style.transform = `translate3d(${-idx * 100}vw,0,0)`;
  }

  /* Rueda / trackpad: abajo o derecha = avanzar, arriba o izquierda = volver */
  let acc = 0, lastWheel = 0, cooling = false;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;

    if (locked) return;
    // ignora la inercia del trackpad hasta que haya una pausa real
    if (cooling && gap < 160) return;
    cooling = false;

    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    acc = gap > 200 ? d : acc + d;

    if (Math.abs(acc) > 35) {
      acc > 0 ? next() : prev();
      acc = 0;
      cooling = true;
    }
  }, { passive: false });

  /* Teclado */
  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(slides.length - 1);
  });

  /* Táctil: swipe vertical u horizontal, el track sigue un poco al dedo */
  let tx = 0, ty = 0, touching = false, axis = null;
  const stage = document.getElementById('stage');

  stage.addEventListener('touchstart', (e) => {
    if (locked) return;
    const t = e.touches[0];
    tx = t.clientX; ty = t.clientY; touching = true; axis = null;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!touching) return;
    const t = e.touches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    if (!axis && Math.hypot(dx, dy) > 8) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (!axis) return;
    // "deslizar hacia arriba" (dy<0) o "hacia la izquierda" (dx<0) = avanzar
    let d = axis === 'x' ? dx : dy;
    if ((idx === 0 && d > 0) || (idx === slides.length - 1 && d < 0)) d *= .25;
    track.classList.add('is-dragging');
    track.style.transform = `translate3d(calc(${-idx * 100}vw + ${d * .45}px),0,0)`;
  }, { passive: true });

  const endTouch = (e) => {
    if (!touching) return;
    touching = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    track.classList.remove('is-dragging');
    const d = axis === 'x' ? dx : axis === 'y' ? dy : 0;
    if (Math.abs(d) > 45) { d < 0 ? next() : prev(); }
    else snapBack();
  };
  stage.addEventListener('touchend', endTouch);
  stage.addEventListener('touchcancel', endTouch);

  /* Botones */
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) next();
  });

  /* ---------- Init ---------- */
  async function init() {
    const discos = (await fetchDiscos()).filter(d => d && d.titulo);
    discos.forEach(d => track.appendChild(buildAlbum(d)));
    document.getElementById('musica-cta').hidden = discos.length === 0;

    slides = Array.from(track.querySelectorAll('.slide'));
    render(false);
    // primer frame sin clase activa para que se vea la entrada
    slides[0].classList.remove('is-active');
    requestAnimationFrame(() => requestAnimationFrame(() => slides[0].classList.add('is-active')));
  }

  init();
})();
