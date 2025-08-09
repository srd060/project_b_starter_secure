
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import VehicleSelector from '../components/VehicleSelector';
import { VehicleContext } from '../contexts/VehicleContext';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function MaintenanceScreen() {
  const { selectedVehicle } = useContext(VehicleContext);
  const [repairs, setRepairs] = useState([]);
  const [modal, setModal] = useState(false);
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!selectedVehicle) return;
    const q = query(collection(db,'maintenance'), where('vehicleId','==', selectedVehicle.id));
    const unsub = onSnapshot(q, snap => setRepairs(snap.docs.map(d => ({ id:d.id, ...d.data() }))) );
    return () => unsub();
  }, [selectedVehicle]);

  const addRepair = async () => {
    if (!date || !amount) return Alert.alert('Date and amount required');
    try {
      await addDoc(collection(db,'maintenance'), {
        vehicleId: selectedVehicle.id,
        date, day, amount_paid: parseFloat(amount)||0, remarks, createdAt: serverTimestamp()
      });
      setModal(false); setDate(''); setDay(''); setAmount(''); setRemarks('');
    } catch(e) {
      console.log(e); Alert.alert('Error','Failed to add repair');
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Text>{item.date} | {item.day}</Text>
      <Text>Amount: {item.amount_paid}</Text>
      <Text>{item.remarks}</Text>
    </View>
  );

  return (
    <View style={{flex:1,padding:16}}>
      <VehicleSelector />
      <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}><Text style={{color:'#fff'}}>+ Repair Cost</Text></TouchableOpacity>
      <FlatList data={repairs} keyExtractor={i=>i.id} renderItem={renderItem} style={{marginTop:12}} />
      <Modal visible={modal} animationType="slide">
        <View style={{flex:1,padding:16}}>
          <Text style={{fontWeight:'700',fontSize:18}}>Add Repair</Text>
          <TextInput placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} />
          <TextInput placeholder="Day" value={day} onChangeText={setDay} style={styles.input} />
          <TextInput placeholder="Amount Paid" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Remarks" value={remarks} onChangeText={setRemarks} style={styles.input} />
          <TouchableOpacity style={styles.saveBtn} onPress={addRepair}><Text style={{color:'#fff'}}>Save</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn,{backgroundColor:'#ccc',marginTop:8}]} onPress={() => setModal(false)}><Text>Cancel</Text></TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { backgroundColor:'#007bff', padding:10, borderRadius:6, alignItems:'center' },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:8, marginTop:8 },
  saveBtn: { backgroundColor:'#28a745', padding:12, borderRadius:8, marginTop:12, alignItems:'center' },
  card: { padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:8 }
});
