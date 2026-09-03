import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Building2,
  ClipboardList,
  Cpu,
  LayoutDashboard,
  Plane,
  ScanLine,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react-native';

import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/tokens';
import { ROLES } from '../constants/roles';

import { SuperAdminDashboard } from '../screens/dashboard/SuperAdminDashboard';
import { CompanyAdminDashboard } from '../screens/dashboard/CompanyAdminDashboard';
import { ManufacturerDashboard } from '../screens/dashboard/ManufacturerDashboard';
import { TechnicianDashboard } from '../screens/dashboard/TechnicianDashboard';
import { InspectorDashboard } from '../screens/dashboard/InspectorDashboard';
import { ViewerDashboard } from '../screens/dashboard/ViewerDashboard';

import {
  CompanyStack,
  ComponentStack,
  FleetStack,
  MaintenanceStack,
  ProfileStack,
  UserStack,
  VerificationStack,
} from './Stacks';

import type {
  SuperAdminTabParamList,
  CompanyAdminTabParamList,
  ManufacturerTabParamList,
  TechnicianTabParamList,
  InspectorTabParamList,
  ViewerTabParamList,
} from './types';

// Tab navigators for each role
const SATab = createBottomTabNavigator<SuperAdminTabParamList>();
const CATab = createBottomTabNavigator<CompanyAdminTabParamList>();
const MfrTab = createBottomTabNavigator<ManufacturerTabParamList>();
const TechTab = createBottomTabNavigator<TechnicianTabParamList>();
const InspTab = createBottomTabNavigator<InspectorTabParamList>();
const ViewTab = createBottomTabNavigator<ViewerTabParamList>();

const screenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
};

/**
 * Super Admin App Shell
 * - Dashboard (Platform analytics)
 * - Companies (Tenant management)
 * - Profile
 */
const SuperAdminApp = () => (
  <SATab.Navigator screenOptions={screenOptions}>
    <SATab.Screen
      name="SADashboard"
      component={SuperAdminDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
    />
    <SATab.Screen
      name="Companies"
      component={CompanyStack}
      options={{ tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
    />
    <SATab.Screen
      name="SAProfile"
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
    />
  </SATab.Navigator>
);

/**
 * Company Admin App Shell
 * - Dashboard (Tenant analytics)
 * - Users (Staff management)
 * - Fleet (Aircraft)
 * - Components (Inventory & Passports)
 * - Verify (Logs)
 * - Profile
 */
const CompanyAdminApp = () => (
  <CATab.Navigator screenOptions={screenOptions}>
    <CATab.Screen
      name="CADashboard"
      component={CompanyAdminDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
    />
    <CATab.Screen
      name="Users"
      component={UserStack}
      options={{ tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
    />
    <CATab.Screen
      name="Fleet"
      component={FleetStack}
      options={{ tabBarIcon: ({ color, size }) => <Plane color={color} size={size} /> }}
    />
    <CATab.Screen
      name="Verify"
      component={VerificationStack}
      options={{ tabBarLabel: 'Verifications', tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} /> }}
    />
    <CATab.Screen
      name="CAProfile"
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
    />
  </CATab.Navigator>
);

/**
 * Manufacturer App Shell
 * - Dashboard (Production)
 * - Fleet
 * - Components (Registration & Tags)
 * - Tags
 * - Profile
 */
const ManufacturerApp = () => (
  <MfrTab.Navigator screenOptions={screenOptions}>
    <MfrTab.Screen
      name="MFRDashboard"
      component={ManufacturerDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
    />
    <MfrTab.Screen
      name="Components"
      component={ComponentStack}
      options={{ tabBarIcon: ({ color, size }) => <Cpu color={color} size={size} /> }}
    />
    <MfrTab.Screen
      name="Tags"
      component={VerificationStack} // Reuse for tag registration
      options={{ tabBarLabel: 'Tags', tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }}
    />
    <MfrTab.Screen
      name="MFRProfile"
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
    />
  </MfrTab.Navigator>
);

/**
 * Technician App Shell
 * - Dashboard
 * - Maintenance
 * - Components (Passports)
 * - Profile
 */
const TechnicianApp = () => (
  <TechTab.Navigator screenOptions={screenOptions}>
    <TechTab.Screen
      name="TECHDashboard"
      component={TechnicianDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
    />
    <TechTab.Screen
      name="Maintenance"
      component={MaintenanceStack}
      options={{ tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }}
    />
    <TechTab.Screen
      name="Components"
      component={ComponentStack}
      options={{ tabBarIcon: ({ color, size }) => <Cpu color={color} size={size} /> }}
    />
    <TechTab.Screen
      name="TECHProfile"
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
    />
  </TechTab.Navigator>
);

/**
 * Inspector App Shell
 * - Dashboard
 * - Verify (NFC scanning & Logs)
 * - Components (Passports)
 * - Profile
 */
const InspectorApp = () => (
  <InspTab.Navigator screenOptions={screenOptions}>
    <InspTab.Screen
      name="INSPDashboard"
      component={InspectorDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
    />
    <InspTab.Screen
      name="Verify"
      component={VerificationStack}
      options={{ tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }}
    />
    <InspTab.Screen
      name="Components"
      component={ComponentStack}
      options={{ tabBarIcon: ({ color, size }) => <Cpu color={color} size={size} /> }}
    />
    <InspTab.Screen
      name="INSPProfile"
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
    />
  </InspTab.Navigator>
);

/**
 * Viewer App Shell
 * - Dashboard
 * - Fleet
 * - Components
 * - Profile
 */
const ViewerApp = () => (
  <ViewTab.Navigator screenOptions={screenOptions}>
    <ViewTab.Screen
      name="VIEWDashboard"
      component={ViewerDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
    />
    <ViewTab.Screen
      name="Fleet"
      component={FleetStack}
      options={{ tabBarIcon: ({ color, size }) => <Plane color={color} size={size} /> }}
    />
    <ViewTab.Screen
      name="Components"
      component={ComponentStack}
      options={{ tabBarIcon: ({ color, size }) => <Cpu color={color} size={size} /> }}
    />
    <ViewTab.Screen
      name="VIEWProfile"
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
    />
  </ViewTab.Navigator>
);

/**
 * Authenticated app shell. Module 2 branch logic:
 * Reads `useAuthStore().user.role` to determine which tab shell to render.
 */
export const AppNavigator: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminApp />;
    case ROLES.COMPANY_ADMIN:
      return <CompanyAdminApp />;
    case ROLES.MANUFACTURER:
      return <ManufacturerApp />;
    case ROLES.MAINTENANCE_TECHNICIAN:
      return <TechnicianApp />;
    case ROLES.INSPECTOR:
      return <InspectorApp />;
    case ROLES.VIEWER:
    default:
      return <ViewerApp />;
  }
};
