(() => {
  const canHover = window.matchMedia('(hover: hover)').matches;
  const webglSupported = !!window.WebGLRenderingContext;
  const preloader = document.getElementById('preloader');

  if (preloader) {
    preloader.classList.add('js-preloader');
  }

  const initListClones = () => {
    if (window.__listClonesInitialized) return;
    window.__listClonesInitialized = true;
    document.querySelectorAll('.feature-marquee').forEach(list => {
      const originals = Array.from(list.children);

      const positions = [
        { x: '15%', y: '25%' },
        { x: '60%', y: '30%' },
        { x: '35%', y: '70%' }
      ];

      originals.forEach((li, index) => {
        const pos = positions[index % positions.length];
        li.style.setProperty('--i', index);
        li.style.setProperty('--x', pos.x);
        li.style.setProperty('--y', pos.y);
        li.style.animationDelay = `${index * 4}s`;
      });

      originals.forEach((li, index) => {
        const clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        const delayIndex = originals.length + index;
        clone.style.setProperty('--i', delayIndex);
        clone.style.animationDelay = `${delayIndex * 4}s`;
        list.appendChild(clone);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListClones, { once: true });
  } else {
    initListClones();
  }

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
    if (canHover) {
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
    }

  // Preloader
  window.addEventListener('load', () => {
    if (preloader) {
      preloader.classList.add('hide');
      setTimeout(() => {
        preloader.classList.remove('js-preloader');
        preloader.remove();
      }, 600);
    }
  });

  if (document.body) {
    document.body.classList.add('js-reveal');
  }

  // Reveal on scroll
  let revealObserver;
  const observeReveals = nodes => {
    if (!nodes) return;
    nodes.forEach(el => {
      if (!el || el.dataset.revealObserved === 'true') return;
      el.dataset.revealObserved = 'true';
      if (revealObserver) {
        revealObserver.observe(el);
      } else {
        el.classList.add('visible');
      }
    });
  };

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
  }

  const initReveals = () => {
    const revealEls = document.querySelectorAll('.reveal');
    observeReveals(revealEls ? Array.from(revealEls) : []);
  };

  initReveals();
  document.addEventListener('includes:loaded', initReveals);

  const initFeaturedCarousels = () => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.featured .carousel').forEach(carousel => {
      const track = carousel.querySelector('.featured-items');
      const prev = carousel.querySelector('.carousel-prev');
      const next = carousel.querySelector('.carousel-next');
      const items = track ? Array.from(track.querySelectorAll('a')) : [];
      if (!items.length) return;
      track.setAttribute('aria-live', 'polite');
      let idx = 0;
      const updateAria = () => {
        items.forEach((el, i) => el.setAttribute('aria-hidden', i !== idx));
        track.setAttribute('aria-label', `Slide ${idx + 1} of ${items.length}`);
      };
      const go = (i) => {
        idx = (i + items.length) % items.length;
        const item = items[idx];
        const offset = item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2;
        track.scrollTo({ left: offset, behavior: 'smooth' });
        updateAria();
      };
      updateAria();
      prev?.addEventListener('click', (e) => {
        go(idx - 1);
        e.currentTarget.focus();
        if (window.gtag) {
          window.gtag('event','carousel_nav',{event_label:'prev'});
        }
      });
      next?.addEventListener('click', (e) => {
        go(idx + 1);
        e.currentTarget.focus();
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
          if (!container) return;
          const items = Array.isArray(data[key]) ? data[key] : [];
          container.innerHTML = '';
          if (!items.length) {
            const fallback = document.createElement('p');
            fallback.className = 'featured-empty';
            fallback.textContent = 'No featured items available.';
            container.appendChild(fallback);
            return;
          }
          items.forEach((item, i) => {
            const link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('data-analytics', `${key}-item-${i + 1}`);
            link.classList.add('featured-card');
            link.addEventListener('click', () => {
              const label = link.getAttribute('data-analytics');
              if (window.gtag) {
                window.gtag('event', 'click', {
                  event_category: 'featured',
                  event_label: label,
                });
              }
            });

            const media = document.createElement('div');
            media.className = 'featured-media';

            const img = document.createElement('img');
            const small = item.imageSmall || item.imageLarge || '';
            const large = item.imageLarge || item.imageSmall || '';
            img.src = small;
            img.alt = item.alt || '';
            img.loading = 'lazy';
            try {
              const getWidth = (u) => {
                try {
                  return parseInt(new URL(u).searchParams.get('width') || '0', 10);
                } catch {
                  return 0;
                }
              };
              const smallW = getWidth(small);
              const largeW = getWidth(large);
              if (smallW && largeW) {
                img.width = largeW;
                img.height = Math.round(largeW * 9 / 16);
                img.srcset = `${small} ${smallW}w, ${large} ${largeW}w`;
                img.sizes = `(max-width: ${largeW}px) 100vw, ${largeW}px`;
              }
            } catch {}
            media.appendChild(img);
            link.appendChild(media);
            if (item.tagColor) {
              link.style.setProperty('--featured-border-color', item.tagColor);
            }
            if (item.badge || item.stock) {
              const meta = document.createElement('span');
              meta.className = 'item-meta';
              meta.textContent = item.badge ? item.badge : `Only ${item.stock} left`;
              if (item.tagColor) {
                meta.style.backgroundColor = item.tagColor;
              }
              media.appendChild(meta);
            }
            const details = document.createElement('div');
            details.className = 'featured-details';
            const title = document.createElement('span');
            title.className = 'featured-title';
            title.textContent = item.title || item.caption || item.alt || 'Featured find';
            details.appendChild(title);

            const priceText = item.price || item.priceText || item.priceLabel || '';
            const price = document.createElement('span');
            price.className = 'featured-price';
            if (priceText) {
              price.textContent = priceText;
            } else {
              price.textContent = 'View listing ↗';
              price.classList.add('featured-price--placeholder');
            }
            details.appendChild(price);

            if (Array.isArray(item.valueProps) && item.valueProps.length) {
              const list = document.createElement('ul');
              list.className = 'featured-value-props';
              item.valueProps.filter(Boolean).forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                list.appendChild(li);
              });
              if (list.childElementCount) {
                details.appendChild(list);
              }
            }

            if (item.bonus) {
              const bonus = document.createElement('span');
              bonus.className = 'featured-bonus';
              bonus.textContent = item.bonus;
              details.appendChild(bonus);
            }

            link.appendChild(details);
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
  const testimonialWrapper = document.querySelector('#testimonials .testimonials');
  if (testimonialWrapper) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const track = testimonialWrapper.querySelector('.testimonial-track');
    const prevBtn = testimonialWrapper.querySelector('.testimonial-prev');
    const nextBtn = testimonialWrapper.querySelector('.testimonial-next');
    const pagination = testimonialWrapper.querySelector('.testimonial-pagination');

    const buildSlides = (reviews) => {
      track.innerHTML = '';
      reviews.forEach((rev, i) => {
        const fig = document.createElement('figure');
        fig.id = 'testimonial-' + (i + 1);
        if (rev.headline) {
          const heading = document.createElement('h3');
          heading.className = 'testimonial-headline';
          heading.textContent = rev.headline;
          fig.appendChild(heading);
        }
        const quote = document.createElement('blockquote');
        quote.textContent = '“' + rev.text + '”';
        fig.appendChild(quote);
        const rating = document.createElement('div');
        rating.className = 'rating';
        const stars = Math.round(Number(rev.rating) || 0);
        rating.setAttribute('aria-label', stars + ' out of 5 stars');
        for (let s = 0; s < stars; s++) {
          const star = document.createElement('i');
          star.className = 'fa-solid fa-star';
          star.setAttribute('aria-hidden', 'true');
          rating.appendChild(star);
        }
        fig.appendChild(rating);
        if (Array.isArray(rev.valueProps) && rev.valueProps.length) {
          const list = document.createElement('ul');
          list.className = 'testimonial-value-props';
          rev.valueProps.filter(Boolean).forEach(value => {
            const li = document.createElement('li');
            li.textContent = value;
            list.appendChild(li);
          });
          if (list.childElementCount) {
            fig.appendChild(list);
          }
        }
        const cap = document.createElement('figcaption');
        const parts = [];
        if (rev.reviewer) parts.push(rev.reviewer);
        if (rev.badge) {
          parts.push(rev.badge);
        } else if (rev.source) {
          parts.push(rev.source);
        }
        cap.textContent = parts.length ? '— ' + parts.join(', ') : '';
        fig.appendChild(cap);
        track.appendChild(fig);
      });
      return Array.from(track.querySelectorAll('figure'));
    };

    const initCarousel = (slides) => {
      slides.forEach(s => { s.setAttribute('role', 'tabpanel'); });
      let index = 0;
      let timer;

      const select = (i) => {
        index = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
        slides.forEach((s, idx) => {
          const active = idx === index;
          s.classList.toggle('active', active);
          s.setAttribute('aria-hidden', active ? 'false' : 'true');
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
        dot.setAttribute('aria-selected', 'false');
        if (slide.id) dot.setAttribute('aria-controls', slide.id);
        dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        dot.addEventListener('click', () => {
          select(i);
          reset();
          if (window.gtag) {
            window.gtag('event','testimonial_nav',{event_label: 'dot_' + (i + 1)});
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

      if (typeof motionQuery.addEventListener === 'function') {
        motionQuery.addEventListener('change', e => {
          if (e.matches) {
            clearInterval(timer);
          } else {
            start();
          }
        });
      }

      select(0);
      start();
    };

    const load = async () => {
      try {
        if (location.protocol === 'file:') return;
        const src = testimonialWrapper.dataset.src || 'reviews.json';
        const res = await fetch(src);
        if (!res.ok) return;
        const data = await res.json();
        const reviews = Array.isArray(data) ? data : data.reviews || [];
        const slides = buildSlides(reviews);
        if (slides.length) {
          initCarousel(slides);
        } else {
          track.innerHTML = '<p>No reviews yet.</p>';
        }
      } catch (err) {
        console.warn('Unable to load testimonials', err);
      }
    };

    load();
  }
    // Hero background animation
    const heroSection = document.getElementById('home');
    const heroMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let vantaEffect;

    window.initVanta = () => {
      if (!heroSection || heroMotionQuery.matches || !window.VANTA || !webglSupported) return;
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
        window.initVanta();
      }
    };
    if (typeof heroMotionQuery.addEventListener === 'function') {
      heroMotionQuery.addEventListener('change', handleMotionChange);
    } else if (heroMotionQuery.addListener) {
      heroMotionQuery.addListener(handleMotionChange);
    }

    // 3D tilt on hero card
  const heroCard = document.querySelector('#home .card.tilt');
  if (canHover && heroCard) {
    heroCard.addEventListener('mousemove', e => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      heroCard.style.transform = `rotateY(${x / 25}deg) rotateX(${-y / 25}deg)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = '';
    });
  }

  // Package reveal animation
  const packageContainer = document.getElementById('package-anim');
  window.initPackageAnimation = () => {
    if (!packageContainer) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLocal = window.location.protocol === 'file:';
    if (!webglSupported || !window.THREE || reduced || isLocal) {
      packageContainer.classList.add('show-logo');
      return;
    }
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
      const loader = new THREE.TextureLoader();
      const tex = loader.load('logo.png', undefined, undefined, () => {
        packageContainer.classList.add('show-logo');
        if (renderer && renderer.domElement) {
          renderer.domElement.remove();
        }
      });
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
  };

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    };
    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
