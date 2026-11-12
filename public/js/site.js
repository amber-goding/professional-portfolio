// Progressive enhancement for the mobile navigation menu.
// Without this script the navigation links stay visible and usable.
(() => {
  const header = document.querySelector('[data-site-header]');
  const toggle = header?.querySelector('.nav-toggle');
  const nav = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
  if (!header || !toggle || !nav) return;

  const desktop = window.matchMedia('(min-width: 56rem)');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  function setOpen(open, { restoreFocus = false } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    if (!open && restoreFocus) toggle.focus();
  }

  toggle.hidden = false;
  header.classList.add('has-menu');

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // Escape closes the menu and returns focus to the button.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false, { restoreFocus: header.contains(document.activeElement) });
    }
  });

  // Choosing a link closes the menu before the page scrolls to the section.
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Clicking or tabbing outside the header closes the menu.
  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  header.addEventListener('focusout', (event) => {
    if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });

  // Reset when the layout switches to the desktop navigation.
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
})();
