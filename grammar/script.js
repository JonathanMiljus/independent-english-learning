// English Grammar for Spanish Speakers, interactive web book script
(function () {
  'use strict';

  // ---------- Data: load chapters.json then init ----------
  var DATA = [];
  var __initRan = false;
  function __init() {
    if (__initRan) return;
    __initRan = true;
    initApp();
  }
  fetch('chapters.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) { DATA = d; __init(); })
    .catch(function (err) {
      console.error('Failed to load chapters.json', err);
      var grid = document.getElementById('lesson-grid');
      if (grid) grid.innerHTML = '<p style="padding:24px;color:#C75146;font-style:italic;">Could not load the chapter library. Please refresh the page.</p>';
    });

  function initApp() {

  // ---------- Theme ----------
  var THEME_KEY = 'gram-theme';
  var html = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var themeLabel = document.getElementById('theme-label');

  function applyTheme(theme) {
    if (theme === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    if (themeLabel) themeLabel.textContent = (theme === 'dark') ? 'Light' : 'Dark';
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (savedTheme === 'dark' || savedTheme === 'light') applyTheme(savedTheme);
  if (themeToggle) themeToggle.addEventListener('click', function () {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ---------- Language ----------
  var LANG_KEY = 'gram-lang';
  var langButtons = document.querySelectorAll('.lang-toggle button[data-lang]');
  var currentLang = 'en';

  function setLang(lang) {
    currentLang = lang;
    html.setAttribute('lang', lang);
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v) el.innerHTML = v;
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang + '-placeholder');
      if (v) el.setAttribute('placeholder', v);
    });
    langButtons.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    // Refresh chapter counter and chapter-header number if a chapter is open
    if (currentNum != null && readerCounter) {
      readerCounter.textContent = (lang === 'es' ? 'Capítulo ' : (lang === 'fr' ? 'Chapitre ' : 'Chapter '))
        + currentNum + (lang === 'es' ? ' de ' : (lang === 'fr' ? ' sur ' : ' of '))
        + DATA.length;
      if (typeof translateChapterHeader === 'function' && readerContent) {
        translateChapterHeader(readerContent, lang);
      }
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }
  langButtons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) {}
  if (savedLang === 'es' || savedLang === 'fr') setLang(savedLang);
  else {
    var nav = (navigator.language || 'en').slice(0, 2);
    if (nav === 'es' || nav === 'fr') setLang(nav);
  }

  // ---------- Categories chips ----------
  var categories = ['All'];
  DATA.forEach(function (ch) {
    if (categories.indexOf(ch.category) < 0) categories.push(ch.category);
  });
  var chipRow = document.getElementById('chip-row');
  if (chipRow) {
    chipRow.innerHTML = categories.map(function (cat, i) {
      return '<button type="button" class="chip' + (i === 0 ? ' is-active' : '') + '" data-category="' + cat + '">' + cat + '</button>';
    }).join('');
  }

  // ---------- Lesson grid ----------
  var grid = document.getElementById('lesson-grid');
  function renderGrid() {
    grid.innerHTML = DATA.map(function (ch) {
      return '<article class="lesson-card" data-num="' + ch.num + '" data-category="' + ch.category + '" data-keywords="' + ch.keywords + '" data-title="' + ch.title.replace(/"/g, '&quot;') + '">'
        + '<span class="lesson-index">CH ' + String(ch.num).padStart(2, '0') + '</span>'
        + '<span class="lesson-cat">' + ch.category + '</span>'
        + '<h3>' + ch.title + '</h3>'
        + '<span class="lesson-cta">'
          + '<span data-en="Read chapter →" data-es="Leer capítulo →" data-fr="Lire le chapitre →">Read chapter →</span>'
        + '</span>'
        + '</article>';
    }).join('');
    setLang(currentLang);
  }
  renderGrid();

  // ---------- Filtering ----------
  var searchInput = document.getElementById('lesson-search');
  var emptyState = document.getElementById('empty-state');
  var activeCategory = 'All';

  function applyFilters() {
    var q = (searchInput.value || '').trim().toLowerCase();
    var cards = grid.querySelectorAll('.lesson-card');
    var visible = 0;
    cards.forEach(function (card) {
      var matchesCat = (activeCategory === 'All') || (card.getAttribute('data-category') === activeCategory);
      var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var matchesQ = !q || keywords.indexOf(q) >= 0 || title.indexOf(q) >= 0;
      var show = matchesCat && matchesQ;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (emptyState) emptyState.hidden = visible > 0;
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (chipRow) chipRow.addEventListener('click', function (e) {
    var btn = e.target.closest('button.chip');
    if (!btn) return;
    chipRow.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
    btn.classList.add('is-active');
    activeCategory = btn.getAttribute('data-category');
    applyFilters();
  });

  // ---------- Reader ----------
  var reader = document.getElementById('reader');
  var readerEmpty = document.getElementById('reader-empty');
  var readerContent = document.getElementById('reader-content');
  var readerCounter = document.getElementById('reader-counter');
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');
  var prevBtn2 = document.getElementById('prev-btn-2');
  var nextBtn2 = document.getElementById('next-btn-2');
  var closeBtn = document.getElementById('close-btn');
  var currentNum = null;

  // Translation map for hardcoded English labels inside rendered chapter HTML.
  // Adds data-en/es/fr attributes so setLang() can swap them on the fly.
  var LABEL_TRANSLATIONS = {
    'Big Idea':              { es: 'Idea Principal',           fr: 'Idée Centrale' },
    'Simple Rule':           { es: 'Regla Simple',             fr: 'Règle Simple' },
    'Spanish Comparison':    { es: 'Comparación con Español',  fr: 'Comparaison Espagnole' },
    'Common Mistake':        { es: 'Error Común',              fr: 'Erreur Courante' },
    'Why This Happens':      { es: 'Por Qué Pasa Esto',        fr: 'Pourquoi Cela Arrive' },
    'Real English Examples': { es: 'Ejemplos Reales en Inglés',fr: 'Exemples Réels en Anglais' },
    'Practice':              { es: 'Práctica',                 fr: 'Pratique' },
    'Quick Review':          { es: 'Repaso Rápido',            fr: 'Récapitulatif' },
    'Contrast box':          { es: 'Caja de contraste',        fr: 'Encadré de contraste' },
    'Show answers':          { es: 'Ver respuestas',           fr: 'Voir les réponses' },
    'Show answer':           { es: 'Ver respuesta',            fr: 'Voir la réponse' },
    'Teacher / Academic Note': { es: 'Nota para el Profesor / Académica', fr: 'Note Enseignante / Académique' },
    'Sources and Further Reading': { es: 'Fuentes y Lecturas Adicionales', fr: 'Sources et Lectures Complémentaires' }
  };

  // Also translate the chapter-header pieces that are baked into ch.html
  function translateChapterHeader(root, lang) {
    if (!root) return;
    var chNum = root.querySelector('.ch-num');
    if (chNum && !chNum.hasAttribute('data-num-en')) {
      var t = (chNum.textContent || '').trim();
      var m = t.match(/^Chapter\s+(\d+)/i);
      if (m) {
        var n = m[1];
        chNum.setAttribute('data-num-en', 'Chapter ' + n);
        chNum.setAttribute('data-num-es', 'Capítulo ' + n);
        chNum.setAttribute('data-num-fr', 'Chapitre ' + n);
      }
    }
    if (chNum) {
      var attr = chNum.getAttribute('data-num-' + lang);
      if (attr) chNum.textContent = attr;
    }
  }

  function tagTranslatableLabels(root) {
    if (!root) return;
    var selectors = ['.box-label', '.ans-details > summary', '.ch-teacher > summary', '.ch-sources > summary', '.contrast-label'];
    var nodes = root.querySelectorAll(selectors.join(','));
    nodes.forEach(function (el) {
      if (el.hasAttribute('data-en')) return; // already tagged
      var text = (el.textContent || '').trim();
      var t = LABEL_TRANSLATIONS[text];
      if (t) {
        el.setAttribute('data-en', text);
        if (t.es) el.setAttribute('data-es', t.es);
        if (t.fr) el.setAttribute('data-fr', t.fr);
      }
    });
  }

  function showChapter(num, scroll) {
    var ch = DATA.find(function (c) { return c.num === num; });
    if (!ch) return;
    currentNum = num;
    readerContent.innerHTML = ch.html;
    tagTranslatableLabels(readerContent);
    translateChapterHeader(readerContent, currentLang);
    var counterText = (currentLang === 'es' ? 'Capítulo ' : (currentLang === 'fr' ? 'Chapitre ' : 'Chapter '))
                    + num + (currentLang === 'es' ? ' de ' : (currentLang === 'fr' ? ' sur ' : ' of '))
                    + DATA.length;
    readerCounter.textContent = counterText;
    var first = (num === DATA[0].num);
    var last = (num === DATA[DATA.length - 1].num);
    [prevBtn, prevBtn2].forEach(function (b) { if (b) b.disabled = first; });
    [nextBtn, nextBtn2].forEach(function (b) { if (b) b.disabled = last; });
    reader.hidden = false;
    if (readerEmpty) readerEmpty.style.display = 'none';
    setLang(currentLang);
    if (scroll !== false) {
      window.scrollTo({ top: reader.offsetTop - 80, behavior: 'smooth' });
    }
  }

  function closeReader() {
    reader.hidden = true;
    if (readerEmpty) readerEmpty.style.display = '';
    currentNum = null;
  }

  function nextChapter() {
    if (currentNum && currentNum < DATA[DATA.length - 1].num) showChapter(currentNum + 1);
  }
  function prevChapter() {
    if (currentNum && currentNum > DATA[0].num) showChapter(currentNum - 1);
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.lesson-card');
    if (card && card.dataset.num) {
      showChapter(parseInt(card.dataset.num, 10));
    }
  });
  if (prevBtn) prevBtn.addEventListener('click', prevChapter);
  if (prevBtn2) prevBtn2.addEventListener('click', prevChapter);
  if (nextBtn) nextBtn.addEventListener('click', nextChapter);
  if (nextBtn2) nextBtn2.addEventListener('click', nextChapter);
  if (closeBtn) closeBtn.addEventListener('click', closeReader);

  // Keyboard nav inside reader
  document.addEventListener('keydown', function (e) {
    if (reader.hidden || !currentNum) return;
    if (e.key === 'ArrowLeft') prevChapter();
    if (e.key === 'ArrowRight') nextChapter();
    if (e.key === 'Escape') closeReader();
  });

  } // end initApp
})();
