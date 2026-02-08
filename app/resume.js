import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from '../contexts/ThemeContext';
import { getMyProfile } from '../lib/profileService';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const Resume = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [profile, setProfile] = useState(null);

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and contemporary design with bold headers',
      color: '#3b82f6',
      icon: 'sparkles',
      preview: require('../assets/images/icon.png'), // Replace with actual template preview
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional professional layout',
      color: '#1e293b',
      icon: 'document-text',
      preview: require('../assets/images/icon.png'),
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Colorful and unique design for creative professionals',
      color: '#8b5cf6',
      icon: 'color-palette',
      preview: require('../assets/images/icon.png'),
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant with plenty of white space',
      color: '#64748b',
      icon: 'remove',
      preview: require('../assets/images/icon.png'),
    },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getMyProfile();
      const data = response.data || {};
      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        headline: data.headline || '',
        summary: data.summary || '',
        skills: data.skills || [],
        education: data.education || [],
        experience: data.experience || [],
        projects: data.projects || [],
        socialMediaLinks: data.socialMediaLinks || [],
        certifications: data.certifications || [],
        pictureUrl: data.pictureUrl || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const generateHTMLContent = (templateId) => {
    if (!profile) return '';

    const templateStyles = {
      modern: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        fontFamily: 'Arial, sans-serif',
        headerBg: '#3b82f6',
        headerText: '#ffffff'
      },
      classic: {
        primaryColor: '#1e293b',
        secondaryColor: '#475569',
        fontFamily: 'Georgia, serif',
        headerBg: '#1e293b',
        headerText: '#ffffff'
      },
      creative: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#6d28d9',
        fontFamily: 'Verdana, sans-serif',
        headerBg: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        headerText: '#ffffff'
      },
      minimal: {
        primaryColor: '#64748b',
        secondaryColor: '#94a3b8',
        fontFamily: 'Helvetica, Arial, sans-serif',
        headerBg: '#ffffff',
        headerText: '#1e293b'
      }
    };

    const style = templateStyles[templateId] || templateStyles.modern;

    const socialLinks = profile.socialMediaLinks.map(link => 
      `<a href="${link.profileUrl}" style="color: ${style.primaryColor}; text-decoration: none; margin-right: 15px;">${link.platform}</a>`
    ).join('');

    const skills = profile.skills.map(skill => 
      `<span style="display: inline-block; background: ${style.primaryColor}20; color: ${style.primaryColor}; padding: 5px 12px; margin: 4px; border-radius: 15px; font-size: 13px;">${skill}</span>`
    ).join('');

    const education = profile.education.map(edu => `
      <div style="margin-bottom: 20px;">
        <h3 style="color: ${style.primaryColor}; margin: 5px 0; font-size: 16px;">${edu.degree}</h3>
        <p style="margin: 5px 0; color: ${style.secondaryColor}; font-weight: 600;">${edu.institution}</p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">${edu.startYear} - ${edu.endYear}${edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ''}</p>
      </div>
    `).join('');

    const experience = profile.experience.map(exp => `
      <div style="margin-bottom: 20px;">
        <h3 style="color: ${style.primaryColor}; margin: 5px 0; font-size: 16px;">${exp.jobTitle}</h3>
        <p style="margin: 5px 0; color: ${style.secondaryColor}; font-weight: 600;">${exp.company} • ${exp.location}</p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">${exp.startMonth}/${exp.startYear} - ${exp.currentlyWorking ? 'Present' : `${exp.endMonth}/${exp.endYear}`}</p>
        ${exp.description ? `<p style="margin: 10px 0; line-height: 1.6; color: #333;">${exp.description}</p>` : ''}
      </div>
    `).join('');

    const projects = profile.projects.map(project => `
      <div style="margin-bottom: 20px;">
        <h3 style="color: ${style.primaryColor}; margin: 5px 0; font-size: 16px;">${project.title}</h3>
        ${project.techStack ? `<p style="margin: 5px 0; color: ${style.secondaryColor}; font-size: 13px;"><strong>Tech Stack:</strong> ${project.techStack}</p>` : ''}
        ${project.description ? `<p style="margin: 10px 0; line-height: 1.6; color: #333;">${project.description}</p>` : ''}
        ${project.projectUrl ? `<a href="${project.projectUrl}" style="color: ${style.primaryColor}; text-decoration: none;">View Project →</a>` : ''}
      </div>
    `).join('');

    const certifications = profile.certifications.map(cert => `
      <div style="margin-bottom: 15px;">
        <h3 style="color: ${style.primaryColor}; margin: 5px 0; font-size: 16px;">${cert.name}</h3>
        ${cert.startDate ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${new Date(cert.startDate).toLocaleDateString()} - ${cert.endDate ? new Date(cert.endDate).toLocaleDateString() : 'Present'}</p>` : ''}
        ${cert.description ? `<p style="margin: 5px 0; color: #333;">${cert.description}</p>` : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: ${style.fontFamily}; 
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: #fff;
          }
          .header {
            background: ${style.headerBg};
            color: ${style.headerText};
            padding: 40px 30px;
            text-align: ${templateId === 'minimal' ? 'left' : 'center'};
            ${templateId === 'minimal' ? 'border-bottom: 3px solid ' + style.primaryColor + ';' : ''}
          }
          .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header .headline {
            font-size: 18px;
            margin-bottom: 15px;
            opacity: 0.9;
          }
          .contact-info {
            font-size: 14px;
            margin-top: 15px;
            opacity: 0.85;
          }
          .content {
            padding: 30px;
          }
          .section {
            margin-bottom: 35px;
          }
          .section-title {
            color: ${style.primaryColor};
            font-size: 22px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid ${style.primaryColor};
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .summary {
            line-height: 1.8;
            color: #444;
            font-size: 15px;
          }
          a { color: ${style.primaryColor}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${profile.fullName || 'Your Name'}</h1>
            ${profile.headline ? `<div class="headline">${profile.headline}</div>` : ''}
            <div class="contact-info">
              ${profile.email ? `📧 ${profile.email}` : ''}
              ${profile.mobileNumber ? ` | 📱 ${profile.mobileNumber}` : ''}
            </div>
            ${socialLinks ? `<div style="margin-top: 15px;">${socialLinks}</div>` : ''}
          </div>
          
          <div class="content">
            ${profile.summary ? `
              <div class="section">
                <h2 class="section-title">Summary</h2>
                <p class="summary">${profile.summary}</p>
              </div>
            ` : ''}
            
            ${profile.skills.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Skills</h2>
                <div style="line-height: 2;">${skills}</div>
              </div>
            ` : ''}
            
            ${profile.experience.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Experience</h2>
                ${experience}
              </div>
            ` : ''}
            
            ${profile.education.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Education</h2>
                ${education}
              </div>
            ` : ''}
            
            ${profile.projects.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Projects</h2>
                ${projects}
              </div>
            ` : ''}
            
            ${profile.certifications.length > 0 ? `
              <div class="section">
                <h2 class="section-title">Certifications</h2>
                ${certifications}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleGenerateResume = async (templateId) => {
    if (!profile) {
      Alert.alert('Error', 'No profile data available');
      return;
    }

    try {
      setGenerating(true);
      const html = generateHTMLContent(templateId);
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Resume',
          UTI: 'public.item'
        });
      } else {
        Alert.alert('Success', `Resume saved at: ${uri}`);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      Alert.alert('Error', 'Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  };

  const renderTemplateCard = (template) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        { 
          backgroundColor: colors.cardBackground,
          borderColor: selectedTemplate === template.id ? template.color : colors.border,
          borderWidth: selectedTemplate === template.id ? 2 : 1
        }
      ]}
      onPress={() => setSelectedTemplate(template.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.templatePreview, { backgroundColor: template.color + '10' }]}>
        <Ionicons name={template.icon} size={48} color={template.color} />
      </View>
      
      <View style={styles.templateInfo}>
        <View style={styles.templateHeader}>
          <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
          {selectedTemplate === template.id && (
            <View style={[styles.selectedBadge, { backgroundColor: template.color }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
        <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
          {template.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Resume Builder</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.notificationButton} 
              onPress={() => router.push('/notifications')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => setDrawerVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu-outline" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Select a template and generate your professional resume using your portfolio data
          </Text>
        </View>

        {/* Templates Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a Template</Text>
        <View style={styles.templatesGrid}>
          {templates.map(renderTemplateCard)}
        </View>

        {/* Preview & Download Button */}
        {selectedTemplate && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.previewButton, { borderColor: colors.primary, backgroundColor: colors.background }]}
              onPress={() => setShowPreview(true)}
            >
              <Ionicons name="eye-outline" size={20} color={colors.primary} />
              <Text style={[styles.previewButtonText, { color: colors.primary }]}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: colors.primary }]}
              onPress={() => handleGenerateResume(selectedTemplate)}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.downloadButtonText}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Summary */}
        {profile && (
          <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Your Profile Data</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="person" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                {profile.fullName || 'Name not set'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="briefcase" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                {profile.experience?.length || 0} Experience(s)
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="school" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                {profile.education?.length || 0} Education(s)
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="code-slash" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                {profile.skills?.length || 0} Skill(s)
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="folder" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                {profile.projects?.length || 0} Project(s)
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={[styles.previewModal, { backgroundColor: colors.background }]}>
          <View style={[styles.previewHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
            <TouchableOpacity onPress={() => {
              setShowPreview(false);
              handleGenerateResume(selectedTemplate);
            }}>
              <Ionicons name="download" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.previewContent}>
            <Text style={[styles.previewNote, { color: colors.textSecondary }]}>
              This is a simplified preview. The actual PDF will have better formatting.
            </Text>
            {/* Simplified preview rendering would go here */}
            <View style={[styles.previewCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.previewText, { color: colors.text }]}>
                {profile?.fullName || 'Your Name'}
              </Text>
              <Text style={[styles.previewSubtext, { color: colors.textSecondary }]}>
                {profile?.headline || 'Your Headline'}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <CustomDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 12 : 15,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    flex: 1,
    marginLeft: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    position: 'relative',
  },
  menuButton: {},
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: isSmallDevice ? 16 : 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 25,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  templatesGrid: {
    gap: 15,
    marginBottom: 25,
  },
  templateCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  templatePreview: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateInfo: {
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
  },
  previewModal: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewNote: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  previewCard: {
    padding: 20,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewSubtext: {
    fontSize: 16,
  },
});

export default Resume;
