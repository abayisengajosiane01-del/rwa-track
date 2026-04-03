import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, AppState, AppStateStatus,
} from "react-native";
import * as Location from "expo-location";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { getUser, removeToken, apiFetch } from "../lib/auth";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "Home"> };

interface WorkerUser {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  workAddress?: string;
  homeAddress?: string;
}

export default function HomeScreen({ navigation }: Props) {
  const [user, setUser] = useState<WorkerUser | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    getUser().then(setUser);
    startTracking();

    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        if (!locationSub.current) startTracking();
      }
      appState.current = next;
    });

    return () => {
      sub.remove();
      locationSub.current?.remove();
    };
  }, []);

  const startTracking = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return;

    setTracking(true);
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 100,
      },
      async (loc) => {
        const { latitude: lat, longitude: lng, accuracy } = loc.coords;
        setLastLocation({ lat, lng });
        try {
          await apiFetch("/api/location-logs", {
            method: "POST",
            body: JSON.stringify({ lat, lng, accuracy }),
          });
        } catch {
          // silent — retries on next interval
        }
      }
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          locationSub.current?.remove();
          locationSub.current = null;
          await removeToken();
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>📍</Text>
        </View>
        <Text style={styles.logoText}>RWATRACK</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome */}
      <View style={styles.card}>
        <Text style={styles.welcomeTitle}>
          Welcome, {user?.firstName} {user?.lastName}!
        </Text>
        <Text style={styles.welcomeSub}>{user?.email}</Text>
        {user?.jobTitle ? <Text style={styles.jobTitle}>{user.jobTitle}</Text> : null}
      </View>

      {/* Tracking Status */}
      <View style={styles.statusCard}>
        <View style={[styles.statusDot, tracking ? styles.dotActive : styles.dotInactive]} />
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>
            {tracking ? "Location Tracking Active" : "Location Tracking Inactive"}
          </Text>
          <Text style={styles.statusSub}>
            {tracking
              ? "Your location is being monitored for work verification."
              : "Location tracking is not running."}
          </Text>
          {lastLocation ? (
            <Text style={styles.coordText}>
              Last: {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Work Location */}
      {user?.workAddress ? (
        <View style={styles.card}>
          <Text style={styles.infoLabel}>WORK LOCATION</Text>
          <Text style={styles.infoValue}>{user.workAddress}</Text>
        </View>
      ) : null}

      {/* Home Location */}
      {user?.homeAddress ? (
        <View style={styles.card}>
          <Text style={styles.infoLabel}>HOME LOCATION</Text>
          <Text style={styles.infoValue}>{user.homeAddress}</Text>
        </View>
      ) : null}

      {/* Privacy note */}
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Your location is collected periodically during working hours to confirm your assigned
          workplace. Data is used only for work-related purposes.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#eff6ff", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logoBox: {
    width: 36, height: 36, backgroundColor: "#3b82f6",
    borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  logoIcon: { fontSize: 18 },
  logoText: { fontSize: 18, fontWeight: "800", color: "#1e293b", flex: 1 },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8,
  },
  logoutText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: "#bfdbfe",
  },
  welcomeTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  jobTitle: { fontSize: 14, color: "#3b82f6", fontWeight: "600" },
  statusCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: "#bfdbfe",
    flexDirection: "row", alignItems: "flex-start",
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: 12 },
  dotActive: { backgroundColor: "#22c55e" },
  dotInactive: { backgroundColor: "#94a3b8" },
  statusText: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  statusSub: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  coordText: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  infoLabel: {
    fontSize: 11, color: "#94a3b8", fontWeight: "700",
    marginBottom: 4, letterSpacing: 0.5,
  },
  infoValue: { fontSize: 14, color: "#1e293b" },
  noteCard: { backgroundColor: "#dbeafe", borderRadius: 12, padding: 14, marginTop: 4 },
  noteText: { fontSize: 12, color: "#1d4ed8", lineHeight: 18, textAlign: "center" },
});
