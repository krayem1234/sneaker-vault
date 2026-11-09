import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { AuthProvider, useAuth } from './src/lib/auth'
import LoginScreen from './src/screens/LoginScreen'
import ShopScreen from './src/screens/ShopScreen'
import ProductScreen from './src/screens/ProductScreen'
import ScannerScreen from './src/screens/ScannerScreen'

const Stack = createNativeStackNavigator()

function RootNavigator() {
  const { token, ready } = useAuth()

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#ff5a1f" />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Product" component={ProductScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} options={{ presentation: 'fullScreenModal' }} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
