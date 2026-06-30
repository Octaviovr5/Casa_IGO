/* script.js — solo menú hamburger */
(function () {
  const btn    = document.querySelector('.hamburger');
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';

  document.querySelectorAll('.navlinks a').forEach(a => {
    const clone = a.cloneNode(true);
    clone.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
    drawer.appendChild(clone);
  });

  btn.parentElement.style.position = 'relative';
  btn.after(drawer);

  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !drawer.contains(e.target)) {
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
