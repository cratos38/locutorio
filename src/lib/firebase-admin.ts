// Firebase Admin SDK - Backend only
// Para verificar tokens JWT en API routes

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

let app: App;
let auth: Auth;

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
    auth = getAuth(app);
    return { app, auth };
  }

  try {
    let serviceAccount;

    // Opción 1: Leer desde variable de entorno (para Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.log('🔧 Loading Firebase service account from env variable');
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }
    // Opción 2: Leer desde archivo local (para desarrollo)
    else {
      console.log('🔧 Loading Firebase service account from file');
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('Firebase service account key not found (file or env variable)');
      }

      serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
      );
    }

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    auth = getAuth(app);

    console.log('✅ Firebase Admin initialized');
    
    return { app, auth };
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Inicializar al importar
const { app: firebaseApp, auth: firebaseAuth } = initializeFirebaseAdmin();

export { firebaseApp as app, firebaseAuth as auth };
export const adminAuth = firebaseAuth; // Alias para compatibilidad

/**
 * Verifica un token JWT de Firebase
 * @param token - Token JWT del header Authorization
 * @returns Usuario decodificado con uid, email, etc.
 */
export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('❌ Error verifying Firebase token:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extrae y verifica el token del header Authorization
 * @param request - Request de Next.js
 * @returns Usuario decodificado o null si no hay token/inválido
 */
export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    return await verifyFirebaseToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware para proteger API routes
 * Retorna el usuario o lanza error 401
 */
export async function requireAuth(request: Request) {
  const user = await getAuthUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
