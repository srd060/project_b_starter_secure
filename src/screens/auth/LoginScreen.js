
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const doLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      Alert.alert('Login failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={doLogin}><Text style={{color:'#fff'}}>Sign in</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{marginTop:12}}>
        <Text style={{color:'#007bff'}}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, padding:16, justifyContent:'center'},
  title:{fontSize:22,fontWeight:'700', marginBottom:12, textAlign:'center'},
  input:{borderWidth:1,borderColor:'#ccc',borderRadius:6,padding:10,marginTop:8},
  btn:{backgroundColor:'#007bff',padding:12,borderRadius:8,alignItems:'center',marginTop:12}
});
