import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    env_vars: {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ EXISTS' : '❌ MISSING',
      ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ EXISTS' : '❌ MISSING',
      SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ EXISTS' : '❌ MISSING',
      SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ EXISTS' : '❌ MISSING',
      
      // Mostrar primeros 10 caracteres (seguro)
      SERVICE_KEY_preview: process.env.SUPABASE_SERVICE_KEY 
        ? process.env.SUPABASE_SERVICE_KEY.substring(0, 10) + '...' 
        : 'NOT FOUND',
      
      SERVICE_ROLE_KEY_preview: process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' 
        : 'NOT FOUND',
      
      // Ver todas las variables que empiezan con SUPABASE
      all_supabase_vars: Object.keys(process.env)
        .filter(key => key.includes('SUPABASE'))
        .map(key => `${key}: ${process.env[key] ? 'EXISTS' : 'MISSING'}`)
    }
  });
}
