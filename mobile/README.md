# Vault Kicks — Companion App (mobile)

App mobile compagnon de la boutique [Vault Kicks](../backend) : scanner un QR
code en magasin pour ouvrir une fiche produit, et recevoir une **notification
push** quand une taille épuisée revient en stock.

Construite avec **Expo (React Native + TypeScript)** — testable directement
sur un téléphone physique via l'app **Expo Go**, sans Android Studio, Xcode
ni émulateur.

## Fonctionnalités

- Connexion avec le même compte que sur la boutique web (JWT, backend NestJS partagé).
- Catalogue produits (liste + fiche détail), réutilise l'API existante.
- **Scan QR code** : vise le QR code d'un produit → ouverture directe de sa fiche.
- **Alertes stock en push** : sur une taille épuisée, "M'alerter" enregistre
  l'utilisateur ; dès que l'admin remet du stock, un push arrive sur le téléphone
  (en plus de l'email déjà envoyé côté web).

## Mise en place

Dans ce dossier (`sneaker-vault/mobile`), **dans ton terminal Windows** :

```
npm install
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-camera expo-notifications expo-device expo-constants @react-native-async-storage/async-storage
```

Puis édite `src/lib/config.ts` et remplace l'IP par celle de ton PC sur le
Wi-Fi (trouvable avec `ipconfig`, champ "Adresse IPv4") — le téléphone ne peut
pas joindre `localhost`, qui désigne le téléphone lui-même.

Le backend doit tourner (`npm run dev` dans `backend/`) et ton pare-feu
Windows doit autoriser les connexions entrantes sur le port 3002 (Windows
peut demander confirmation la première fois).

### Lancer l'app

```
npx expo start
```

Un QR code s'affiche dans le terminal. Installe l'app **Expo Go** (gratuite,
Play Store / App Store) sur ton téléphone, assure-toi qu'il est sur le même
Wi-Fi que le PC, puis scanne ce QR code avec Expo Go (ou l'appareil photo —
il proposera d'ouvrir Expo Go). L'app se lance en direct, avec rechargement
à chaud à chaque modif.

### Tester le scan de QR codes produits

Le dossier `sample-qr-codes/` contient des QR codes de test pour 6 produits
réels de la boutique — affiche une des images sur un écran (ou imprime-la) et
scanne-la depuis l'app avec le bouton "Scanner".

### Activer les notifications push (optionnel mais recommandé pour la démo)

Les tokens push Expo nécessitent un compte Expo gratuit lié au projet :

```
npx eas init
```

Ça te demande de te connecter / créer un compte Expo (gratuit) et ajoute
automatiquement un `projectId` dans la config. Sans cette étape, le reste de
l'app fonctionne normalement (scan, navigation, alerte par email côté web) —
seul l'enregistrement du push échouera silencieusement.

## Backend : une migration à lancer

Ce projet ajoute un modèle `PushToken` au schéma Prisma (en plus de `Address`
et `StockNotification` du précédent lot de features). Si tu n'as pas encore
lancé la migration, fais-le une seule fois dans `backend/` :

```
npx prisma migrate dev --name add_stock_notify_addresses_push
```

(Si tu l'avais déjà lancée avant cette session, relance juste la commande —
elle ne reprendra que ce qui manque, ici la table `PushToken`.)

## Pourquoi ce projet pour un portfolio

Ce companion app montre une compétence que la boutique web (NestJS + React)
ne couvre pas : développement mobile cross-platform, intégration caméra
(scan QR), et notifications push — tout en réutilisant une vraie API
backend déjà construite, ce qui prouve une architecture full-stack cohérente
plutôt que deux projets isolés.
