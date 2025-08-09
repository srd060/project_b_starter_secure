
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LandingScreen from '../screens/LandingScreen';
import DailyLogScreen from '../screens/DailyLogScreen';
import SalaryScreen from '../screens/SalaryScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import HsdPipeScreen from '../screens/HsdPipeScreen';
import StatementScreen from '../screens/StatementScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Landing">
      <Tab.Screen name="Landing" component={LandingScreen} />
      <Tab.Screen name="DailyLog" component={DailyLogScreen} options={{ title: 'Daily Log' }} />
      <Tab.Screen name="Salary" component={SalaryScreen} />
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} />
      <Tab.Screen name="HSDPipe" component={HsdPipeScreen} options={{ title: 'HSD / Pipe' }} />
      <Tab.Screen name="Statement" component={StatementScreen} />
    </Tab.Navigator>
  );
}
