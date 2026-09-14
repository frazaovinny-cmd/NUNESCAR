/* ============================================================
   NUNESCAR — Camada de dados (localStorage) e utilitários
   ============================================================ */
(function () {
  'use strict';

  var KEYS = {
    services: 'nunescar_services',
    products: 'nunescar_products',
    gallery: 'nunescar_gallery',
    settings: 'nunescar_settings',
    session: 'nunescar_session'
  };

  var DEFAULT_SETTINGS = {
    whatsapp: '5562999999999',
    title: 'NUNESCAR',
    subtitle: 'Elética Automotiva & Acessórios',
    logo: '',
    bg1: '#1B0000',
    bg2: '#8B0000',
    accent: '#2563EB',
    btn: '#2563EB'
  };

  var DEFAULT_SERVICES = [
    { id: 1, nome: 'Injeção Eletrônica', descricao: 'Diagnóstico e reparos completos em sistemas de injeção eletrônica, com scanner de última geração.', valor: 180, icone: 'zap' },
    { id: 2, nome: 'Alternadores e Baterias', descricao: 'Teste, reparo e troca de alternadores e baterias com garantia.', valor: 150, icone: 'battery' },
    { id: 3, nome: 'Motor de Partida', descricao: 'Reparo e troca de motores de partida (motorzinho) de todas as marcas.', valor: 120, icone: 'key' },
    { id: 4, nome: 'Ar-Condicionado Automotivo', descricao: 'Manutenção preventiva, carga de gás e reparos no ar-condicionado do veículo.', valor: 200, icone: 'ac' },
    { id: 5, nome: 'Iluminação e Faróis', descricao: 'Instalação de faróis, lâmpadas LED, painéis e iluminação geral.', valor: 80, icone: 'bolt' },
    { id: 6, nome: 'Diagnóstico Eletrônico', descricao: 'Scanner automotivo completo para leitura de falhas em todos os módulos.', valor: 100, icone: 'diagnostic' }
  ];

  var DEFAULT_PRODUCTS = [
    { id: 1, nome: 'Farol de LED Alta Potência', descricao: 'Par de faróis de LED com alta luminosidade, pronto para instalação.', preco: 129.9, foto: 'https://picsum.photos/seed/nunescar-farol/600/450' },
    { id: 2, nome: 'Bateria Automotiva 60Ah', descricao: 'Bateria automotiva 60Ah com 24 meses de garantia e ótima durabilidade.', preco: 459.9, foto: 'https://picsum.photos/seed/nunescar-bateria/600/450' },
    { id: 3, nome: 'Kit Sensor de Ré', descricao: 'Kit com 4 sensores e alarme sonoro para facilitar o estacionamento.', preco: 89.9, foto: 'https://picsum.photos/seed/nunescar-sensor/600/450' },
    { id: 4, nome: 'Central Multimídia 7"', descricao: 'Central multimídia com Bluetooth, espelhamento e entrada para câmera de ré.', preco: 799.9, foto: 'https://picsum.photos/seed/nunescar-multimidia/600/450' },
    { id: 5, nome: 'Lâmpada H4 LED', descricao: 'Lâmpada H4 de LED com ventilador, luz mais branca e durabilidade superior.', preco: 49.9, foto: 'https://picsum.photos/seed/nunescar-lampada/600/450' },
    { id: 6, nome: 'Alarme Automotivo', descricao: 'Alarme com controle remoto, sensor de impacto e bloqueio de ignição.', preco: 149.9, foto: 'https://picsum.photos/seed/nunescar-alarme/600/450' }
  ];

  var DEFAULT_GALLERY = [
    { id: 1, foto: 'https://picsum.photos/seed/nunescar-servico1/800/600', legenda: 'Reformulação do chicote elétrico — Fiat Uno' },
    { id: 2, foto: 'https://picsum.photos/seed/nunescar-servico2/800/600', legenda: 'Instalação de multimídia e som — VW Gol' },
    { id: 3, foto: 'https://picsum.photos/seed/nunescar-servico3/800/600', legenda: 'Reparo de alternador — Chevrolet Onix' },
    { id: 4, foto: 'https://picsum.photos/seed/nunescar-servico4/800/600', legenda: 'Diagnóstico eletrônico completo — Ford Ka' }
  ];

  var ICONS = {
    zap: '<path d="M13 2 3 14h7l-1 8 11-12h-7l1-8z"/>',
    battery: '<rect x="4" y="7" width="16" height="10" rx="2"/><path d="M8 7V5h8v2"/><path d="M10 11h4"/><path d="M10 14h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/>',
    key: '<circle cx="7.5" cy="16.5" r="4.5"/><path d="M11 13l8-8M16 5l3 3M13 8l2 2M14 11l2 2"/>',
    ac: '<path d="M12 2v20M4 7l16 10M20 7 4 17"/>',
    bolt: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/>',
    diagnostic: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
  };

  function read(keyName, fallback) {
    try {
      var raw = localStorage.getItem(KEYS[keyName]);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(keyName, value) {
    try {
      localStorage.setItem(KEYS[keyName], JSON.stringify(value));
    } catch (e) {
      return false;
    }
    return true;
  }

  function hexToRgba(hex, alpha) {
    var h = (hex || '#000000').replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(function (c) { return c + c; }).join('');
    }
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0;
    var r = (n >> 16) & 255;
    var g = (n >> 8) & 255;
    var b = n & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha == null ? 1 : alpha) + ')';
  }

  var NunesCar = {
    KEYS: KEYS,
    ICONS: ICONS,
    ICON_NAMES: Object.keys(ICONS),

    getServices: function () { return read('services', DEFAULT_SERVICES); },
    saveServices: function (v) { write('services', v); },

    getProducts: function () { return read('products', DEFAULT_PRODUCTS); },
    saveProducts: function (v) { write('products', v); },

    getGallery: function () { return read('gallery', DEFAULT_GALLERY); },
    saveGallery: function (v) { write('gallery', v); },

    getSettings: function () {
      var stored = read('settings', {});
      var out = {};
      var k;
      for (k in DEFAULT_SETTINGS) out[k] = DEFAULT_SETTINGS[k];
      for (k in stored) if (DEFAULT_SETTINGS.hasOwnProperty(k)) out[k] = stored[k];
      return out;
    },
    saveSettings: function (v) { write('settings', v); },

    applyTheme: function (settings) {
      var s = settings || this.getSettings();
      var doc = document.documentElement;
      var set = function (name, val) { doc.style.setProperty(name, val); };
      set('--bg1', s.bg1);
      set('--bg2', s.bg2);
      set('--accent', s.accent);
      set('--btn', s.btn);
      set('--btn-glow', hexToRgba(s.btn, 0.55));
      set('--accent-glow', hexToRgba(s.accent, 0.42));
    },

    waLink: function (message) {
      var number = this.getSettings().whatsapp.replace(/[^0-9]/g, '');
      return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message || '');
    },

    msgService: function (name) {
      return 'Olá, Nunescar! Gostaria de um orçamento para o serviço de ' + name + ' em Brasilinha - GO.';
    },

    msgProduct: function (name, price) {
      return 'Olá, Nunescar! Quero comprar o produto: ' + name + ' (' + price + '). Ainda está disponível?';
    },

    formatBRL: function (v) {
      if (v === null || v === undefined || isNaN(v)) return 'Sob consulta';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    },

    iconSvg: function (key, size) {
      var inner = ICONS[key] || ICONS.zap;
      var s = size || 26;
      return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    },

    logoHTML: function (settings) {
      var s = settings || this.getSettings();
      if (s.logo) {
        return '<img class="logo-img" src="' + this.escapeHtml(s.logo) + '" alt="Logotipo ' + this.escapeHtml(s.title) + '" onerror="this.onerror=null;this.style.display=\'none\';">';
      }
      return this.iconSvg('zap', 22);
    },

    defaultServices: DEFAULT_SERVICES,
    defaultProducts: DEFAULT_PRODUCTS,
    defaultGallery: DEFAULT_GALLERY,
    defaultSettings: DEFAULT_SETTINGS,

    resetAll: function () {
      var k;
      for (k in KEYS) {
        if (KEYS[k] !== KEYS.session) localStorage.removeItem(KEYS[k]);
      }
    },

    hexToRgba: hexToRgba,

    escapeHtml: function (str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  window.NunesCar = NunesCar;
})();