import React, { useState, useEffect } from 'react';
import './Home.css';
// import LandingDoor from '../components/LandingDoor'; // temporarily disabled
import FloralHero from '../components/FloralHero';
import SideIconNav from '../components/SideIconNav';
import RSVPList from '../components/RSVPList';
import RSVPModal from '../components/RSVPModal';
import { RSVPProvider } from '../context/RSVPContext';

const Home = () => {
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
  {/* <LandingDoor /> */} {/* Landing door temporarily commented out */}
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

      {/* Timeline Section */}
      <section className="timeline" id="story">
        <h2>A STORY OF OUR ever after</h2>
        <div className="timeline-events">
          <div className="event">
            <h3>2005</h3>
            <p>05.05.2005 Where it all began</p>
          </div>
          <div className="event">
            <h3>2007</h3>
            <p>08.31.2007 Made it official</p>
          </div>
          <div className="event">
            <h3>2024</h3>
            <p>09.13.2024 Sealed with a yes</p>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="countdown" id="countdown">
        <h2>SAVE THE Date</h2>
        <p>OCTOBER 11, 2025 | 2:00 PM</p>
        <div className="countdown-timer">
          <div className="time-block">
            <span>{timeLeft.days}</span>
            <p>Days</p>
          </div>
          <div className="time-block">
            <span>{timeLeft.hours}</span>
            <p>Hours</p>
          </div>
          <div className="time-block">
            <span>{timeLeft.minutes}</span>
            <p>Minutes</p>
          </div>
          <div className="time-block">
            <span>{timeLeft.seconds}</span>
            <p>Seconds</p>
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
