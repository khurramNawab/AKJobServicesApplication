import admin from "firebase-admin";
import "dotenv/config";

// Helper to safely read env variables with potential quotes
const getEnv = (key) => process.env[key]?.replace(/^"|"$/g, '');

// Firebase Service Account Credentials from Environment Variables
const serviceAccount = {
  type: "service_account",
  project_id: getEnv('FIREBASE_PROJECT_ID'),
  private_key_id: getEnv('FIREBASE_PRIVATE_KEY_ID'),
  private_key: getEnv('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'), // Handle newlines correctly
  client_email: getEnv('FIREBASE_CLIENT_EMAIL'),
  client_id: getEnv('FIREBASE_CLIENT_ID'),
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: getEnv('FIREBASE_CLIENT_CERT_URL'),
};

// Initialize Firebase Admin SDK
const bucketName = getEnv('FIREBASE_STORAGE_BUCKET');

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName,
    });
    console.log("Firebase Admin Initialized Successfully!");
  }
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
}

const db = admin.firestore();
const storage = admin.storage().bucket(bucketName);
const auth = admin.auth();

export { db, storage, auth, admin };
