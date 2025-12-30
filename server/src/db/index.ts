// Re-export database connection and schema
export { db, testConnection, closeConnection } from '../config/database.js';
export * from './schema.js';
