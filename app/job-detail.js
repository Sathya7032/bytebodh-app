import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const jobsDataOld = [
  {
    id: 1,
    title: 'Senior React Native Developer',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '₹15-25 LPA',
    postedDate: '2 days ago',
    description: 'We are looking for an experienced React Native developer to join our mobile team. You will be responsible for developing and maintaining high-quality mobile applications for iOS and Android platforms.\n\nAs a Senior React Native Developer, you will work closely with our product and design teams to create intuitive and performant mobile experiences. You will have the opportunity to work on challenging problems and contribute to the architecture of our applications.',
    requirements: [
      '3+ years of experience in React Native development',
      'Strong knowledge of JavaScript/TypeScript',
      'Experience with Redux, Context API, and state management',
      'Familiarity with native build tools like XCode, Gradle',
      'Understanding of RESTful APIs and GraphQL',
      'Experience with mobile app deployment (App Store, Play Store)',
      'Knowledge of mobile security best practices',
    ],
    responsibilities: [
      'Develop and maintain mobile applications using React Native',
      'Collaborate with cross-functional teams to define and implement features',
      'Write clean, maintainable, and testable code',
      'Participate in code reviews and provide constructive feedback',
      'Mentor junior developers and share knowledge',
      'Optimize applications for maximum performance',
      'Stay updated with the latest mobile development trends',
    ],
    skills: ['React Native', 'TypeScript', 'Redux', 'REST API', 'Git', 'Jest', 'Firebase'],
    benefits: [
      'Competitive salary with performance bonuses',
      'Health insurance for you and your family',
      'Flexible work hours and remote work options',
      'Learning and development budget',
      'Annual team outings and events',
      'Modern office with great amenities',
    ],
    applicants: 45,
    isNew: true,
    isFeatured: true,
    companyAbout: 'TechCorp Solutions is a leading technology company specializing in mobile and web solutions. We work with clients globally and pride ourselves on innovation and quality.',
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'StartupHub Inc',
    location: 'Mumbai, India',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '₹12-18 LPA',
    postedDate: '5 days ago',
    description: 'Join our dynamic team as a Full Stack Developer. Work on cutting-edge technologies and contribute to building scalable web applications that serve millions of users.',
    requirements: [
      '2+ years of full stack development experience',
      'Proficiency in Node.js and React',
      'Experience with databases (MongoDB, PostgreSQL)',
      'Knowledge of cloud platforms (AWS, Azure)',
      'Strong problem-solving skills',
    ],
    responsibilities: [
      'Design and implement web applications',
      'Develop RESTful APIs',
      'Optimize application performance',
      'Work with DevOps team',
      'Ensure code quality',
    ],
    skills: ['Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
    benefits: [
      'Equity options',
      'Health and wellness benefits',
      'Flexible schedule',
      'Professional growth opportunities',
    ],
    applicants: 78,
    isNew: true,
    isFeatured: false,
    companyAbout: 'StartupHub Inc is a fast-growing startup building innovative solutions for the modern web.',
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'DesignStudio Pro',
    location: 'Pune, India',
    type: 'Contract',
    experience: '1-3 years',
    salary: '₹8-12 LPA',
    postedDate: '1 week ago',
    description: 'We are seeking a creative UI/UX Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design.',
    requirements: [
      '1+ years of UI/UX design experience',
      'Proficiency in Figma, Adobe XD',
      'Strong portfolio showcasing design work',
      'Understanding of user-centered design',
      'Excellent communication skills',
    ],
    responsibilities: [
      'Create wireframes and prototypes',
      'Design user interfaces',
      'Conduct user research',
      'Collaborate with developers',
      'Iterate based on feedback',
    ],
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    benefits: [
      'Creative work environment',
      'Latest design tools',
      'Portfolio building opportunities',
    ],
    applicants: 32,
    isNew: false,
    isFeatured: false,
    companyAbout: 'DesignStudio Pro is a boutique design agency working with top brands.',
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'AI Innovations Ltd',
    location: 'Hyderabad, India',
    type: 'Full-time',
    experience: '4-6 years',
    salary: '₹20-30 LPA',
    postedDate: '3 days ago',
    description: 'Looking for an experienced Data Scientist to join our AI team. You will work on machine learning models and data analysis projects.',
    requirements: [
      '4+ years in data science/ML',
      'Strong Python programming skills',
      'Experience with TensorFlow, PyTorch',
      'Knowledge of statistical analysis',
      'MS/PhD in related field preferred',
    ],
    responsibilities: [
      'Build predictive models',
      'Analyze large datasets',
      'Deploy ML models',
      'Collaborate with engineering teams',
      'Present findings to stakeholders',
    ],
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    benefits: [
      'Cutting-edge AI projects',
      'Conference attendance',
      'Research opportunities',
      'Comprehensive benefits',
    ],
    applicants: 23,
    isNew: true,
    isFeatured: true,
    companyAbout: 'AI Innovations Ltd is at the forefront of artificial intelligence research and development.',
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '₹18-28 LPA',
    postedDate: '4 days ago',
    description: 'Join our DevOps team to build and maintain scalable infrastructure. Experience with cloud platforms and CI/CD pipelines is essential.',
    requirements: [
      '3+ years of DevOps experience',
      'Strong knowledge of AWS/Azure',
      'Experience with Docker, Kubernetes',
      'Proficiency in scripting (Python, Bash)',
      'Understanding of CI/CD tools',
    ],
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance',
      'Automate deployment processes',
      'Ensure system security',
    ],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    benefits: [
      'Remote work flexibility',
      'Professional certifications',
      'Top-tier tools',
      'Great team culture',
    ],
    applicants: 56,
    isNew: false,
    isFeatured: false,
    companyAbout: 'CloudTech Systems provides cloud infrastructure solutions to enterprises worldwide.',
  },
];

const JobDetail = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://backend.bytebodh.in/api/job-notifications/${id}`);
      const jobData = response.data.data || response.data;
      setJob(jobData);
      console.log('✅ Job detail loaded:', jobData.jobTitle);
    } catch (err) {
      console.error('❌ Failed to fetch job detail:', err);
      setError('Job not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.simpleHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.simpleBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.simpleHeaderTitle, { color: colors.text }]}>Job Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.simpleHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.simpleBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.simpleHeaderTitle, { color: colors.text }]}>Job Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Job not found'}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Helper functions to handle API data
  const getJobTitle = () => job?.jobTitle || job?.title || 'Job Title';
  const getCompanyName = () => job?.companyName || job?.company || 'Company';
  const getLocation = () => job?.location || 'Location TBD';
  const getEmploymentType = () => job?.employmentType || job?.type || 'Full-time';
  const getExperience = () => job?.experienceRequired ? `${job.experienceRequired}+ years` : job?.experience || 'Not specified';
  const getDeadline = () => {
    if (job?.applicationDeadline) {
      return new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return null;
  };
  const getPostedDate = () => {
    if (job?.createdTime) {
      const diffTime = Math.abs(new Date() - new Date(job.createdTime));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return new Date(job.createdTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return job?.postedDate || 'Recently';
  };

  const getSkillsArray = () => {
    if (job?.requiredSkills) {
      if (typeof job.requiredSkills === 'string') {
        return job.requiredSkills.split(',').map(s => s.trim());
      }
      if (Array.isArray(job.requiredSkills)) {
        return job.requiredSkills;
      }
    }
    return job?.skills || [];
  };

  const isHtmlContent = (content) => {
    return content && typeof content === 'string' && (content.includes('<p>') || content.includes('<ol>') || content.includes('<ul>') || content.includes('<li>'));
  };

  const getRequirementsArray = () => {
    if (job?.requirements) {
      // If it's HTML, return null to indicate we should render HTML instead
      if (isHtmlContent(job.requirements)) {
        return null;
      }
      if (typeof job.requirements === 'string') {
        return job.requirements.split('\n').filter(r => r.trim());
      }
      if (Array.isArray(job.requirements)) {
        return job.requirements;
      }
    }
    return [];
  };

  const renderSection = (title, icon, content) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {content}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={[styles.simpleHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity style={styles.simpleBackButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.simpleHeaderTitle, { color: colors.text }]}>Job Details</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={[styles.companyLogo, { backgroundColor: colors.lightGray }]}>
            <Ionicons name="briefcase" size={40} color={colors.primary} />
          </View>

          <Text style={[styles.jobTitle, { color: colors.text }]}>{getJobTitle()}</Text>
          <Text style={[styles.companyName, { color: colors.mediumGray }]}>{getCompanyName()}</Text>

          <View style={styles.headerBadges}>
            {job.isFeatured && (
              <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={[styles.badgeText, { color: colors.warning }]}>Featured</Text>
              </View>
            )}
            {job.isActive && (
              <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Active</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{getLocation()}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{getEmploymentType()}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{getExperience()}</Text>
            </View>
          </View>

          {(job.salary || getDeadline()) && (
            <View style={styles.salaryContainer}>
              <View style={styles.salaryLeft}>
                {job.salary ? (
                  <>
                    <Text style={styles.salaryLabel}>Salary Range</Text>
                    <Text style={[styles.salaryValue, { color: colors.primary }]}>{job.salary}</Text>
                  </>
                ) : getDeadline() && (
                  <>
                    <Text style={styles.salaryLabel}>Application Deadline</Text>
                    <Text style={[styles.salaryValue, { color: colors.error }]}>{getDeadline()}</Text>
                  </>
                )}
              </View>
              <View style={styles.salaryRight}>
                <Ionicons name="calendar" size={16} color={colors.mediumGray} />
                <Text style={styles.applicantsText}>{getPostedDate()}</Text>
              </View>
            </View>
          )}

          {(job.jobDescription || job.description) && renderSection('Job Description', 'document-text-outline', (
            isHtmlContent(job.jobDescription || job.description) ? (
              <RenderHtml
                contentWidth={width - 80}
                source={{ html: job.jobDescription || job.description }}
                tagsStyles={{
                  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
                  p: { marginBottom: 10, color: colors.text },
                  strong: { fontWeight: 'bold', color: colors.text },
                  li: { marginBottom: 5, color: colors.text },
                  ol: { paddingLeft: 10 },
                  ul: { paddingLeft: 10 },
                }}
              />
            ) : (
              <Text style={styles.descriptionText}>{job.jobDescription || job.description}</Text>
            )
          ))}

          {(job.requirements || getRequirementsArray()?.length > 0) && renderSection('Requirements', 'checkbox-outline', (
            isHtmlContent(job.requirements) ? (
              <RenderHtml
                contentWidth={width - 80}
                source={{ html: job.requirements }}
                tagsStyles={{
                  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
                  p: { marginBottom: 10, color: colors.text },
                  strong: { fontWeight: 'bold', color: colors.text },
                  li: { marginBottom: 5, color: colors.text },
                  ol: { paddingLeft: 10 },
                  ul: { paddingLeft: 10 },
                }}
              />
            ) : (
              <View>
                {getRequirementsArray().map((req, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={styles.listText}>{req}</Text>
                  </View>
                ))}
              </View>
            )
          ))}

          {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && renderSection('Responsibilities', 'list-outline', (
            <View>
              {job.responsibilities.map((resp, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: colors.success }]} />
                  <Text style={styles.listText}>{resp}</Text>
                </View>
              ))}
            </View>
          ))}

          {getSkillsArray().length > 0 && renderSection('Required Skills', 'code-slash-outline', (
            <View style={styles.skillsWrapper}>
              {getSkillsArray().map((skill, index) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.skillChipText, { color: colors.primary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          ))}

          {job.benefits && renderSection('Benefits', 'gift-outline', (
            <View>
              {job.benefits.map((benefit, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.listText}>{benefit}</Text>
                </View>
              ))}
            </View>
          ))}

          {(job.companyAbout || job.companyName) && renderSection('About Company', 'business-outline', (
            <Text style={styles.descriptionText}>{job.companyAbout || `Learn more about ${getCompanyName()}`}</Text>
          ))}

          {job.jobLink && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="link-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Application Link</Text>
              </View>
              <TouchableOpacity 
                style={[styles.linkButton, { backgroundColor: `${colors.primary}15` }]}
                onPress={() => {
                  if (job.jobLink) {
                    Linking.openURL(job.jobLink).catch(err => 
                      console.error('Failed to open URL:', err)
                    );
                  }
                }}
              >
                <Text style={[styles.linkButtonText, { color: colors.primary }]} numberOfLines={1}>{job.jobLink}</Text>
                <Ionicons name="open-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.postedText}>Posted {getPostedDate()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.background }]}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.7}
          onPress={() => {
            if (job.jobLink) {
              Linking.openURL(job.jobLink).catch(err => 
                console.error('Failed to open URL:', err)
              );
            }
          }}
        >
          <Text style={styles.applyButtonText}>{job.jobLink ? 'Apply Now' : 'Contact Company'}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    width: '100%',
  },
  simpleBackButton: {
    padding: 4,
  },
  simpleHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  salaryLeft: {
    flex: 1,
  },
  salaryLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  salaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  salaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applicantsText: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  postedText: {
    fontSize: 13,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  saveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  linkButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default JobDetail;
