import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { clearTokens } from '../lib/secureStore';

export default function CustomDrawer({ visible, onClose }) {
  const { colors } = useTheme();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNavigation = (route) => {
    onClose();
    setTimeout(() => router.push(route), 300);
  };

  const handleHelpSupport = () => {
    onClose();
    setTimeout(() => router.push('/contact'), 300);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              console.log('Logging out...');
              await clearTokens();
              console.log('Tokens cleared successfully');
              onClose();
              setTimeout(() => router.replace('/(login)'), 300);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Drawer Content */}
        <Animated.View 
          style={[
            styles.drawer, 
            { 
              backgroundColor: colors.white,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Ionicons name="person-circle" size={80} color={colors.white} />
            <Text style={styles.headerTitle}>ByteBodh</Text>
            <Text style={styles.headerSubtitle}>Learn & Grow</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/(tabs)/home')}
            >
              <Ionicons name="home-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/(tabs)/leaderboards')}
            >
              <Ionicons name="trophy-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/blogs')}
            >
              <Ionicons name="book-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Blogs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/(tabs)/jobs')}
            >
              <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/(tabs)/profile')}
            >
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Profile</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />

            {/* Help & Support */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleHelpSupport}
            >
              <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
              <Text style={[styles.menuText, { color: '#e74c3c' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: 280,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 20,
  },
});
