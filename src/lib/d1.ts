/**
 * Cloudflare D1 Database Helper
 * 
 * Este módulo proporciona funciones para interactuar con Cloudflare D1 (SQLite)
 * usando la API REST de Cloudflare.
 * 
 * Documentación: https://developers.cloudflare.com/d1/
 */

// Tipos para Cloudflare D1 API responses
interface D1Result {
  success: boolean;
  result: Array<{
    results: any[];
    success: boolean;
    meta: {
      changed_db: boolean;
      changes: number;
      duration: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
      size_after: number;
    };
  }>;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: string[];
}

interface D1QueryOptions {
  params?: any[];
}

/**
 * Ejecuta una query SQL en Cloudflare D1
 * 
 * @param sql - Query SQL (puede contener ? como placeholders)
 * @param params - Parámetros para reemplazar en la query
 * @returns Resultado de la query
 */
export async function executeD1Query(
  sql: string,
  params: any[] = []
): Promise<any[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    console.error('❌ [D1] Faltan variables de entorno:');
    console.error('  - CLOUDFLARE_ACCOUNT_ID:', accountId ? '✅' : '❌');
    console.error('  - CLOUDFLARE_D1_DATABASE_ID:', databaseId ? '✅' : '❌');
    console.error('  - CLOUDFLARE_API_TOKEN:', apiToken ? '✅' : '❌');
    throw new Error('Cloudflare D1 credentials not configured');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  console.log('🔍 [D1] Ejecutando query:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
  console.log('📊 [D1] Parámetros:', params.length > 0 ? params : 'sin parámetros');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [D1] Error HTTP:', response.status, errorText);
      throw new Error(`D1 API error: ${response.status} ${errorText}`);
    }

    const data: D1Result = await response.json();

    if (!data.success) {
      console.error('❌ [D1] Query falló:', data.errors);
      throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
    }

    const results = data.result[0]?.results || [];
    console.log(`✅ [D1] Query exitosa (${results.length} filas)`);

    return results;
  } catch (error) {
    console.error('❌ [D1] Error ejecutando query:', error);
    throw error;
  }
}

/**
 * Ejecuta múltiples queries en una transacción
 * 
 * @param queries - Array de { sql, params }
 * @returns Resultados de todas las queries
 */
export async function executeD1Transaction(
  queries: Array<{ sql: string; params?: any[] }>
): Promise<any[][]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error('Cloudflare D1 credentials not configured');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  console.log(`🔄 [D1] Ejecutando transacción con ${queries.length} queries`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queries.map(q => ({
        sql: q.sql,
        params: q.params || [],
      }))),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [D1] Error HTTP en transacción:', response.status, errorText);
      throw new Error(`D1 API error: ${response.status} ${errorText}`);
    }

    const data: D1Result = await response.json();

    if (!data.success) {
      console.error('❌ [D1] Transacción falló:', data.errors);
      throw new Error(`D1 transaction failed: ${JSON.stringify(data.errors)}`);
    }

    const results = data.result.map(r => r.results || []);
    console.log(`✅ [D1] Transacción exitosa (${results.length} queries)`);

    return results;
  } catch (error) {
    console.error('❌ [D1] Error ejecutando transacción:', error);
    throw error;
  }
}

/**
 * Helper para INSERT que retorna el ID insertado
 */
export async function insertD1(
  table: string,
  data: Record<string, any>
): Promise<number> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => '?').join(', ');

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
  `;

  console.log(`📝 [D1] INSERT en tabla ${table}:`, columns);

  await executeD1Query(sql, values);

  // Obtener el último ID insertado
  const [result] = await executeD1Query('SELECT last_insert_rowid() as id');
  return result.id;
}

/**
 * Helper para UPDATE
 */
export async function updateD1(
  table: string,
  data: Record<string, any>,
  where: { column: string; value: any }
): Promise<number> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns.map(col => `${col} = ?`).join(', ');

  const sql = `
    UPDATE ${table}
    SET ${setClause}
    WHERE ${where.column} = ?
  `;

  console.log(`📝 [D1] UPDATE en tabla ${table}:`, columns, 'WHERE', where);

  const result = await executeD1Query(sql, [...values, where.value]);
  return result.length;
}

/**
 * Helper para SELECT con filtros opcionales
 */
export async function selectD1<T = any>(
  table: string,
  options: {
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
  } = {}
): Promise<T[]> {
  const columns = options.columns?.join(', ') || '*';
  let sql = `SELECT ${columns} FROM ${table}`;
  const params: any[] = [];

  if (options.where) {
    const whereKeys = Object.keys(options.where);
    const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
    sql += ` WHERE ${whereClause}`;
    params.push(...Object.values(options.where));
  }

  if (options.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }

  if (options.limit) {
    sql += ` LIMIT ${options.limit}`;
  }

  console.log(`🔍 [D1] SELECT en tabla ${table}:`, options);

  return executeD1Query(sql, params) as Promise<T[]>;
}

/**
 * Helper para DELETE
 */
export async function deleteD1(
  table: string,
  where: { column: string; value: any }
): Promise<number> {
  const sql = `DELETE FROM ${table} WHERE ${where.column} = ?`;

  console.log(`🗑️ [D1] DELETE en tabla ${table} WHERE`, where);

  const result = await executeD1Query(sql, [where.value]);
  return result.length;
}
