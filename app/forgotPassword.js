import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../lib/api';

const ForgotPassword = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1: Send OTP to Email
  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      console.log('🔵 Sending OTP to:', email);
      
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, null, {
        params: { email }
      });
      
      Alert.alert('Success', 'OTP has been sent to your email');
      setStep(2);
    } catch (error) {
      console.error('❌ Send OTP Error:', error);
      const msg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password (with OTP verification)
  const handleResetPassword = async () => {
    const newErrors = {};
    
    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length < 4) {
      newErrors.otp = 'Please enter a valid OTP';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      console.log('🔵 Resetting password with OTP verification');
      
      await axios.post(`${API_BASE_URL}/auth/reset-password`, null, {
        params: { 
          email, 
          otp, 
          newPassword 
        }
      });
      
      Alert.alert(
        'Success',
        'Password has been reset successfully. Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(login)')
          }
        ]
      );
    } catch (error) {
      console.error('❌ Reset Password Error:', error);
      const msg = error.response?.data?.message || 'Failed to reset password. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={colors.gradient}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header - Company Branding */}
            <View style={styles.header}>
             

              <View style={styles.brandContainer}>
                <Text style={styles.companyName}>
                  BYTE<Text style={styles.companyNameHighlight}>BODH</Text>
                </Text>
                <Text style={styles.tagline}>Learn • Code • Grow</Text>
              </View>
            </View>

            {/* Form Container - Bottom Section */}
            <View style={styles.formContainer}>
              {/* Step Indicator */}
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
              </View>

              {/* Step 1: Email Input */}
              {step === 1 && (
                <>
                  <View style={styles.formHeader}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                      Enter your email address and we'll send you an OTP to reset your password
                    </Text>
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={colors.mediumGray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.mediumGray}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={colors.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2: OTP & New Password */}
              {step === 2 && (
                <>
                  <View style={styles.formHeader}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                      Enter the OTP sent to {email} and your new password
                    </Text>
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="key-outline"
                        size={20}
                        color={colors.mediumGray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter OTP"
                        placeholderTextColor={colors.mediumGray}
                        value={otp}
                        onChangeText={(text) => {
                          setOtp(text);
                          if (errors.otp) setErrors({ ...errors, otp: null });
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                    {errors.otp && (
                      <Text style={styles.errorText}>{errors.otp}</Text>
                    )}
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.mediumGray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="New Password"
                        placeholderTextColor={colors.mediumGray}
                        value={newPassword}
                        onChangeText={(text) => {
                          setNewPassword(text);
                          if (errors.newPassword) setErrors({ ...errors, newPassword: null });
                        }}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color={colors.mediumGray}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.newPassword && (
                      <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.mediumGray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Confirm Password"
                        placeholderTextColor={colors.mediumGray}
                        value={confirmPassword}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                        }}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color={colors.mediumGray}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                  </View>

                  {/* Password Requirements */}
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsTitle}>Password must contain:</Text>
                    <View style={styles.requirement}>
                      <Ionicons
                        name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={newPassword.length >= 8 ? colors.success : colors.mediumGray}
                      />
                      <Text style={styles.requirementText}>At least 8 characters</Text>
                    </View>
                    <View style={styles.requirement}>
                      <Ionicons
                        name={/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? colors.success : colors.mediumGray}
                      />
                      <Text style={styles.requirementText}>Uppercase & lowercase letters</Text>
                    </View>
                    <View style={styles.requirement}>
                      <Ionicons
                        name={/\d/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={/\d/.test(newPassword) ? colors.success : colors.mediumGray}
                      />
                      <Text style={styles.requirementText}>At least one number</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={colors.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={styles.primaryButtonText}>Reset Password</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleResendOTP}
                    style={styles.resendButton}
                    disabled={loading}
                  >
                    <Text style={styles.resendText}>
                      Didn't receive OTP? <Text style={styles.resendLink}>Resend</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Back to Login */}
              <View style={styles.backToLoginContainer}>
                <Text style={styles.backToLoginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.replace('/(login)')}>
                  <Text style={styles.backToLoginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  brandContainer: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  companyNameHighlight: {
    color: '#FFD700',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 3,
    fontWeight: '600',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.mediumGray,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.lightGray,
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  formHeader: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mediumGray,
    lineHeight: 22,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkGray,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  requirementsContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  requirementsTitle: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 8,
    fontWeight: '600',
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 12,
    color: colors.mediumGray,
    marginLeft: 8,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: colors.mediumGray,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    color: colors.mediumGray,
    fontSize: 14,
  },
  backToLoginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ForgotPassword;
