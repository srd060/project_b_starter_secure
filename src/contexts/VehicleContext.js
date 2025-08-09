
import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt','asc'));
    const unsub = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setVehicles(items);
      if (!selectedVehicle && items.length) setSelectedVehicle(items[0]);
    }, err => {
      console.log('vehicle snapshot err', err);
    });
    return () => unsub();
  }, []);

  return (
    <VehicleContext.Provider value={{ vehicles, selectedVehicle, setSelectedVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};
