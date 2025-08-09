
# Project B — Borewell Log Data (Starter)

This is a minimal Expo React Native starter scaffold configured for Firebase (Firestore) integration.
It includes basic screen placeholders for:
- Landing
- Daily Log
- Salary
- Maintenance
- HSD/Pipe
- Statement

## Setup

1. Install Expo CLI (if you don't have it):
   ```bash
   npm install -g expo-cli
   ```

2. Install dependencies:
   ```bash
   cd project_b_starter
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project and enable Firestore and Authentication.
   - Copy your firebase config into `src/firebaseConfig.example.js` and rename it to `src/firebaseConfig.js`.

4. Run the app:
   ```bash
   npm start
   ```

## Notes
- This scaffold focuses on structure and connectivity; business logic and Cloud Functions will be added next.
- Files to pay attention to: `App.js`, `src/navigation/TabNavigator.js`, `src/screens/*`, `src/firebase.js`.


## Note
Make sure to create `src/firebaseConfig.js` with your Firebase web config (rename from the example file). The app relies on Firestore.


## Additional features added
- Firebase Auth screens and AuthContext (src/contexts/AuthContext.js and auth screens).
- Firestore security rules sample (firestore.rules).
- Cloud Functions sample (functions/index.js) to handle transactional updates (deploy separately).
- Export to JSON/XLSX in Statement screen (requires expo-file-system, expo-sharing, xlsx). Install dependencies if using exports.

## Running Cloud Functions
- cd functions
- npm install
- firebase deploy --only functions



## Security & Functions Deployment
1. In Firebase Console, enable Authentication (Email/Password).
2. To deploy Firestore rules:
   - `firebase deploy --only firestore:rules`
3. To deploy functions:
   - `cd functions && npm install && firebase deploy --only functions`

Make sure Firebase project is set to the correct project with `firebase use`.
