import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AppointmentsScreen from "./src/screens/AppointmentsScreen";
import AppointmentDetailScreen from "./src/screens/AppointmentDetailScreen";

type Screen =
  | { name: "login" }
  | { name: "dashboard" }
  | { name: "appointments" }
  | { name: "appointmentDetail"; id: string };

export default function App() {
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [screen, setScreen] = useState<Screen>({ name: "login" });

  function handleLogin(sessionToken: string, userEmail: string) {
    setToken(sessionToken);
    setEmail(userEmail);
    setScreen({ name: "dashboard" });
  }

  function handleLogout() {
    setToken("");
    setEmail("");
    setScreen({ name: "login" });
  }

  return (
    <>
      <StatusBar style="auto" />
      {screen.name === "login" && <LoginScreen onLogin={handleLogin} />}
      {screen.name === "dashboard" && (
        <DashboardScreen
          token={token}
          email={email}
          onNavigate={(s) => setScreen({ name: s as "appointments" })}
          onLogout={handleLogout}
        />
      )}
      {screen.name === "appointments" && (
        <AppointmentsScreen
          token={token}
          onSelectAppointment={(id) => setScreen({ name: "appointmentDetail", id })}
          onBack={() => setScreen({ name: "dashboard" })}
        />
      )}
      {screen.name === "appointmentDetail" && (
        <AppointmentDetailScreen
          appointmentId={screen.id}
          token={token}
          onBack={() => setScreen({ name: "appointments" })}
        />
      )}
    </>
  );
}
