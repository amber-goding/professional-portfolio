// Progressive enhancement for the Savvy design. Every feature here is optional:
// without this script all content stays visible and every link works.
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Scroll reveals. Elements are only hidden once this script has confirmed
  // that motion is allowed and IntersectionObserver exists, so a failure here
  // can never leave content invisible.
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if (revealTargets.length && 'IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    root.classList.add('motion-ready');
    revealTargets.forEach((element) => observer.observe(element));
  }

  // Ticker: a visible pause control for the continuously moving band.
  const ticker = document.querySelector('[data-ticker]');
  const tickerToggle = ticker?.querySelector('[data-ticker-toggle]');
  if (ticker && tickerToggle) {
    tickerToggle.hidden = false;
    ticker.classList.add('is-live');
    tickerToggle.addEventListener('click', () => {
      const paused = ticker.classList.toggle('is-paused');
      tickerToggle.setAttribute('aria-pressed', String(paused));
      tickerToggle.textContent = paused ? 'Play motion' : 'Pause motion';
    });
  }

  // Technology groups: an accessible tabs pattern. Without JavaScript every
  // group is shown as its own labelled block.
  const stack = document.querySelector('[data-stack]');
  const tabList = stack?.querySelector('[data-stack-tabs]');
  if (stack && tabList) {
    const tabs = [...tabList.querySelectorAll('[data-stack-tab]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    if (tabs.length && panels.every(Boolean)) {
      tabList.setAttribute('role', 'tablist');
      tabList.setAttribute('aria-label', 'Technology groups');
      tabList.hidden = false;
      stack.classList.add('is-tabbed');
      tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        panels[index].setAttribute('role', 'tabpanel');
        panels[index].setAttribute('aria-labelledby', tab.id);
        panels[index].tabIndex = 0;
      });

      const select = (index, { focus = false, animate = true } = {}) => {
        tabs.forEach((tab, i) => {
          const selected = i === index;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
          panels[i].hidden = !selected;
          panels[i].classList.remove('is-entering');
        });
        if (animate && !reducedMotion.matches) {
          // Restart the entrance animation on the newly shown panel.
          void panels[index].offsetWidth;
          panels[index].classList.add('is-entering');
        }
        if (focus) tabs[index].focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(index));
        tab.addEventListener('keydown', (event) => {
          const last = tabs.length - 1;
          const moves = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last };
          if (!(event.key in moves)) return;
          event.preventDefault();
          const next = (moves[event.key] + tabs.length) % tabs.length;
          select(next, { focus: true });
        });
      });
      select(0, { animate: false });
    }
  }
})();
