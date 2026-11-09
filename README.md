# Vault Kicks

Boutique en ligne de sneakers, avec gestion du stock par taille, panel admin
complet, et une **app mobile compagnon** pour scanner les produits en magasin.
Le projet couvre tout le cycle e-commerce côté client, côté admin, et une
extension mobile — pas qu'un catalogue avec un panier.

## Fonctionnalités

### Boutique (web)

- Catalogue par catégories, variantes par taille/stock.
- Panier, **paiement Stripe** (mode test), suivi de commande (timeline).
- Compte client : historique de commandes, liste de souhaits, avis produits,
  carnet d'adresses.
- **Alerte retour en stock** : un client s'inscrit sur une taille épuisée,
  reçoit un email (et un push mobile, voir plus bas) dès le restock.
- Codes promo, "récemment consultés", partage de produit.
- Thème clair/sombre.

### Panel admin

- Gestion des produits, variantes et stock.
- Gestion des commandes et des codes promo.
- Statistiques de ventes (graphique).

### App mobile compagnon (`mobile/`)

- Même compte que la boutique web (API partagée, JWT).
- **Scan de QR code** en magasin → ouverture directe de la fiche produit.
- **Notifications push** : alerte de retour en stock envoyée directement sur
  le téléphone (en plus de l'email).

Détails et mise en place de l'app mobile : [`mobile/README.md`](mobile/README.md).

## Pile technique

- **Backend** : NestJS, Prisma, Stripe, JWT, bcrypt.
- **Frontend** : React + Vite + TypeScript.
- **Mobile** : Expo (React Native + TypeScript), `expo-camera`, `expo-notifications`.
- **Infra** : Docker / docker-compose pour backend + frontend.

## Modèle de données

`User` · `Category` · `Product` / `ProductVariant` (stock par taille) ·
`Order` / `OrderItem` · `WishlistItem` · `Review` · `PromoCode` ·
`StockNotification` · `Address` · `PushToken` · `PasswordResetToken`.

## Installation

### Backend

Copie `backend/.env.example` en `backend/.env` et renseigne `DATABASE_URL`,
`JWT_SECRET` et les clés Stripe (test) :

```
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

### Avec Docker

```
docker-compose up
```

### App mobile

Voir [`mobile/README.md`](mobile/README.md) — se lance sur un téléphone
physique via l'app Expo Go, sans installation d'Android Studio ni Xcode.

## Pourquoi ce projet pour un portfolio

Au-delà du e-commerce classique (panier, paiement, stock), ce projet montre
une architecture **full-stack cohérente et étendue** : la même API NestJS
sert à la fois une app web et une app mobile, avec une fonctionnalité qui
relie les deux (alerte de stock par email **et** par push). C'est le genre
d'intégration transverse (web + mobile + paiement + notifications) que les
recruteurs apprécient voir plutôt que plusieurs petits projets isolés.
