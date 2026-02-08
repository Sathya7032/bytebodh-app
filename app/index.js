import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { getAccessToken } from '../lib/secureStore'

const Index = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      // Check if user is authenticated
      const accessToken = await getAccessToken()
      
      if (accessToken) {
        // User is logged in, go to tabs
        router.replace('/(tabs)')
        return
      }
      
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted')
      
      if (onboardingCompleted === 'true') {
        // User has completed onboarding, go to login
        router.replace('/(login)')
      } else {
        // Show onboarding
        router.replace('/onboarding')
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // Default to onboarding on error
      router.replace('/onboarding')
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#667eea" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})

export default Index
