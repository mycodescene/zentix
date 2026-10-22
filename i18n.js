/* Zentix i18n — 6 languages, RTL-aware. Deferred; runs on every page. */
(function () {
  'use strict';

  var LANGS = {
    en: { name: 'English', dir: 'ltr' },
    ar: { name: 'العربية', dir: 'rtl' },
    ur: { name: 'اردو', dir: 'rtl' },
    es: { name: 'Español', dir: 'ltr' },
    fr: { name: 'Français', dir: 'ltr' },
    de: { name: 'Deutsch', dir: 'ltr' }
  };
  var KEY = 'zentix-lang';
  var inPosts = location.pathname.indexOf('/posts/') !== -1;
  var base = inPosts ? '../' : '';

  function currentLang() {
    var l = null;
    try { l = localStorage.getItem(KEY); } catch (e) {}
    return LANGS[l] ? l : 'en';
  }

  function loadDict(l) {
    return fetch(base + 'i18n/' + l + '.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return null; });
  }

  function apply(dict, l) {
    var html = document.documentElement;
    html.setAttribute('lang', l);
    html.setAttribute('dir', LANGS[l].dir);
    if (dict) {
      try { window.ZENTIX_I18N = dict; } catch (e) {}
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var k = el.getAttribute('data-i18n');
        if (dict[k] !== undefined) el.innerHTML = dict[k];
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
        var k = el.getAttribute('data-i18n-aria');
        if (dict[k] !== undefined) el.setAttribute('aria-label', dict[k]);
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
        var k = el.getAttribute('data-i18n-ph');
        if (dict[k] !== undefined) el.setAttribute('placeholder', dict[k]);
      });
    }
    var cur = document.querySelector('#langSwitch .lang-current');
    if (cur) cur.textContent = LANGS[l].name;
    document.querySelectorAll('#langSwitch [data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === l;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      if (b.closest('li')) b.closest('li').classList.toggle('active', on);
    });
  }

  function setLang(l) {
    if (!LANGS[l]) l = 'en';
    try { localStorage.setItem(KEY, l); } catch (e) {}
    loadDict(l).then(function (d) { apply(d, l); });
  }

  function buildSwitcher() {
    if (document.getElementById('langSwitch')) return;
    var actions = document.querySelector('.header-actions');
    if (!actions) return;
    var wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    wrap.id = 'langSwitch';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Language');
    btn.innerHTML = '<span class="lang-current">English</span>' +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    var list = document.createElement('ul');
    list.className = 'lang-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    Object.keys(LANGS).forEach(function (code) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'option');
      b.setAttribute('data-lang', code);
      b.setAttribute('lang', code);
      b.textContent = LANGS[code].name;
      b.addEventListener('click', function () { setLang(code); close(); });
      li.appendChild(b);
      list.appendChild(li);
    });
    function close() {
      list.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (list.hidden) { list.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
      else close();
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    wrap.appendChild(btn);
    wrap.appendChild(list);
    var toggle = actions.querySelector('.theme-toggle');
    if (toggle) actions.insertBefore(wrap, toggle);
    else actions.appendChild(wrap);
  }

  function init() {
    buildSwitcher();
    setLang(currentLang());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
