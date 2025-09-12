import React from "react";
import "./CeremonyTimeline.css";

// Lightweight inline SVG icons (no external deps)
const RingIcon = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="14" r="5" />
    <circle cx="16" cy="10" r="5" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <circle cx="12" cy="14" r="4" />
    <path d="M8 7l1.5-3h5L16 7" />
  </svg>
);

const MartiniIcon = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h18l-9 8-9-8z" />
    <path d="M12 12v8" />
    <path d="M8 20h8" />
  </svg>
);

const ProgramIcon = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M8 8h8M8 12h8M8 16h6" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l2-5h14l2 5" />
    <rect x="3" y="12" width="18" height="6" rx="1" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

const events = [
  { label: "Ceremony", time: "2:00 PM", Icon: RingIcon },
  { label: "Postnup/Photo", time: "4:00 PM", Icon: CameraIcon },
  { label: "Pika-Pika", time: "4:30 PM", Icon: MartiniIcon },
  { label: "Program", time: "5:30 PM", Icon: ProgramIcon },
  { label: "Closing", time: "8:00 PM", Icon: CarIcon },
];

export default function CeremonyTimeline() {
  return (
    <div className="ctimeline-wrap">
      <div className="ctimeline">
        <div className="ctimeline-base-line"></div>
        <div className="ctimeline-items">
          {events.map((e, idx) => {
            const ItemIcon = e.Icon;
            const position = idx % 2 === 0 ? "above" : "below";
            return (
              <div key={idx} className={`ctimeline-item ${position}`}>
                {position === "above" && (
                  <div className="ctimeline-content">
                    <div className="ctimeline-icon"><ItemIcon /></div>
                    <div className="ctimeline-label">{e.label}</div>
                    <div className="ctimeline-time">{e.time}</div>
                  </div>
                )}
                <div className="ctimeline-dot" />
                {position === "below" && (
                  <div className="ctimeline-content">
                    <div className="ctimeline-icon"><ItemIcon /></div>
                    <div className="ctimeline-label">{e.label}</div>
                    <div className="ctimeline-time">{e.time}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}