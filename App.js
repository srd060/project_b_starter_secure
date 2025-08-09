
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VehicleProvider } from './src/contexts/VehicleContext';
import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import AuthStack from './src/navigation/AuthStack';

function RootNavigator() {
  const { user, initializing } = useContext(AuthContext);
  if (initializing) return null;
  return user ? <TabNavigator /> : <AuthStack />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VehicleProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </VehicleProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
