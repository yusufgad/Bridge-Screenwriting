# Setting Up Firebase for Bridge

This guide will walk you through setting up Firebase for the Bridge screenwriting application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Bridge-Screenwriting")
4. Choose whether to enable Google Analytics (recommended)
5. Complete the project creation process

## Step 2: Set Up Firestore Database

1. In your Firebase project console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Start in "Production mode" (or "Test mode" for development)
4. Choose a location closest to your users
5. Click "Enable"

## Step 3: Set Up Authentication

1. In your Firebase project console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the "Email/Password" provider at minimum
4. Optionally enable "Google" as a sign-in method

## Step 4: Register Your Web Application

1. In your Firebase project console, click the web icon (</>) on the home page
2. Enter a nickname for your app (e.g., "bridge-web")
3. Optionally enable Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration object that appears

## Step 5: Update Your .env File

1. In your Bridge project, open the `.env` file
2. Fill in the Firebase configuration values from the configuration object you copied:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 6: Set Up Firebase Security Rules

1. In your Firebase project console, go to "Firestore Database" 
2. Click on the "Rules" tab
3. Replace the rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scripts/{scriptId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

4. Click "Publish"

## Step 7: Install Firebase CLI (Optional for Deployment)

1. Install Firebase CLI globally: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize your project: `firebase init` (select Hosting)
4. Deploy to Firebase: `firebase deploy`

## Next Steps

1. Start your development server with `npm run dev`
2. Register a user account
3. Start creating scripts! 