import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../lib/auth'
import { registerForPushNotifications } from '../lib/push'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError('')
    setLoading(true)
    let freshToken = ''
    try {
      freshToken = await login(email.trim(), password)
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
      setLoading(false)
      return
    }
    setLoading(false)
    // Fire-and-forget : ne bloque jamais la connexion si le push échoue.
    registerForPushNotifications(freshToken).catch(() => {})
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>V</Text>
      </View>
      <Text style={styles.title}>Vault Kicks</Text>
      <Text style={styles.subtitle}>Connecte-toi pour scanner et suivre tes alertes stock</Text>

      <TextInput
        style={styles.input}
        placeholder="toi@exemple.com"
        placeholderTextColor="#8a8a8a"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#8a8a8a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>Utilise le même compte que sur la boutique web.</Text>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#ff5a1f', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: '#999', fontSize: 13, textAlign: 'center', marginBottom: 28, paddingHorizontal: 20 },
  input: {
    width: '100%', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#2a2a2a',
  },
  button: { width: '100%', backgroundColor: '#ff5a1f', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  error: { color: '#f87171', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  hint: { color: '#666', fontSize: 11.5, marginTop: 20, textAlign: 'center' },
})
