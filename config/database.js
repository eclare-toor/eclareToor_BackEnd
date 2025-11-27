import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Configuration DB chargée:');
console.log('  Database:', process.env.DB_NAME);
console.log('  Port:', process.env.PORT);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Export testConnection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const dbResult = await client.query('SELECT current_database()');
    console.log('✅ Connecté à la base:', dbResult.rows[0].current_database);
    
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('📊 Table users existe:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      const users = await client.query('SELECT COUNT(*) as count FROM users');
      console.log('👥 Nombre d\'utilisateurs:', users.rows[0].count);
    } else {
      console.log('❌ ATTENTION: Table users non trouvée!');
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion DB:', error.message);
    return false;
  }
};

export const query = (text, params) => pool.query(text, params);
export { pool };