import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    // Hide splash screen after initialization
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sos/trigger" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="sos/active" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="report" options={{ headerShown: false }} />
        <Stack.Screen name="chat/index" options={{ headerShown: true, title: 'AI Safety Assistant' }} />
        <Stack.Screen name="moderator" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
