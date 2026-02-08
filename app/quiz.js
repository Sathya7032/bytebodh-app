import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getQuizById, submitQuizAttempt } from '../lib/api';

const { width } = Dimensions.get('window');

// Sample quiz questions
const quizQuestions = [
  {
    id: 1,
    question: 'What is the latest version of React Native?',
    options: ['0.71', '0.72', '0.73', '0.74'],
    correctAnswer: 2,
    explanation: 'React Native 0.73 is the latest stable version as of 2026.',
  },
  {
    id: 2,
    question: 'Which company developed React Native?',
    options: ['Google', 'Facebook', 'Microsoft', 'Apple'],
    correctAnswer: 1,
    explanation: 'React Native was developed by Facebook (now Meta) in 2015.',
  },
  {
    id: 3,
    question: 'What does JSX stand for?',
    options: ['JavaScript XML', 'Java Syntax Extension', 'JavaScript Extension', 'Java XML'],
    correctAnswer: 0,
    explanation: 'JSX stands for JavaScript XML, a syntax extension for JavaScript.',
  },
  {
    id: 4,
    question: 'Which hook is used to manage state in functional components?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1,
    explanation: 'useState is the primary hook for managing state in functional components.',
  },
  {
    id: 5,
    question: 'What is the virtual DOM?',
    options: [
      'A physical representation of DOM',
      'A lightweight copy of the actual DOM',
      'A database management system',
      'A cloud service',
    ],
    correctAnswer: 1,
    explanation: 'The virtual DOM is a lightweight copy of the actual DOM kept in memory.',
  },
  {
    id: 6,
    question: 'Which CSS property is NOT supported in React Native?',
    options: ['flexDirection', 'float', 'padding', 'margin'],
    correctAnswer: 1,
    explanation: 'React Native uses Flexbox for layout and does not support the float property.',
  },
  {
    id: 7,
    question: 'What is the purpose of useEffect hook?',
    options: [
      'To manage state',
      'To handle side effects',
      'To create context',
      'To optimize performance',
    ],
    correctAnswer: 1,
    explanation: 'useEffect is used to handle side effects like data fetching, subscriptions, etc.',
  },
  {
    id: 8,
    question: 'Which navigation library is most popular for React Native?',
    options: ['React Router', 'React Navigation', 'Next.js', 'Vue Router'],
    correctAnswer: 1,
    explanation: 'React Navigation is the most widely used navigation library for React Native.',
  },
  {
    id: 9,
    question: 'What does npm stand for?',
    options: [
      'Node Package Manager',
      'New Project Manager',
      'Network Protocol Manager',
      'Node Programming Module',
    ],
    correctAnswer: 0,
    explanation: 'npm stands for Node Package Manager, used to manage JavaScript packages.',
  },
  {
    id: 10,
    question: 'Which method is used to update state in class components?',
    options: ['updateState()', 'setState()', 'changeState()', 'modifyState()'],
    correctAnswer: 1,
    explanation: 'setState() is the method used to update state in React class components.',
  },
];

export default function Quiz() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [quizData, setQuizData] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [progressAnim] = useState(new Animated.Value(0));
  const [timeElapsed, setTimeElapsed] = useState(0);

  const selectedAnswer = userAnswers[currentQuestion];

  // Fetch quiz data by ID
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const quizId = params.id || params.quizId;
        if (!quizId) {
          setError('Quiz ID not provided');
          setLoading(false);
          return;
        }

        const response = await getQuizById(quizId);
        
        if (response.success && response.data) {
          const quiz = response.data;
          setQuizData(quiz);
          
          // Map API response to existing UI structure
          const mappedQuestions = quiz.questions.map((q, index) => {
            // Find the correct answer index
            const correctAnswerIndex = q.options.findIndex(opt => opt.correct);
            
            return {
              id: q.id || index + 1,
              question: q.questionText,
              options: q.options.map(opt => opt.optionText),
              optionIds: q.options.map(opt => opt.id), // Store option IDs for submission
              correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
              explanation: q.explanation || 'No explanation provided.',
              marks: q.marks || 0,
            };
          });
          
          setQuizQuestions(mappedQuestions);
          setUserAnswers(Array(mappedQuestions.length).fill(null));
        } else {
          setError('Failed to load quiz');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [params.id, params.quizId]);

  // Timer that counts up from 0
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Progress animation
  useEffect(() => {
    if (quizQuestions.length > 0) {
      Animated.timing(progressAnim, {
        toValue: ((currentQuestion + 1) / quizQuestions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestion, quizQuestions.length]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (index) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
  };

  const handleFinishQuiz = async () => {
    const unanswered = userAnswers.filter(a => a === null).length;
    
    const navigateToResults = async () => {
      try {
        setSubmitting(true);
        
        // Calculate correct answers and score
        const correctAnswers = userAnswers.filter((answer, index) => 
          answer === quizQuestions[index].correctAnswer
        ).length;
        
        // Calculate total marks based on question marks
        const totalMarks = quizQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
        const earnedMarks = quizQuestions.reduce((sum, q, index) => {
          return sum + (userAnswers[index] === q.correctAnswer ? (q.marks || 1) : 0);
        }, 0);
        
        // Prepare submission data according to QuizAttemptSubmitRequestDto
        const quizId = params.id || params.quizId;
        const submissionData = {
          quizId: parseInt(quizId),
          score: earnedMarks,
          timeTakenSeconds: timeElapsed,
        };
        
        let response = null;
        let attemptId = '';
        let rank = 0;
        let alreadyAttempted = false;
        
        // Try to submit quiz attempt
        try {
          response = await submitQuizAttempt(submissionData);
          attemptId = response.data?.attemptId || '';
          rank = response.data?.rank || 0;
        } catch (submitError) {
          // Check if it's "already attempted" error
          const errorMessage = submitError.message || submitError.toString();
          if (errorMessage.includes('already attempted')) {
            // Quiz already attempted - silently continue to show results
            console.log('Quiz already attempted, showing results without resubmission');
            alreadyAttempted = true;
          } else {
            // Other errors - log and continue
            console.warn('Could not submit quiz:', errorMessage);
          }
        }
        
        // Navigate to results with all data including submission details
        router.push({
          pathname: '/results',
          params: {
            quizId: quizId,
            attemptId: attemptId,
            score: earnedMarks,
            totalMarks: totalMarks,
            totalQuestions: quizQuestions.length,
            correctAnswers: correctAnswers,
            timeTaken: timeElapsed,
            timeTakenSeconds: timeElapsed,
            rank: rank,
            alreadyAttempted: alreadyAttempted.toString(),
            userAnswers: JSON.stringify(userAnswers),
            questions: JSON.stringify(quizQuestions),
          }
        });
      } catch (error) {
        console.error('Unexpected error in quiz submission:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setSubmitting(false);
      }
    };
    
    if (unanswered > 0) {
      Alert.alert(
        'Unanswered Questions',
        `You have ${unanswered} unanswered question(s). Do you want to finish anyway?`,
        [
          { text: 'Review', style: 'cancel' },
          { text: 'Finish', onPress: navigateToResults },
        ]
      );
    } else {
      await navigateToResults();
    }
  };

  const handleExitQuiz = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers(Array(quizQuestions.length).fill(null));
    setTimeElapsed(0);
  };
  
  const renderQuizHeader = () => (
    <View style={[styles.quizHeader, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitQuiz}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.questionCount, { color: colors.text }]}>
            Question {currentQuestion + 1}/{quizQuestions.length}
          </Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={[styles.timerText, { color: colors.primary }]}>
              {formatTime(timeElapsed)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.finishButton, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 }]}
          onPress={handleFinishQuiz}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.finishButtonText}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={[styles.progressBarContainer, { backgroundColor: colors.lightGray }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  const renderQuestion = () => {
    const question = quizQuestions[currentQuestion];
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.question}
          </Text>
          {question.marks > 0 && (
            <View style={[styles.marksContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={[styles.marksText, { color: colors.primary }]}>
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.innerDot} />}
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Question Navigator */}
        <View style={styles.questionNavigator}>
          {quizQuestions.map((_, index) => {
            const isAnswered = userAnswers[index] !== null;
            const isCurrent = index === currentQuestion;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.navButton,
                  { 
                    backgroundColor: isCurrent 
                      ? colors.primary 
                      : isAnswered 
                      ? `${colors.success}30`
                      : colors.card,
                    borderColor: isCurrent ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleQuestionNavigation(index)}
              >
                <Text style={[
                  styles.navButtonText,
                  { color: isCurrent ? colors.white : colors.text }
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderQuizActions = () => (
    <View style={styles.actionsContainer}>
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navActionButton,
            { 
              backgroundColor: currentQuestion === 0 ? colors.lightGray : colors.primary,
              opacity: currentQuestion === 0 ? 0.5 : 1,
            },
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={colors.white} 
          />
          <Text style={styles.navActionText}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navActionButton,
            { 
              backgroundColor: currentQuestion === quizQuestions.length - 1 ? colors.lightGray : colors.primary,
              opacity: currentQuestion === quizQuestions.length - 1 ? 0.5 : 1,
            },
          ]}
          onPress={handleNextQuestion}
          disabled={currentQuestion === quizQuestions.length - 1}
        >
          <Text style={styles.navActionText}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading Quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
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

  // Empty state
  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.mediumGray} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No questions available</Text>
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {renderQuizHeader()}
      {renderQuestion()}
      {renderQuizActions()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exitButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  questionCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  finishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 8,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  marksText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  optionButton: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  questionNavigator: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 6,
  },
  navActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  resultsHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  resultsScoreSection: {
    padding: 16,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
  },
  scoreText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  reviewSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewQuestion: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 20,
  },
  answersSection: {
    gap: 8,
    marginBottom: 12,
  },
  answerItem: {
    flexDirection: 'row',
    gap: 8,
  },
  answerLabel: {
    fontSize: 13,
    minWidth: 100,
  },
  answerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  correctAnswerText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  explanationContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
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
});
