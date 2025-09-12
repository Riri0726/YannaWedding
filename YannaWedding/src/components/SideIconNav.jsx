import React from 'react';
import './SideIconNav.css';

const icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7.5l8.5 6L21 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  hourglass: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 2h12M6 22h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 2v6a4 4 0 0 0 4 4 4 4 0 0 0 4-4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 22v-6a4 4 0 0 1 4-4 4 4 0 0 1 4 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shirt: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 7l3-2 3 1 3-2 3 2 3-1 3 2v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 14l2.5-3 3.5 4 3-4L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8c0-2.2 1.8-4 4-4 2 0 3 2 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8c0-2.2-1.8-4-4-4-2 0-3 2-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2C8 2 5 5 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-4-3-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
};

const SideIconNav = () => {
  return (
    <nav className="side-icon-nav" aria-label="Quick navigation">
      <ul>
        <li><a href="#home" aria-label="Home" title="Click to see our invitation">{icons.home}</a></li>
        <li><a href="#couple" aria-label="Invitation" title="Invitation">{icons.mail}</a></li>
        <li><a href="#entourage" aria-label="Entourage" title="Entourage">{icons.menu}</a></li>
        <li><a href="#story" aria-label="Story" title="Story of us Timeline">{icons.hourglass}</a></li>
        <li><a href="#countdown" aria-label="Save the Date" title="Save the date">{icons.image}</a></li>
        <li><a href="#gallery" aria-label="Gallery" title="Photo Gallery">{icons.image}</a></li>
        <li><a href="#schedule" aria-label="When & Where" title="When and Where">{icons.pin}</a></li>
        <li><a href="#ceremony-timeline" aria-label="Timeline" title="Ceremony Timeline">{icons.hourglass}</a></li>
        <li><a href="#attire" aria-label="Attire" title="Attire">{icons.shirt}</a></li>
        <li><a href="#rsvp" aria-label="RSVP" title="RSVP">{icons.mail}</a></li>
      </ul>
    </nav>
  );
};

export default SideIconNav;
