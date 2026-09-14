/* ============================================================
   NUNESCAR — Lógica do painel administrativo
   ============================================================ */
(function () {
  'use strict';

  var NS = window.NunesCar;

  var ADMIN_USER = '12345';
  var ADMIN_PASS = '12345';
  var FALLBACK_IMG = 'https://picsum.photos/seed/nunescar-fallback/800/600';

  var editing = { type: null, id: null };

  function q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function toast(msg) {
    var t = q('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- Sessão ---------- */
  function isLogged() {
    return sessionStorage.getItem(NS.KEYS.session) === '1';
  }

  function showPanel() {
    q('#loginView').style.display = 'none';
    q('#panelView').style.display = '';
    NS.applyTheme(NS.getSettings());
    initBrand();
    renderAll();
  }

  function showLogin() {
    q('#panelView').style.display = 'none';
    q('#loginView').style.display = '';
  }

  function logout() {
    sessionStorage.removeItem(NS.KEYS.session);
    showLogin();
  }

  /* ---------- Brand ---------- */
  function initBrand() {
    var s = NS.getSettings();
    var logo = NS.logoHTML(s);
    q('#loginMark').innerHTML = logo;
    q('#panelMark').innerHTML = logo;
    q('#panelLogoSub').textContent = s.title;
    var prev = q('#logoPreview');
    if (prev) prev.innerHTML = logo;
  }

  /* ---------- Login ---------- */
  function initLogin() {
    q('#loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var u = q('#loginUser').value.trim();
      var p = q('#loginPass').value;
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem(NS.KEYS.session, '1');
        q('#loginError').style.display = 'none';
        showPanel();
      } else {
        q('#loginError').style.display = '';
      }
    });
    q('#btnLogout').addEventListener('click', logout);
  }

  /* ---------- Abas ---------- */
  function initTabs() {
    qa('#adminTabs .tabbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qa('#adminTabs .tabbtn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var tab = btn.getAttribute('data-tab');
        qa('.tabview').forEach(function (v) { v.style.display = 'none'; });
        q('#tab-' + tab).style.display = '';
      });
    });
  }

  /* ================= EDITOR MODAL (genérico) ================= */
  function fieldText(id, label, value, ph) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input class="input" type="text" id="' + id + '" value="' + NS.escapeHtml(value) + '" placeholder="' + NS.escapeHtml(ph || '') + '"></div>';
  }
  function fieldArea(id, label, value, ph) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<textarea class="input" id="' + id + '" placeholder="' + NS.escapeHtml(ph || '') + '">' + NS.escapeHtml(value) + '</textarea></div>';
  }
  function fieldNumber(id, label, value, ph) {
    var phAttr = ph ? ' placeholder="' + NS.escapeHtml(ph) + '"' : '';
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input class="input" type="number" id="' + id + '" step="0.01" min="0" value="' + (value == null ? '' : value) + '"' + phAttr + '></div>';
  }
  function fieldUrl(id, label, value, ph) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input class="input" type="url" id="' + id + '" value="' + NS.escapeHtml(value) + '" placeholder="' + NS.escapeHtml(ph || 'https://...') + '"><p style="color:var(--muted);font-size:0.78rem;margin-top:0.35rem;">Cole o link direto da imagem.</p></div>';
  }
  function fieldIcons(id, selected) {
    var opts = NS.ICON_NAMES.map(function (k) {
      return '<button type="button" class="icon-opt' + (k === selected ? ' selected' : '') + '" data-icon="' + k + '" title="' + k + '">' + NS.iconSvg(k, 22) + '</button>';
    }).join('');
    return '<div class="field"><label>Ícone do serviço</label><input type="hidden" id="' + id + '" value="' + NS.escapeHtml(selected || 'zap') + '"><div class="icon-picker">' + opts + '</div></div>';
  }

  function attachIconPicker() {
    qa('.icon-picker').forEach(function (picker) {
      qa('.icon-opt', picker).forEach(function (opt) {
        opt.addEventListener('click', function () {
          qa('.icon-opt', picker).forEach(function (o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
          q('input[type=hidden]', picker).value = opt.getAttribute('data-icon');
        });
      });
    });
  }

  function openEditor(type, item) {
    editing.type = type;
    editing.id = item ? item.id : null;
    var fields = '';

    if (type === 'service') {
      q('#editorTitle').textContent = item ? 'Editar serviço' : 'Novo serviço';
      fields += fieldText('fNome', 'Nome do serviço', item ? item.nome : '');
      fields += fieldArea('fDesc', 'Descrição', item ? item.descricao : '');
      fields += '<div class="grid-fields">' +
        fieldNumber('fValor', 'Valor estimado (R$)', item ? item.valor : '', 'Deixe vazio para "sob consulta"') +
        fieldIcons('fIcon', item ? item.icone : 'zap') +
        '</div>';
    } else if (type === 'product') {
      q('#editorTitle').textContent = item ? 'Editar produto' : 'Novo produto';
      fields += fieldText('fNome', 'Nome do produto', item ? item.nome : '');
      fields += fieldArea('fDesc', 'Descrição', item ? item.descricao : '');
      fields += '<div class="grid-fields">' +
        fieldNumber('fPreco', 'Preço (R$)', item ? item.preco : '', ' placeholder="0.00"') +
        fieldUrl('fFoto', 'Foto (URL)', item ? item.foto : '') +
        '</div>';
    } else if (type === 'photo') {
      q('#editorTitle').textContent = item ? 'Editar foto' : 'Nova foto';
      fields += fieldUrl('fFoto', 'Foto (URL)', item ? item.foto : '');
      fields += fieldText('fLegenda', 'Legenda', item ? item.legenda : '');
    }

    q('#editorFields').innerHTML = fields;
    attachIconPicker();
    q('#editorModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeEditor() {
    q('#editorModal').classList.remove('open');
    document.body.style.overflow = '';
    editing.type = null;
    editing.id = null;
  }

  function collectEditor() {
    var v = {};
    if (editing.type === 'service') {
      v.nome = (q('#fNome').value || '').trim();
      v.descricao = (q('#fDesc').value || '').trim();
      v.valor = q('#fValor').value === '' ? null : parseFloat(q('#fValor').value);
      v.icone = q('#fIcon').value || 'zap';
    } else if (editing.type === 'product') {
      v.nome = (q('#fNome').value || '').trim();
      v.descricao = (q('#fDesc').value || '').trim();
      v.preco = parseFloat(q('#fPreco').value);
      v.foto = (q('#fFoto').value || '').trim();
    } else if (editing.type === 'photo') {
      v.foto = (q('#fFoto').value || '').trim();
      v.legenda = (q('#fLegenda').value || '').trim();
    }
    return v;
  }

  function validate(type, v) {
    if (type === 'service' && !v.nome) return 'Informe o nome do serviço.';
    if (type === 'product') {
      if (!v.nome) return 'Informe o nome do produto.';
      if (isNaN(v.preco) || v.preco < 0) return 'Informe um preço válido.';
    }
    if (type === 'photo' && !v.foto) return 'Informe a URL da foto.';
    return null;
  }

  function saveEditor() {
    if (!editing.type) return;
    var v = collectEditor();
    var err = validate(editing.type, v);
    if (err) { toast(err); return; }

    if (editing.type === 'service') {
      var services = NS.getServices();
      if (editing.id) {
        services = services.map(function (s) { return s.id === editing.id ? Object.assign({}, s, v) : s; });
      } else {
        v.id = nextId(services);
        services.push(v);
      }
      NS.saveServices(services);
      renderServices();
    } else if (editing.type === 'product') {
      var products = NS.getProducts();
      if (editing.id) {
        products = products.map(function (p) { return p.id === editing.id ? Object.assign({}, p, v) : p; });
      } else {
        v.id = nextId(products);
        products.push(v);
      }
      NS.saveProducts(products);
      renderProducts();
    } else if (editing.type === 'photo') {
      var gallery = NS.getGallery();
      if (editing.id) {
        gallery = gallery.map(function (g) { return g.id === editing.id ? Object.assign({}, g, v) : g; });
      } else {
        v.id = nextId(gallery);
        gallery.push(v);
      }
      NS.saveGallery(gallery);
      renderGallery();
    }
    toast('Registro salvo!');
    closeEditor();
  }

  function nextId(list) {
    var m = 0;
    list.forEach(function (it) { if (it.id > m) m = it.id; });
    return m + 1;
  }

  function confirmDelete(msg, fn) {
    if (window.confirm(msg)) fn();
  }

  /* ================= RENDER ================= */
  function renderServices() {
    var list = q('#servicesList');
    var data = NS.getServices();
    if (!data.length) {
      list.innerHTML = '<div class="empty">Nenhum serviço cadastrado.</div>';
      return;
    }
    list.innerHTML = data.map(function (s) {
      var price = NS.formatBRL(s.valor);
      return '<div class="row">' +
        '<span class="row-icon">' + NS.iconSvg(s.icone, 24) + '</span>' +
        '<span class="row-main"><span class="row-title">' + NS.escapeHtml(s.nome) + '</span>' +
        '<span class="row-sub">' + NS.escapeHtml(s.descricao || '') + '</span></span>' +
        '<span class="row-price">' + NS.escapeHtml(price) + '</span>' +
        '<span class="row-actions">' +
          '<button class="ic-btn" data-edit="' + s.id + '" data-kind="service" title="Editar">' + pencilSvg() + '</button>' +
          '<button class="ic-btn del" data-del="' + s.id + '" data-kind="service" title="Excluir">' + trashSvg() + '</button>' +
        '</span></div>';
    }).join('');
    bindRowActions(list);
  }

  function renderProducts() {
    var list = q('#productsList');
    var data = NS.getProducts();
    if (!data.length) {
      list.innerHTML = '<div class="empty">Nenhum produto cadastrado.</div>';
      return;
    }
    list.innerHTML = data.map(function (p) {
      return '<div class="row">' +
        '<img class="row-thumb" src="' + NS.escapeHtml(p.foto) + '" alt="' + NS.escapeHtml(p.nome) + '" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\';">' +
        '<span class="row-main"><span class="row-title">' + NS.escapeHtml(p.nome) + '</span>' +
        '<span class="row-sub">' + NS.escapeHtml(p.descricao || '') + '</span></span>' +
        '<span class="row-price">' + NS.escapeHtml(NS.formatBRL(p.preco)) + '</span>' +
        '<span class="row-actions">' +
          '<button class="ic-btn" data-edit="' + p.id + '" data-kind="product" title="Editar">' + pencilSvg() + '</button>' +
          '<button class="ic-btn del" data-del="' + p.id + '" data-kind="product" title="Excluir">' + trashSvg() + '</button>' +
        '</span></div>';
    }).join('');
    bindRowActions(list);
  }

  function renderGallery() {
    var list = q('#galleryList');
    var data = NS.getGallery();
    if (!data.length) {
      list.innerHTML = '<div class="empty">Nenhuma foto na galeria.</div>';
      return;
    }
    list.innerHTML = data.map(function (g) {
      return '<div class="row">' +
        '<img class="row-thumb" src="' + NS.escapeHtml(g.foto) + '" alt="' + NS.escapeHtml(g.legenda) + '" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\';">' +
        '<span class="row-main"><span class="row-title">' + NS.escapeHtml(g.legenda || 'Sem legenda') + '</span>' +
        '<span class="row-sub">Foto da galeria</span></span>' +
        '<span class="row-actions">' +
          '<button class="ic-btn" data-edit="' + g.id + '" data-kind="photo" title="Editar">' + pencilSvg() + '</button>' +
          '<button class="ic-btn del" data-del="' + g.id + '" data-kind="photo" title="Excluir">' + trashSvg() + '</button>' +
        '</span></div>';
    }).join('');
    bindRowActions(list);
  }

  function pencilSvg() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3l4 4L8 20l-5 1 1-5z"/></svg>';
  }
  function trashSvg() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';
  }

  function bindRowActions(container) {
    qa('[data-edit]', container).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-kind');
        var id = Number(btn.getAttribute('data-edit'));
        var item = getItem(kind, id);
        if (item) openEditor(kind === 'service' ? 'service' : kind === 'product' ? 'product' : 'photo', item);
      });
    });
    qa('[data-del]', container).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-kind');
        var id = Number(btn.getAttribute('data-del'));
        confirmDelete('Tem certeza que deseja excluir este registro?', function () {
          removeItem(kind, id);
          renderAll();
          toast('Registro excluído.');
        });
      });
    });
  }

  function getItem(kind, id) {
    var data = kind === 'service' ? NS.getServices()
      : kind === 'product' ? NS.getProducts()
      : NS.getGallery();
    return data.filter(function (it) { return it.id === id; })[0];
  }

  function removeItem(kind, id) {
    if (kind === 'service') NS.saveServices(NS.getServices().filter(function (s) { return s.id !== id; }));
    if (kind === 'product') NS.saveProducts(NS.getProducts().filter(function (p) { return p.id !== id; }));
    if (kind === 'photo') NS.saveGallery(NS.getGallery().filter(function (g) { return g.id !== id; }));
  }

  function renderAll() {
    renderServices();
    renderProducts();
    renderGallery();
  }

  /* ================= CONFIGURAÇÕES ================= */
  var colorIns = {};

  function bindColor(id, hexId) {
    var picker = q(id);
    var hex = q(hexId);
    colorIns[id] = { picker: picker, hex: hex };
    picker.addEventListener('input', function () {
      hex.value = picker.value;
      hexChanged(id);
    });
    hex.addEventListener('input', function () {
      if (/^#[0-9a-f]{3,8}$/i.test(hex.value)) {
        picker.value = hex.value;
        hexChanged(id);
      }
    });
    hex.addEventListener('change', function () {
      if (/^#[0-9a-f]{3,8}$/i.test(hex.value)) {
        picker.value = hex.value;
        hexChanged(id);
      } else {
        hex.value = picker.value;
      }
    });
  }

  function hexChanged() {
    var s = readSettingsForm();
    NS.applyTheme(s);
    q('#bgPreview').style.background = 'linear-gradient(90deg, ' + s.bg1 + ', ' + s.bg2 + ')';
  }

  function readSettingsForm() {
    var s = NS.getSettings();
    return {
      whatsapp: q('#setWhatsapp').value.trim(),
      title: q('#setTitle').value.trim(),
      subtitle: q('#setSubtitle').value.trim(),
      logo: q('#setLogo').value.trim(),
      bg1: q('#setBg1').value,
      bg2: q('#setBg2').value,
      accent: q('#setAccent').value,
      btn: q('#setBtn').value
    };
  }

  function writeSettingsForm(s) {
    q('#setWhatsapp').value = s.whatsapp;
    q('#setTitle').value = s.title;
    q('#setSubtitle').value = s.subtitle;
    q('#setLogo').value = s.logo || '';
    q('#logoPreview').innerHTML = NS.logoHTML(s);
    q('#setBg1').value = s.bg1;
    q('#setBg1Hex').value = s.bg1;
    q('#setBg2').value = s.bg2;
    q('#setBg2Hex').value = s.bg2;
    q('#setAccent').value = s.accent;
    q('#setAccentHex').value = s.accent;
    q('#setBtn').value = s.btn;
    q('#setBtnHex').value = s.btn;
    q('#bgPreview').style.background = 'linear-gradient(90deg, ' + s.bg1 + ', ' + s.bg2 + ')';
  }

  function initSettings() {
    writeSettingsForm(NS.getSettings());
    bindColor('#setBg1', '#setBg1Hex');
    bindColor('#setBg2', '#setBg2Hex');
    bindColor('#setAccent', '#setAccentHex');
    bindColor('#setBtn', '#setBtnHex');

    q('#settingsForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var s = readSettingsForm();
      if (!/^\d{10,15}$/.test(s.whatsapp.replace(/[^0-9]/g, ''))) {
        toast('Informe um número de WhatsApp válido (ex: 5562999999999).');
        return;
      }
      if (!s.title) { toast('Informe o nome da oficina.'); return; }
      if (s.logo && !/^https?:\/\/\S+/i.test(s.logo)) {
        toast('Informe uma URL de logotipo válida (comece com https://).');
        return;
      }
      NS.saveSettings(s);
      NS.applyTheme(s);
      initBrand();
      toast('Configurações salvas!');
    });

    q('#setLogo').addEventListener('input', function () {
      var s = readSettingsForm();
      q('#logoPreview').innerHTML = NS.logoHTML(s);
    });

    q('#btnReset').addEventListener('click', function () {
      confirmDelete('Restaurar todos os dados de exemplo? Os dados atuais serão apagados.', function () {
        NS.resetAll();
        showPanel();
        toast('Dados de exemplo restaurados.');
      });
    });

    q('#btnExport').addEventListener('click', exportData);
    q('#btnImport').addEventListener('click', function () { q('#importFile').click(); });
    q('#importFile').addEventListener('change', importData);
  }

  function exportData() {
    var payload = {
      services: NS.getServices(),
      products: NS.getProducts(),
      gallery: NS.getGallery(),
      settings: NS.getSettings()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'nunescar-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Backup exportado.');
  }

  function importData(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var d = JSON.parse(ev.target.result);
        if (d.services) NS.saveServices(d.services);
        if (d.products) NS.saveProducts(d.products);
        if (d.gallery) NS.saveGallery(d.gallery);
        if (d.settings) NS.saveSettings(Object.assign({}, NS.defaultSettings, d.settings));
        renderAll();
        writeSettingsForm(NS.getSettings());
        NS.applyTheme(NS.getSettings());
        initBrand();
        toast('Dados importados com sucesso!');
      } catch (err) {
        toast('Arquivo inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  /* ================= BOTÕES NOVO ================= */
  function initNewButtons() {
    q('[data-new-service]').addEventListener('click', function () { openEditor('service', null); });
    q('[data-new-product]').addEventListener('click', function () { openEditor('product', null); });
    q('[data-new-photo]').addEventListener('click', function () { openEditor('photo', null); });
  }

  /* ================= INIT ================= */
  function init() {
    NS.applyTheme(NS.getSettings());
    initBrand();
    initLogin();
    initTabs();
    initSettings();
    initNewButtons();
    renderAll();

    q('#editorForm').addEventListener('submit', function (e) {
      e.preventDefault();
      saveEditor();
    });

    qa('[data-close-modal]').forEach(function (b) {
      b.addEventListener('click', function () {
        q('#editorModal').classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    q('#editorModal').addEventListener('click', function (e) {
      if (e.target === q('#editorModal')) {
        q('#editorModal').classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && q('#editorModal').classList.contains('open')) {
        q('#editorModal').classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    if (isLogged()) {
      showPanel();
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();