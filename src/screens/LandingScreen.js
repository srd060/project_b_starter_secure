
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import VehicleSelector from '../components/VehicleSelector';
import { VehicleContext } from '../contexts/VehicleContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

export default function LandingScreen({ navigation }) {
  const cards = [
    { title: 'Daily Log', route: 'DailyLog' },
    { title: 'Salary', route: 'Salary' },
    { title: 'Maintenance', route: 'Maintenance' },
    { title: 'HSD / Pipe', route: 'HSDPipe' },
    { title: 'Statement', route: 'Statement' },
  ];

  const { vehicles } = useContext(VehicleContext);

  const addVehicle = async () => {
    Alert.prompt(
      'Add Vehicle',
      'Enter vehicle name:',
      async (text) => {
        if (!text) return;
        try {
          const user = auth.currentUser;
          if (!user) return Alert.alert('Not signed in', 'Please sign in to add vehicles.');
          await addDoc(collection(db, 'vehicles'), { name: text, createdAt: new Date(), ownerId: user.uid });
        } catch (e) {
          console.log('add vehicle error', e);
        }
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Borewell Log Data</Text>
      <VehicleSelector />
      <TouchableOpacity style={styles.addBtn} onPress={addVehicle}><Text style={{color:'#fff'}}>+ Add Vehicle</Text></TouchableOpacity>
      {cards.map(c => (
        <TouchableOpacity key={c.title} style={styles.card} onPress={() => navigation.navigate(c.route)}>
          <Text style={styles.cardText}>{c.title}</Text>
        </TouchableOpacity>
      ))}
      <View style={{height:40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'stretch' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign:'center' },
  card: { width: '100%', padding: 16, backgroundColor: '#f3f3f3', borderRadius: 8, marginBottom: 12 },
  cardText: { fontSize: 18 },
  addBtn: { backgroundColor:'#007bff', padding:10, borderRadius:6, alignItems:'center', marginBottom:12 }
});
