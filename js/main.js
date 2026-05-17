/* ─── js/main.js ─── */

/* ══════════════════════════════════
   GSAP + ScrollTrigger loaded via CDN
   This file runs after DOM is ready
══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────
     1. CUSTOM CURSOR
  ───────────────────────────────── */
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursor-trail');
  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    setTimeout(() => {
      cursorTrail.style.left = mx + 'px';
      cursorTrail.style.top  = my + 'px';
    }, 80);
  });

  document.querySelectorAll('a, button, .btn-royal, .btn-liquid, .note-card, .perfume-card, .perfume-card-link')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });


  /* ─────────────────────────────────
     2. CINEMATIC VIDEO & SCROLL EFFECTS
  ───────────────────────────────── */
  const video = document.getElementById('hero-video');
  const heroSection = document.getElementById('hero');

  let userScrolled = false;
  let climaxTriggered = false;
  let scrollTimeout = null;
  let inAutoScroll = false;
  let hasCompletedFirstIntro = false;

  // Cancel pending auto-scrolls instantly if the user starts manually scrolling or touching
  const cancelAutoScroll = () => {
    if (inAutoScroll) {
      inAutoScroll = false;
      userScrolled = true;
      climaxTriggered = true;
      hasCompletedFirstIntro = true;
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      document.body.classList.remove('intro-active');
    }
  };

  // Monitor scroll offset to mark manual interaction or trigger re-plays at scroll top
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 20) {
      if (!inAutoScroll) {
        userScrolled = true;
        hasCompletedFirstIntro = true;
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        document.body.classList.remove('intro-active');
      }
    } else if (scrollY <= 4) {
      // Re-trigger the complete cinematic loop ONLY if they explicitly scroll back up to the absolute top
      // after they've already completed/experienced the intro once.
      if (hasCompletedFirstIntro && climaxTriggered && userScrolled) {
        resetIntro();
      }
    }
  }, { passive: true });

  // Add event listeners to detect physical scroll wheels, sweeps, or key presses immediately
  window.addEventListener('wheel', cancelAutoScroll, { passive: true });
  window.addEventListener('touchmove', cancelAutoScroll, { passive: true });
  window.addEventListener('mousedown', cancelAutoScroll, { passive: true });
  window.addEventListener('pointerdown', cancelAutoScroll, { passive: true });
  window.addEventListener('keydown', cancelAutoScroll, { passive: true });

  function resetIntro() {
    climaxTriggered = false;
    userScrolled = false;
    inAutoScroll = false;
    hasCompletedFirstIntro = false;
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Hide all branding elements instantly
    const eyebrow   = document.querySelector('.hero-eyebrow');
    const title     = document.querySelector('.hero-title');
    const sub       = document.querySelector('.hero-sub');
    const ctaWrap   = document.querySelector('.hero-cta-wrap');
    const scrollHint = document.querySelector('.scroll-hint');

    [eyebrow, title, sub, ctaWrap, scrollHint].forEach(el => {
      if (el) {
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
      }
    });

    // Lock the body scroll
    document.body.classList.add('intro-active');

    // Rewind video and play it cleanly
    if (video) {
      video.loop = false;
      video.currentTime = 0;
      video.play().catch(err => console.log(err));
    }
  }

  // Ensure the video plays smoothly at full frame rate on page load
  if (video) {
    document.body.classList.add('intro-active');
    video.play().catch(err => console.log("Muted autoplay started."));

    // Trigger reveal 0.8 seconds before the video ends (to align perfectly with the lineup sweep)
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        if (video.currentTime >= video.duration - 0.8) {
          triggerClimaxSequence();
        }
      }
    });

    // Fallback if the ended event fires
    video.addEventListener('ended', () => {
      triggerClimaxSequence();
    });
  }

  function triggerClimaxSequence() {
    if (climaxTriggered) return;
    climaxTriggered = true;

    // 1. Reveal branding with royal slow-fade motion
    if (!userScrolled) {
      animateBrandingIn();

      // 2. Lock and auto-scroll down smoothly after 2.5 seconds
      inAutoScroll = true;
      scrollTimeout = setTimeout(() => {
        if (!userScrolled) {
          // Remove the scroll lock class right before auto-scrolling
          document.body.classList.remove('intro-active');

          const nextSection = document.getElementById('opening');
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          }

          // Mark auto-scroll as finished after smooth scroll completes (approx 1.2s)
          setTimeout(() => {
            inAutoScroll = false;
            hasCompletedFirstIntro = true;
          }, 1200);
        }
      }, 2500);
    } else {
      document.body.classList.remove('intro-active');
      hasCompletedFirstIntro = true;
    }

    // 3. Loop the video continuously in the background
    if (video) {
      video.loop = true;
      video.play().catch(err => console.log(err));
    }
  }

  function animateBrandingIn() {
    const eyebrow   = document.querySelector('.hero-eyebrow');
    const title     = document.querySelector('.hero-title');
    const sub       = document.querySelector('.hero-sub');
    const ctaWrap   = document.querySelector('.hero-cta-wrap');
    const scrollHint = document.querySelector('.scroll-hint');

    const elements = [
      { el: eyebrow, delay: 0 },
      { el: title, delay: 200 },
      { el: sub, delay: 400 },
      { el: ctaWrap, delay: 600 },
      { el: scrollHint, delay: 800 }
    ];

    elements.forEach(item => {
      if (item.el) {
        item.el.style.transition = 'opacity 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        setTimeout(() => {
          if (!userScrolled) {
            item.el.style.opacity = '1';
            item.el.style.transform = 'translateY(0)';
          }
        }, item.delay);
      }
    });
  }

  function initScrollScrub() {
    const heroHeight = heroSection.offsetHeight; // 400vh
    const viewportH  = window.innerHeight;
    const scrollRange = heroHeight - viewportH;

    function handleScrollEffects() {
      const scrollY   = window.scrollY;
      const progress  = Math.min(Math.max(scrollY / scrollRange, 0), 1);

      // Premium visual depth: gentle zoom effect as you scroll
      if (video) {
        const scale = 1 + progress * 0.08;
        video.style.transform = `scale(${scale})`;
      }

      if (userScrolled) {
        // Once the user interacts, they control the fades dynamically
        updateHeroText(progress);
      }

      requestAnimationFrame(handleScrollEffects);
    }
    requestAnimationFrame(handleScrollEffects);
  }

  // Start scroll checking
  initScrollScrub();

  function updateHeroText(progress) {
    const eyebrow   = document.querySelector('.hero-eyebrow');
    const title     = document.querySelector('.hero-title');
    const sub       = document.querySelector('.hero-sub');
    const ctaWrap   = document.querySelector('.hero-cta-wrap');
    const scrollHint = document.querySelector('.scroll-hint');

    // Remove slow transition when scrubbing so it responds instantly
    [eyebrow, title, sub, ctaWrap, scrollHint].forEach(el => {
      if (el) el.style.transition = 'none';
    });

    // When the user scrolls back up to the video, the branding is fully displayed at scroll = 0 (progress = 0)
    // and smoothly fades out as they scroll down into the page (0% -> 22% progress).
    setFade(eyebrow,   progress, 0, 0, 0.05, 0.15);
    setFade(title,     progress, 0, 0, 0.08, 0.18);
    setFade(sub,       progress, 0, 0, 0.10, 0.20);
    setFade(ctaWrap,   progress, 0, 0, 0.12, 0.22);

    // Scroll hint is shown briefly and fades out quickly
    setFade(scrollHint, progress, 0, 0, 0.02, 0.10);
  }

  /**
   * setFade — smoothly fade an element in/out based on scroll progress.
   * Supports `inStart === inEnd === 0` to keep element fully visible at progress 0, fading out on scroll.
   */
  function setFade(el, progress, inStart, inEnd, outStart, outEnd) {
    if (!el) return;
    let opacity = 0;
    let ty = 12;

    if (inEnd === inStart) {
      // Element is already fully visible on load (progress = 0) and fades out dynamically
      if (progress < outStart) {
        opacity = 1;
        ty = 0;
      } else if (progress >= outStart && progress <= outEnd) {
        const t = (progress - outStart) / (outEnd - outStart);
        opacity = 1 - easeIn(t);
        ty = -12 * easeIn(t);
      } else {
        opacity = 0;
        ty = -12;
      }
    } else {
      // Dual-trigger fade-in / fade-out interpolation
      if (progress >= inStart && progress <= inEnd) {
        const t = (progress - inStart) / (inEnd - inStart);
        opacity = easeOut(t);
        ty = 12 * (1 - easeOut(t));
      } else if (progress > inEnd && progress < outStart) {
        opacity = 1; ty = 0;
      } else if (progress >= outStart && progress <= outEnd) {
        const t = (progress - outStart) / (outEnd - outStart);
        opacity = 1 - easeIn(t);
        ty = -12 * easeIn(t);
      }
    }

    el.style.opacity  = opacity;
    el.style.transform = `translateY(${ty}px)`;
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)  { return t * t * t; }


  /* ─────────────────────────────────
     3. SECTION SCROLL REVEAL
  ───────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));


  /* ─────────────────────────────────
     4. BRAND STORY WORD REVEAL
  ───────────────────────────────── */
  const storyHeadline = document.querySelector('.story-headline');
  if (storyHeadline) {
    const wordObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.reveal-word');
          words.forEach((word, i) => {
            setTimeout(() => word.classList.add('visible'), i * 120);
          });
        }
      });
    }, { threshold: 0.3 });
    wordObserver.observe(storyHeadline);
  }


  /* ─────────────────────────────────
     5. MIST PARTICLE SPAWNER
  ───────────────────────────────── */
  const mistContainer = document.querySelector('.mist-container');
  if (mistContainer) {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'mist-particle';
      const size = 20 + Math.random() * 60;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${10 + Math.random() * 80}%;
        bottom:${Math.random() * 30}%;
        --dur:${3 + Math.random() * 4}s;
        --delay:${Math.random() * 3}s;
      `;
      mistContainer.appendChild(p);
    }
  }


  /* ─────────────────────────────────
     6. PARALLAX on OPENING section
  ───────────────────────────────── */
  const bottleIcon = document.querySelector('.bottle-icon');
  if (bottleIcon) {
    window.addEventListener('scroll', () => {
      const rect = document.getElementById('opening').getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const frac = 1 - rect.top / window.innerHeight;
        bottleIcon.style.transform = `translateY(${-14 + frac * 8}px)`;
      }
    }, { passive: true });
  }


  /* ─────────────────────────────────
     7. GOLD DIVIDER SCALE ON REVEAL
  ───────────────────────────────── */
  document.querySelectorAll('.gold-divider').forEach(divider => {
    divider.style.transform = 'scaleX(0)';
    const divObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.transition = 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s';
          e.target.style.transform = 'scaleX(1)';
        }
      });
    }, { threshold: 0.5 });
    divObs.observe(divider);
  });


  /* ─────────────────────────────────
     8. NOTE CARD TILT EFFECT
  ───────────────────────────────── */
  document.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-6px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─────────────────────────────────
     9. CINEMATIC PAGE TRANSITION
  ───────────────────────────────── */
  const ctaShop = document.getElementById('cta-shop');
  const curtain = document.getElementById('cinematic-curtain');
  const logo = document.getElementById('cinematic-logo');

  if (ctaShop && curtain && logo) {
    ctaShop.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Sweep up the curtain
      curtain.style.transform = 'translateY(0%)';
      curtain.style.pointerEvents = 'all';
      
      // After a small delay, fade in the logo
      setTimeout(() => {
        logo.style.opacity = '1';
        logo.style.transform = 'scale(1) translateY(0)';
      }, 400);
      
      // After transition completes, navigate to showcase.html
      setTimeout(() => {
        window.location.href = 'showcase.html';
      }, 1200);
    });
  }

});
