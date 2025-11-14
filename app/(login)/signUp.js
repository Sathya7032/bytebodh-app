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
import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const [isFocused, setIsFocused] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("success"); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState("");

  const handleFocus = (field) =>
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  const handleBlur = (field) =>
    setIsFocused((prev) => ({ ...prev, [field]: false }));

  const API_URL = "https://bytebodh.codewithsathya.info/register/"; // change if needed

  const showModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSignUp = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      showModal("error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      showModal("error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          password2: confirmPassword,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        showModal("success", "Account created successfully!");
      } else {
        const errorMsg =
          data?.password?.[0] ||
          data?.email?.[0] ||
          data?.username?.[0] ||
          "Something went wrong. Try again.";
        showModal("error", errorMsg);
      }
    } catch (error) {
      setLoading(false);
      showModal("error", "Could not connect to the server.");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      router.push("/(login)");
    }
  };

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ByteBodh to start learning</Text>
          </View>

          {/* Input Fields */}
          {["username", "email", "password", "confirmPassword"].map(
            (field, idx) => (
              <View key={idx} style={styles.inputContainer}>
                <Text style={styles.label}>
                  {field === "confirmPassword"
                    ? "Confirm Password *"
                    : `${field.charAt(0).toUpperCase() + field.slice(1)} *`}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused[field] && styles.inputFocused,
                  ]}
                  placeholder={`Enter your ${
                    field === "confirmPassword" ? "password again" : field
                  }`}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  keyboardType={field === "email" ? "email-address" : "default"}
                  secureTextEntry={
                    field === "password" || field === "confirmPassword"
                  }
                  value={formData[field]}
                  onChangeText={(text) =>
                    setFormData({ ...formData, [field]: text })
                  }
                  onFocus={() => handleFocus(field)}
                  onBlur={() => handleBlur(field)}
                />
              </View>
            )
          )}

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
              <Text>
                <TouchableOpacity onPress={() => router.push("/termsConditions")}>
                  <Text style={styles.termsLink}>Terms of Service</Text>
                </TouchableOpacity>
              </Text>{" "}
              ,{" "}
              <Text>
                <TouchableOpacity onPress={() => router.push("/PrivacyPolicy")}>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </Text>
            </Text>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(login)")}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Built-in React Native Modal */}
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
  subtitle: {
    fontSize: 16,
    color: "#003153",
    textAlign: "center",
    opacity: 0.7,
  },
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
  termsContainer: { marginBottom: 24 },
  termsText: {
    fontSize: 14,
    color: "#003153",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: { color: "#003153", fontWeight: "600" },
  signUpButton: {
    backgroundColor: "#003153",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  signUpButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: { fontSize: 14, color: "#003153", opacity: 0.7 },
  signInLink: { fontSize: 14, color: "#003153", fontWeight: "600" },

  // Modal styles
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
