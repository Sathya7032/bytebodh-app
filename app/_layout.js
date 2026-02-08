import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';

const _layout = () => {
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack>
        <Stack.Screen
          name="Index"
          options={{  
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{  
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(login)"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="job-detail"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="blog-detail"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="terms"
          options={{  
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{  
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="contact"
          options={{  
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgotPassword"
          options={{  
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="changePassword"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="blogs"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="tasks"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="allquiz"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="portfolio"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="resume"
          options={{  
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="quizleaderboard"
          options={{  
            headerShown: false,
          }}
        />


      </Stack>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default _layout;
