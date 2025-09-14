import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LocationCards.css';

// Import images
import ugongImage from '../assets/Ugong.jpg';
import patioQueenImage from '../assets/Patio Queen.png';

const locations = [
  {
    id: 'ceremony',
    title: 'SAN JUAN DELA CRUZ PARISH',
    address: 'Ugong, Valenzuela City',
    time: '2:00 PM',
    subtitle: 'The Ceremony',
    image: ugongImage,
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.1234567890123!2d120.98765432109876!3d14.654321098765432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM5JzE1LjYiTiAxMjDCsDU5JzE1LjYiRQ!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph',
    googleMapsLink: 'https://maps.app.goo.gl/1NoLWcEFg9voS2kYA'
  },
  {
    id: 'reception',
    title: 'Patio Queen Sofia',
    address: '21 F. de la Cruz, Valenzuela, Metro Manila',
    time: '4:30 PM',
    subtitle: 'The Reception',
    image: patioQueenImage,
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.1234567890123!2d120.98765432109876!3d14.654321098765432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM5JzE1LjYiTiAxMjDCsDU5JzE1LjYiRQ!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph',
    googleMapsLink: 'https://maps.app.goo.gl/n35jymfGSebVyvgc8'
  }
];

const LocationCard = ({ location }) => {
  const [cardState, setCardState] = useState('front'); // 'front', 'back'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Track small-screen state so we don't render the extra expanded map on mobile
    const mql = window.matchMedia('(max-width: 768px)');
    const handleChange = (e) => setIsMobile(e.matches);
    // set initial
    setIsMobile(mql.matches);
    // add listener with compatibility
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange);
    } else if (mql.addListener) {
      mql.addListener(handleChange);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange);
      } else if (mql.removeListener) {
        mql.removeListener(handleChange);
      }
    };
  }, []);

  const handleCardClick = () => {
    if (cardState === 'front') {
      setCardState('back');
    } else if (cardState === 'back') {
      setCardState('front');
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setCardState('expanded');
  };

  const handleCloseExpanded = (e) => {
    e.stopPropagation();
    setCardState('back');
  };

  return (
      <motion.div
        className="location-card-container"
        initial={false}
        animate={{
          width: cardState === 'expanded' ? '100%' : '450px',
          maxWidth: cardState === 'expanded' ? '950px' : '450px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
      {/* Image panel stays visible beside the flipping card */}
      <div className="card-image-container">
        <img src={location.image} alt={`${location.title} photo`} className="location-image" />
        <div className="image-overlay">
          <div className="overlay-title">{location.title}</div>
          <div className="overlay-address">{location.address}</div>
        </div>
      </div>

      <div 
        className="location-card" 
        onClick={handleCardClick}
        style={{
          width: cardState === 'expanded' ? '450px' : '100%'
        }}
      >
        <div className="card-inner">
          {/* Front Face */}
          <motion.div
            className="card-face card-front"
            initial={false}
            animate={{
              rotateY: cardState === 'front' ? 0 : 180,
              opacity: cardState === 'front' ? 1 : 0
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <div className="card-content">
              <h3 className="location-subtitle">{location.subtitle}</h3>
              <h2 className="location-title">{location.title}</h2>
              <p className="location-address">{location.address}</p>
              <div className="location-time">
                <span className="time-badge">{location.time}</span>
              </div>
              <p className="click-hint">Click to view location</p>
            </div>
          </motion.div>

          {/* Back Face */}
          <motion.div
            className="card-face card-back"
            initial={false}
            animate={{
              rotateY: cardState === 'front' ? -180 : 0,
              opacity: cardState === 'front' ? 0 : 1
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ visibility: cardState === 'front' ? 'hidden' : 'visible', zIndex: cardState === 'front' ? 1 : 3 }}
          >
            <div className="map-section" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="map-header">
                <h4>Location Map</h4>
              </div>
              <div className="map-container" style={{ flex: 1 }}>
                <iframe
                  src={location.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '8px', minHeight: '250px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${location.title}`}
                />
                <div className="map-actions">
                  <a 
                    href={location.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-btn"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Arrow Button - Outside the card */}
      {/* No arrow button, map will show automatically when card is flipped */}

      {/* Expanded Map Section */}
      {cardState === 'back' && !isMobile && (
        <motion.div
          className="map-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="map-header">
            <h4>Location Map</h4>
          </div>
          <div className="map-container">
            <iframe
              src={location.mapUrl}
              width="100%"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${location.title}`}
            />
            <div className="map-actions">
              <a 
                href={location.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-btn"
              >
                Get Directions
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const LocationCards = () => {
  return (
    <div className="location-cards-wrapper">
      <div className="location-cards-grid">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </div>
  );
};

export default LocationCards;
