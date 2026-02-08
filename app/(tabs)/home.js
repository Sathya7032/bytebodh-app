import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds, useForeground, } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDrawer from '../../components/CustomDrawer';
import { useTheme } from '../../contexts/ThemeContext';
import { getQuizzes } from '../../lib/api';
import { getUserData } from '../../lib/secureStore';

const { width } = Dimensions.get('window');

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-1462312256770219/6874861381';

const adUnitId1 = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-1462312256770219/1144555386';

const interstitial = InterstitialAd.createForAdRequest(adUnitId1, {
  keywords: ['fashion', 'clothing'],
});

const Home = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [quizError, setQuizError] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const styles = createStyles(colors);

  // Gesture handler for swipe from right edge to open drawer
  const panGesture = Gesture.Pan()
    .activeOffsetX([-Infinity, -10])
    .activeOffsetY([-Infinity, Infinity]) // Allow vertical scrolling
    .onStart((event) => {
      if (event.x > width - 50) { // Only trigger if swipe starts from right edge (within 50px)
        setDrawerVisible(true);
      }
    });

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      setUserData(data);
    };
    loadUserData();
  }, []);

  // Fetch quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      setQuizError(null);
      const response = await getQuizzes();
      
      if (response.success && response.data) {
        setQuizzes(response.data);
      } else {
        setQuizError('Failed to load quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizError(error.message || 'Failed to load quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const bannerRef = useRef(null);

  // iOS: Reload banner when app comes to foreground
  useForeground(() => {
    if (Platform.OS === 'ios' && bannerRef.current) {
      bannerRef.current.load();
    }
  });

  // Interstitial Ad Handlers
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => {
        setIsLoadingAd(false);
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(true);
        }
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsLoadingAd(false);
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false);
        }
        // Load next ad
        interstitial.load();
        setLoaded(false);
      }
    );

    // Load ad
    interstitial.load();

    // Cleanup
    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, [router]);

  // Show interstitial ad every 10 minutes
  useEffect(() => {
    const adInterval = setInterval(() => {
      if (loaded) {
        interstitial.show();
      }
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    return () => clearInterval(adInterval);
  }, [loaded]);

  const navigateToQuiz = (quizId) => {
    if (quizId) {
      router.push({
        pathname: '/quiz',
        params: { id: quizId }
      });
    } else {
      router.push('/quiz');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload user data
      const data = await getUserData();
      setUserData(data);
      
      // Reload quizzes
      await fetchQuizzes();
      
      // Reload banner ad
      if (bannerRef.current) {
        bannerRef.current.load();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{userData?.fullName || 'Quiz Master'}! 👋</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFeaturedQuiz = (quiz) => {
    // Format expiry date
    const expiryDate = quiz.expiryDate 
      ? new Date(quiz.expiryDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'No expiry';

    return (
      <TouchableOpacity
        key={quiz.id}
        style={styles.featuredCard}
        onPress={() => navigateToQuiz(quiz.id)}
      >
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredTitleContainer}>
              <Text style={styles.featuredTitle}>{quiz.title}</Text>
              <Text style={styles.featuredDescription}>{quiz.description}</Text>

              {/* Prize Details */}
              {quiz.firstPrize && (
                <View style={styles.prizeDetailsContainer}>
                  <Ionicons name="trophy" size={14} color={colors.warning} />
                  <Text style={styles.prizeDetailsText}>{quiz.firstPrize}</Text>
                </View>
              )}

              {/* Category */}
              {quiz.categoryName && (
                <View style={styles.categoryContainer}>
                  <Ionicons name="bookmark-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.categoryText}>{quiz.categoryName}</Text>
                </View>
              )}

              {/* Expiry Date */}
              {quiz.expiryDate && (
                <View style={styles.expiryContainer}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.expiryText}>Expires: {expiryDate}</Text>
                </View>
              )}
            </View>
            
            {quiz.firstPrize && (
              <View style={styles.prizeTag}>
                <Ionicons name="gift" size={16} color={colors.warning} />
                <Text style={styles.prizeText}>{quiz.firstPrize}</Text>
              </View>
            )}
          </View>

          <View style={styles.featuredFooter}>
            <View style={styles.quizInfo}>
              {quiz.totalQuestions && (
                <View style={styles.infoItem}>
                  <Ionicons name="help-circle-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.infoText}>{quiz.totalQuestions} Qs</Text>
                </View>
              )}
              {quiz.difficulty && (
                <View style={[styles.difficultyBadge, quiz.difficulty === 'Hard' && styles.hardBadge]}>
                  <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
                </View>
              )}
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.leaderboardButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/quizleaderboard?id=${quiz.id}`);
                }}
              >
                <Ionicons name="trophy-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playButton}
                onPress={(e) => {
                  e.stopPropagation();
                  navigateToQuiz(quiz.id);
                }}
              >
                <Text style={[styles.playButtonText, { color: colors.primary }]}>Play</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomDrawer 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
        {renderHeader()}

        {/* About App Section */}
        <View style={styles.aboutSection}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aboutContent}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }}
              style={styles.aboutImage}
              resizeMode="contain"
            />
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutTitle}>Welcome to ByteBodh! 🚀</Text>
              <Text style={styles.aboutDescription}>
                Your all-in-one platform for learning and career growth. Explore quizzes, jobs, blogs, and more!
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* App Features Section */}
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>App Features</Text>
                <Text style={styles.sectionSubtitle}>Explore all our services</Text>
              </View>
            </View>
            
            <View style={styles.featuresGrid}>
              <TouchableOpacity 
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push('/allquiz')}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="help-circle" size={28} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Quiz</Text>
                <Text style={styles.featureSubtitle}>Take tests</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/jobs')}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: '#10b981' + '20' }]}>
                  <Ionicons name="briefcase" size={28} color="#10b981" />
                </View>
                <Text style={styles.featureTitle}>Job Alerts</Text>
                <Text style={styles.featureSubtitle}>Get notified</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push('/resume')}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: '#f59e0b' + '20' }]}>
                  <Ionicons name="document-text" size={28} color="#f59e0b" />
                </View>
                <Text style={styles.featureTitle}>Resume</Text>
                <Text style={styles.featureSubtitle}>Download CV</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push('/portfolio')}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: '#8b5cf6' + '20' }]}>
                  <Ionicons name="globe" size={28} color="#8b5cf6" />
                </View>
                <Text style={styles.featureTitle}>Portfolio</Text>
                <Text style={styles.featureSubtitle}>Build website</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push('/blogs')}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: '#ef4444' + '20' }]}>
                  <Ionicons name="newspaper" size={28} color="#ef4444" />
                </View>
                <Text style={styles.featureTitle}>Blogs</Text>
                <Text style={styles.featureSubtitle}>Read articles</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard}
                activeOpacity={0.7}
                onPress={() => router.push('/tasks')}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: '#06b6d4' + '20' }]}>
                  <Ionicons name="checkmark-done" size={28} color="#06b6d4" />
                </View>
                <Text style={styles.featureTitle}>Tasks</Text>
                <Text style={styles.featureSubtitle}>Manage todos</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Quizzes</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {loadingQuizzes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading quizzes...</Text>
              </View>
            ) : quizError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={styles.errorText}>{quizError}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchQuizzes}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : quizzes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={48} color={colors.mediumGray} />
                <Text style={styles.emptyText}>No quizzes available</Text>
                <Text style={styles.emptySubtext}>Check back later for new quizzes!</Text>
              </View>
            ) : (
              quizzes.map(renderFeaturedQuiz)
            )}
          </View>

        </View>

        <View style={styles.adWrapper}>
          <View style={styles.adContainer}>
            <View style={styles.adLabelContainer}>
              <Ionicons name="megaphone-outline" size={12} color={colors.mediumGray} />
              <Text style={styles.adLabel}>Sponsored</Text>
            </View>
            <View style={styles.adBannerContainer}>
              <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <Modal
        transparent
        visible={isLoadingAd}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading Quiz...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  adWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  adContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  adLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  adLabel: {
    fontSize: 10,
    color: colors.mediumGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adBannerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  userInfo: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: colors.mediumGray,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: -6,
  },
  featureCard: {
    width: (width - 64) / 3, // 3 columns with padding
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 10,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  featuredCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  featuredTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  prizeDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  prizeDetailsText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  prizeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  prizeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 5,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  hardBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  difficultyText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 55) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 8,
    textAlign: 'center',
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
  },
  aboutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  aboutTextContainer: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});

export default Home;
