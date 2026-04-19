# Smart Prayer Tracker

A React app to track your daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) with Firebase Authentication and Firestore.

## Setup

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure Firebase

Edit `.env` and replace the Firebase config values with your own project's credentials from the [Firebase Console](https://console.firebase.google.com/).

### 3. Add Firestore Security Rules

In Firebase Console → Firestore Database → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/prayers/{date} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Start the development server

```bash
yarn start
```

## Project Structure

```
src/
├── App.js                    # Root component & routing
├── index.js                  # Entry point
├── index.css                 # Global styles (Tailwind)
├── App.css                   # App-level styles
├── lib/
│   ├── firebase.js           # Firebase initialization
│   └── utils.js              # Tailwind utility helper
├── contexts/
│   └── AuthContext.js        # Google Auth context & provider
├── hooks/
│   ├── use-toast.js          # Toast notification hook
│   └── useFirestore.js       # Firestore hooks & utilities
└── components/
    ├── AuthButton.js         # Sign in / Sign out button
    └── PrayerTracker.js      # Main prayer tracking grid
```

## Features

- Google Sign-In via Firebase Authentication
- Track 5 daily prayers for the last 7 days
- Tap to cycle status: Empty → On-time → Late → Missed
- Data synced to Firestore per user
- Mobile-responsive layout
