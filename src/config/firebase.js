const { initializeFirebase } = require('../utils/firebase');
const path = require('path');

let serviceAccount;
try {
  serviceAccount = require('../config/firebase-service-account.json');
} catch (error) {
  // Service account file not found - will try environment variables
  serviceAccount = {};
}
/**
 * Initialize Firebase Admin SDK with service account
 * You need to download your Firebase service account key from:
 * Firebase Console > Project Settings > Service Accounts > Generate New Private Key
 * 
 * Save the JSON file and update the path below or use environment variables
 */

let isInitialized = false;

function setupFirebase() {
  if (isInitialized) {
    return;
  }

  try {
    // Option 1: Load from file
    // const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));
    
    // Option 2: Load from environment variables (recommended for production)
    

    // Check if required fields are present
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.warn('Firebase credentials not configured. Notifications will not work.');
      console.warn('Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.');
      return;
    }

    initializeFirebase(serviceAccount);
    isInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    console.warn('Notifications will not work until Firebase is properly configured.');
  }
}

module.exports = { setupFirebase };
