import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { apiFetch } from '../lib/api'
import { useAuth } from '../lib/auth'

type Product = {
  id: string; slug: string; name: string; priceCents: number; images: string[]
  category: { name: string }; variants: { stock: number }[]
}

type Nav = NativeStackNavigationProp<any>

export default function ShopScreen() {
  const navigation = useNavigation<Nav>()
  const { logout, user } = useAuth()
  const [products, setProducts] = useState<Product[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(() => {
    apiFetch('/products?page=1&limit=30', null)
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
  }, [])

  useEffect(load, [load])

  async function onRefresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 300))
    load()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vault Kicks</Text>
          <Text style={styles.subtitle}>{user ? `Bonjour, ${user.name}` : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scanner')}>
            <Text style={styles.scanButtonText}>Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Déco</Text>
          </TouchableOpacity>
        </View>
      </View>

      {products === null ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#ff5a1f" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff5a1f" />}
          renderItem={({ item }) => {
            const inStock = item.variants.some((v) => v.stock > 0)
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Product', { slug: item.slug })}
              >
                <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
                {!inStock && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Épuisé</Text>
                  </View>
                )}
                <Text style={styles.cardCategory}>{item.category.name}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardPrice}>{(item.priceCents / 100).toFixed(2)} €</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 54, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  title: { color: '#fff', fontSize: 19, fontWeight: '900' },
  subtitle: { color: '#888', fontSize: 12, marginTop: 2 },
  scanButton: { backgroundColor: '#ff5a1f', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  scanButtonText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  logoutButton: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  logoutButtonText: { color: '#ccc', fontWeight: '600', fontSize: 12.5 },
  card: { flex: 1, backgroundColor: '#161616', borderRadius: 12, padding: 10, marginBottom: 12, position: 'relative' },
  cardImage: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 8, backgroundColor: '#222' },
  badge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(220,38,38,0.85)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardCategory: { color: '#888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  cardName: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardPrice: { color: '#fff', fontSize: 14, fontWeight: '800' },
})
