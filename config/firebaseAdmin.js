// config/firebaseAdmin.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// 🔑 Cheia de service de la Firebase (se descarcă din Firebase Console > Project Settings > Service Accounts)
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Inițializează Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
