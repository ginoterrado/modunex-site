/* Modunex — shared behaviour. No dependencies. */
(function () {
  'use strict';

  /* ---- mobile menu ------------------------------------------------------ */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-menu') === 'open';
      nav.setAttribute('data-menu', open ? 'closed' : 'open');
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      toggle.textContent = open ? 'Menu' : 'Close';
    });
  }

  /* ---- services dropdown ------------------------------------------------ */
  var subs = Array.prototype.slice.call(document.querySelectorAll('.has-sub'));

  function closeAll(except) {
    subs.forEach(function (item) {
      if (item === except) return;
      item.setAttribute('data-open', 'false');
      var b = item.querySelector('.subtoggle');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  subs.forEach(function (item) {
    var btn = item.querySelector('.subtoggle');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = item.getAttribute('data-open') === 'true';
      closeAll(item);
      item.setAttribute('data-open', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });

    // Desktop convenience: open on hover, close on leave.
    item.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 861px)').matches) {
        item.setAttribute('data-open', 'true');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(min-width: 861px)').matches) {
        item.setAttribute('data-open', 'false');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll(null);
      if (nav && nav.getAttribute('data-menu') === 'open') {
        nav.setAttribute('data-menu', 'closed');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = 'Menu';
        }
      }
    }
  });

  /* ---- image lightbox --------------------------------------------------- */
  var box = document.querySelector('dialog.lightbox');
  if (box && typeof box.showModal === 'function') {
    var boxImg = box.querySelector('img');
    var boxTitle = box.querySelector('h4');
    var closeBtn = box.querySelector('button');

    document.querySelectorAll('.shots button').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var img = trigger.querySelector('img');
        if (!img) return;
        boxImg.src = img.getAttribute('data-full') || img.src;
        boxImg.alt = img.alt;
        boxTitle.textContent = trigger.getAttribute('data-title') || img.alt;
        box.showModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  }

  /* ---- contact form -> prefilled email ---------------------------------- */
  var form = document.querySelector('form[data-mailto]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (name) {
        var el = form.elements[name];
        return el ? el.value.trim() : '';
      };
      var subject = 'Enquiry: ' + (get('service') || 'General') + ' — ' + (get('company') || get('name'));
      var body =
        'Name: ' + get('name') + '\n' +
        'Company: ' + get('company') + '\n' +
        'Phone: ' + get('phone') + '\n' +
        'Service: ' + get('service') + '\n\n' +
        get('message') + '\n';
      window.location.href =
        'mailto:info@modunex.com.au?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  /* ---- current year ----------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
