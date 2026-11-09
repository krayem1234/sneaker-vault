import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { apiFetch } from '../lib/api'
import { useAuth } from '../lib/auth'

type Variant = { id: string; size: string; stock: number }
type Product = {
  id: string; name: string; slug: string; description: string; priceCents: number
  images: string[]; category: { name: string }; variants: Variant[]
}

type RouteParams = { Product: { slug: string } }

export default function ProductScreen() {
  const route = useRoute<RouteProp<RouteParams, 'Product'>>()
  const navigation = useNavigation()
  const { token, user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [alertSent, setAlertSent] = useState(false)
  const [sendingAlert, setSendingAlert] = useState(false)

  useEffect(() => {
    setProduct(null)
    setNotFound(false)
    setSelectedSize(null)
    setAlertSent(false)
    apiFetch(`/products/${route.params.slug}`, null)
      .then(setProduct)
      .catch(() => setNotFound(true))
  }, [route.params.slug])

  async function notifyMe() {
    if (!product || !selectedSize || !user) return
    setSendingAlert(true)
    try {
      await apiFetch(`/products/${product.id}/notify-me`, null, {
        method: 'POST',
        body: JSON.stringify({ size: selectedSize, email: user.email }),
      })
      setAlertSent(true)
    } catch {
      // silencieux : on retente simplement au prochain tap
    } finally {
      setSendingAlert(false)
    }
  }

  if (notFound) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Produit introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff5a1f" />
      </View>
    )
  }

  const variant = product.variants.find((v) => v.size === selectedSize)

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={{ uri: product.images[0] }} style={styles.image} />
      <View style={styles.body}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.category}>{product.category.name}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{(product.priceCents / 100).toFixed(2)} €</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={styles.sectionLabel}>POINTURE</Text>
        <View style={styles.sizeRow}>
          {product.variants.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.sizePill,
                selectedSize === v.size && styles.sizePillSelected,
                v.stock === 0 && styles.sizePillDisabled,
              ]}
              onPress={() => setSelectedSize(v.size)}
            >
              <Text style={[styles.sizePillText, selectedSize === v.size && styles.sizePillTextSelected]}>{v.size}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {variant && variant.stock > 0 && variant.stock <= 3 && (
          <Text style={styles.lowStock}>Plus que {variant.stock} en stock</Text>
        )}

        {variant && variant.stock === 0 && (
          <View style={styles.alertBox}>
            {alertSent ? (
              <Text style={styles.alertSentText}>On t'envoie une notif push dès que la taille {variant.size} revient.</Text>
            ) : (
              <>
                <Text style={styles.alertText}>Taille {variant.size} épuisée.</Text>
                <TouchableOpacity style={styles.alertButton} onPress={notifyMe} disabled={sendingAlert}>
                  <Text style={styles.alertButtonText}>{sendingAlert ? '...' : "M'alerter (push)"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 320, backgroundColor: '#1a1a1a' },
  body: { padding: 20 },
  backLink: { color: '#ff5a1f', fontSize: 14, fontWeight: '700', marginBottom: 14 },
  notFoundText: { color: '#fff', fontSize: 16, marginBottom: 14 },
  backButton: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  backButtonText: { color: '#fff', fontWeight: '700' },
  category: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  name: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  price: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  description: { color: '#aaa', fontSize: 13.5, lineHeight: 20, marginBottom: 22 },
  sectionLabel: { color: '#888', fontSize: 11, fontWeight: '700', marginBottom: 10 },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  sizePill: { borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  sizePillSelected: { borderColor: '#ff5a1f', backgroundColor: 'rgba(255,90,31,0.12)' },
  sizePillDisabled: { opacity: 0.35 },
  sizePillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sizePillTextSelected: { color: '#ff5a1f' },
  lowStock: { color: '#f87171', fontSize: 12.5, fontWeight: '700', marginBottom: 10 },
  alertBox: { backgroundColor: '#161616', borderRadius: 10, padding: 14, marginTop: 6 },
  alertText: { color: '#ccc', fontSize: 13, marginBottom: 10 },
  alertButton: { backgroundColor: '#ff5a1f', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  alertButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  alertSentText: { color: '#34d399', fontSize: 13, fontWeight: '600' },
})
