import { useEffect } from 'react'

type MetaOptions = {
  title?: string
  description?: string
  image?: string
  type?: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const DEFAULT_TITLE = 'Vault Kicks — Sneakers premium'
const DEFAULT_DESCRIPTION = 'Vault Kicks — la boutique de sneakers running, trail et lifestyle. Livraison rapide, retours gratuits sous 30 jours.'
const DEFAULT_IMAGE = ''

export function useDocumentMeta({ title, description, image, type = 'website' }: MetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Vault Kicks` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    const img = image || DEFAULT_IMAGE

    document.title = fullTitle
    setMetaTag('name', 'description', desc)
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', desc)
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:url', window.location.href)
    if (img) setMetaTag('property', 'og:image', img)
    setMetaTag('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', desc)
    if (img) setMetaTag('name', 'twitter:image', img)

    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title, description, image, type])
}
