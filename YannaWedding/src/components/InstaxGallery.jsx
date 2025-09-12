import React, { useState, useCallback } from 'react';
import './InstaxGallery.css';

// Import camera
import instaxCamera from '../assets/Instax.png';

// Import all photos
import photo1 from '../assets/Instax/A6701797.jpg';
import photo2 from '../assets/Instax/A6701907.jpg';
import photo3 from '../assets/Instax/A6701926.jpg';
import photo4 from '../assets/Instax/A6701987.jpg';
import photo5 from '../assets/Instax/A6702695.jpg';
import photo6 from '../assets/Instax/A6702747.jpg';
import photo7 from '../assets/Instax/A6702762.jpg';
import photo8 from '../assets/Instax/A6702839.jpg';
import photo9 from '../assets/Instax/A6702959.jpg';
import photo10 from '../assets/Instax/A6703078.jpg';

const ALL_PHOTOS = [
  photo1, photo2, photo3, photo4, photo5,
  photo6, photo7, photo8, photo9, photo10
];

const InstaxGallery = () => {
  const [availablePhotos, setAvailablePhotos] = useState([...ALL_PHOTOS]);
  const [shotPhotos, setShotPhotos] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const shootPhoto = useCallback(() => {
    if (availablePhotos.length === 0 || isAnimating) return;

    setIsAnimating(true);
    setShowFlash(true);

    // Remove flash effect quickly
    setTimeout(() => setShowFlash(false), 150);

    // Get the next photo
    const nextPhoto = availablePhotos[0];
    const newShotPhotos = [...shotPhotos];
    
    // Calculate position for stacking with slight rotation and offset
    const stackIndex = shotPhotos.length;
    const baseX = 50; // Base position percentage from left
    const baseY = 50; // Base position percentage from top
    const offsetX = (Math.random() - 0.5) * 20; // Random offset ±10%
    const offsetY = (Math.random() - 0.5) * 20; // Random offset ±10%
    const rotation = (Math.random() - 0.5) * 30; // Random rotation ±15 degrees

    const photoData = {
      src: nextPhoto,
      id: Date.now(),
      x: baseX + offsetX,
      y: baseY + offsetY,
      rotation: rotation,
      zIndex: stackIndex + 1,
      isAnimating: true
    };

    newShotPhotos.push(photoData);
    setShotPhotos(newShotPhotos);

    // Remove from available photos
    setAvailablePhotos(prev => prev.slice(1));

    // Animation complete after 1 second
    setTimeout(() => {
      setShotPhotos(prev => 
        prev.map(photo => 
          photo.id === photoData.id 
            ? { ...photo, isAnimating: false }
            : photo
        )
      );
      setIsAnimating(false);
    }, 1000);
  }, [availablePhotos, shotPhotos, isAnimating]);

  const resetGallery = useCallback(() => {
    setShotPhotos([]);
    setAvailablePhotos([...ALL_PHOTOS]);
    setIsAnimating(false);
  }, []);

  return (
    <div className="instax-gallery">
      <div className="gallery-content">
        {/* Left side - Camera */}
        <div className="camera-section">
          <div 
            className={`instax-camera ${availablePhotos.length === 0 ? 'disabled' : ''} ${isAnimating ? 'shooting' : ''}`}
            onClick={shootPhoto}
          >
            <img src={instaxCamera} alt="Instax Camera" />
            {showFlash && <div className="camera-flash"></div>}
          </div>
          <p className="photos-remaining">
            {availablePhotos.length} photos remaining
          </p>
        </div>

        {/* Right side - Photo pile */}
        <div className="photo-pile-section">
          <div className="photo-pile">
            {shotPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`shot-photo ${photo.isAnimating ? 'shooting' : 'stacked'}`}
                style={{
                  left: `${photo.x}%`,
                  top: `${photo.y}%`,
                  transform: `translate(-50%, -50%) rotate(${photo.rotation}deg)`,
                  zIndex: photo.zIndex,
                }}
              >
                <img src={photo.src} alt={`Shot ${photo.id}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset button */}
      {shotPhotos.length > 0 && (
        <div className="gallery-controls">
          <button 
            className="reset-btn"
            onClick={resetGallery}
            disabled={isAnimating}
          >
            Reset Gallery
          </button>
        </div>
      )}
    </div>
  );
};

export default InstaxGallery;
