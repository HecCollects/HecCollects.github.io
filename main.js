const burger  = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', burger.classList.contains('open'));
  navMenu.setAttribute('aria-hidden', !navMenu.classList.contains('open'));
});

// Close after link click
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
  });
});

// Ripple
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const circle  = document.createElement('span');
    const size    = Math.max(btn.clientWidth, btn.clientHeight);
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left  = `${e.clientX - btn.getBoundingClientRect().left - size/2}px`;
    circle.style.top   = `${e.clientY - btn.getBoundingClientRect().top  - size/2}px`;
    circle.classList.add('ripple');
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
});

// Preloader
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  pre.classList.add('hide');
  setTimeout(() => pre.remove(), 600);
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
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { threshold:0.6 });
sections.forEach(sec => sectionObs.observe(sec));

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

