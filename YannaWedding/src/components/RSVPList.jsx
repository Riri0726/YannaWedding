import React from 'react';
import { useRSVP } from '../context/RSVPContext';

const RSVPList = () => {
  const { groups, setSelectedGroup, setIsModalOpen, loading, error } = useRSVP();

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  return (
    <div className="rsvp-list">
      <h2>RSVP Groups</h2>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}
      <div className="guest-grid">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`guest-card`}
            onClick={() => handleGroupClick(group)}
          >
            <h3>{group.group_name}</h3>
            <div className="guest-limit">Max: {group.group_count_max}</div>
            <div className="status-indicator">
              {group.is_predetermined ? (
                <span className="attending">Predetermined</span>
              ) : (
                <span className="pending">Unknown</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal will handle both predetermined and unknown group flows */}
    </div>
  );
};

export default RSVPList;
