/**
 * Navigation param lists — expanded through Module 11.
 * All screen params are documented against the backend endpoints they display.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
};

// ─── Root ────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

import type { NavigatorScreenParams } from '@react-navigation/native';

export type SuperAdminTabParamList = {
  SADashboard: undefined;
  Companies: NavigatorScreenParams<CompanyStackParamList>;
  SAProfile: undefined;
};

export type CompanyStackParamList = {
  CompanyList: undefined;
  CompanyDetail: { companyId: number };
  CreateCompany: undefined;
  CreateCompanyAdmin: { companyId: number };
  CompanyUsers: { companyId: number };
};

// ─── Company Admin tab set ───────────────────────────────────────────────────

export type CompanyAdminTabParamList = {
  CADashboard: undefined;
  Fleet: undefined;
  Users: undefined;
  Verify: undefined;
  CAProfile: undefined;
};

// ─── Manufacturer tab set ────────────────────────────────────────────────────

export type ManufacturerTabParamList = {
  MFRDashboard: undefined;
  Fleet: undefined;
  Components: undefined;
  Tags: undefined;
  MFRProfile: undefined;
};

// ─── Maintenance Technician tab set ─────────────────────────────────────────

export type TechnicianTabParamList = {
  TECHDashboard: undefined;
  Maintenance: undefined;
  Components: undefined;
  TECHProfile: undefined;
};

// ─── Inspector tab set ───────────────────────────────────────────────────────

export type InspectorTabParamList = {
  INSPDashboard: undefined;
  Verify: undefined;
  Components: undefined;
  INSPProfile: undefined;
};

// ─── Viewer tab set ──────────────────────────────────────────────────────────

export type ViewerTabParamList = {
  VIEWDashboard: undefined;
  Fleet: undefined;
  Components: undefined;
  VIEWProfile: undefined;
};

// ─── Shared stacks (used across multiple roles) ──────────────────────────────

export type FleetStackParamList = {
  AircraftList: undefined;
  AircraftDetail: { aircraftId: number };
  CreateAircraft: undefined;
};

export type ComponentStackParamList = {
  ComponentList: undefined;
  ComponentDetail: { componentId: number };
  CreateComponent: undefined;
  ComponentPassport: { componentId: number };
  ComponentHistory: { componentId: number };
  ComponentVerifications: { componentId: number };
};

export type UserStackParamList = {
  UserList: undefined;
  CreateUser: undefined;
};

export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  MaintenanceDetail: { recordId: number };
  CreateMaintenance: undefined;
  ComponentHistory: { componentId: number };
};

export type VerificationStackParamList = {
  VerificationHome: undefined;
  NfcScan: undefined;
  VerificationResult: {
    tagIdentifier: string;
    verified: boolean;
    status: string;
    component?: { id: string; aircraft: string; serial_number: string } | null;
    checks: {
      nfc_authentication: boolean;
      component_binding: boolean;
      tamper_status: boolean;
      blockchain_integrity: boolean;
    };
    failure_reason?: string | null;
  };
  VerificationLogs: undefined;
  RegisterTag: undefined;
  IntegrityCheck: undefined;
};

export type TagStackParamList = {
  RegisterTag: undefined;
  TagDetail: { tagId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
};
