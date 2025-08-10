(() => {
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);

  const burger = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!burger || !navMenu) return;

  const links = Array.from(navMenu.querySelectorAll('a'));
  const mql = window.matchMedia('(min-width: 1024px)');

  const openMenu = () => {
    burger.classList.add('open');
    navMenu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');
    links[0]?.focus();
  };

  const closeMenu = (focusBurger = true) => {
    if (mql.matches) return;
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
    if (focusBurger) burger.focus();
  };

  burger.addEventListener('click', () => {
    if (navMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (!navMenu.classList.contains('open') || mql.matches) return;

    if (e.key === 'Escape') {
      closeMenu();
    } else if (e.key === 'Tab' && links.length) {
      const first = links[0];
      const last = links[links.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  const handleBreakpoint = (e) => {
    if (e.matches) {
      navMenu.classList.add('open');
      navMenu.setAttribute('aria-hidden', 'false');
      burger.style.display = 'none';
      burger.setAttribute('aria-hidden', 'true');
      burger.tabIndex = -1;
    } else {
      navMenu.classList.remove('open');
      navMenu.setAttribute('aria-hidden', 'true');
      burger.style.display = '';
      burger.setAttribute('aria-hidden', 'false');
      burger.tabIndex = 0;
    }
  };
  handleBreakpoint(mql);
  mql.addEventListener('change', handleBreakpoint);

  // Outbound click tracking
  const trackables = document.querySelectorAll('[data-analytics]');
  trackables.forEach(link => {
    link.addEventListener('click', () => {
      const label = link.getAttribute('data-analytics');
      if (window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'outbound',
          event_label: label,
        });
      }
    });
  });

  // Scroll cues
  document.querySelectorAll('section:not(:last-of-type)').forEach(section => {
    const cue = document.createElement('span');
    cue.className = 'scroll-cue';
    cue.textContent = 'Swipe / scroll ↓';
    section.appendChild(cue);
  });

  // Ripple
  document.querySelectorAll('.btn').forEach(btn => {
    const showRipple = (x, y) => {
      const circle = document.createElement('span');
      const size = Math.max(btn.clientWidth, btn.clientHeight);
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${x - size / 2}px`;
      circle.style.top = `${y - size / 2}px`;
      circle.classList.add('ripple');
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    };

    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const hasCoords = typeof e.clientX === 'number' && typeof e.clientY === 'number' && (e.clientX !== 0 || e.clientY !== 0);
      const x = hasCoords ? e.clientX - rect.left : rect.width / 2;
      const y = hasCoords ? e.clientY - rect.top : rect.height / 2;
      showRipple(x, y);
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Preloader
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.classList.add('hide');
      setTimeout(() => pre.remove(), 600);
    }
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    });
  }, { threshold:0.3 });
  revealEls.forEach(el => revealObs.observe(el));

  // Active nav link
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isActive);
          if (isActive) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, { threshold:0.6 });
  sections.forEach(sec => sectionObs.observe(sec));

  // Load featured items
  if (location.protocol !== 'file:') {
    fetch('items.json')
      .then(res => res.json())
      .then(data => {
        const buildItems = (key, containerId) => {
          const container = document.getElementById(containerId);
          if (!container || !data[key]) return;
          data[key].forEach((item, i) => {
            const link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('data-analytics', `${key}-item-${i + 1}`);
            link.addEventListener('click', () => {
              const label = link.getAttribute('data-analytics');
              if (window.gtag) {
                window.gtag('event', 'click', {
                  event_category: 'featured',
                  event_label: label,
                });
              }
            });
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.alt;
            img.loading = 'lazy';
            link.appendChild(img);
            container.appendChild(link);
          });
        };
        buildItems('ebay', 'ebay-items');
        buildItems('offerup', 'offerup-items');
      })
      .catch(() => {});
  }

  // Testimonials slider
  const testimonialWrapper = document.querySelector('.testimonials');
  if (testimonialWrapper) {
    const track = testimonialWrapper.querySelector('.testimonial-track');
    const slides = Array.from(track.querySelectorAll('figure'));
    const prevBtn = testimonialWrapper.querySelector('.testimonial-prev');
    const nextBtn = testimonialWrapper.querySelector('.testimonial-next');
    const pagination = testimonialWrapper.querySelector('.testimonial-pagination');
    let index = 0;
    let timer;

    const select = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, idx) => {
        s.classList.toggle('active', idx === index);
      });
      pagination?.querySelectorAll('button').forEach((dot, idx) => {
        dot.setAttribute('aria-selected', idx === index ? 'true' : 'false');
      });
    };

    const start = () => {
      timer = setInterval(() => {
        select(index + 1);
      }, 5000);
    };

    const reset = () => {
      clearInterval(timer);
      start();
    };

    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dot.setAttribute('role', 'tab');
      if (slide.id) dot.setAttribute('aria-controls', slide.id);
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      dot.addEventListener('click', () => {
        select(i);
        reset();
      });
      pagination?.appendChild(dot);
    });

    prevBtn?.addEventListener('click', () => {
      select(index - 1);
      reset();
    });

    nextBtn?.addEventListener('click', () => {
      select(index + 1);
      reset();
    });

    select(0);
    start();
  }

  // 3D tilt on hero card
  const heroCard = document.querySelector('#home .card.tilt');
  if(heroCard){
    heroCard.addEventListener('mousemove', e => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      heroCard.style.transform = `rotateY(${x/25}deg) rotateX(${-y/25}deg)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = '';
    });
  }

  // Subscribe form handling with honeypot and Turnstile
  const subscribeForm = document.querySelector('.subscribe-form');
  if(subscribeForm){
    const msg = document.getElementById('subscribe-msg');
    const btn = subscribeForm.querySelector('button[type="submit"]');
    const disableBtn = () => { if(btn) btn.disabled = true; };
    disableBtn();
    window.enableSubscribe = () => { if(btn) btn.disabled = false; };
    window.disableSubscribe = disableBtn;
    subscribeForm.addEventListener('submit', async e => {
      e.preventDefault();
      msg.textContent = '';
      const hp = subscribeForm.querySelector('input[name="hp"]');
      if(hp && hp.value){
        msg.textContent = 'Submission rejected.';
        return;
      }
      const token = window.turnstile?.getResponse();
      if(!token){
        msg.textContent = 'Please complete the captcha.';
        return;
      }
      try{
        const formData = new FormData(subscribeForm);
        formData.append('cf-turnstile-response', token);
        const res = await fetch(subscribeForm.action, {
          method:'POST',
          body:formData,
          headers:{Accept:'application/json'}
        });
          if(res.ok){
            msg.textContent = 'Thanks for subscribing!';
            if(window.gtag){
              window.gtag('event','subscribe');
            }
            subscribeForm.reset();
            disableBtn();
            window.turnstile?.reset();
          }else{
            msg.textContent = 'Submission failed. Please try again later.';
          }
      }catch{
        msg.textContent = 'Submission failed. Please try again later.';
      }
    });
  }
})();
