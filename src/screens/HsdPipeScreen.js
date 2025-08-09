
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import VehicleSelector from '../components/VehicleSelector';
import { VehicleContext } from '../contexts/VehicleContext';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function HsdPipeScreen() {
  const { selectedVehicle } = useContext(VehicleContext);
  const [hsdEntries, setHsdEntries] = useState([]);
  const [pipeEntries, setPipeEntries] = useState([]);
  const [inventory, setInventory] = useState({ '5in':{qty_in:0,qty_out:0,current:0}, '7in':{qty_in:0,qty_out:0,current:0} });

  const [modalHsd, setModalHsd] = useState(false);
  const [modalPipe, setModalPipe] = useState(false);

  const [hsdLiters, setHsdLiters] = useState('');
  const [hsdAmount, setHsdAmount] = useState('');
  const [pipe5Qty, setPipe5Qty] = useState('');
  const [pipe7Qty, setPipe7Qty] = useState('');
  const [pipeAmount, setPipeAmount] = useState('');
  const [pipePending, setPipePending] = useState('');
  const [paidBy, setPaidBy] = useState('self');
  const [paidByAgent, setPaidByAgent] = useState('');

  useEffect(() => {
    if (!selectedVehicle) return;
    const q1 = query(collection(db,'hsd_entries'), where('vehicleId','==', selectedVehicle.id));
    const unsub1 = onSnapshot(q1, snap => setHsdEntries(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const q2 = query(collection(db,'pipe_entries'), where('vehicleId','==', selectedVehicle.id));
    const unsub2 = onSnapshot(q2, snap => setPipeEntries(snap.docs.map(d=>({id:d.id,...d.data()}))));
    // inventory aggregation
    const computeInv = async () => {
      const q5 = query(collection(db,'pipe_entries'), where('vehicleId','==', selectedVehicle.id));
      const snap = await getDocs(q5);
      let in5=0, in7=0, out5=0, out7=0;
      snap.docs.forEach(d=>{
        const data = d.data();
        in5 += Number(data.qty_5in||0);
        in7 += Number(data.qty_7in||0);
      });
      const qd = query(collection(db,'daily_log'), where('vehicleId','==', selectedVehicle.id));
      const sd = await getDocs(qd);
      sd.docs.forEach(d=>{
        const data = d.data();
        out5 += Number(data.casing_5in_ft||0);
        out7 += Number(data.casing_7in_ft||0);
      });
      setInventory({
        '5in': { qty_in: in5, qty_out: out5, current: in5 - out5 },
        '7in': { qty_in: in7, qty_out: out7, current: in7 - out7 }
      });
    };
    computeInv();
    return () => { unsub1(); unsub2(); };
  }, [selectedVehicle]);

  const addHsd = async () => {
    if (!selectedVehicle) return Alert.alert('Select vehicle');
    try {
      await addDoc(collection(db,'hsd_entries'), {
        vehicleId: selectedVehicle.id,
        date: new Date().toISOString().slice(0,10),
        day: '', liters: parseFloat(hsdLiters)||0, amount_paid: parseFloat(hsdAmount)||0, createdAt: serverTimestamp()
      });
      setModalHsd(false); setHsdLiters(''); setHsdAmount('');
    } catch(e) { console.log(e); Alert.alert('Error','Failed to save HSD'); }
  };

  const addPipe = async () => {
    if (!selectedVehicle) return Alert.alert('Select vehicle');
    try {
      const docRef = await addDoc(collection(db,'pipe_entries'), {
        vehicleId: selectedVehicle.id,
        date: new Date().toISOString().slice(0,10),
        day:'', qty_5in: parseInt(pipe5Qty)||0, qty_7in: parseInt(pipe7Qty)||0,
        amount_paid: parseFloat(pipeAmount)||0, amount_pending: parseFloat(pipePending)||0,
        paid_by_type: paidBy, paid_by_agentId: paidBy==='agent'? paidByAgent : null,
        createdAt: serverTimestamp()
      });
      // No transaction here: if paid_by agent, the agent pending should be adjusted via Cloud Function in production.
      setModalPipe(false); setPipe5Qty(''); setPipe7Qty(''); setPipeAmount(''); setPipePending('');
    } catch(e) { console.log(e); Alert.alert('Error','Failed to save pipe entry'); }
  };

  const renderHsd = ({item}) => (<View style={styles.card}><Text>{item.date}</Text><Text>Liters: {item.liters}</Text><Text>Amt: {item.amount_paid}</Text></View>);
  const renderPipe = ({item}) => (<View style={styles.card}><Text>{item.date}</Text><Text>5":{item.qty_5in} 7":{item.qty_7in}</Text><Text>Paid:{item.amount_paid} Pending:{item.amount_pending}</Text></View>);

  return (
    <View style={{flex:1,padding:16}}>
      <VehicleSelector />
      <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:8}}>
        <TouchableOpacity style={styles.btn} onPress={() => setModalHsd(true)}><Text style={{color:'#fff'}}>+ Add HSD</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setModalPipe(true)}><Text style={{color:'#fff'}}>+ Add Pipe</Text></TouchableOpacity>
      </View>

      <Text style={{fontWeight:'700', marginTop:12}}>HSD Entries</Text>
      <FlatList data={hsdEntries} keyExtractor={i=>i.id} renderItem={renderHsd} />

      <Text style={{fontWeight:'700', marginTop:12}}>Pipe Entries</Text>
      <FlatList data={pipeEntries} keyExtractor={i=>i.id} renderItem={renderPipe} />

      <View style={{marginTop:12}}>
        <Text style={{fontWeight:'700'}}>Pipe Inventory</Text>
        <Text>5": In {inventory['5in'].qty_in} | Used {inventory['5in'].qty_out} | Left {inventory['5in'].current}</Text>
        <Text>7": In {inventory['7in'].qty_in} | Used {inventory['7in'].qty_out} | Left {inventory['7in'].current}</Text>
      </View>

      {/* HSD Modal */}
      <Modal visible={modalHsd} animationType="slide">
        <View style={{flex:1,padding:16}}>
          <Text style={{fontWeight:'700'}}>Add HSD Entry</Text>
          <TextInput placeholder="Liters" value={hsdLiters} onChangeText={setHsdLiters} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Amount Paid" value={hsdAmount} onChangeText={setHsdAmount} keyboardType="numeric" style={styles.input} />
          <TouchableOpacity style={styles.saveBtn} onPress={addHsd}><Text style={{color:'#fff'}}>Save HSD</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn,{backgroundColor:'#ccc',marginTop:8}]} onPress={() => setModalHsd(false)}><Text>Cancel</Text></TouchableOpacity>
        </View>
      </Modal>

      {/* Pipe Modal */}
      <Modal visible={modalPipe} animationType="slide">
        <View style={{flex:1,padding:16}}>
          <Text style={{fontWeight:'700'}}>Add Pipe Entry</Text>
          <TextInput placeholder="5" qty received" value={pipe5Qty} onChangeText={setPipe5Qty} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="7" qty received" value={pipe7Qty} onChangeText={setPipe7Qty} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Amount Paid" value={pipeAmount} onChangeText={setPipeAmount} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Amount Pending" value={pipePending} onChangeText={setPipePending} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Paid By (self|agent)" value={paidBy} onChangeText={setPaidBy} style={styles.input} />
          <TextInput placeholder="If agent: agentId" value={paidByAgent} onChangeText={setPaidByAgent} style={styles.input} />
          <TouchableOpacity style={styles.saveBtn} onPress={addPipe}><Text style={{color:'#fff'}}>Save Pipe</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn,{backgroundColor:'#ccc',marginTop:8}]} onPress={() => setModalPipe(false)}><Text>Cancel</Text></TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor:'#007bff', padding:10, borderRadius:6, alignItems:'center', width:'48%' },
  card: { padding:8, borderWidth:1, borderColor:'#eee', borderRadius:6, marginTop:8 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:8, marginTop:8 },
  saveBtn: { backgroundColor:'#28a745', padding:12, borderRadius:8, marginTop:12, alignItems:'center' }
});
