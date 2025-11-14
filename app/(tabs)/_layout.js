import { router, Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function _layout() {
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E2E" />
      <Tabs
        screenOptions={() => ({
          headerStyle: { backgroundColor: "#1E1E2E" },
          headerTintColor: "#fff",
          headerTitleAlign: "left",
          headerTitle: () => (
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
              ByteBodh
            </Text>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => router.push('/notifications')}
                style={{ marginRight: 20 }}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => alert("Support")}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
          tabBarStyle: {
            backgroundColor: "#1E1E2E",
            borderTopWidth: 0,
            height: 60,
            paddingTop: 5, // extra space for safe area
          },
          tabBarActiveTintColor: "#00BFFF",
          tabBarInactiveTintColor: "#bbb",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="code"
          options={{
            title: "Code",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="code-slash-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
