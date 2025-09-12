import React from 'react';
import {
  FaRing,
  FaCameraRetro,
  FaGlassMartiniAlt,
  FaWalking,
  FaCarSide,
} from 'react-icons/fa';
import './EventTimeline.css';

const events = [
  { time: '2:00 PM', label: 'Ceremony', Icon: FaRing },
  { time: '4:00 PM', label: 'Post Rep', Icon: FaCameraRetro },
  { time: '4:30 PM', label: 'Pika-Pika', Icon: FaGlassMartiniAlt },
  { time: '5:30 PM', label: 'Program', Icon: FaWalking },
  { time: '8:00 PM', label: 'Closing', Icon: FaCarSide },
];

export default function EventTimeline() {
  return (
    <div className="etimeline-container">
      <div className="etimeline">
        {events.map((e, idx) => {
          const Icon = e.Icon;
          return (
            <div key={idx} className="etimeline-item">
              {/* ✅ Use <Icon /> instead of {Icon} */}
              <div className="etimeline-icon"><Icon /></div> 
              <div className="etimeline-label">{e.label}</div>
              <div className="etimeline-time">{e.time}</div>
            </div>
          );
        })}
        <div className="etimeline-line" />
      </div>
    </div>
  );
}
