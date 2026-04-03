import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { enableScreens } from "react-native-screens";
import { getToken, getUser } from "./src/lib/auth";
import LoginScreen from "./src/screens/LoginScreen";
import LocationPermissionScreen from "./src/screens/LocationPermissionScreen";
import HomeScreen from "./src/screens/HomeScreen";

enableScreens();

export type RootStackParamList = {
  Login: undefined;
  LocationPermission: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const user = await getUser();
      setInitialRoute(token && user ? "Home" : "Login");
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
});
