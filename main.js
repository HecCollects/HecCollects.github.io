(() => {
  const recaptchaEnabled = !!window.RECAPTCHA_SITE_KEY;
  const recaptcha = document.querySelector('.g-recaptcha');
  if (recaptcha) {
    if (recaptchaEnabled) {
      recaptcha.setAttribute('data-sitekey', window.RECAPTCHA_SITE_KEY);
    } else {
      recaptcha.classList.add('hidden');
    }
  }

  if (!window.GA_ID) {
    console.warn('window.GA_ID is not set; analytics will be disabled.');
  }
  if (!window.PHONE_NUMBER) {
    console.warn('window.PHONE_NUMBER is not set; phone link will be hidden.');
  }

  const phoneLink = document.getElementById('phone-link');
  if (phoneLink) {
    if (window.PHONE_NUMBER) {
      phoneLink.href = `tel:${window.PHONE_NUMBER}`;
    } else {
      phoneLink.classList.add('hidden');
    }
  }

  const initListClones = () => {
    if (window.__listClonesInitialized) return;
    window.__listClonesInitialized = true;
    document.querySelectorAll('.feature-marquee').forEach(list => {
      const originals = Array.from(list.children);
      originals.forEach(li => {
        const clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        list.appendChild(clone);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListClones, { once: true });
  } else {
    initListClones();
  }

  const burger = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (burger && navMenu) {
    const links = Array.from(navMenu.querySelectorAll('a'));
    const mql = window.matchMedia('(min-width: 1024px)');

    const openMenu = () => {
      burger.classList.add('open');
      navMenu.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');
      links[0]?.focus();
      if (window.gtag) {
        window.gtag('event', 'menu_open');
      }
    };

    const closeMenu = (focusBurger = true) => {
      if (mql.matches) return;
      burger.classList.remove('open');
      navMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-hidden', 'true');
      if (focusBurger) burger.focus();
      if (window.gtag) {
        window.gtag('event', 'menu_close');
      }
    };

    burger.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu(false);
        if (window.gtag) {
          window.gtag('event', 'navigate', {
            event_category: 'nav',
            event_label: link.textContent?.trim() || ''
          });
        }
      });
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
        burger.classList.add('hidden');
        burger.setAttribute('aria-hidden', 'true');
        burger.tabIndex = -1;
      } else {
        navMenu.classList.remove('open');
        navMenu.setAttribute('aria-hidden', 'true');
        burger.classList.remove('hidden');
        burger.setAttribute('aria-hidden', 'false');
        burger.tabIndex = 0;
      }
    };
    handleBreakpoint(mql);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleBreakpoint);
    } else if (mql.addListener) {
      mql.addListener(handleBreakpoint);
    }
  }

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
      cue.setAttribute('aria-hidden', 'true');
      cue.setAttribute('role', 'presentation');
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

  const initFeaturedCarousels = () => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.featured .carousel').forEach(carousel => {
      const track = carousel.querySelector('.featured-items');
      const prev = carousel.querySelector('.carousel-prev');
      const next = carousel.querySelector('.carousel-next');
      const items = track ? Array.from(track.querySelectorAll('a')) : [];
      if (!items.length) return;
      let idx = 0;
      const go = (i) => {
        idx = (i + items.length) % items.length;
        const item = items[idx];
        const offset = item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2;
        track.scrollTo({ left: offset, behavior: 'smooth' });
      };
      prev?.addEventListener('click', () => {
        go(idx - 1);
        if (window.gtag) {
          window.gtag('event','carousel_nav',{event_label:'prev'});
        }
      });
      next?.addEventListener('click', () => {
        go(idx + 1);
        if (window.gtag) {
          window.gtag('event','carousel_nav',{event_label:'next'});
        }
      });
      let timer;
      const start = () => { timer = setInterval(() => go(idx + 1), 5000); };
      const stop = () => clearInterval(timer);
      if (!motionQuery.matches) start();
      motionQuery.addEventListener('change', e => {
        if (e.matches) {
          stop();
        } else {
          start();
        }
      });
    });
  };

  const showFallbackMessage = () => {
    document.querySelectorAll('.featured-items').forEach(container => {
      container.textContent = 'Unable to load items at this time.';
    });
  };

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
            if (item.badge || item.stock) {
              const meta = document.createElement('span');
              meta.className = 'item-meta';
              const parts = [];
              if (item.badge) parts.push(item.badge);
              if (item.stock) parts.push(`Only ${item.stock} left`);
              meta.textContent = parts.join(' – ');
              link.appendChild(meta);
            }
            container.appendChild(link);
          });
        };
        buildItems('ebay', 'ebay-items');
        buildItems('offerup', 'offerup-items');
        initFeaturedCarousels();
      })
      .catch(err => {
        console.error(err);
        showFallbackMessage();
      });
  } else {
    initFeaturedCarousels();
  }

  // Testimonials slider
  const testimonialWrapper = document.querySelector('.testimonials');
  if (testimonialWrapper) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
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
      if (motionQuery.matches) return;
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
        if (window.gtag) {
          window.gtag('event','testimonial_nav',{event_label:`dot_${i+1}`});
        }
      });
      pagination?.appendChild(dot);
    });

    prevBtn?.addEventListener('click', () => {
      select(index - 1);
      reset();
      if (window.gtag) {
        window.gtag('event','testimonial_nav',{event_label:'prev'});
      }
    });

    nextBtn?.addEventListener('click', () => {
      select(index + 1);
      reset();
      if (window.gtag) {
        window.gtag('event','testimonial_nav',{event_label:'next'});
      }
    });

    motionQuery.addEventListener('change', e => {
      if (e.matches) {
        clearInterval(timer);
      } else {
        start();
      }
    });

    select(0);
    start();
  }

    // Hero background animation
    const heroSection = document.getElementById('home');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let vantaEffect;

    const initVanta = () => {
      if (!heroSection || motionQuery.matches || !window.VANTA) return;
      vantaEffect = window.VANTA.NET({
        el: heroSection,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        color: 0xffffff,
        backgroundAlpha: 0
      });
      heroSection.querySelector('canvas')?.setAttribute('aria-hidden', 'true');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!vantaEffect) return;
          if (entry.isIntersecting) {
            vantaEffect.play?.();
          } else {
            vantaEffect.pause?.();
          }
        });
      });
      observer.observe(heroSection);
    };

    const destroyVanta = () => {
      vantaEffect?.destroy();
      vantaEffect = null;
    };

    const handleMotionChange = (e) => {
      if (e.matches) {
        destroyVanta();
      } else {
        initVanta();
      }
    };
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(handleMotionChange);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initVanta, { once: true });
    } else {
      initVanta();
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

  // Package reveal animation
  const packageContainer = document.getElementById('package-anim');
  if (packageContainer && window.THREE) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      packageContainer.classList.add('show-logo');
    } else {
      let renderer, scene, camera, lid, logoMesh, animId, startTime, progress = 0;
      const init = () => {
        const { clientWidth: w, clientHeight: h } = packageContainer;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        packageContainer.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 1.5, 4);
        const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), material);
        box.position.y = -0.5;
        scene.add(box);
        lid = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 2), material);
        lid.position.y = 0.05;
        scene.add(lid);
        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(light);
        const tex = new THREE.TextureLoader().load('logo.png');
        const plane = new THREE.PlaneGeometry(1.2, 1.2);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        logoMesh = new THREE.Mesh(plane, mat);
        logoMesh.rotation.x = -Math.PI / 2;
        logoMesh.position.y = -0.1;
        logoMesh.visible = false;
        scene.add(logoMesh);
        renderer.render(scene, camera);
      };
      const step = (t) => {
        if (!startTime) startTime = t;
        const delta = t - startTime;
        startTime = t;
        progress = Math.min(progress + delta / 1000, 1);
        lid.rotation.x = -Math.PI / 2 * progress;
        if (progress >= 1) {
          logoMesh.visible = true;
          packageContainer.classList.add('show-logo');
        }
        renderer.render(scene, camera);
        if (progress < 1) animId = requestAnimationFrame(step);
        else animId = null;
      };
      const play = () => {
        if (animId || progress >= 1) return;
        startTime = null;
        animId = requestAnimationFrame(step);
      };
      const pause = () => {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!renderer) init();
            play();
          } else {
            pause();
          }
        });
      }, { threshold: 0.5 });
      observer.observe(packageContainer);
      packageContainer.addEventListener('click', () => {
        lid.rotation.x = 0;
        logoMesh.visible = false;
        packageContainer.classList.remove('show-logo');
        progress = 0;
        play();
      });
    }
  }

  // Subscribe form handling with honeypot and reCAPTCHA
  const subscribeForm = document.querySelector('.subscribe-form');
  if(subscribeForm){
    const msg = document.getElementById('subscribe-msg');
    const btn = subscribeForm.querySelector('button[type="submit"]');
    const disableBtn = () => { if(btn) btn.disabled = true; };
    disableBtn();
    window.enableSubscribe = () => { if(btn) btn.disabled = false; };
    window.disableSubscribe = disableBtn;
    if(!recaptchaEnabled){
      window.enableSubscribe();
      if(msg){
        msg.textContent = 'reCAPTCHA disabled in test/local builds.';
        msg.className = 'form-msg';
      }
    }
    subscribeForm.addEventListener('submit', async e => {
      e.preventDefault();
      if(msg){
        msg.textContent = '';
        msg.className = 'form-msg';
      }
      const hp = subscribeForm.querySelector('input[name="hp"]');
      if(hp && hp.value){
        if(msg){
          msg.textContent = 'Submission rejected.';
          msg.className = 'form-msg error';
        }
        if(window.gtag){ window.gtag('event','subscribe_error'); }
        return;
      }
      let token = '';
      if(recaptchaEnabled){
        token = window.grecaptcha?.getResponse();
        if(!token){
          if(msg){
            msg.textContent = 'Please complete the captcha.';
            msg.className = 'form-msg error';
          }
          if(window.gtag){ window.gtag('event','subscribe_error'); }
          return;
        }
      }
      try{
        const formData = new FormData(subscribeForm);
        if(recaptchaEnabled){
          formData.append('g-recaptcha-response', token);
        }
        const res = await fetch(subscribeForm.action, {
          method:'POST',
          body:formData,
          headers:{Accept:'application/json'}
        });
          if(res.ok){
            if(msg){
              msg.textContent = 'Thanks for subscribing!';
              msg.className = 'form-msg success';
            }
            if(window.gtag){
              window.gtag('event','subscribe_success');
            }
            subscribeForm.reset();
            disableBtn();
            if(recaptchaEnabled){
              window.grecaptcha?.reset();
            }
          }else{
            if(msg){
              msg.textContent = 'Submission failed. Please try again later.';
              msg.className = 'form-msg error';
            }
            if(window.gtag){ window.gtag('event','subscribe_error'); }
          }
      }catch{
        if(msg){
          msg.textContent = 'Submission failed. Please try again later.';
          msg.className = 'form-msg error';
        }
        if(window.gtag){ window.gtag('event','subscribe_error'); }
      }
    });
  }

  // Cookie/analytics notice
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieBtn = document.getElementById('cookie-btn');
  if(cookieBanner && cookieBtn){
    if(localStorage.getItem('cookieConsent')){
      cookieBanner.remove();
    }else{
      cookieBanner.classList.remove('hidden');
      cookieBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent','yes');
        cookieBanner.remove();
        if(window.gtag){ window.gtag('event','cookie_consent'); }
      });
    }
  }
})();
