import React, { useState, useEffect, useRef } from 'react';
import './LandingDoor.css';

// Import entrance jpg and video
import entranceJpg from '../assets/entrance.jpg';
import entranceVideo from '../assets/entrance.mp4';

const LandingDoor = ({ onFinish } = {}) => {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState('idle'); // idle | playing | white | done
  const videoRef = useRef(null);
  const timeouts = useRef([]);

  useEffect(() => {
    // Prevent body scroll when landing door is visible
    if (visible) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      // clear any pending timeouts on unmount
      timeouts.current.forEach((t) => clearTimeout(t));
      timeouts.current = [];
      
      // Restore scroll when component unmounts
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [visible]);

  const sleep = (ms) => new Promise((res) => {
    const t = setTimeout(res, ms);
    timeouts.current.push(t);
  });

  const handleEnter = async () => {
    if (stage !== 'idle') return;
    setStage('playing');

    // Play the entrance video
    const videoElement = document.querySelector('.entrance-video');
    if (videoElement) {
      try {
        // Add better mobile support
        videoElement.muted = true;
        videoElement.playsInline = true;
        await videoElement.play();
        
        // Wait for video to finish with timeout fallback for mobile
        await Promise.race([
          new Promise((resolve) => {
            videoElement.onended = resolve;
          }),
          // Fallback timeout in case video doesn't trigger onended on mobile
          sleep(3000) // 3 seconds for 2.5 sec video + small buffer
        ]);
      } catch (error) {
        console.log('Video play failed, continuing anyway:', error);
        // If video fails, just wait a moment before continuing
        await sleep(2000);
      }
    } else {
      // If no video element found, still continue
      await sleep(2000);
    }

    setStage('done');
    await sleep(100);
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
    <div className={`landing-door-overlay`} role="dialog" aria-label="Entrance overlay">
      <div className="door-wrap" onKeyDown={(e) => { if (e.key === 'Enter') handleEnter(); }}>
        {/* JPG placeholder when idle */}
        <img
          className="door-preview"
          src={entranceJpg}
          alt="Chapel door entrance"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: stage === 'idle' ? 'block' : 'none'
          }}
        />
        
        {/* Video only when playing */}
        <video
          className="entrance-video"
          src={entranceVideo}
          muted
          playsInline
          preload="metadata"
          webkit-playsinline="true"
          x5-playsinline="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: stage === 'playing' ? 'block' : 'none'
          }}
        />

        <button 
          className={`enter-btn ${stage !== 'idle' ? 'hidden' : ''}`} 
          onClick={handleEnter} 
          disabled={stage !== 'idle'}
          aria-label="Enter site"
        >
          {stage === 'playing' ? 'Loading...' : 'Enter'}
        </button>

        <button className="skip-btn" onClick={handleSkip} aria-label="Skip animation">Skip</button>
      </div>
    </div>
  );
};

export default LandingDoor;
