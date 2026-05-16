import React, { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AppointmentsScreen from "./src/screens/AppointmentsScreen";
import AppointmentDetailScreen from "./src/screens/AppointmentDetailScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import { I18nProvider } from "./src/i18n";
import { clearSession, loadSession, saveSession, toSession } from "./src/auth/session";
import type { MobileSession } from "./src/auth/session";
import type { MobileAuthPayload } from "./src/api/client";
import { mobileLogout, mobileRefresh } from "./src/api/client";

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Appointments: undefined;
  AppointmentDetail: { id: string };
  Calendar: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<MobileSession | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const existing = await loadSession();
      if (!mounted) return;
      if (!existing) {
        setBooting(false);
        return;
      }

      if (existing.expiresAt > Date.now() + 30_000) {
        setSession(existing);
        setBooting(false);
        return;
      }

      try {
        const refreshed = await mobileRefresh({ refreshToken: existing.refreshToken });
        const next = toSession(refreshed);
        await saveSession(next);
        if (!mounted) return;
        setSession(next);
      } catch {
        await clearSession();
        if (!mounted) return;
        setSession(null);
      } finally {
        if (mounted) setBooting(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(payload: MobileAuthPayload) {
    const next = toSession(payload);
    setSession(next);
    await saveSession(next);
  }

  async function handleLogout() {
    const current = session;
    setSession(null);
    await clearSession();
    if (current?.refreshToken) {
      mobileLogout(current.refreshToken).catch(() => undefined);
    }
  }

  const canUpdateStatus = useMemo(() => session?.roles.appRole !== "STAFF_MEMBER", [session?.roles.appRole]);

  return (
    <I18nProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {booting ? (
            <Stack.Screen name="Login" component={() => null} />
          ) : !session ? (
            <Stack.Screen name="Login">
              {() => <LoginScreen onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Dashboard">
                {({ navigation }) => (
                  <DashboardScreen
                    session={session}
                    onOpenAppointments={() => navigation.navigate("Appointments")}
                    onOpenCalendar={() => navigation.navigate("Calendar")}
                    onLogout={handleLogout}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Appointments">
                {({ navigation }) => (
                  <AppointmentsScreen
                    token={session.accessToken}
                    onSelectAppointment={(id) => navigation.navigate("AppointmentDetail", { id })}
                    onBack={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="AppointmentDetail">
                {({ route, navigation }) => (
                  <AppointmentDetailScreen
                    appointmentId={route.params.id}
                    token={session.accessToken}
                    canUpdateStatus={Boolean(canUpdateStatus)}
                    onBack={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Calendar">
                {({ navigation }) => (
                  <CalendarScreen
                    token={session.accessToken}
                    onBack={() => navigation.goBack()}
                    onSelectAppointment={(id) => navigation.navigate("AppointmentDetail", { id })}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </I18nProvider>
  );
}

