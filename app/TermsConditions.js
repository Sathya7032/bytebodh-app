import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsConditions() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms & Conditions</Text>
          <Text style={styles.subtitle}>Last updated: December 2024</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Welcome to ByteBodh. By accessing or using our mobile application, you agree to be bound by these Terms and Conditions.
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By creating an account or using ByteBodh, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </Text>

          <Text style={styles.sectionTitle}>2. Account Registration</Text>
          <Text style={styles.paragraph}>
            • You must be at least 13 years old to use ByteBodh{'\n'}
            • You are responsible for maintaining account confidentiality{'\n'}
            • You must provide accurate and complete information{'\n'}
            • One account per user is permitted
          </Text>

          <Text style={styles.sectionTitle}>3. Subscription and Payments</Text>
          <Text style={styles.paragraph}>
            • Premium features require subscription{'\n'}
            • Payments are processed through secure third-party providers{'\n'}
            • Subscription automatically renews unless canceled{'\n'}
            • Refunds are subject to our refund policy
          </Text>

          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:{'\n'}
            • Share your account with others{'\n'}
            • Use the app for any illegal purpose{'\n'}
            • Attempt to hack or reverse engineer the app{'\n'}
            • Upload malicious code or content{'\n'}
            • Violate intellectual property rights
          </Text>

          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All course content, materials, and the ByteBodh application are protected by copyright and other intellectual property laws. You may not distribute, modify, or create derivative works without permission.
          </Text>

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            ByteBodh is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the application.
          </Text>

          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account if you violate these terms. You may terminate your account at any time through the app settings.
          </Text>

          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these terms periodically. Continued use of the app after changes constitutes acceptance of the modified terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms & Conditions:{'\n\n'}
            <Text style={styles.highlight}>legal@bytebodh.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003153',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003153',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  highlight: {
    color: '#003153',
    fontWeight: '600',
  },
});