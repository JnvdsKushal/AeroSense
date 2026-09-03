import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CompanyListScreen } from '../screens/companies/CompanyListScreen';
import { CompanyDetailScreen } from '../screens/companies/CompanyDetailScreen';
import { CreateCompanyScreen } from '../screens/companies/CreateCompanyScreen';
import { CreateCompanyAdminScreen } from '../screens/companies/CreateCompanyAdminScreen';

import { AircraftListScreen } from '../screens/aircraft/AircraftListScreen';
import { AircraftDetailScreen } from '../screens/aircraft/AircraftDetailScreen';
import { CreateAircraftScreen } from '../screens/aircraft/CreateAircraftScreen';

import { ComponentListScreen } from '../screens/components/ComponentListScreen';
import { ComponentDetailScreen } from '../screens/components/ComponentDetailScreen';
import { CreateComponentScreen } from '../screens/components/CreateComponentScreen';
import { ComponentPassportScreen } from '../screens/components/ComponentPassportScreen';

import { UserListScreen } from '../screens/users/UserListScreen';
import { CreateUserScreen } from '../screens/users/CreateUserScreen';

import { MaintenanceListScreen } from '../screens/maintenance/MaintenanceListScreen';
import { MaintenanceDetailScreen } from '../screens/maintenance/MaintenanceDetailScreen';
import { CreateMaintenanceScreen } from '../screens/maintenance/CreateMaintenanceScreen';
import { ComponentHistoryScreen } from '../screens/maintenance/ComponentHistoryScreen';

import { NfcScanScreen } from '../screens/verification/NfcScanScreen';
import { VerificationResultScreen } from '../screens/verification/VerificationResultScreen';
import { VerificationLogsScreen } from '../screens/verification/VerificationLogsScreen';
import { RegisterTagScreen } from '../screens/verification/RegisterTagScreen';

import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';

import type {
  CompanyStackParamList,
  FleetStackParamList,
  ComponentStackParamList,
  UserStackParamList,
  MaintenanceStackParamList,
  VerificationStackParamList,
  ProfileStackParamList,
} from './types';

const screenOptions = { headerShown: false };

const Company = createNativeStackNavigator<CompanyStackParamList>();
export const CompanyStack = () => (
  <Company.Navigator screenOptions={screenOptions}>
    <Company.Screen name="CompanyList" component={CompanyListScreen} />
    <Company.Screen name="CompanyDetail" component={CompanyDetailScreen} />
    <Company.Screen name="CreateCompany" component={CreateCompanyScreen} />
    <Company.Screen name="CreateCompanyAdmin" component={CreateCompanyAdminScreen} />
    <Company.Screen name="CompanyUsers" component={UserListScreen as any} />
  </Company.Navigator>
);

const Fleet = createNativeStackNavigator<FleetStackParamList>();
export const FleetStack = () => (
  <Fleet.Navigator screenOptions={screenOptions}>
    <Fleet.Screen name="AircraftList" component={AircraftListScreen} />
    <Fleet.Screen name="AircraftDetail" component={AircraftDetailScreen} />
    <Fleet.Screen name="CreateAircraft" component={CreateAircraftScreen} />
  </Fleet.Navigator>
);

const Comp = createNativeStackNavigator<ComponentStackParamList>();
export const ComponentStack = () => (
  <Comp.Navigator screenOptions={screenOptions}>
    <Comp.Screen name="ComponentList" component={ComponentListScreen} />
    <Comp.Screen name="ComponentDetail" component={ComponentDetailScreen} />
    <Comp.Screen name="CreateComponent" component={CreateComponentScreen} />
    <Comp.Screen name="ComponentPassport" component={ComponentPassportScreen} />
    <Comp.Screen name="ComponentHistory" component={ComponentHistoryScreen} />
    <Comp.Screen name="ComponentVerifications" component={VerificationLogsScreen as any} />
  </Comp.Navigator>
);

const User = createNativeStackNavigator<UserStackParamList>();
export const UserStack = () => (
  <User.Navigator screenOptions={screenOptions}>
    <User.Screen name="UserList" component={UserListScreen} />
    <User.Screen name="CreateUser" component={CreateUserScreen} />
  </User.Navigator>
);

const Maint = createNativeStackNavigator<MaintenanceStackParamList>();
export const MaintenanceStack = () => (
  <Maint.Navigator screenOptions={screenOptions}>
    <Maint.Screen name="MaintenanceList" component={MaintenanceListScreen} />
    <Maint.Screen name="MaintenanceDetail" component={MaintenanceDetailScreen} />
    <Maint.Screen name="CreateMaintenance" component={CreateMaintenanceScreen} />
    <Maint.Screen name="ComponentHistory" component={ComponentHistoryScreen} />
  </Maint.Navigator>
);

const Verify = createNativeStackNavigator<VerificationStackParamList>();
export const VerificationStack = () => (
  <Verify.Navigator screenOptions={screenOptions}>
    <Verify.Screen name="VerificationHome" component={NfcScanScreen as any} />
    <Verify.Screen name="NfcScan" component={NfcScanScreen} />
    <Verify.Screen name="VerificationResult" component={VerificationResultScreen} />
    <Verify.Screen name="VerificationLogs" component={VerificationLogsScreen} />
    <Verify.Screen name="RegisterTag" component={RegisterTagScreen} />
    <Verify.Screen name="IntegrityCheck" component={ComponentPassportScreen as any} />
  </Verify.Navigator>
);

const Prof = createNativeStackNavigator<ProfileStackParamList>();
export const ProfileStack = () => (
  <Prof.Navigator screenOptions={screenOptions}>
    <Prof.Screen name="Profile" component={ProfileScreen} />
    <Prof.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </Prof.Navigator>
);
