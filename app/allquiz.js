import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getQuizzes } from '../lib/api';

const { width } = Dimensions.get('window');

const AllQuiz = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(colors);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuizzes();
      
      if (response.success && response.data) {
        setQuizzes(response.data);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizzes();
    setRefreshing(false);
  };

  const navigateToQuiz = (quizId) => {
    router.push(`/quiz?id=${quizId}`);
  };

  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return 'No expiry';
    return new Date(expiryDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderQuizCard = (quiz) => (
    <TouchableOpacity
      key={quiz.id}
      style={styles.quizCard}
      onPress={() => navigateToQuiz(quiz.id)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.quizTitle} numberOfLines={2}>{quiz.title}</Text>
            <Text style={styles.quizDescription} numberOfLines={2}>
              {quiz.description || 'Test your knowledge with this quiz'}
            </Text>
          </View>
          
          {/* Prize Badge */}
          {quiz.firstPrize && (
            <View style={styles.prizeBadge}>
              <Ionicons name="trophy" size={18} color={colors.warning} />
              <Text style={styles.prizeText}>{quiz.firstPrize}</Text>
            </View>
          )}
        </View>

        {/* Category & Expiry Info */}
        <View style={styles.infoRow}>
          {quiz.categoryName && (
            <View style={styles.infoTag}>
              <Ionicons name="bookmark-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoTagText}>{quiz.categoryName}</Text>
            </View>
          )}
          {quiz.expiryDate && (
            <View style={styles.infoTag}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoTagText}>{formatExpiryDate(quiz.expiryDate)}</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {quiz.participants !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{quiz.participants} participants</Text>
              </View>
            )}
            {quiz.totalQuestions && (
              <View style={styles.statItem}>
                <Ionicons name="help-circle-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{quiz.totalQuestions} Questions</Text>
              </View>
            )}
          </View>
          
          <View style={styles.statsRow}>
            {quiz.timeLimitMinutes && (
              <View style={styles.statItem}>
                <Ionicons name="timer-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statText}>{quiz.timeLimitMinutes} minutes</Text>
              </View>
            )}
            {quiz.difficulty && (
              <View style={[
                styles.difficultyBadge, 
                quiz.difficulty === 'Hard' && styles.hardBadge,
                quiz.difficulty === 'Medium' && styles.mediumBadge
              ]}>
                <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.leaderboardButton}
            onPress={() => router.push(`/quizleaderboard?id=${quiz.id}`)}
          >
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
            <Text style={[styles.leaderboardButtonText, { color: colors.primary }]}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigateToQuiz(quiz.id)}
          >
            <Text style={[styles.startButtonText, { color: colors.primary }]}>Start Quiz</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQuizzes}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (quizzes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="clipboard-outline" size={64} color={colors.mediumGray} />
          <Text style={styles.emptyTitle}>No Quizzes Available</Text>
          <Text style={styles.emptyText}>Check back later for new quizzes!</Text>
        </View>
      );
    }

    return (
      <View style={styles.quizzesContainer}>
        {quizzes.map(renderQuizCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>All Quizzes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
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
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  quizzesContainer: {
    padding: 16,
    gap: 16,
  },
  quizCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 4,
  },
  gradientCard: {
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 6,
  },
  quizDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  prizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    height: 32,
  },
  prizeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  infoTagText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },
  statsContainer: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mediumBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  hardBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  leaderboardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  leaderboardButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  startButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AllQuiz;
