import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getQuizLeaderboard } from '../lib/api';

const QuizLeaderboard = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const quizId = params.id;
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!quizId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await getQuizLeaderboard(quizId);
        
        if (response.success && response.data) {
          setLeaderboard(response.data);
        }
      } catch (error) {
        console.log('Could not load leaderboard:', error.message);
      } finally {
        setLoading(false);
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Leaderboard */}
        <View style={[styles.leaderboardCard, { backgroundColor: colors.card }]}>
          <View style={styles.leaderboardHeader}>
            <Ionicons name="trophy" size={28} color={colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Top Players
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.leaderboardLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
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
                    style={[
                      styles.leaderboardItem,
                      { backgroundColor: index < 3 ? `${colors.primary}05` : 'transparent' }
                    ]}
                  >
                    <View style={styles.leaderboardLeft}>
                      <View style={[
                        styles.rankBadge,
                        { backgroundColor: index < 3 ? `${colors.primary}15` : colors.lightGray }
                      ]}>
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
              <Ionicons name="medal-outline" size={64} color={colors.mediumGray} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No leaderboard data available yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Be the first to complete this quiz!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  leaderboardCard: {
    borderRadius: 16,
    padding: 20,
    
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  leaderboardLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  leaderboardList: {
    gap: 12,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
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
    fontSize: 13,
  },
  leaderboardRankLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderboardScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  leaderboardScoreLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  leaderboardEmpty: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default QuizLeaderboard;
