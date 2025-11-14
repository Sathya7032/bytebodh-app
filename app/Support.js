import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Support() {
  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      action: 'mailto:support@bytebodh.com',
      icon: '📧'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: null,
      icon: '💬'
    },
    {
      title: 'Help Center',
      description: 'Browse help articles',
      action: null,
      icon: '📚'
    },
    {
      title: 'Report a Bug',
      description: 'Found an issue? Let us know',
      action: 'mailto:bugs@bytebodh.com',
      icon: '🐛'
    }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings → Change Password, or use the Forgot Password feature on the login screen.'
    },
    {
      question: 'Can I use ByteBodh on multiple devices?',
      answer: 'Yes, your progress syncs across all devices when you log in with the same account.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'Go to Account → Subscriptions to manage your subscription settings.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 7-day free trial for all new premium subscriptions.'
    }
  ];

  const handleContact = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      // Handle actions that don't require linking
      alert('This feature is coming soon!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>We're here to help you learn better</Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          {contactMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={() => handleContact(method.action)}
            >
              <Text style={styles.contactIcon}>{method.icon}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Support Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Support Hours</Text>
          <Text style={styles.infoText}>Monday - Friday: 9:00 AM - 6:00 PM IST</Text>
          <Text style={styles.infoText}>Weekends: 10:00 AM - 4:00 PM IST</Text>
          
          <Text style={[styles.infoTitle, { marginTop: 16 }]}>Emergency Support</Text>
          <Text style={styles.infoText}>For critical issues outside business hours:</Text>
          <Text style={styles.highlight}>emergency@bytebodh.com</Text>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ByteBodh v1.0.0</Text>
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
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003153',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003153',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  faqItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003153',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    padding: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003153',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  highlight: {
    color: '#003153',
    fontWeight: '600',
    marginTop: 4,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});