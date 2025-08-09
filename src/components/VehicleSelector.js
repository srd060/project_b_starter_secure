
import React, { useContext } from 'react';
import { View, Text, Picker, StyleSheet, TouchableOpacity } from 'react-native';
import { VehicleContext } from '../contexts/VehicleContext';

export default function VehicleSelector() {
  const { vehicles, selectedVehicle, setSelectedVehicle } = useContext(VehicleContext);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vehicle:</Text>
      {vehicles.length === 0 ? (
        <Text style={styles.noVehicle}>No vehicles yet. Add in Vehicle Manager.</Text>
      ) : (
        <Picker
          selectedValue={selectedVehicle ? selectedVehicle.id : ''}
          style={styles.picker}
          onValueChange={(val) => {
            const v = vehicles.find(x => x.id === val);
            setSelectedVehicle(v);
          }}>
          {vehicles.map(v => <Picker.Item key={v.id} label={v.name || 'Unnamed'} value={v.id} />)}
        </Picker>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontWeight: '600', marginRight: 8 },
  picker: { flex: 1 },
  noVehicle: { color: '#777' }
});
