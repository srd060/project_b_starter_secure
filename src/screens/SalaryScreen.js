
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import VehicleSelector from '../components/VehicleSelector';
import { VehicleContext } from '../contexts/VehicleContext';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function SalaryScreen() {
  const { selectedVehicle } = useContext(VehicleContext);
  const [employees, setEmployees] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [doj, setDoj] = useState('');
  const [advance, setAdvance] = useState('');
  const [monthly, setMonthly] = useState('');
  const [monthsWorked, setMonthsWorked] = useState('');

  useEffect(() => {
    if (!selectedVehicle) return;
    const q = query(collection(db, 'employees'), where('vehicleId','==', selectedVehicle.id));
    const unsub = onSnapshot(q, snap => {
      setEmployees(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedVehicle]);

  const addEmployee = async () => {
    if (!name) return Alert.alert('Name required');
    if (!selectedVehicle) return Alert.alert('Select vehicle','Please select a vehicle first.');
    try {
      await addDoc(collection(db,'employees'), {
        vehicleId: selectedVehicle.id,
        name, date_of_joining: doj, advance_paid: parseFloat(advance)||0,
        monthly_salary: parseFloat(monthly)||0, months_worked: parseInt(monthsWorked)||0,
        salary_paid_till_date: 0, createdAt: serverTimestamp()
      });
      setModalVisible(false);
      setName(''); setDoj(''); setAdvance(''); setMonthly(''); setMonthsWorked('');
    } catch(e) {
      console.log(e);
      Alert.alert('Error','Failed to add employee');
    }
  };

  const renderItem = ({item}) => {
    const totalEarned = (item.monthly_salary||0) * (item.months_worked||0);
    const balance = totalEarned - ((item.advance_paid||0) + (item.salary_paid_till_date||0));
    return (
      <View style={styles.card}>
        <Text style={{fontWeight:'700'}}>{item.name}</Text>
        <Text>DOJ: {item.date_of_joining}</Text>
        <Text>Advance: {item.advance_paid}</Text>
        <Text>Monthly: {item.monthly_salary} | Months: {item.months_worked}</Text>
        <Text>Total Earned: {totalEarned}</Text>
        <Text>Paid till date: {item.salary_paid_till_date || 0}</Text>
        <Text style={{fontWeight:'700'}}>Balance Pending: {balance}</Text>
      </View>
    );
  };

  return (
    <View style={{flex:1, padding:16}}>
      <VehicleSelector />
      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={{color:'#fff'}}>+ Add Employee</Text>
      </TouchableOpacity>

      <FlatList data={employees} keyExtractor={i=>i.id} renderItem={renderItem} style={{marginTop:12}} />

      <Modal visible={modalVisible} animationType="slide">
        <View style={{flex:1,padding:16}}>
          <Text style={{fontWeight:'700',fontSize:18}}>Add Employee</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Date of Joining (YYYY-MM-DD)" value={doj} onChangeText={setDoj} style={styles.input} />
          <TextInput placeholder="Advance Paid" value={advance} onChangeText={setAdvance} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Monthly Salary" value={monthly} onChangeText={setMonthly} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Months Worked" value={monthsWorked} onChangeText={setMonthsWorked} keyboardType="numeric" style={styles.input} />
          <TouchableOpacity style={styles.saveBtn} onPress={addEmployee}><Text style={{color:'#fff'}}>Save</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn,{backgroundColor:'#ccc',marginTop:8}]} onPress={() => setModalVisible(false)}><Text>Cancel</Text></TouchableOpacity>
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
