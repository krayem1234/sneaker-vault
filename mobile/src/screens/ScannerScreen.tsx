import { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type Nav = NativeStackNavigationProp<any>

// Les QR codes en magasin encodent soit le slug du produit directement
// ("air-max-trail-97"), soit un lien du type "vaultkicks://product/<slug>"
// ou une URL web "https://.../product/<slug>" — on extrait le dernier segment.
function extractSlug(raw: string): string {
  const trimmed = raw.trim()
  const parts = trimmed.split('/').filter(Boolean)
  return parts.length ? parts[parts.length - 1] : trimmed
}

export default function ScannerScreen() {
  const navigation = useNavigation<Nav>()
  const [permission, requestPermission] = useCameraPermissions()
  const [locked, setLocked] = useState(false)
  const lastScan = useRef<{ value: string; at: number } | null>(null)

  function onScanned(result: { data: string }) {
    const now = Date.now()
    if (lastScan.current && lastScan.current.value === result.data && now - lastScan.current.at < 2000) {
      return // évite de scanner le même code plusieurs fois d'affilée
    }
    lastScan.current = { value: result.data, at: now }
    if (locked) return
    setLocked(true)
    const slug = extractSlug(result.data)
    navigation.replace('Product', { slug })
    setTimeout(() => setLocked(false), 1500)
  }

  if (!permission) {
    return <View style={styles.center} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Accès à la caméra nécessaire pour scanner un QR code.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Vise le QR code sur l'étiquette du produit</Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  permissionButton: { backgroundColor: '#ff5a1f', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  permissionButtonText: { color: '#fff', fontWeight: '700' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: '#ff5a1f', borderRadius: 20, backgroundColor: 'transparent' },
  hint: { color: '#fff', fontSize: 13, marginTop: 20, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  closeButton: { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 12 },
  closeButtonText: { color: '#fff', fontWeight: '700' },
})
