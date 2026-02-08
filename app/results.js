import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getQuizLeaderboard } from '../lib/api';

export default function Results() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse parameters
  const quizId = params.quizId;
  const score = parseInt(params.score) || 0;
  const totalMarks = parseInt(params.totalMarks) || (parseInt(params.totalQuestions) || 10) * 10;
  const totalQuestions = parseInt(params.totalQuestions) || 10;
  const correctAnswers = parseInt(params.correctAnswers) || 0;
  const timeTaken = params.timeTaken || 'N/A';
  const timeTakenSeconds = parseInt(params.timeTakenSeconds) || 0;
  const alreadyAttempted = params.alreadyAttempted === 'true';
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // Calculate metrics
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const passed = percentage >= 70;
  
  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!quizId) return;
      
      try {
        setLoadingLeaderboard(true);
        const response = await getQuizLeaderboard(quizId);
        
        if (response.success && response.data) {
          setLeaderboard(response.data);
        }
      } catch (error) {
        console.log('Could not load leaderboard:', error.message);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    
    fetchLeaderboard();
  }, [quizId]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/home')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quiz Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Performance Header */}
        <LinearGradient
          colors={passed ? [colors.success, '#059669'] : [colors.error, '#dc2626']}
          style={styles.performanceHeader}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name={passed ? 'checkmark-circle' : 'close-circle'}
              size={60}
              color={colors.white}
            />
          </View>
          
          <Text style={styles.statusTitle}>
            {passed ? 'Quiz Passed!' : 'Quiz Failed'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {percentage.toFixed(0)}% - {score}/{totalMarks} marks
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Score Card */}
          <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score</Text>
                <Text style={[styles.scoreValue, { color: colors.primary }]}>
                  {score}/{totalMarks}
                </Text>
                <Text style={[styles.scoreSubtext, { color: colors.textSecondary }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Correct</Text>
                <Text style={[styles.scoreValue, { color: colors.success }]}>
                  {correctAnswers}/{totalQuestions}
                </Text>
                <Text style={[styles.scoreSubtext, { color: colors.textSecondary }]}>
                  answers
                </Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Time</Text>
                <Text style={[styles.scoreValue, { color: colors.secondary }]}>
                  {Math.floor(timeTakenSeconds / 60)}:{(timeTakenSeconds % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={[styles.scoreSubtext, { color: colors.textSecondary }]}>
                  minutes
                </Text>
              </View>
            </View>
          </View>

          {/* Already Attempted Notice */}
          {alreadyAttempted && (
            <View style={[styles.noticeCard, { backgroundColor: colors.card, borderLeftColor: colors.warning }]}>
              <View style={styles.noticeIconContainer}>
                <Ionicons name="information-circle" size={24} color={colors.warning} />
              </View>
              <View style={styles.noticeContent}>
                <Text style={[styles.noticeTitle, { color: colors.text }]}>
                  Quiz Already Attempted
                </Text>
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                  You have already completed this quiz. Your rank will not be calculated for this attempt.
                </Text>
              </View>
            </View>
          )}

          {/* Leaderboard */}
          {quizId && (
            <View style={[styles.leaderboardCard, { backgroundColor: colors.card }]}>
              <View style={styles.leaderboardHeader}>
                <Ionicons name="trophy" size={24} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                  Leaderboard
                </Text>
              </View>
              
              {loadingLeaderboard ? (
                <View style={styles.leaderboardLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading leaderboard...
                  </Text>
                </View>
              ) : leaderboard.length > 0 ? (
                <View style={styles.leaderboardList}>
                  {leaderboard.map((entry, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                    const displayRank = entry.rank || (index + 1);
                    
                    return (
                      <View
                        key={index}
                        style={styles.leaderboardItem}
                      >
                        <View style={styles.leaderboardLeft}>
                          <View style={styles.rankBadge}>
                            <Text style={[styles.leaderboardRank, { color: colors.text }]}>
                              {medal || `#${displayRank}`}
                            </Text>
                          </View>
                          <View style={styles.leaderboardUser}>
                            <Text 
                              style={[styles.leaderboardName, { color: colors.text }]}
                              numberOfLines={1}
                            >
                              {entry.userName || entry.username || 'Anonymous'}
                            </Text>
                            <View style={styles.leaderboardMeta}>
                              <Text style={[styles.leaderboardTime, { color: colors.textSecondary }]}>
                                ⏱️ {entry.timeTakenSeconds ? `${Math.floor(entry.timeTakenSeconds / 60)}:${(entry.timeTakenSeconds % 60).toString().padStart(2, '0')}` : 'N/A'}
                              </Text>
                              <Text style={[styles.leaderboardRankLabel, { color: colors.textSecondary }]}>
                                • Rank #{displayRank}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.leaderboardRight}>
                          <Text style={[styles.leaderboardScore, { color: colors.primary }]}>
                            {entry.score || 0}
                          </Text>
                          <Text style={[styles.leaderboardScoreLabel, { color: colors.textSecondary }]}>
                            marks
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.leaderboardEmpty}>
                  <Ionicons name="medal-outline" size={48} color={colors.mediumGray} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No leaderboard data available
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
           
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Ionicons name="home" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Go Home</Text>
            </TouchableOpacity>
            
           
          </View>
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
  performanceHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
   
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 50,
    marginHorizontal: 10,
  },
  noticeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noticeIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pointsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    
  },
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  pointsTextContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  pointsBreakdown: {
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownText: {
    fontSize: 14,
  },
  breakdownPoints: {
    fontSize: 14,
    fontWeight: '600',
  },
  performanceCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,

  },
  performanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  performanceBar: {
    width: '100%',
    alignItems: 'center',
  },
  performanceBarBg: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  performancePercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  leaderboardCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  leaderboardUser: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  leaderboardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  leaderboardTime: {
    fontSize: 12,
  },
  leaderboardRankLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderboardScore: {
    fontSize: 18,
    fontWeight: '700',
  },
  leaderboardScoreLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  leaderboardEmpty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
