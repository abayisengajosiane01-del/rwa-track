import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { removeToken } from "../lib/auth";

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, "LocationPermission"> };

export default function LocationPermissionScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location access is required to use this app. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== "granted") {
        Alert.alert(
          "Background Location",
          "Background location is needed for work verification. You can enable it in settings.",
          [{ text: "Continue Anyway", onPress: () => navigation.replace("Home") }, { text: "Cancel" }]
        );
        return;
      }
      navigation.replace("Home");
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    Alert.alert(
      "Cannot Continue",
      "Location access is essential for this system. You will be signed out.",
      [
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await removeToken();
            navigation.replace("Login");
          },
        },
        { text: "Go Back", style: "cancel" },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>📍</Text>
      </View>

      <Text style={styles.title}>Location Access Required</Text>

      <Text style={styles.body}>
        To continue using this application, we require access to your location.
      </Text>
      <Text style={styles.body}>
        This system is designed to help verify work presence and manage assigned job locations.
        Your location may be collected periodically during working hours to confirm your assigned
        workplace and ensure accurate records.
      </Text>

      <View style={styles.consentBox}>
        <Text style={styles.consentTitle}>By tapping "Allow", you agree to:</Text>
        {[
          "Share your location while using the app",
          "Allow background location updates for work verification purposes",
        ].map((item) => (
          <Text key={item} style={styles.consentItem}>• {item}</Text>
        ))}
      </View>

      <Text style={styles.denyNote}>
        If you choose "Deny", you will not be able to access the system, as location data is
        essential for its functionality.
      </Text>

      <Text style={styles.privacyNote}>
        We are committed to using your data responsibly and only for work-related purposes.
      </Text>

      <TouchableOpacity style={styles.allowButton} onPress={handleAllow} disabled={loading}>
        <Text style={styles.allowText}>{loading ? "Requesting..." : "Allow"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.denyButton} onPress={handleDeny} disabled={loading}>
        <Text style={styles.denyText}>Deny</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#eff6ff", paddingHorizontal: 24, paddingVertical: 48, alignItems: "center" },
  iconBox: { width: 80, height: 80, backgroundColor: "#dbeafe", borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  iconText: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: "800", color: "#1e293b", textAlign: "center", marginBottom: 16 },
  body: { fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 22, marginBottom: 12 },
  consentBox: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#bfdbfe", padding: 16, width: "100%", marginVertical: 16 },
  consentTitle: { fontSize: 14, fontWeight: "700", color: "#1e293b", marginBottom: 8 },
  consentItem: { fontSize: 13, color: "#475569", lineHeight: 22 },
  denyNote: { fontSize: 13, color: "#ef4444", textAlign: "center", marginBottom: 12, lineHeight: 20 },
  privacyNote: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 32, lineHeight: 18 },
  allowButton: { backgroundColor: "#3b82f6", borderRadius: 10, paddingVertical: 14, width: "100%", alignItems: "center", marginBottom: 12 },
  allowText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  denyButton: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingVertical: 14, width: "100%", alignItems: "center" },
  denyText: { color: "#64748b", fontSize: 16, fontWeight: "600" },
});
