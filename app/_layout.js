import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  getInitialNotification,
  AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize state to check if user is authenticated

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        setIsAuthenticated(true); // Token exists, user is authenticated
      } else {
        setIsAuthenticated(false); // No token, user is not authenticated
      }
    };

    checkToken(); // Run the token check on mount
  }, []);

  useEffect(() => {
    const messagingInstance = getMessaging(getApp());

    const requestUserPermission = async () => {
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

     
    };

    const setupMessaging = async () => {
      await requestUserPermission();

      const token = await getToken(messagingInstance);
      console.log("FCM Token:", token);
      

      // Handle app opened from quit state
      const initialNotification = await getInitialNotification(messagingInstance);
      if (initialNotification) {
        console.log(
          "Notification opened from quit state:",
          initialNotification.notification
        );
      }

      // Handle foreground messages
      const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
       

        const newNotification = {
          id: Date.now().toString(),
          title: remoteMessage.notification?.title || "New Message",
          message: remoteMessage.notification?.body || "You have a new notification",
          time: new Date().toISOString(),
          read: false,
          icon: "notifications",
          color: "#4CAF50",
        };

        // Save notification to AsyncStorage
        const existing = await AsyncStorage.getItem("notifications");
        const notifications = existing ? JSON.parse(existing) : [];
        notifications.unshift(newNotification);
        await AsyncStorage.setItem("notifications", JSON.stringify(notifications));

        Alert.alert("New Notification", newNotification.message);
      });

      return unsubscribe;
    };

    const unsubscribe = setupMessaging();

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    // Show loading spinner while checking the token
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack initialRouteName={isAuthenticated ? "(tabs)" : "(login)"}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
          <Stack.Screen name="PrivacyPolicy" options={{ headerShown: false }} />
          <Stack.Screen name="TermsConditions" options={{ headerShown: false }} />
          <Stack.Screen name="Support" options={{ headerShown: false }} />
          <Stack.Screen
            name="TutorialDetailScreen"
            options={{
              title: "Tutorial Detail",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#1E1E2E" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="TopicViewScreen"
            options={{
              title: "Topic Detail",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#1E1E2E" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              title: "Notifications",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#1E1E2E" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="ProblemDetail"
            options={{
              title: "Problem Detail",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#1E1E2E" },
              headerTintColor: "#fff",
            }}
          />
          {/* Conditionally render the initial route */}
          {/* The initialRouteName is now handled dynamically */}
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
