import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import LandingDoor from '../components/LandingDoor';
import FloralHero from '../components/FloralHero';
import SideIconNav from '../components/SideIconNav';
import RSVPList from '../components/RSVPList';
import RSVPModal from '../components/RSVPModal';
import { RSVPProvider } from '../context/RSVPContext';

// Import prenup video
import prenupVideo from '../assets/Prenup.webp';
// Import timeline images
import image2007 from '../assets/2007.png';
import image2021 from '../assets/2021.png';
import image2025 from '../assets/2025.png';

const Home = () => {
  // Vanta effect refs
  const timelineRef = useRef(null);
  const timelineVantaRef = useRef(null);

  // Navigation scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // const nav = document.querySelector('.nav-menu');
      const homeEl = document.querySelector('.home');
      if (window.scrollY > 50) {
        // if (nav) nav.classList.add('scrolled');
        if (homeEl) homeEl.classList.remove('hero-top');
      } else {
        // if (nav) nav.classList.remove('scrolled');
        if (homeEl) homeEl.classList.add('hero-top');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Countdown timer state and logic
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Timeline scroll animation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe timeline events
    const timelineEvents = document.querySelectorAll('.timeline-event');
    timelineEvents.forEach((event) => observer.observe(event));

    // Timeline line scroll fill animation
    const handleTimelineScroll = () => {
      const timelineSection = document.querySelector('.timeline');
      const timelineLine = document.querySelector('.timeline-line');
      
      if (!timelineSection || !timelineLine) return;
      
      const sectionRect = timelineSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Simple calculation: 
      // When section top is at bottom of screen = 0% progress
      // When section top is at top of screen = 100% progress
      let scrollProgress = 1 - (sectionRect.top / windowHeight);
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));
      
      // Update line fill
      timelineLine.style.setProperty('--scroll-progress', scrollProgress);
    };

    window.addEventListener('scroll', handleTimelineScroll);
    handleTimelineScroll(); // Initial call

    return () => {
      timelineEvents.forEach((event) => observer.unobserve(event));
      window.removeEventListener('scroll', handleTimelineScroll);
    };
  }, []);

  // Initialize Vanta FOG effect for timeline
  useEffect(() => {
    const loadTimelineVanta = async () => {
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

      // Initialize Vanta effect for timeline
      if (window.VANTA && timelineRef.current) {
        timelineVantaRef.current = window.VANTA.FOG({
          el: timelineRef.current,
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
          speed: 1.50,
          zoom: 0.90
        });
      }
    };

    loadTimelineVanta();

    // Cleanup
    return () => {
      if (timelineVantaRef.current) {
        timelineVantaRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date('2025-10-11T14:00:00');
      const now = new Date();
      const difference = weddingDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="home">
  <LandingDoor />
      {/* Navigation removed — using side icon nav instead
      <nav className="nav-menu">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#couple">Couple</a></li>
          <li><a href="#story">Our Story</a></li>
          <li><a href="#countdown">Date</a></li>
          <li><a href="#gallery">Gallery</a></li>
          <li><a href="#schedule">Schedule</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </nav>
      */}

  {/* Hero Section */}
  <FloralHero />

      {/* Couple Section */}
      <section className="couple" id="couple">
          {/* Corner flowers for couple section */}
          <div className="couple-floral-top-left"></div>
          <div className="couple-floral-bottom-right"></div>
          
          <h3>Join us for</h3>
          <h4>the wedding of</h4>
          <div className="couple-names">
            <h1>Third</h1>
            <h2>and</h2>
            <h1>Aleanna</h1>
          </div>
        <div className="wedding-details">
          <div className="date-section">
            <span className="month">OCTOBER</span>
            <span className="day">11</span>
            <span className="time">2:00 PM</span>
          </div>
          <div className="venue-section">
            <p>SAN JUAN DELA CRUZ PARISH</p>
            <p>Ugong, Valenzuela City</p>
          </div>
        </div>
      </section>

      {/* Interactive Vertical Timeline Section */}
      <section className="timeline" id="story" ref={timelineRef}>
        <div className="timeline-container">
          <h2 className="timeline-title">A STORY OF OUR ever after</h2>
          
          <div className="timeline-wrapper">
            <div className="timeline-line"></div>
            
            {/* Event 1 - 2007 */}
            <div className="timeline-event event-left" data-year="2007">
              <div className="timeline-marker">
                <span className="year-marker">2007</span>
              </div>

              <div className="timeline-content">
                <div className="timeline-photo">
                  <img src={image2007} alt="Where we meet - 2007" />
                </div>

                <div className="timeline-text">
                  <h3 className="timeline-year">2007</h3>
                  <p className="timeline-caption">Where we meet</p>
                </div>
              </div>
            </div>

            {/* Event 2 - 2021 */}
            <div className="timeline-event event-right" data-year="2021">
              <div className="timeline-marker">
                <span className="year-marker">2021</span>
              </div>
              
              <div className="timeline-content">
                <div className="timeline-text">
                  <h3 className="timeline-year">October 11, 2021</h3>
                  <p className="timeline-caption">Made it official</p>
                </div>
                
                <div className="timeline-photo">
                  <img src={image2021} alt="Made it official - 2021" />
                </div>
              </div>
            </div>

            {/* Event 3 - 2025 */}
            <div className="timeline-event event-left" data-year="2025">
              <div className="timeline-marker">
                <span className="year-marker">2025</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-photo">
                  <img src={image2025} alt="Sealed with a yes - 2025" />
                </div>
                <div className="timeline-text">
                  <h3 className="timeline-year">August 2025</h3>
                  <p className="timeline-caption">Sealed with a yes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save the Date Section with Full Screen Prenup Video */}
      <section className="save-the-date" id="countdown">
        {/* Full screen background video */}
        <div className="fullscreen-video-bg">
          <img 
            src={prenupVideo} 
            alt="Prenup video" 
            className="prenup-video-fullscreen"
            loading="lazy"
          />
        </div>
        
        {/* Right side glassmorphism overlay content */}
        <div className="save-content-overlay">
          <div className="save-content">
            <h2 className="save-title">SAVE THE DATE</h2>
            <p className="save-datetime">OCTOBER 11, 2025 | 2:00 PM</p>
            
            <div className="countdown-timer">
              <div className="time-block glassmorphism">
                <span className="time-number">{timeLeft.days}</span>
                <p className="time-label">DAYS</p>
              </div>
              <div className="time-block glassmorphism">
                <span className="time-number">{timeLeft.hours}</span>
                <p className="time-label">HOURS</p>
              </div>
              <div className="time-block glassmorphism">
                <span className="time-number">{timeLeft.minutes}</span>
                <p className="time-label">MINUTES</p>
              </div>
              <div className="time-block glassmorphism">
                <span className="time-number">{timeLeft.seconds}</span>
                <p className="time-label">SECONDS</p>
              </div>
            </div>
            
            <button className="save-date-btn">SAVE THE DATE</button>
          </div>
        </div>
      </section>



      {/* Gallery Section */}
      <section className="gallery" id="gallery">
        <h2>OUR PHOTO Gallery</h2>
        <p>To add more photos in our social media, please use our hashtag:</p>
        <div className="gallery-grid">
          {/* Add your images here */}
        </div>
        <h3>#YourHashtagHere</h3>
      </section>

      {/* Schedule Section */}
      <section className="schedule" id="schedule">
        <h2>When & Where</h2>
        <p>We love to see you soon!</p>
        
        <div className="ceremony">
          <h3>The Ceremony</h3>
          <h4>SAN JUAN DELA CRUZ PARISH</h4>
          <p>Ugong, Valenzuela City</p>
          <p>2:00 PM – 3:00 PM</p>
        </div>

        <div className="reception">
          <h3>The Reception</h3>
          <h4>RADISSON HOTEL</h4>
          <p>Manila, Philippines</p>
          <p>04:00 PM – 08:00 pm</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq" id="faq">
        <div className="section-container">
          <h2>THE Big DAY</h2>
          <h3>FREQUENTLY ASKED Questions</h3>
          {/* FAQ items will be added here */}
        </div>
      </section>

      {/* RSVP Section */}
      <section className="rsvp" id="rsvp">
        <div className="section-container">
          <RSVPProvider>
            <RSVPList />
            <RSVPModal />
          </RSVPProvider>
        </div>
      </section>
  <SideIconNav />
    </div>
  );
};

export default Home;
