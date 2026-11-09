import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { apiFetch } from './api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(token: string | null) {
  if (!Device.isDevice) {
    // Les notifications push ne fonctionnent pas dans un simulateur/émulateur.
    return
  }
  if (!token) return

  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    let status = existing
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync()
      status = req.status
    }
    if (status !== 'granted') return

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      })
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const pushToken = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)

    await apiFetch('/push-tokens', token, {
      method: 'POST',
      body: JSON.stringify({ token: pushToken.data, platform: Platform.OS }),
    })
  } catch {
    // best-effort : l'app doit fonctionner même si l'enregistrement push échoue
  }
}
