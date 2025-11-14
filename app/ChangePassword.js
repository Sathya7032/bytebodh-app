import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./auth/axiosInstance"; // ✅ axios instance
import { router } from "expo-router";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // ✅ Password changed successfully
      Alert.alert("Success", response.data.message);

      // --- Logout user automatically ---
      await handleLogout();
    } catch (error) {
      console.log("Change password error:", error.response?.data || error.message);
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.new_password?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        "Failed to change password.";
      Alert.alert("Error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout user (same as your account screen)
  const handleLogout = async () => {
    try {
      const refresh = await AsyncStorage.getItem("refreshToken");

      if (refresh) {
        await api.post("/logout/", { refresh });
      }

      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      router.replace("/(login)");
    } catch (error) {
      console.log("Logout error:", error.response?.data || error.message);
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      router.replace("/(login)");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Change Password</Text>

          {/* Current Password */}
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            show={showPassword.current}
            toggle={() =>
              setShowPassword((prev) => ({ ...prev, current: !prev.current }))
            }
          />

          {/* New Password */}
          <PasswordField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            show={showPassword.new}
            toggle={() =>
              setShowPassword((prev) => ({ ...prev, new: !prev.new }))
            }
          />

          {/* Confirm Password */}
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showPassword.confirm}
            toggle={() =>
              setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
            }
          />

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ✅ Reusable password field component
const PasswordField = ({ label, value, onChangeText, show, toggle }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.passwordWrapper}>
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor="#999"
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={styles.eyeIcon} onPress={toggle}>
        <Ionicons
          name={show ? "eye-off-outline" : "eye-outline"}
          size={22}
          color="#003153"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#003153",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003153",
    marginBottom: 8,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#003153",
  },
  eyeIcon: {
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: "#003153",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
