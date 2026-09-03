/**
 * Navigation param lists. Kept minimal in Module 0 — grows as each
 * feature module adds real screens (Aircraft detail in Module 3,
 * Component Passport in Module 5, Scanner in Module 6, etc.).
 */

export type AuthStackParamList = {
  Login: undefined;
};

/** Bottom-tab destinations. Which tabs actually render for a given user is
 * a role decision made in `AppNavigator` (Module 2 fleshes out the
 * per-role tab sets described in the brief's Section 17) — Module 0 wires
 * up only a single placeholder Home tab so the authenticated shell exists
 * and can be built on. */
export type AppTabParamList = {
  Home: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
