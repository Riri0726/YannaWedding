import React, { useState, useEffect, useRef } from 'react';
import './LandingDoor.css';

// Import entrance sequence images from assets (added extras)
import entranceImg from '../assets/entrance.png';
import entrance1Img from '../assets/entrance 1.png';
import entrance2Img from '../assets/entrance 2.png';
import entrance3Img from '../assets/entrance 3.png';

const IMAGE_SEQUENCE = [
  entranceImg,
  entrance1Img,
  entrance2Img,
  entrance3Img
];

const LandingDoor = ({ onFinish } = {}) => {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState('idle'); // idle | animating | white | done
  const timeouts = useRef([]);

  useEffect(() => {
    return () => {
      // clear any pending timeouts on unmount
      timeouts.current.forEach((t) => clearTimeout(t));
      timeouts.current = [];
    };
  }, []);

  const sleep = (ms) => new Promise((res) => {
    const t = setTimeout(res, ms);
    timeouts.current.push(t);
  });

  const handleEnter = async () => {
    if (stage !== 'idle') return;
    setStage('animating');

  // Smooth multi-step transition that follows the numeric ordering of images.
  // Increase per-step time slightly for a smoother feel.
  const stepMs = 500; // per-image crossfade time

  // brief micro-delay to give immediate tactile feedback before progression
  await sleep(80);

    for (let i = 1; i < IMAGE_SEQUENCE.length; i++) {
      // crossfade to next image
      setCurrentIndex(i);
      // wait slightly longer than CSS transition so it feels smooth
      // add tiny overlap to avoid hard cuts
      // keep short so whole animation stays snappy
      // accumulate timeout handles via sleep helper
      // eslint-disable-next-line no-await-in-loop
      await sleep(stepMs);
    }

  // show a short white flash before revealing page
  setStage('white');
  // allow the bloom animation (~620ms) to complete visually
  await sleep(700);

  setStage('done');
  // short delay to allow any exit transitions
  await sleep(120);
    setVisible(false);
    if (typeof onFinish === 'function') onFinish();
  };

  const handleSkip = () => {
    // Immediately hide overlay and call onFinish
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
    setVisible(false);
    if (typeof onFinish === 'function') onFinish();
  };

  if (!visible) return null;

  return (
    <div className={`landing-door-overlay ${stage === 'white' ? 'white-stage' : ''}`} role="dialog" aria-label="Entrance overlay">
      {/* background panel to hide page content gently with nude/neutral tint and blur */}
      <div className={`bg-panel ${stage !== 'done' ? 'show' : ''}`} aria-hidden="true"></div>

      <div className="door-wrap" onKeyDown={(e) => { if (e.key === 'Enter') handleEnter(); }}>
        {IMAGE_SEQUENCE.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={idx === 0 ? 'Closed chapel door' : `Door stage ${idx}`}
            className={`door-img ${currentIndex === idx ? 'active' : 'inactive'}`}
            draggable={false}
          />
        ))}

        {/* subtle overlay sitting on top of the door images to blur/tint background behind the door */}
        <div className="door-overlay" aria-hidden="true"></div>

        <button className={`enter-btn ${stage !== 'idle' ? 'hidden' : ''}`} onClick={handleEnter} aria-label="Enter site">Enter</button>

        <button className="skip-btn" onClick={handleSkip} aria-label="Skip animation">Skip</button>
      </div>

      <div className={`white-flash ${stage === 'white' || stage === 'done' ? 'show' : ''}`} aria-hidden="true"></div>
    </div>
  );
};

export default LandingDoor;
