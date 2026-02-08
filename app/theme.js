import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themes, useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const ThemeScreen = () => {
  const router = useRouter();
  const { colors, currentTheme, changeTheme } = useTheme();

  const themeOptions = Object.values(themes);

  const handleThemeSelect = (themeId) => {
    changeTheme(themeId);
  };

  const renderThemeCard = (theme) => {
    const isSelected = currentTheme.id === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        style={styles.themeCard}
        onPress={() => handleThemeSelect(theme.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.themeGradient, isSelected && styles.selectedTheme]}
        >
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={32} color={colors.white} />
            </View>
          )}
          
          <View style={styles.themeContent}>
            <View style={styles.colorCirclesRow}>
              <View style={[styles.colorCircle, { backgroundColor: theme.primary }]} />
              <View style={[styles.colorCircle, { backgroundColor: theme.secondary }]} />
              <View style={[styles.colorCircle, { backgroundColor: theme.accent }]} />
            </View>
            
            <Text style={styles.themeName}>{theme.name}</Text>
            
            {isSelected && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.darkGray }]}>Choose Theme</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.darkGray }]}>
            Personalize Your Experience
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.mediumGray }]}>
            Select a theme that matches your style. Your choice will be applied throughout the app.
          </Text>

          <View style={styles.themesGrid}>
            {themeOptions.map(renderThemeCard)}
          </View>

          {/* Preview Section */}
          <View style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.darkGray }]}>Preview</Text>
            
            <LinearGradient
              colors={colors.gradient}
              style={styles.previewCard}
            >
              <View style={styles.previewHeader}>
                <Ionicons name="notifications" size={24} color={colors.white} />
                <View style={styles.previewBadge} />
              </View>
              
              <Text style={styles.previewTitle}>Sample Card</Text>
              <Text style={styles.previewText}>
                This is how your selected theme looks across the app
              </Text>
              
              <View style={styles.previewButtons}>
                <View style={[styles.previewButton, { backgroundColor: colors.white }]}>
                  <Text style={[styles.previewButtonText, { color: colors.primary }]}>
                    Primary
                  </Text>
                </View>
                <View style={[styles.previewButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.previewButtonTextWhite}>Secondary</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Example UI Elements */}
            <View style={styles.examplesContainer}>
              <View style={[styles.exampleButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="play-circle" size={20} color={colors.white} />
                <Text style={styles.exampleButtonText}>Start Quiz</Text>
              </View>
              
              <View style={[styles.exampleChip, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="trophy" size={16} color={colors.primary} />
                <Text style={[styles.exampleChipText, { color: colors.primary }]}>
                  Achievement
                </Text>
              </View>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  themeCard: {
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
  themeGradient: {
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
    position: 'relative',
  },
  selectedTheme: {
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 8,
    shadowOpacity: 0.3,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  themeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  colorCirclesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  previewSection: {
    marginTop: 10,
  },
  previewCard: {
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    lineHeight: 20,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  previewButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewButtonTextWhite: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  examplesContainer: {
    gap: 12,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  exampleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  exampleChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ThemeScreen;
