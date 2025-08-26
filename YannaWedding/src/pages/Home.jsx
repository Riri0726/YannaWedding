import React, { useState, useEffect } from 'react';
import './Home.css';
import RSVPList from '../components/RSVPList';
import RSVPModal from '../components/RSVPModal';
import { RSVPProvider } from '../context/RSVPContext';

const Home = () => {
  // Navigation scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.nav-menu');
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
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
      const weddingDate = new Date('2025-08-31T14:00:00');
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
      {/* Navigation */}
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

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="section-container">
          <div className="date">08.31.2025</div>
          <button className="invitation-btn">Click to See our Invitation</button>
        </div>
      </section>

      {/* Couple Section */}
      <section className="couple" id="couple">
          <h2>BY THE GRACE OF GOD AND WITH THE BLESSINGS OF OUR PARENTS,</h2>
          <div className="couple-names">
            <h1>WE</h1>
            <h1>Ronald</h1>
            <h2>AND</h2>
            <h1>Samantha</h1>
          </div>
        <p className="invitation-text">
          REQUEST THE HONOR OF YOUR PRESENCE TO CELEBRATE LOVE AS WE BEGIN THE FIRST DAY OF OUR LIVES TOGETHER
        </p>
        <div className="wedding-details">
          <h2>08.31.2025</h2>
          <p>SUNDAY | 02:00 PM</p>
          <p>ST. JOSEPH PARISH CHURCH</p>
          <p>Manila, Philippines</p>
          <p>RADISSON HOTEL</p>
          <p>Manila, Philippines</p>
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
        <p>08.31.2025 | 02:00 PM</p>
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
          <h4>ST. JOSEPH PARISH CHURCH</h4>
          <p>Manila, Philippines</p>
          <p>02:00 PM – 03:00 pm</p>
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
    </div>
  );
};

export default Home;
