// Firebase Admin SDK - Backend only
// Para verificar tokens JWT en API routes

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

let app: App | null = null;
let auth: Auth | null = null;

function initializeFirebaseAdmin() {
  // Si ya está inicializado, retornar
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
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (parseError) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', parseError);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON format');
      }
    }
    // Opción 2: Leer desde archivo local (para desarrollo)
    else if (typeof window === 'undefined') {
      // Solo intentar leer el archivo en el servidor (no en build time del cliente)
      try {
        console.log('🔧 Loading Firebase service account from file');
        const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, 'utf8')
          );
        } else {
          console.warn('⚠️ Firebase service account file not found, will retry on first use');
          // No tirar error aquí, permitir que continúe el build
          return { app: null, auth: null };
        }
      } catch (fileError) {
        console.warn('⚠️ Could not read Firebase service account file:', fileError);
        return { app: null, auth: null };
      }
    } else {
      // En el cliente, no hacer nada
      return { app: null, auth: null };
    }

    if (!serviceAccount) {
      console.warn('⚠️ No Firebase service account available yet');
      return { app: null, auth: null };
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
    // No tirar error en build time
    return { app: null, auth: null };
  }
}

// Intentar inicializar, pero no fallar si no está disponible
const { app: firebaseApp, auth: firebaseAuth } = initializeFirebaseAdmin();

// Getter lazy para auth que inicializa bajo demanda
export const getAdminAuth = (): Auth => {
  if (!auth && typeof window === 'undefined') {
    // Reintentar inicialización
    const result = initializeFirebaseAdmin();
    if (!result.auth) {
      throw new Error('Firebase Admin not initialized. Please check FIREBASE_SERVICE_ACCOUNT_JSON env variable.');
    }
    return result.auth;
  }
  if (!auth) {
    throw new Error('Firebase Admin auth not available');
  }
  return auth;
};

export { firebaseApp as app, firebaseAuth as auth };
export const adminAuth = { verifyIdToken: async (token: string) => getAdminAuth().verifyIdToken(token) };

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
