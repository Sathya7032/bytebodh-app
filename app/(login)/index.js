import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false,
  });
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("error"); // 'success' | 'error'
  const [modalMessage, setModalMessage] = useState("");

  const API_URL = "https://bytebodh.codewithsathya.info/login/";

  const handleFocus = (field) =>
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  const handleBlur = (field) =>
    setIsFocused((prev) => ({ ...prev, [field]: false }));

  const showModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    const { username, password } = formData;

    if (!username || !password) {
      showModal("error", "Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("accessToken", data.token.access);
        await AsyncStorage.setItem("refreshToken", data.token.refresh);

        showModal("success", `Welcome back, ${data.user.username}!`);
        setTimeout(() => {
          setModalVisible(false);
          router.push("/(tabs)");
        }, 1200);
      } else {
        const errorMsg =
          data?.detail || "Invalid credentials. Please try again.";
        showModal("error", errorMsg);
      }
    } catch (error) {
      setLoading(false);
      showModal("error", "Network Error: Could not connect to the server.");
    }
  };

  const handleModalClose = () => setModalVisible(false);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[styles.input, isFocused.username && styles.inputFocused]}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              onFocus={() => handleFocus("username")}
              onBlur={() => handleBlur("username")}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View
              style={[
                styles.input,
                styles.passwordField,
                isFocused.password && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#003153"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signUp")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ✅ Matching Modal (same as SignUp) */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View
                style={[
                  styles.iconWrapper,
                  {
                    backgroundColor:
                      modalType === "success" ? "#d1f7c4" : "#ffd1d1",
                  },
                ]}
              >
                <Ionicons
                  name={
                    modalType === "success"
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={60}
                  color={modalType === "success" ? "#2e7d32" : "#d32f2f"}
                />
              </View>
              <Text style={styles.modalTitle}>
                {modalType === "success" ? "Success!" : "Error"}
              </Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleModalClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "700", color: "#003153", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#003153", opacity: 0.7 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#003153", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#003153",
    backgroundColor: "#fff",
  },
  inputFocused: { borderColor: "#003153", backgroundColor: "#f8f9fa" },
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#003153",
    paddingVertical: 0,
  },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { fontSize: 14, color: "#003153", fontWeight: "500" },
  signInButton: {
    backgroundColor: "#003153",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  signInButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  signUpContainer: { flexDirection: "row", justifyContent: "center" },
  signUpText: { fontSize: 14, color: "#003153", opacity: 0.7 },
  signUpLink: { fontSize: 14, color: "#003153", fontWeight: "600" },

  // ✅ Modal styles (same as SignUp)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#003153",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#003153",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
