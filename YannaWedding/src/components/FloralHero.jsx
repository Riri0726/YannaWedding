import React, { useRef, useEffect } from 'react';
import './FloralHero.css';

// Import the logo
import logo from '../assets/Logo.png';

const FloralHero = () => {
  const rootRef = useRef(null);
  const vantaRef = useRef(null);

  // Load Vanta.js scripts
  useEffect(() => {
    const loadVanta = async () => {
      // Load Three.js
      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        document.head.appendChild(threeScript);
        
        await new Promise((resolve) => {
          threeScript.onload = resolve;
        });
      }

      // Load Vanta FOG
      if (!window.VANTA) {
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js';
        document.head.appendChild(vantaScript);
        
        await new Promise((resolve) => {
          vantaScript.onload = resolve;
        });
      }

      // Initialize Vanta effect
      if (window.VANTA && rootRef.current) {
        vantaRef.current = window.VANTA.FOG({
          el: rootRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0xcb9c64,
          midtoneColor: 0xffffff,
          lowlightColor: 0xffffff,
          baseColor: 0xffffff,
          blurFactor: 0.71,
          speed: 2.20,
          zoom: 0.90
        });
      }
    };

    loadVanta();

    // Cleanup
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    const el = rootRef.current;
    if (!el) return;
  // don't run parallax on touch / coarse pointers
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  if ('ontouchstart' in window) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // normalized -1 .. 1 values
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    // clamp
    const mx = Math.max(-1, Math.min(1, nx));
    const my = Math.max(-1, Math.min(1, ny));
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
  };

  const handleMouseLeave = () => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  };

  // particle layer creation
  const particleRef = useRef(null);

  useEffect(() => {
    // set CSS --vh for mobile browser address bar handling (fallback)
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Also set a minimum height directly for mobile safety
      const heroElement = rootRef.current;
      if (heroElement && window.innerWidth <= 480) {
        heroElement.style.minHeight = `${window.innerHeight}px`;
      }
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    const container = particleRef.current;
    if (!container) return;
    // respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // don't overload small screens
  if (window.innerWidth < 480) return;

  const max = Math.min(30, Math.floor(window.innerWidth / 80)); // Increased from 18 to 30 max, and 120 to 80 divisor
    const nodes = [];

    for (let i = 0; i < max; i++) {
      const d = document.createElement('div');
      d.className = 'particle';
      const size = Math.round(6 + Math.random() * 18); // px
      const dur = (8 + Math.random() * 12).toFixed(2) + 's';
      const delay = (Math.random() * 6).toFixed(2) + 's';
      const opacity = (0.4 + Math.random() * 0.4).toFixed(2); // Increased from 0.25-0.6 to 0.4-0.8
      const xOff = Math.round(-30 + Math.random() * 60) + 'px';

      d.style.left = Math.round(Math.random() * 100) + '%';
      d.style.top = Math.round(10 + Math.random() * 80) + '%';
      d.style.setProperty('--p-size', size + 'px');
      d.style.setProperty('--p-duration', dur);
      d.style.setProperty('--p-delay', delay);
      d.style.setProperty('--p-opacity', opacity);
      d.style.setProperty('--p-x', xOff);
      d.style.animationDelay = delay;

      container.appendChild(d);
      nodes.push(d);
    }

    return () => {
      nodes.forEach(n => n.remove());
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  return (
    <div className="floral-hero" id="home" ref={rootRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="floral-layer layer--slow" aria-hidden="true"></div>
      <div className="floral-layer layer--medium" aria-hidden="true"></div>
      <div className="floral-layer layer--fast" aria-hidden="true"></div>
      {/* separated floral elements for better responsive control */}
      <div className="floral-bg" aria-hidden="true"></div>
      <div className="floral-corner floral-top-left" aria-hidden="true"></div>
      <div className="floral-corner floral-bottom-right" aria-hidden="true"></div>
      <div className="particle-layer" ref={particleRef} aria-hidden="true"></div>      <div className="floral-content">
        <div className="logo-container">
          <img src={logo} alt="Wedding Logo" className="wedding-logo" />
        </div>

        <div className="wedding-date">08.31.2025</div>

        <button className="invitation-btn">Click to See our Invitation</button>
      </div>
    </div>
  );
};

export default FloralHero;
