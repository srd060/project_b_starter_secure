
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import VehicleSelector from '../components/VehicleSelector';
import { VehicleContext } from '../contexts/VehicleContext';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';


// Export helpers (XLSX and JSON)
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

const exportJSON = async (data) => {
  const filename = FileSystem.documentDirectory + 'borewell_backup.json';
  await FileSystem.writeAsStringAsync(filename, JSON.stringify(data, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(filename);
};

const exportXLSX = async (agentSummary, pnl, pipeStock) => {
  const wb = XLSX.utils.book_new();
  const wsData = [['Agent','Jobs','Total','Paid','Pending']];
  agentSummary.forEach(a => wsData.push([a.agent, a.jobs, a.total, a.paid, a.pending]));
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Agents');

  const pnlData = [['Income', pnl.income], ['Expenses', pnl.expenses], ['Net', pnl.net]];
  const ws2 = XLSX.utils.aoa_to_sheet(pnlData);
  XLSX.utils.book_append_sheet(wb, ws2, 'P&L');

  const invData = [['Size','In','Out','Left'], ['5in', pipeStock['5in']?.in||0, pipeStock['5in']?.out||0, pipeStock['5in']?.left||0], ['7in', pipeStock['7in']?.in||0, pipeStock['7in']?.out||0, pipeStock['7in']?.left||0]];
  const ws3 = XLSX.utils.aoa_to_sheet(invData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Inventory');

  const wbout = XLSX.write(wb, { type:'base64', bookType:'xlsx' });
  const filename = FileSystem.documentDirectory + 'borewell_statement.xlsx';
  await FileSystem.writeAsStringAsync(filename, wbout, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(filename);
};


export default function StatementScreen() {
  const { selectedVehicle } = useContext(VehicleContext);
  const [agentSummary, setAgentSummary] = useState([]);
  const [glEntries, setGlEntries] = useState([]);
  const [pnl, setPnl] = useState({ income:0, expenses:0, net:0 });
  const [pipeStock, setPipeStock] = useState({});

  useEffect(() => {
    if (!selectedVehicle) return;
    const unsub = onSnapshot(query(collection(db,'daily_log'), where('vehicleId','==', selectedVehicle.id)), async snap => {
      const docs = snap.docs.map(d=>d.data());
      // aggregate agent pending
      const map = {};
      docs.forEach(d=>{
        const agent = d.agent || 'Unknown';
        if (!map[agent]) map[agent] = { jobs:0, total:0, paid:0, pending:0 };
        map[agent].jobs += 1;
        map[agent].total += Number(d.total_amount||0);
        map[agent].paid += Number(d.amount_paid||0);
        map[agent].pending += Number(d.amount_pending||0);
      });
      const arr = Object.keys(map).map(k=>({ agent:k, ...map[k] }));
      setAgentSummary(arr);

      // P&L simple calculation
      // income = sum of job totals
      const income = docs.reduce((s,d)=>s+Number(d.total_amount||0),0);
      // expenses = sum of maintenance + hsd + pipe self-paid + salary paid (we'll fetch basics)
      const maintSnap = await getDocs(query(collection(db,'maintenance'), where('vehicleId','==', selectedVehicle.id)));
      const hsdSnap = await getDocs(query(collection(db,'hsd_entries'), where('vehicleId','==', selectedVehicle.id)));
      const pipeSnap = await getDocs(query(collection(db,'pipe_entries'), where('vehicleId','==', selectedVehicle.id)));
      const salarySnap = await getDocs(query(collection(db,'employees'), where('vehicleId','==', selectedVehicle.id)));

      const maintTotal = maintSnap.docs.reduce((s,d)=>s+Number(d.data().amount_paid||0),0);
      const hsdTotal = hsdSnap.docs.reduce((s,d)=>s+Number(d.data().amount_paid||0),0);
      const pipeTotal = pipeSnap.docs.reduce((s,d)=>s+Number(d.data().amount_paid||0),0);
      const salaryTotal = salarySnap.docs.reduce((s,d)=>{
        const it = d.data();
        return s + (Number(it.salary_paid_till_date||0) + Number(it.advance_paid||0));
      },0);

      const expenses = maintTotal + hsdTotal + pipeTotal + salaryTotal;
      setPnl({ income, expenses, net: income - expenses });

      // pipe stock compute
      let in5=0, in7=0, out5=0, out7=0;
      pipeSnap.docs.forEach(d=>{
        const data = d.data();
        in5 += Number(data.qty_5in||0);
        in7 += Number(data.qty_7in||0);
      });
      docs.forEach(d=>{
        out5 += Number(d.casing_5in_ft||0);
        out7 += Number(d.casing_7in_ft||0);
      });
      setPipeStock({ '5in': { in:in5, out: out5, left: in5 - out5 }, '7in': { in:in7, out: out7, left: in7 - out7 } });
    });

    return () => unsub();
  }, [selectedVehicle]);

  const renderAgent = ({item}) => (
    <View style={styles.card}><Text style={{fontWeight:'700'}}>{item.agent}</Text><Text>Pending: {item.pending}</Text></View>
  );

  return (
    <View style={{flex:1,padding:16}}>
      <VehicleSelector />
      <View style={{flexDirection:'row', marginTop:8}}>
        <TouchableOpacity style={{backgroundColor:'#007bff',padding:10,borderRadius:6,marginRight:8}} onPress={() => exportJSON({ agentSummary, pnl, pipeStock })}><Text style={{color:'#fff'}}>Export JSON</Text></TouchableOpacity>
        <TouchableOpacity style={{backgroundColor:'#28a745',padding:10,borderRadius:6}} onPress={() => exportXLSX(agentSummary, pnl, pipeStock)}><Text style={{color:'#fff'}}>Export XLSX</Text></TouchableOpacity>
      </View>
      <Text style={{fontWeight:'700',fontSize:18}}>Agent Pending</Text>
      <FlatList data={agentSummary} keyExtractor={(i)=>i.agent} renderItem={renderAgent} />

      <View style={{marginTop:12}}>
        <Text style={{fontWeight:'700'}}>Profit & Loss</Text>
        <Text>Income: {pnl.income}</Text>
        <Text>Expenses: {pnl.expenses}</Text>
        <Text>Net: {pnl.net}</Text>
      </View>

      <View style={{marginTop:12}}>
        <Text style={{fontWeight:'700'}}>Pipe Stock</Text>
        <Text>5": In {pipeStock['5in']?.in || 0} | Used {pipeStock['5in']?.out || 0} | Left {pipeStock['5in']?.left || 0}</Text>
        <Text>7": In {pipeStock['7in']?.in || 0} | Used {pipeStock['7in']?.out || 0} | Left {pipeStock['7in']?.left || 0}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding:10, borderWidth:1, borderColor:'#eee', borderRadius:8, marginTop:8 }
});
