
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const doSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      Alert.alert('Signup failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={doSignup}><Text style={{color:'#fff'}}>Sign up</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop:12}}>
        <Text style={{color:'#007bff'}}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, padding:16, justifyContent:'center'},
  title:{fontSize:22,fontWeight:'700', marginBottom:12, textAlign:'center'},
  input:{borderWidth:1,borderColor:'#ccc',borderRadius:6,padding:10,marginTop:8},
  btn:{backgroundColor:'#28a745',padding:12,borderRadius:8,alignItems:'center',marginTop:12}
});
