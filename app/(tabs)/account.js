import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import api from "../auth/axiosInstance"; // ✅ use your axios instance

const { width } = Dimensions.get("window");

export default function AccountScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ Fetch user details from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error fetching user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Logout handler using axiosInstance
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const refresh = await AsyncStorage.getItem("refreshToken");
      if (!refresh) throw new Error("No refresh token found");

      // Call Django logout API
      await api.post("/logout/", { refresh });

      // Clear local storage
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);

      setLogoutModalVisible(false);
      router.replace("/(login)");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      alert("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#003153" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>No user data found. Please login.</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.signInButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const menuItems = [
    { title: "Edit Profile", icon: "👤", onPress: () => alert("Edit Profile") },
    { title: "Privacy Policy", icon: "🛡️", onPress: () => router.push("/PrivacyPolicy") },
    { title: "Terms & Conditions", icon: "📝", onPress: () => router.push("/TermsConditions") },
    { title: "Change Password", icon: "🔒", onPress: () => router.push('/ChangePassword') },
    { title: "Help & Support", icon: "💬", onPress: () => router.push("/Support") },
    { title: "Logout", icon: "🚪", onPress: () => setLogoutModalVisible(true), isLogout: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, item.isLogout && styles.logoutItem]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.menuText,
                      item.isLogout && styles.logoutText,
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ByteBodh v1.0.0</Text>
        </View>
      </ScrollView>

      {/* ✅ Custom Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout from ByteBodh?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
                disabled={loggingOut}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.logoutButton]}
                onPress={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.logoutTextBtn}>Logout</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#003153", fontSize: 16, marginBottom: 16 },
  signInButton: {
    backgroundColor: "#003153",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signInButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  profileSection: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f8f9fa",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#003153",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 6,
  },
  avatarText: { color: "#fff", fontSize: 42, fontWeight: "700" },
  name: { fontSize: 26, fontWeight: "700", color: "#003153", marginBottom: 8 },
  email: { fontSize: 16, color: "#666" },

  menuContainer: {},
  menuItem: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuIcon: { fontSize: 22, marginRight: 16 },
  menuText: { fontSize: 18, color: "#333" },
  arrow: { fontSize: 24, color: "#999" },
  logoutItem: { backgroundColor: "#fff5f5" },
  logoutText: { color: "#ff4d4d", fontWeight: "700" },

  versionContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f8f9fa",
  },
  versionText: { fontSize: 14, color: "#999" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#003153",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#f0f0f0" },
  cancelText: { color: "#333", fontSize: 16, fontWeight: "600" },
  logoutButton: { backgroundColor: "#003153" },
  logoutTextBtn: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
