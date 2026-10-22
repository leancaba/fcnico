/* =========================================================
   PANEL ADMIN · alta y baja de discos (Supabase)
   ========================================================= */
(() => {
  const sb = (window.REGALO_CONFIG || {}).supabase || {};
  const base = (sb.url || '').replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);

  if (!base || !sb.anonKey) {
    $('no-db').hidden = false;
    return;
  }

  const headers = {
    apikey: sb.anonKey,
    Authorization: `Bearer ${sb.anonKey}`,
    'Content-Type': 'application/json'
  };

  const rpc = async (fn, body) => {
    const res = await fetch(`${base}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || `Error ${res.status}`);
    return data;
  };

  const getClave = () => sessionStorage.getItem('regalo_clave') || '';
  const setMsg = (el, text, type = '') => { el.textContent = text; el.className = `msg ${type}`; };

  /* ---------- Login ---------- */
  async function showPanel() {
    $('login').hidden = true;
    $('panel').hidden = false;
    await loadList();
  }

  $('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const clave = $('clave').value;
    setMsg($('login-msg'), 'verificando…');
    try {
      const ok = await rpc('check_admin', { p_clave: clave });
      if (!ok) return setMsg($('login-msg'), 'clave incorrecta', 'err');
      sessionStorage.setItem('regalo_clave', clave);
      setMsg($('login-msg'), '');
      showPanel();
    } catch (err) {
      setMsg($('login-msg'), err.message, 'err');
    }
  });

  /* ---------- Vista previa de portada ---------- */
  const prev = $('preview');
  $('imagen').addEventListener('input', (e) => {
    const v = e.target.value.trim();
    prev.classList.remove('show');
    if (/^https?:\/\//.test(v)) prev.src = v;
  });
  prev.addEventListener('load', () => prev.classList.add('show'));
  prev.addEventListener('error', () => prev.classList.remove('show'));

  /* ---------- Comentario: máximo 3 líneas ---------- */
  $('comentario').addEventListener('input', (e) => {
    const lines = e.target.value.split('\n');
    if (lines.length > 3) e.target.value = lines.slice(0, 3).join('\n');
  });

  /* ---------- Guardar ---------- */
  $('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('guardar');
    btn.disabled = true;
    setMsg($('form-msg'), 'guardando…');
    try {
      await rpc('add_disco', {
        p_clave: getClave(),
        p_titulo: $('titulo').value.trim(),
        p_imagen: $('imagen').value.trim(),
        p_comentario: $('comentario').value.trim(),
        p_link: $('link').value.trim()
      });
      e.target.reset();
      prev.classList.remove('show');
      setMsg($('form-msg'), 'disco guardado ✓', 'ok');
      await loadList();
    } catch (err) {
      setMsg($('form-msg'), err.message, 'err');
      if (/clave/i.test(err.message)) logout();
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- Listado + borrar ---------- */
  async function loadList() {
    const list = $('list');
    list.innerHTML = '';
    let discos = [];
    try {
      const res = await fetch(`${base}/rest/v1/discos?select=*&order=creado.asc`, { headers });
      discos = await res.json();
    } catch { /* sin conexión */ }

    $('empty').hidden = discos.length > 0;

    discos.forEach((d, i) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.style.animationDelay = `${i * 50}ms`;

      const img = document.createElement('img');
      img.src = d.imagen; img.alt = ''; img.referrerPolicy = 'no-referrer';

      const info = document.createElement('div');
      info.style.minWidth = '0';
      const t = document.createElement('div'); t.className = 't'; t.textContent = d.titulo;
      const l = document.createElement('div'); l.className = 'l'; l.textContent = d.link;
      info.append(t, l);

      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = 'borrar';
      del.addEventListener('click', async () => {
        if (!confirm(`¿Borrar "${d.titulo}"?`)) return;
        del.disabled = true;
        try {
          await rpc('borrar_disco', { p_clave: getClave(), p_id: d.id });
          await loadList();
        } catch (err) {
          alert(err.message);
          del.disabled = false;
        }
      });

      li.append(img, info, del);
      list.append(li);
    });
  }

  function logout() {
    sessionStorage.removeItem('regalo_clave');
    $('panel').hidden = true;
    $('login').hidden = false;
  }

  /* ---------- Init ---------- */
  (async () => {
    const clave = getClave();
    if (clave) {
      try { if (await rpc('check_admin', { p_clave: clave })) return showPanel(); } catch {}
    }
    $('login').hidden = false;
  })();
})();
