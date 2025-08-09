
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import VehicleSelector from '../components/VehicleSelector';
import { VehicleContext } from '../contexts/VehicleContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function DailyLogScreen() {
  const { selectedVehicle } = useContext(VehicleContext);
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  const [agent, setAgent] = useState('');
  const [boreArea, setBoreArea] = useState('');

  const [drillingFt, setDrillingFt] = useState('');
  const [drillingRate, setDrillingRate] = useState('');
  const [c5Ft, setC5Ft] = useState('');
  const [c5Rate, setC5Rate] = useState('');
  const [c7Ft, setC7Ft] = useState('');
  const [c7Rate, setC7Rate] = useState('');
  const [c10Ft, setC10Ft] = useState('');
  const [c10Rate, setC10Rate] = useState('');

  const [amountPaid, setAmountPaid] = useState('');

  const calc = (ft, rate) => {
    const f = parseFloat(ft) || 0;
    const r = parseFloat(rate) || 0;
    return +(f * r).toFixed(2);
  };

  const drillingTotal = calc(drillingFt, drillingRate);
  const c5Total = calc(c5Ft, c5Rate);
  const c7Total = calc(c7Ft, c7Rate);
  const c10Total = calc(c10Ft, c10Rate);
  const grandTotal = +(drillingTotal + c5Total + c7Total + c10Total).toFixed(2);
  const pending = +(grandTotal - (parseFloat(amountPaid) || 0)).toFixed(2);

  const saveEntry = async () => {
    if (!selectedVehicle) return Alert.alert('No vehicle selected', 'Please select or add a vehicle first.');
    if (!agent) return Alert.alert('Agent required','Please enter agent name.');
    if (isNaN(Number(drillingFt)) && isNaN(Number(c5Ft)) && isNaN(Number(c7Ft)) && isNaN(Number(c10Ft))) return Alert.alert('Depth required','Enter at least one depth value.');
    try {
      await addDoc(collection(db, 'daily_log'), {
        vehicleId: selectedVehicle.id,
        day, date, agent, boreArea,
        drilling_depth_ft: parseFloat(drillingFt) || 0,
        drilling_rate_per_ft: parseFloat(drillingRate) || 0,
        drilling_total: drillingTotal,
        casing_5in_ft: parseFloat(c5Ft) || 0,
        casing_5in_rate: parseFloat(c5Rate) || 0,
        casing_5in_total: c5Total,
        casing_7in_ft: parseFloat(c7Ft) || 0,
        casing_7in_rate: parseFloat(c7Rate) || 0,
        casing_7in_total: c7Total,
        casing_10in_ft: parseFloat(c10Ft) || 0,
        casing_10in_rate: parseFloat(c10Rate) || 0,
        casing_10in_total: c10Total,
        total_amount: grandTotal,
        amount_paid: parseFloat(amountPaid) || 0,
        amount_pending: pending,
        createdAt: serverTimestamp()
      });
      Alert.alert('Saved', 'Daily log saved successfully.');
      // reset
      setDay(''); setDate(''); setAgent(''); setBoreArea('');
      setDrillingFt(''); setDrillingRate(''); setC5Ft(''); setC5Rate('');
      setC7Ft(''); setC7Rate(''); setC10Ft(''); setC10Rate('');
      setAmountPaid('');
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to save entry.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VehicleSelector />
      <Text style={styles.label}>Day</Text>
      <TextInput style={styles.input} value={day} onChangeText={setDay} placeholder="e.g., Monday" />
      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Text style={styles.label}>Agent</Text>
      <TextInput style={styles.input} value={agent} onChangeText={setAgent} placeholder="Agent name" />
      <Text style={styles.label}>Bore Area</Text>
      <TextInput style={styles.input} value={boreArea} onChangeText={setBoreArea} placeholder="Location" />

      <View style={styles.row}>
        <View style={{flex:1}}>
          <Text style={styles.label}>Drilling Depth (ft)</Text>
          <TextInput style={styles.input} value={drillingFt} onChangeText={setDrillingFt} keyboardType="numeric" />
        </View>
        <View style={{flex:1, marginLeft:8}}>
          <Text style={styles.label}>Rate per ft</Text>
          <TextInput style={styles.input} value={drillingRate} onChangeText={setDrillingRate} keyboardType="numeric" />
        </View>
        <View style={{width:80, marginLeft:8, justifyContent:'center', alignItems:'center'}}>
          <Text style={styles.label}>Total</Text>
          <Text style={{fontWeight:'700'}}>{drillingTotal}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={{flex:1}}>
          <Text style={styles.label}>5" Casing (ft)</Text>
          <TextInput style={styles.input} value={c5Ft} onChangeText={setC5Ft} keyboardType="numeric" />
        </View>
        <View style={{flex:1, marginLeft:8}}>
          <Text style={styles.label}>Rate per ft</Text>
          <TextInput style={styles.input} value={c5Rate} onChangeText={setC5Rate} keyboardType="numeric" />
        </View>
        <View style={{width:80, marginLeft:8, justifyContent:'center', alignItems:'center'}}>
          <Text style={styles.label}>Total</Text>
          <Text style={{fontWeight:'700'}}>{c5Total}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={{flex:1}}>
          <Text style={styles.label}>7" Casing (ft)</Text>
          <TextInput style={styles.input} value={c7Ft} onChangeText={setC7Ft} keyboardType="numeric" />
        </View>
        <View style={{flex:1, marginLeft:8}}>
          <Text style={styles.label}>Rate per ft</Text>
          <TextInput style={styles.input} value={c7Rate} onChangeText={setC7Rate} keyboardType="numeric" />
        </View>
        <View style={{width:80, marginLeft:8, justifyContent:'center', alignItems:'center'}}>
          <Text style={styles.label}>Total</Text>
          <Text style={{fontWeight:'700'}}>{c7Total}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={{flex:1}}>
          <Text style={styles.label}>10" Casing (ft)</Text>
          <TextInput style={styles.input} value={c10Ft} onChangeText={setC10Ft} keyboardType="numeric" />
        </View>
        <View style={{flex:1, marginLeft:8}}>
          <Text style={styles.label}>Rate per ft</Text>
          <TextInput style={styles.input} value={c10Rate} onChangeText={setC10Rate} keyboardType="numeric" />
        </View>
        <View style={{width:80, marginLeft:8, justifyContent:'center', alignItems:'center'}}>
          <Text style={styles.label}>Total</Text>
          <Text style={{fontWeight:'700'}}>{c10Total}</Text>
        </View>
      </View>

      <View style={{marginTop:12}}>
        <Text style={styles.label}>Grand Total</Text>
        <Text style={{fontSize:18,fontWeight:'700'}}>{grandTotal}</Text>
      </View>

      <Text style={styles.label}>Amount Paid</Text>
      <TextInput style={styles.input} value={amountPaid} onChangeText={setAmountPaid} keyboardType="numeric" />

      <Text style={styles.label}>Amount Pending</Text>
      <Text style={{fontSize:16,fontWeight:'700'}}>{pending}</Text>

      <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
        <Text style={{color:'#fff'}}>Save Entry</Text>
      </TouchableOpacity>

      <View style={{height:40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: '600', marginTop: 8, fontSize:14 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:8, marginTop:6 },
  row: { flexDirection:'row', marginTop:10 },
  saveBtn: { backgroundColor:'#28a745', padding:12, borderRadius:8, marginTop:16, alignItems:'center' }
});
