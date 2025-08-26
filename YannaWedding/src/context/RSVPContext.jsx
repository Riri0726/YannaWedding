import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminService } from '../services/rsvpService';

// Sample family list data
const initialFamilies = [
  {
    id: 1,
    name: "Galo Family",
    maxGuests: 5,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 5
  },
  {
    id: 2,
    name: "Castrudes Family",
    maxGuests: 6,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 6
  },
  {
    id: 3,
    name: "Entic Family",
    maxGuests: 4,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 4
  },
  {
    id: 4,
    name: "Carzon Family",
    maxGuests: 2,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 2
  }
];

const RSVPContext = createContext();

export const RSVPProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupGuests, setGroupGuests] = useState([]);
  const [guestsByGroup, setGuestsByGroup] = useState({});
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load groups and guests
  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setLoading(true);
        const fetched = await adminService.listGroups();
        setGroups(fetched);
        
        // Load guests for all groups
        const guestsData = {};
        for (const group of fetched) {
          const guests = await adminService.listGuestsByGroup(group.id);
          guestsData[group.id] = guests;
        }
        setGuestsByGroup(guestsData);
      } catch (err) {
        console.error('Error loading groups:', err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    loadFamilies();
  }, []);

  const openGroup = async (group) => {
    setSelectedGroup(group);
    setSelectedGuest(null);
    setIsModalOpen(false);
    if (group) {
      const guests = await adminService.listGuestsByGroup(group.id);
      setGroupGuests(guests);
    } else {
      setGroupGuests([]);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const fetched = await adminService.listGroups();
      setGroups(fetched);
      
      // Load guests for all groups
      const guestsData = {};
      for (const group of fetched) {
        const guests = await adminService.listGuestsByGroup(group.id);
        guestsData[group.id] = guests;
      }
      setGuestsByGroup(guestsData);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    groups,
    selectedGroup,
    setSelectedGroup: openGroup,
    groupGuests,
    guestsByGroup,
    selectedGuest,
    setSelectedGuest,
    isModalOpen,
    setIsModalOpen,
    loading,
    error,
    refresh
  };

  return (
    <RSVPContext.Provider value={value}>
      {children}
    </RSVPContext.Provider>
  );
};

export const useRSVP = () => {
  const context = useContext(RSVPContext);
  if (!context) {
    throw new Error('useRSVP must be used within an RSVPProvider');
  }
  return context;
};
