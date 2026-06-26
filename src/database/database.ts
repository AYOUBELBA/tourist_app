import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('ri7la.db');

export const initDatabase = async () => {
  try {
    // Create users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create cities table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        region TEXT
      );
    `);

    // Create favorites table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        itemType TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);

    console.log('Database initialized successfully');
    
    // Insert sample cities
    await insertSampleData();
  } catch (error) {
    console.error('Database error:', error);
  }
};

const insertSampleData = async () => {
  const cities = [
    { name: 'Marrakech', description: 'The Red City', image: 'https://images.unsplash.com/photo-1533840004986-7530e15689bb', region: 'Marrakech-Safi' },
    { name: 'Casablanca', description: 'Economic Capital', image: 'https://images.unsplash.com/photo-1571115769316-c0adf6e20019', region: 'Casablanca-Settat' },
    { name: 'Fes', description: 'Cultural Capital', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9', region: 'Fes-Meknes' },
    { name: 'Chefchaouen', description: 'The Blue Pearl', image: 'https://images.unsplash.com/photo-1544923408-75e2399e9e72', region: 'Tangier-Tetouan' },
    { name: 'Rabat', description: 'The Capital', image: 'https://images.unsplash.com/photo-1587163768800-9fa1a5de5a19', region: 'Rabat-Sale' },
    { name: 'Tangier', description: 'Gateway to Africa', image: 'https://images.unsplash.com/photo-1511390389142-6e6bb3e5f255', region: 'Tangier-Tetouan' },
  ];

  for (const city of cities) {
    await db.execAsync(
      'INSERT OR IGNORE INTO cities (name, description, image, region) VALUES (?, ?, ?, ?)',
      [city.name, city.description, city.image, city.region]
    );
  }
};

export { db };