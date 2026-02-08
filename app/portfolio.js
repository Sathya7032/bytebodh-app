import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from '../contexts/ThemeContext';
import { getMyProfile, updateProfile } from '../lib/profileService';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const Portfolio = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState(null);
  const [tempItem, setTempItem] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const [profile, setProfile] = useState({
    fullName: '',
    mobileNumber: '',
    username: '',
    email: '',
    headline: '',
    summary: '',
    isFresher: false,
    skills: [],
    education: [],
    experience: [],
    projects: [],
    socialMediaLinks: [],
    certifications: [],
    pictureUrl: ''
  });

  const tabs = [
    { id: 'personal', label: 'Personal', icon: 'person' },
    { id: 'professional', label: 'Professional', icon: 'briefcase' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'experience', label: 'Experience', icon: 'time' },
    { id: 'projects', label: 'Projects', icon: 'code-slash' },
    { id: 'skills', label: 'Skills', icon: 'construct' },
    { id: 'social', label: 'Social', icon: 'link' },
    { id: 'certifications', label: 'Certificates', icon: 'ribbon' },
  ];

  const socialPlatforms = [
    { value: 'LINKEDIN', label: 'LinkedIn', icon: 'logo-linkedin' },
    { value: 'GITHUB', label: 'GitHub', icon: 'logo-github' },
    { value: 'LEETCODE', label: 'LeetCode', icon: 'code' },
    { value: 'PORTFOLIO', label: 'Portfolio', icon: 'globe' }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getMyProfile();
      const data = response.data || {};
      setProfile({
        fullName: data.fullName || '',
        mobileNumber: data.mobileNumber || '',
        username: data.user?.username || '',
        email: data.email || '',
        headline: data.headline || '',
        summary: data.summary || '',
        isFresher: data.isFresher !== undefined ? data.isFresher : false,
        skills: data.skills || [],
        education: data.education || [],
        experience: data.experience || [],
        projects: data.projects || [],
        socialMediaLinks: data.socialMediaLinks || [],
        certifications: data.certifications || [],
        pictureUrl: data.pictureUrl || ''
      });
      if (data.pictureUrl) {
        setImageUri(data.pictureUrl);
      }
    } catch (err) {
      console.log('Profile error:', err);
      Alert.alert('Info', 'Profile not created yet. Please fill in your details.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile.fullName || !profile.email) {
      Alert.alert('Validation Error', 'Full Name and Email are required.');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      const payload = {
        fullName: profile.fullName,
        mobileNumber: profile.mobileNumber,
        email: profile.email,
        headline: profile.headline,
        summary: profile.summary,
        isFresher: profile.isFresher,
        skills: profile.skills,
        education: profile.education,
        experience: profile.experience,
        projects: profile.projects,
        socialMediaLinks: profile.socialMediaLinks,
        certifications: profile.certifications,
      };

      formData.append('profile', {
        string: JSON.stringify(payload),
        type: 'application/json'
      });

      if (imageUri && !imageUri.startsWith('http')) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          name: filename,
          type: type
        });
      }

      const response = await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Skill management
  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    Alert.alert('Remove Skill', 'Remove this skill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updatedSkills = profile.skills.filter((_, i) => i !== index);
          setProfile({ ...profile, skills: updatedSkills });
        }
      }
    ]);
  };

  // Education management
  const handleAddEducation = () => {
    setEditingSection('education');
    setTempItem({
      degree: '',
      fieldOfStudy: '',
      institution: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      cgpa: ''
    });
  };

  const handleSaveEducation = () => {
    if (!tempItem.degree || !tempItem.institution) {
      Alert.alert('Validation', 'Degree and Institution are required');
      return;
    }
    const updatedEducation = [...profile.education, tempItem];
    setProfile({ ...profile, education: updatedEducation });
    setEditingSection(null);
    setTempItem({});
    Alert.alert('Success', 'Education added successfully');
  };

  const handleRemoveEducation = (index) => {
    Alert.alert('Delete Education', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedEducation = profile.education.filter((_, i) => i !== index);
          setProfile({ ...profile, education: updatedEducation });
        }
      }
    ]);
  };

  // Experience management
  const handleAddExperience = () => {
    setEditingSection('experience');
    setTempItem({
      jobTitle: '',
      company: '',
      location: '',
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: '',
      endYear: '',
      currentlyWorking: false,
      description: ''
    });
  };

  const handleSaveExperience = () => {
    if (!tempItem.jobTitle || !tempItem.company) {
      Alert.alert('Validation', 'Job title and company are required');
      return;
    }
    const updatedExperience = [...profile.experience, tempItem];
    setProfile({ ...profile, experience: updatedExperience });
    setEditingSection(null);
    setTempItem({});
    Alert.alert('Success', 'Experience added successfully');
  };

  const handleRemoveExperience = (index) => {
    Alert.alert('Delete Experience', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedExperience = profile.experience.filter((_, i) => i !== index);
          setProfile({ ...profile, experience: updatedExperience });
        }
      }
    ]);
  };

  // Project management
  const handleAddProject = () => {
    setEditingSection('project');
    setTempItem({
      title: '',
      techStack: '',
      projectUrl: '',
      description: ''
    });
  };

  const handleSaveProject = () => {
    if (!tempItem.title) {
      Alert.alert('Validation', 'Project title is required');
      return;
    }
    const updatedProjects = [...profile.projects, tempItem];
    setProfile({ ...profile, projects: updatedProjects });
    setEditingSection(null);
    setTempItem({});
    Alert.alert('Success', 'Project added successfully');
  };

  const handleRemoveProject = (index) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedProjects = profile.projects.filter((_, i) => i !== index);
          setProfile({ ...profile, projects: updatedProjects });
        }
      }
    ]);
  };

  // Social links management
  const handleAddSocialLink = () => {
    setEditingSection('social');
    setTempItem({ platform: 'LINKEDIN', profileUrl: '' });
  };

  const handleSaveSocialLink = () => {
    if (!tempItem.profileUrl) {
      Alert.alert('Validation', 'Profile URL is required');
      return;
    }
    const updatedSocialLinks = [...profile.socialMediaLinks, tempItem];
    setProfile({ ...profile, socialMediaLinks: updatedSocialLinks });
    setEditingSection(null);
    setTempItem({});
    Alert.alert('Success', 'Social link added successfully');
  };

  const handleRemoveSocialLink = (index) => {
    Alert.alert('Delete Social Link', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedSocialLinks = profile.socialMediaLinks.filter((_, i) => i !== index);
          setProfile({ ...profile, socialMediaLinks: updatedSocialLinks });
        }
      }
    ]);
  };

  // Certification management
  const handleAddCertification = () => {
    setEditingSection('certification');
    setTempItem({ name: '', startDate: '', endDate: '', description: '' });
  };

  const handleSaveCertification = () => {
    if (!tempItem.name) {
      Alert.alert('Validation', 'Certification name is required');
      return;
    }
    const updatedCertifications = [...profile.certifications, tempItem];
    setProfile({ ...profile, certifications: updatedCertifications });
    setEditingSection(null);
    setTempItem({});
    Alert.alert('Success', 'Certification added successfully');
  };

  const handleRemoveCertification = (index) => {
    Alert.alert('Delete Certification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedCertifications = profile.certifications.filter((_, i) => i !== index);
          setProfile({ ...profile, certifications: updatedCertifications });
        }
      }
    ]);
  };

  // Reusable Modal Component
  const renderModal = ({ title, children, onSave, onCancel }) => (
    <Modal
      visible={!!editingSection}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {children}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={onSave}
            >
              <Text style={styles.submitButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={isSmallDevice ? 20 : 24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Portfolio</Text>
        <View style={styles.headerButtons}>
          {profile.username && (
            <TouchableOpacity 
              style={[styles.previewButton, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL(`https://www.bytebodh.in/portfolio/${profile.username}`)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="eye-outline" size={isSmallDevice ? 16 : 18} color="#fff" />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>
          )}
          
        </View>
      </View>
    </View>
  );

  const renderPersonalTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
      
      {/* Profile Image */}
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.lightGray }]}>
            <Ionicons name="person" size={isSmallDevice ? 48 : 60} color={colors.textSecondary} />
          </View>
        )}
        <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera" size={isSmallDevice ? 16 : 20} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        Tap to upload profile picture (Max 5MB)
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Full Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={profile.fullName}
          onChangeText={(text) => setProfile({ ...profile, fullName: text })}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={profile.mobileNumber}
          onChangeText={(text) => setProfile({ ...profile, mobileNumber: text })}
          placeholder="Enter your mobile number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Email <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          placeholder="Enter your email address"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textSecondary, borderColor: colors.border }]}
          value={profile.username}
          editable={false}
          placeholder="Your portfolio URL identifier"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          This is used for your portfolio URL
        </Text>
      </View>
    </View>
  );

  const renderProfessionalTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Professional Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Headline <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={profile.headline}
          onChangeText={(text) => setProfile({ ...profile, headline: text })}
          placeholder="e.g., Java Backend Developer | Spring Boot"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Professional Summary <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={profile.summary}
          onChangeText={(text) => setProfile({ ...profile, summary: text })}
          placeholder="Brief summary about your professional background, skills, and career goals..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: colors.text }]}>I am currently a fresher</Text>
        <Switch
          value={profile.isFresher}
          onValueChange={(value) => setProfile({ ...profile, isFresher: value })}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills</Text>
      
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.skillInput, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={newSkill}
          onChangeText={setNewSkill}
          placeholder="Type a skill"
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={handleAddSkill}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddSkill}
          disabled={!newSkill.trim()}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.skillsContainer}>
        {profile.skills.map((skill, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.skillChip, { backgroundColor: colors.lightGray }]}
            activeOpacity={0.7}
            onPress={() => handleRemoveSkill(index)}
          >
            <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
            <Ionicons name="close-circle" size={20} color={colors.error} />
          </TouchableOpacity>
        ))}
      </View>

      {profile.skills.length === 0 && (
        <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
          <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No skills added yet. Add your technical skills to showcase your expertise.
          </Text>
        </View>
      )}
    </View>
  );

  const renderCardItem = (item, index, type, onRemove) => {
    const renderers = {
      education: (edu) => (
        <>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{edu.degree}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{edu.institution}</Text>
          <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
            {edu.startYear} - {edu.endYear}
          </Text>
          {edu.cgpa && (
            <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
              CGPA: {edu.cgpa}
            </Text>
          )}
        </>
      ),
      experience: (exp) => (
        <>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{exp.jobTitle}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {exp.company} • {exp.location}
          </Text>
          <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
            {exp.startMonth}/{exp.startYear} - {exp.currentlyWorking ? 'Present' : `${exp.endMonth}/${exp.endYear}`}
          </Text>
          {exp.description && (
            <Text style={[styles.cardDescription, { color: colors.text }]}>{exp.description}</Text>
          )}
        </>
      ),
      projects: (project) => (
        <>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{project.title}</Text>
          {project.techStack && (
            <Text style={[styles.cardSubtitle, { color: colors.primary }]}>
              {project.techStack}
            </Text>
          )}
          {project.description && (
            <Text style={[styles.cardDescription, { color: colors.text }]}>{project.description}</Text>
          )}
          {project.projectUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(project.projectUrl)}>
              <Text style={[styles.link, { color: colors.primary }]}>View Project →</Text>
            </TouchableOpacity>
          )}
        </>
      ),
      social: (link) => {
        const platform = socialPlatforms.find(p => p.value === link.platform);
        return (
          <>
            <View style={styles.socialHeader}>
              <Ionicons name={platform?.icon || 'globe'} size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>{platform?.label || link.platform}</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(link.profileUrl)}>
              <Text style={[styles.link, { color: colors.primary }]} numberOfLines={1}>{link.profileUrl}</Text>
            </TouchableOpacity>
          </>
        );
      },
      certifications: (cert) => (
        <>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{cert.name}</Text>
          {cert.startDate && (
            <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
              {new Date(cert.startDate).toLocaleDateString()} - {cert.endDate ? new Date(cert.endDate).toLocaleDateString() : 'Present'}
            </Text>
          )}
          {cert.description && (
            <Text style={[styles.cardDescription, { color: colors.text }]}>{cert.description}</Text>
          )}
        </>
      )
    };

    return (
      <View key={index} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.cardContent}>
          {renderers[type]?.(item)}
        </View>
        <TouchableOpacity 
          onPress={() => onRemove(index)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderListSection = (type, items, onAdd, onRemove) => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAdd}
          disabled={!!editingSection}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {items.length === 0 && !editingSection && (
        <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No {type} added yet
          </Text>
        </View>
      )}

      {items.map((item, index) => renderCardItem(item, index, type, onRemove))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalTab();
      case 'professional':
        return renderProfessionalTab();
      case 'skills':
        return renderSkillsTab();
      case 'education':
        return renderListSection('education', profile.education, handleAddEducation, handleRemoveEducation);
      case 'experience':
        return renderListSection('experience', profile.experience, handleAddExperience, handleRemoveExperience);
      case 'projects':
        return renderListSection('projects', profile.projects, handleAddProject, handleRemoveProject);
      case 'social':
        return renderListSection('social', profile.socialMediaLinks, handleAddSocialLink, handleRemoveSocialLink);
      case 'certifications':
        return renderListSection('certifications', profile.certifications, handleAddCertification, handleRemoveCertification);
      default:
        return null;
    }
  };

  // Modal Content Renderers
  const renderEducationModalContent = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Degree <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.degree || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, degree: text })}
          placeholder="Bachelor of Technology"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Field of Study</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.fieldOfStudy || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, fieldOfStudy: text })}
          placeholder="Computer Science"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Institution <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.institution || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, institution: text })}
          placeholder="ABC University"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={[styles.label, { color: colors.text }]}>Start Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            value={tempItem.startYear?.toString() || ''}
            onChangeText={(text) => setTempItem({ ...tempItem, startYear: parseInt(text) || '' })}
            placeholder="2020"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.halfInput}>
          <Text style={[styles.label, { color: colors.text }]}>End Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            value={tempItem.endYear?.toString() || ''}
            onChangeText={(text) => setTempItem({ ...tempItem, endYear: parseInt(text) || '' })}
            placeholder="2024"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>CGPA/Percentage</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.cgpa || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, cgpa: text })}
          placeholder="8.5"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
        />
      </View>
    </>
  );

  const renderExperienceModalContent = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Job Title <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.jobTitle || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, jobTitle: text })}
          placeholder="Backend Developer"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Company <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.company || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, company: text })}
          placeholder="Tech Solutions Inc."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Location</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.location || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, location: text })}
          placeholder="Remote, Bangalore"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 10 }]}>Start Date</Text>
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={[styles.label, { color: colors.text }]}>Month</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            value={tempItem.startMonth?.toString() || ''}
            onChangeText={(text) => setTempItem({ ...tempItem, startMonth: parseInt(text) || '' })}
            placeholder="1-12"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.halfInput}>
          <Text style={[styles.label, { color: colors.text }]}>Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            value={tempItem.startYear?.toString() || ''}
            onChangeText={(text) => setTempItem({ ...tempItem, startYear: parseInt(text) || '' })}
            placeholder="2022"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: colors.text }]}>I currently work here</Text>
        <Switch
          value={tempItem.currentlyWorking || false}
          onValueChange={(value) => setTempItem({ ...tempItem, currentlyWorking: value })}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>

      {!tempItem.currentlyWorking && (
        <>
          <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 10 }]}>End Date</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Month</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
                value={tempItem.endMonth?.toString() || ''}
                onChangeText={(text) => setTempItem({ ...tempItem, endMonth: parseInt(text) || '' })}
                placeholder="1-12"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Year</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
                value={tempItem.endYear?.toString() || ''}
                onChangeText={(text) => setTempItem({ ...tempItem, endYear: parseInt(text) || '' })}
                placeholder="2023"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </>
      )}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.description || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, description: text })}
          placeholder="Describe your responsibilities and achievements..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  const renderProjectModalContent = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Project Title <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.title || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, title: text })}
          placeholder="Student Management System"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Tech Stack</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.techStack || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, techStack: text })}
          placeholder="Java, Spring Boot, MySQL"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Project URL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.projectUrl || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, projectUrl: text })}
          placeholder="https://github.com/username/project"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.description || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, description: text })}
          placeholder="Describe your project..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  const renderSocialModalContent = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Platform</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {socialPlatforms.map((platform) => (
            <TouchableOpacity
              key={platform.value}
              style={[
                styles.pickerOption,
                tempItem.platform === platform.value && [styles.pickerOptionSelected, { backgroundColor: colors.primary + '20' }]
              ]}
              onPress={() => setTempItem({ ...tempItem, platform: platform.value })}
              activeOpacity={0.7}
            >
              <Ionicons name={platform.icon} size={20} color={tempItem.platform === platform.value ? colors.primary : colors.textSecondary} />
              <Text style={[styles.pickerOptionText, { color: tempItem.platform === platform.value ? colors.primary : colors.text }]}>
                {platform.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Profile URL <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.profileUrl || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, profileUrl: text })}
          placeholder="https://linkedin.com/in/username"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>
    </>
  );

  const renderCertificationModalContent = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Certification Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.name || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, name: text })}
          placeholder="AWS Certified Solutions Architect"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.startDate || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, startDate: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.endDate || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, endDate: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          value={tempItem.description || ''}
          onChangeText={(text) => setTempItem({ ...tempItem, description: text })}
          placeholder="What does this certification cover?"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {renderHeader()}
      
      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={[styles.tabBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={tab.icon} 
              size={isSmallDevice ? 18 : 20} 
              color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving || !!editingSection}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      
      {/* Modals */}
      {editingSection === 'education' && renderModal({
        title: 'Add Education',
        children: renderEducationModalContent(),
        onSave: handleSaveEducation,
        onCancel: () => {
          setEditingSection(null);
          setTempItem({});
        }
      })}

      {editingSection === 'experience' && renderModal({
        title: 'Add Experience',
        children: renderExperienceModalContent(),
        onSave: handleSaveExperience,
        onCancel: () => {
          setEditingSection(null);
          setTempItem({});
        }
      })}

      {editingSection === 'project' && renderModal({
        title: 'Add Project',
        children: renderProjectModalContent(),
        onSave: handleSaveProject,
        onCancel: () => {
          setEditingSection(null);
          setTempItem({});
        }
      })}

      {editingSection === 'social' && renderModal({
        title: 'Add Social Link',
        children: renderSocialModalContent(),
        onSave: handleSaveSocialLink,
        onCancel: () => {
          setEditingSection(null);
          setTempItem({});
        }
      })}

      {editingSection === 'certification' && renderModal({
        title: 'Add Certification',
        children: renderCertificationModalContent(),
        onSave: handleSaveCertification,
        onCancel: () => {
          setEditingSection(null);
          setTempItem({});
        }
      })}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: isTablet ? 32 : isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 12 : 15,
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
    marginLeft: isSmallDevice ? 10 : 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 15,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: 20,
    gap: 5,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
  },
  menuButton: {},
  tabBar: {
    borderBottomWidth: 1,
    maxHeight: isTablet ? 70 : 60,
  },
  tabBarContent: {
    paddingHorizontal: isSmallDevice ? 10 : 16,
    minWidth: '100%',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 8,
    paddingHorizontal: isTablet ? 24 : isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: isTablet ? 100 : 'auto',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  tabContent: {
    padding: isTablet ? 32 : isSmallDevice ? 16 : 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 12 : 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  profileImage: {
    width: isSmallDevice ? 100 : isTablet ? 150 : 120,
    height: isSmallDevice ? 100 : isTablet ? 150 : 120,
    borderRadius: isSmallDevice ? 50 : isTablet ? 75 : 60,
  },
  imagePlaceholder: {
    width: isSmallDevice ? 100 : isTablet ? 150 : 120,
    height: isSmallDevice ? 100 : isTablet ? 150 : 120,
    borderRadius: isSmallDevice ? 50 : isTablet ? 75 : 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: isTablet ? '40%' : '35%',
    width: isSmallDevice ? 30 : isTablet ? 40 : 36,
    height: isSmallDevice ? 30 : isTablet ? 40 : 36,
    borderRadius: isSmallDevice ? 15 : isTablet ? 20 : 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  helperText: {
    fontSize: isSmallDevice ? 11 : 12,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: isSmallDevice ? 14 : 16,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.9,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 15,
    minHeight: isSmallDevice ? 44 : 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 15,
    minHeight: isSmallDevice ? 100 : 120,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 8 : 12,
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 15,
    minHeight: isSmallDevice ? 44 : 48,
  },
  addButton: {
    width: isSmallDevice ? 44 : 48,
    height: isSmallDevice ? 44 : 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 6 : 10,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: 20,
    marginBottom: isSmallDevice ? 4 : 0,
  },
  skillText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: isSmallDevice ? 30 : 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  emptyText: {
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    opacity: 0.7,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  cardDetail: {
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 4,
    opacity: 0.7,
  },
  cardDescription: {
    fontSize: isSmallDevice ? 13 : 14,
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.9,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  link: {
    fontSize: isSmallDevice ? 12 : 13,
    textDecorationLine: 'underline',
  },
  footer: {
    padding: isTablet ? 24 : isSmallDevice ? 16 : 20,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: isSmallDevice ? 14 : 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    maxHeight: height * 0.6,
  },
  modalScrollContent: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: isSmallDevice ? 12 : 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 12,
  },
  halfInput: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    borderRadius: 8,
  },
  pickerOptionText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default Portfolio;