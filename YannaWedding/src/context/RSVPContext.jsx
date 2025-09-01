import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminService, guestService } from '../services/rsvpService';

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
  const [individualGuests, setIndividualGuests] = useState([]);
  const [organizedData, setOrganizedData] = useState({
    individual: [],
    family: [],
    friends: []
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupGuests, setGroupGuests] = useState([]);
  const [guestsByGroup, setGuestsByGroup] = useState({});
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load groups and guests
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load groups
        const fetchedGroups = await adminService.listGroups();
        setGroups(fetchedGroups);
        
        // Load ALL guests (both individual and in groups)
        const allGuests = await guestService.getAllGuests();
        
        // Separate individual guests (those with role = 'individual' and not in groups)
        const individualGuestsList = allGuests.filter(guest => 
          guest.role === 'individual' && 
          guest.in_group === false && 
          !guest.group_id
        );
        setIndividualGuests(individualGuestsList);
        
        // Load guests for groups
        const guestsData = {};
        for (const group of fetchedGroups) {
          guestsData[group.id] = allGuests.filter(guest => guest.group_id === group.id);
        }
        setGuestsByGroup(guestsData);
        
        // Organize data for main page display
        const organized = {
          individual: individualGuestsList,
          family: fetchedGroups.filter(group => group.role === 'family'),
          friends: fetchedGroups.filter(group => group.role === 'friends')
        };
        setOrganizedData(organized);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      
      // Load groups
      const fetchedGroups = await adminService.listGroups();
      setGroups(fetchedGroups);
      
      // Load ALL guests (both individual and in groups)
      const allGuests = await guestService.getAllGuests();
      
      // Separate individual guests (those with role = 'individual' and not in groups)
      const individualGuestsList = allGuests.filter(guest => 
        guest.role === 'individual' && 
        guest.in_group === false && 
        !guest.group_id
      );
      setIndividualGuests(individualGuestsList);
      
      // Load guests for groups
      const guestsData = {};
      for (const group of fetchedGroups) {
        guestsData[group.id] = allGuests.filter(guest => guest.group_id === group.id);
      }
      setGuestsByGroup(guestsData);
      
      // Organize data for main page display
      const organized = {
        individual: individualGuestsList,
        family: fetchedGroups.filter(group => group.role === 'family'),
        friends: fetchedGroups.filter(group => group.role === 'friends')
      };
      setOrganizedData(organized);
      
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    groups,
    individualGuests,
    organizedData,
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
