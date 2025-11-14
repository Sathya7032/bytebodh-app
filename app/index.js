import { router } from "expo-router";
import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#003153" }}>
      {/* Top Section - App Info */}
      <View style={styles.topContainer}>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>ByteBodh</Text>
          <Text style={styles.subTitle}>Master IT Technologies</Text>
        </View>
      </View>

      {/* Bottom Section - Auth Buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.authContent}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.description}>
            Start your learning journey with ByteBodh
          </Text>
          
          <TouchableOpacity style={styles.signInButton} onPress={()=>router.push('/(login)')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signUpButton} onPress={()=>router.push('/signUp')}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    height: height / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  appInfo: {
    alignItems: "center",
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  bottomContainer: {
    height: height / 2,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
  },
  authContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003153",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: "#003153",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signInButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#003153",
  },
  signUpButtonText: {
    color: "#003153",
    fontSize: 18,
    fontWeight: "600",
  },
});