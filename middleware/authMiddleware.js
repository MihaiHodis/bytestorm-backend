// middleware/authMiddleware.js
import admin from "../config/firebaseAdmin.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extrage token-ul din header-ul Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Verifică token-ul cu Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    //console.log("Decoded UID:", decodedToken.uid);


    // Adaugă info despre utilizator la request pentru a putea fi folosit în endpoint
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ message: "Unauthorized" });
  }
};
