import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Verificar bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // Test 2: Listar archivos en profile-photos
    const { data: files, error: filesError } = await supabase.storage
      .from('profile-photos')
      .list();
    
    // Test 3: Verificar tabla profile_photos
    const { data: photos, error: photosError } = await supabase
      .from('profile_photos')
      .select('*')
      .limit(5);
    
    // Test 4: Intentar subir archivo de prueba
    const testFile = new Uint8Array([1, 2, 3, 4, 5]);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload('test/test.txt', testFile, {
        contentType: 'text/plain',
        upsert: true
      });
    
    return NextResponse.json({
      success: true,
      tests: {
        buckets: {
          success: !bucketsError,
          count: buckets?.length || 0,
          error: bucketsError?.message
        },
        files: {
          success: !filesError,
          count: files?.length || 0,
          error: filesError?.message
        },
        profile_photos_table: {
          success: !photosError,
          count: photos?.length || 0,
          error: photosError?.message
        },
        upload_test: {
          success: !uploadError,
          path: uploadData?.path,
          error: uploadError?.message
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
