import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard } from 'lucide-react-native';
import type { AppTabParamList } from './types';
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { colors } from '../theme/tokens';

const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Authenticated app shell. Module 0 wires up a single Home tab so the
 * shell exists and renders against real session state. Per-role tab sets
 * (brief Section 17 — e.g. Scan/Fleet/Components for a Technician vs.
 * Companies/Analytics for a Super Admin) are Module 2's job: that module
 * will read `useAuthStore().user.role` here and branch which tabs render,
 * rather than hiding tabs behind client-only checks that don't match a
 * real permission boundary.
 */
export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);
