/* ==========================================================================
   Vivek & Sneha — app.js
   Countdown engine · Floating audio player · GSAP ScrollTrigger reveals
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 1. Live Countdown Engine                                          */
  /* ------------------------------------------------------------------ */
  var WEDDING_DATE = new Date('2026-09-13T10:30:00+05:30').getTime();
  var heroTimeline;

  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMins = document.getElementById('cd-mins');
  var elSecs = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    var now = Date.now();
    var diff = WEDDING_DATE - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMins.textContent = '00';
      elSecs.textContent = '00';
      clearInterval(countdownTimer);
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  updateCountdown();
  var countdownTimer = setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------ */
  /* 2. Floating Audio Player                                          */
  /* ------------------------------------------------------------------ */
  var audioToggle = document.getElementById('audioToggle');
  var bgAudio = document.getElementById('bgAudio');
  var isPlaying = false;
  var fadeInterval = null;
  var TARGET_VOLUME = 0.6;

  bgAudio.volume = 0;

  function clearFade() {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  function fadeAudio(direction) {
    clearFade();
    var step = 0.05;
    fadeInterval = setInterval(function () {
      if (direction === 'in') {
        bgAudio.volume = Math.min(TARGET_VOLUME, bgAudio.volume + step);
        if (bgAudio.volume >= TARGET_VOLUME) clearFade();
      } else {
        bgAudio.volume = Math.max(0, bgAudio.volume - step);
        if (bgAudio.volume <= 0) {
          bgAudio.pause();
          clearFade();
        }
      }
    }, 80);
  }

  audioToggle.addEventListener('click', function () {
    if (!isPlaying) {
      bgAudio.play().catch(function () {
        /* Autoplay blocked or asset missing — fail silently */
      });
      fadeAudio('in');
      audioToggle.classList.add('playing');
      audioToggle.setAttribute('aria-pressed', 'true');
      audioToggle.setAttribute('aria-label', 'Pause wedding music');
      audioToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
      isPlaying = true;
    } else {
      fadeAudio('out');
      audioToggle.classList.remove('playing');
      audioToggle.setAttribute('aria-pressed', 'false');
      audioToggle.setAttribute('aria-label', 'Play wedding music');
      audioToggle.innerHTML = '<i class="fa-solid fa-music"></i>';
      isPlaying = false;
    }
  });

  /* ------------------------------------------------------------------ */
  /* 2.5. Invitation Cover Overlay                                     */
  /* ------------------------------------------------------------------ */
  var btnOpenInvitation = document.getElementById('btnOpenInvitation');
  var invitationCover = document.getElementById('invitationCover');

  // Lock body scroll if the cover overlay is active
  if (invitationCover) {
    document.body.style.overflow = 'hidden';
  }

  function openInvitation() {
    if (!invitationCover) return;

    // Fade out and remove the cover
    invitationCover.style.opacity = '0';
    invitationCover.style.pointerEvents = 'none';

    // Enable scroll on body
    document.body.style.overflow = '';

    // Play GSAP hero entrance if available
    if (heroTimeline) {
      heroTimeline.play();
    }

    // Play wedding music automatically on open
    if (!isPlaying) {
      bgAudio.play().catch(function () {
        /* Autoplay blocked or asset missing — fail silently */
      });
      fadeAudio('in');
      audioToggle.classList.add('playing');
      audioToggle.setAttribute('aria-pressed', 'true');
      audioToggle.setAttribute('aria-label', 'Pause wedding music');
      audioToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
      isPlaying = true;
    }

    // Completely remove element from DOM after transition
    setTimeout(function () {
      invitationCover.remove();
    }, 800);
  }

  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', openInvitation);
  }

  /* ------------------------------------------------------------------ */
  /* 3. GSAP ScrollTrigger Reveal Sequences                             */
  /* ------------------------------------------------------------------ */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance — plays once opened
    heroTimeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', duration: 0.9 } })
      .to('.hero [data-reveal]', {
        y: 0,
        opacity: 1,
        stagger: 0.15
      });

    // If no cover, play immediately
    if (!document.getElementById('invitationCover')) {
      heroTimeline.play();
    }

    // Generic single reveals
    gsap.utils.toArray('main [data-reveal], .ashirwad [data-reveal]').forEach(function (el) {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Staggered group reveals (family panels, event cards, gallery frames)
    var staggerGroups = {};
    gsap.utils.toArray('[data-reveal-stagger]').forEach(function (el) {
      var parent = el.closest('section');
      var key = parent ? parent.id || parent.className : 'default';
      if (!staggerGroups[key]) staggerGroups[key] = [];
      staggerGroups[key].push(el);
    });

    Object.keys(staggerGroups).forEach(function (key) {
      var items = staggerGroups[key];
      gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: items[0],
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  } else {
    // Fallback: reveal everything immediately if GSAP fails to load
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }
})();