import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function TermsAndConditions() {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms and Conditions</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last updated: February 2, 2026
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing and using ByteBodh application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use this application.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Use License
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Permission is granted to temporarily download one copy of the materials on ByteBodh's application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Modify or copy the materials
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Use the materials for any commercial purpose or for any public display
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Attempt to reverse engineer any software contained in the application
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Remove any copyright or other proprietary notations from the materials
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. User Account
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. ByteBodh reserves the right to refuse service, terminate accounts, or remove content at our sole discretion.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. User Content
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Users may post, upload, or submit content to the application. You retain ownership of any intellectual property rights that you hold in that content. By posting content, you grant ByteBodh a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, and publish such content.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Prohibited Activities
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You agree not to engage in any of the following prohibited activities:
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Violating laws and regulations
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Publishing false, inaccurate, or misleading information
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Harassing, abusing, or harming another person
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Transmitting or uploading viruses or malicious code
          </Text>
          <Text style={[styles.listItem, { color: colors.text }]}>
            • Attempting to gain unauthorized access to the application
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Intellectual Property
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The application and its original content, features, and functionality are owned by ByteBodh and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Disclaimer
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The materials on ByteBodh's application are provided on an 'as is' basis. ByteBodh makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Limitations
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            In no event shall ByteBodh or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ByteBodh's application.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Changes to Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            ByteBodh may revise these Terms and Conditions at any time without notice. By using this application, you agree to be bound by the current version of these Terms and Conditions.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Contact Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about these Terms and Conditions, please contact us through the Contact page in the application.
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
