import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function PrivacyPolicy() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {/* Custom Header with Back Button */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last updated: February 2, 2026
          </Text>

          <Text style={[styles.paragraph, { color: colors.text }]}>
            ByteBodh ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>
            Personal Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may collect personal information that you voluntarily provide to us when you:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Register for an account
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Use the application's features
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Submit content or participate in forums
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Contact us for support
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This may include: name, email address, phone number, profile information, and any other information you choose to provide.
          </Text>

          <Text style={[styles.subSectionTitle, { color: colors.text }]}>
            Automatically Collected Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            When you use the application, we may automatically collect certain information, including:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Device information (model, operating system, unique device identifiers)
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Usage data (features used, time spent, interactions)
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Log data (IP address, browser type, access times)
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Location data (if you grant permission)
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Provide, operate, and maintain the application
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Improve, personalize, and expand our services
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Understand and analyze how you use the application
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Develop new products, services, and features
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Communicate with you for customer service and updates
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Send you promotional materials (with your consent)
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Detect and prevent fraud, security issues, and technical problems
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Sharing Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may share your information in the following situations:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • With service providers who perform services on our behalf
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • With business partners for joint services or features
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • When required by law or to protect our rights
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • In connection with a business transaction (merger, sale, etc.)
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • With your consent or at your direction
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Data Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Data Retention
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Your Privacy Rights
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Depending on your location, you may have the following rights:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Access and receive a copy of your personal data
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Correct inaccurate or incomplete data
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Request deletion of your personal data
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Object to or restrict processing of your data
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Data portability
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Withdraw consent at any time
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Children's Privacy
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Our application is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from a child, please contact us.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The application may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Changes to This Privacy Policy
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the application and updating the "Last updated" date. You are advised to review this Privacy Policy periodically.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us through the Contact page in the application.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 10,
  },
});
