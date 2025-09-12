import React, { useState, useEffect, useRef } from "react";
import "./Home.css";
import LandingDoor from "../components/LandingDoor";
import FloralHero from "../components/FloralHero";
import SideIconNav from "../components/SideIconNav";
import RSVPList from "../components/RSVPList";
import RSVPModal from "../components/RSVPModal";
import { RSVPProvider } from "../context/RSVPContext";
import InstaxGallery from "../components/InstaxGallery";
import LocationCards from "../components/LocationCards";
import CeremonyTimeline from "../components/CeremonyTimeline";

// Import prenup video
import prenupVideo from "../assets/Prenup.mp4";
// Import timeline images
import image2007 from "../assets/2007.png";
import image2021 from "../assets/2021.png";
import image2025 from "../assets/2025.png";
import flowerCenter from "../assets/flower center.png";
import galleryBackground from "../assets/Gallery Background.png";
import attireImage from "../assets/Attire.png";
import colorPaletteImage from "../assets/Color Palette.png";

const Home = () => {
  // Navigation scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // const nav = document.querySelector('.nav-menu');
      const homeEl = document.querySelector(".home");
      if (window.scrollY > 50) {
        // if (nav) nav.classList.add('scrolled');
        if (homeEl) homeEl.classList.remove("hero-top");
      } else {
        // if (nav) nav.classList.remove('scrolled');
        if (homeEl) homeEl.classList.add("hero-top");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown timer state and logic
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Timeline scroll animation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    // Observe timeline events
    const timelineEvents = document.querySelectorAll(".timeline-event");
    timelineEvents.forEach((event) => observer.observe(event));

    // Timeline line scroll fill animation
    const handleTimelineScroll = () => {
      const timelineSection = document.querySelector(".timeline");
      const timelineLine = document.querySelector(".timeline-line");

      if (!timelineSection || !timelineLine) return;

      const sectionRect = timelineSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Simple calculation:
      // When section top is at bottom of screen = 0% progress
      // When section top is at top of screen = 100% progress
      let scrollProgress = 1 - sectionRect.top / windowHeight;
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));

      // Update line fill
      timelineLine.style.setProperty("--scroll-progress", scrollProgress);
    };

    window.addEventListener("scroll", handleTimelineScroll);
    handleTimelineScroll(); // Initial call

    return () => {
      timelineEvents.forEach((event) => observer.unobserve(event));
      window.removeEventListener("scroll", handleTimelineScroll);
    };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date("2025-10-11T14:00:00");
      const now = new Date();
      const difference = weddingDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
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

      {/* Entourage Section */}
      <section className="entourage" id="entourage">
        <div className="entourage-container section-container">
          <h1 className="script-title">The Entourage</h1>

          <div>
            <h2>PARENTS OF THE GROOM</h2>
            <p>Analiza E. Rivero</p>
          </div>

          <div>
            <h2>PARENTS OF THE BRIDE</h2>
            <p>
              Brigitte T. Galo <br />
              Jose G. Galo Jr.
            </p>
          </div>
          <div className="two-col">
            <div>
              <h2>PRINCIPAL SPONSORS</h2>
              <div className="two-col-inner">
                <div>
                  <p>
                    Mr. Philip Sabino
                    <br />
                    Mr. Glenn Pañuelos
                    <br />
                    Brgy. Capt. Rizalino Ferrer
                    <br />
                    Mr. Pedro Candidato Jr.
                    <br />
                    Mr. Joe King Tiong
                    <br />
                    Engr. Jaime Magsayo
                    <br />
                    Mr. Israel S. Dolz
                    <br />
                    Mr. Juanito S. Santos
                    <br />
                    Mr. Lorenzo Mendoza
                  </p>
                </div>
                <div>
                  <p>
                    Mrs. Elsa Delos Reyes Sy
                    <br />
                    Mrs. Purificacion Rivero Cabingao
                    <br />
                    Fiscal Edna Urbano Aninias
                    <br />
                    Dra. Alpha Salvador Montaas
                    <br />
                    Mrs. Carol S. Tiong
                    <br />
                    Mrs. Julieta G. Magsayo
                    <br />
                    Mrs. Meriam P. Dolz
                    <br />
                    Dr. Catherine G. De Gula
                    <br />
                    Coun. Lorena Matalud Borja
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="two-col spaced">
            <div>
              <h2>BEST MAN</h2>
              <p>Daren R. Pañuelos</p>
            </div>
            <div>
              <h2>MAID OF HONOR</h2>
              <p>Angelica B. Estrella</p>
            </div>
          </div>

          <h2>SECONDARY SPONSORS</h2>
          <div className="two-col">
            <div>
              <h3>CANDLE</h3>
              <p>
                Marc Angelo Hostalero
                <br />
                Precious Angelyn Hernandez
              </p>
            </div>
            <div>
              <h3>VEIL</h3>
              <p>
                Jarode Gerard Molina
                <br />
                Justine Licanne Tiong
              </p>
            </div>
          </div>

          <div>
            <h3>CORD</h3>
            <p>
              Charles Matthew Santos
              <br />
              Alleah Jeane Fagyan
            </p>
          </div>

          <div className="two-col spaced">
            <div>
              <h2>GROOMSMEN</h2>
              <p>
                Jake Ryan Atienza
                <br />
                Jose Brian Galo
              </p>
            </div>
            <div>
              <h2>BRIDESMAIDS</h2>
              <p>
                Rose Mary Ann Abrio
                <br />
                Celina May Santos
              </p>
            </div>
          </div>

          <h2>BEARERS</h2>
          <div className="two-col">
            <div>
              <h3>RING</h3>
              <p>Zymon D.C. Rivero</p>
            </div>
            <div>
              <h3>COIN</h3>
              <p>Francis Benedict Francisco</p>
            </div>
          </div>
          <div>
            <h3>BIBLE</h3>
            <p>Victor Ely D. Guanzon</p>
          </div>

          <h2>FLOWER GIRLS</h2>
          <p>
            Catriona Gray I. Iringan
            <br />
            Danielle Amara F. Delos Reyes
            <br />
            Althea Maria Ellaine P. Pañuelos
          </p>
        </div>
      </section>

      {/* Interactive Vertical Timeline Section */}
      <section className="timeline" id="story">
        <div className="timeline-container">
          <h2 className="timeline-title">A story of ourever after</h2>

          <div className="timeline-wrapper">
            <div className="timeline-line"></div>

            <div className="timeline-event-container">
              <div className="timeline-event">
                <span className="timeline-year-badge">2007</span>
                <div className="timeline-photo">
                  <img src={image2007} alt="2007" />
                </div>
                <div className="timeline-text">
                  <h3>2007</h3>
                  <p>Where we met</p>
                </div>
              </div>

              <div className="timeline-event event-right">
                <span className="timeline-year-badge">2021</span>
                <div className="timeline-photo">
                  <img src={image2021} alt="2021" />
                </div>
                <div className="timeline-text">
                  <h3>October 11, 2021</h3>
                  <p>Made it official</p>
                </div>
              </div>

              <div className="timeline-event">
                <span className="timeline-year-badge">2025</span>
                <div className="timeline-photo">
                  <img src={image2025} alt="2025" />
                </div>
                <div className="timeline-text">
                  <h3>August 2025</h3>
                  <p>Sealed with a yes</p>
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
          <video
            src={prenupVideo}
            className="prenup-video-fullscreen"
            autoPlay
            muted
            loop
            playsInline
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
      <section
        className="gallery"
        id="gallery"
        style={{
          backgroundImage: `url(${galleryBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <h2>OUR PHOTO Gallery</h2>
        <p>
          Click the Instax camera to shoot photos and create your own memory
          pile!
        </p>
        <InstaxGallery />
      </section>

      {/* Schedule Section */}
      <section className="schedule" id="schedule">
        <h2>When & Where</h2>
        <p>Click each card to explore our wedding locations!</p>
        <LocationCards />
      </section>

      {/* Ceremony Timeline Panel */}
      <section className="ceremony-timeline" id="ceremony-timeline">
        <h2>Ceremony Timeline</h2>
        <CeremonyTimeline />
      </section>

      {/* Attire Section */}
      <section className="attire" id="attire">
        <div className="section-container">
          <h2>The Attire</h2>
          <div className="attire-content">
            <div className="attire-image">
              <img src={attireImage} alt="Attire Guidelines" />
            </div>
            <div className="color-palette-image">
              <img src={colorPaletteImage} alt="Color Palette" />
            </div>
            <h2>Please make sure to follow the attire guidelines!</h2>
          </div>
        </div>
      </section>

      {/* Gifts Section */}
      <section className="gifts" id="gifts">
        <div className="section-container">
          <h2>Note on Gifts</h2>
          <div className="gift-icon">
            <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,12 20,22 4,22 4,12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="m12 7-3-3h6l-3 3" />
              <path d="m9 7 3 4 3-4" />
            </svg>
          </div>
          <h3>
            With all that we have,
            <br />
            we have been truly blessed.
            <br />
            Your presence & prayers
            <br />
            are all that we request.
            <br />
            But if you desire to give nonetheless,
            <br />a monetary gift is one we suggest.
          </h3>
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
