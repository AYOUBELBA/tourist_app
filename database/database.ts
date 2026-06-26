import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('ri7la.db');

export const initDatabase = async () => {
  try {
    // Users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'tourist',
        interests TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cities table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        region TEXT,
        latitude REAL,
        longitude REAL
      );
    `);

    // Places table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cityId INTEGER NOT NULL,
        vendorId INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        type TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        phone TEXT,
        priceRange TEXT,
        rating REAL DEFAULT 0,
        openingHours TEXT,
        views INTEGER DEFAULT 0,
        FOREIGN KEY (cityId) REFERENCES cities(id),
        FOREIGN KEY (vendorId) REFERENCES users(id)
      );
    `);

    // Bookings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        placeId INTEGER NOT NULL,
        placeName TEXT NOT NULL,
        placeType TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER DEFAULT 1,
        totalPrice REAL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (placeId) REFERENCES places(id)
      );
    `);

    // Favorites table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        placeId INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (placeId) REFERENCES places(id)
      );
    `);

    // Vendor businesses table
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS vendor_businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    placeId INTEGER,
    businessName TEXT NOT NULL,
    businessType TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    image TEXT,
    latitude REAL,
    longitude REAL,
    verified BOOLEAN DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (placeId) REFERENCES places(id)
  );
`);
try {
  await db.execAsync('ALTER TABLE vendor_businesses ADD COLUMN placeId INTEGER');
} catch (error) {
  // Column already exists
}
    // Reviews table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        placeId INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (placeId) REFERENCES places(id)
      );
    `);

    await insertSampleData();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database error:', error);
  }
};

const insertSampleData = async () => {
  try {
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM cities');
    const countResult = result[0] as any;
    
    if (countResult.count === 0) {
      const cities = [
        ['Marrakech', 'La ville rouge, joyau du Maroc', 'marrakech.jpg', 'Marrakech-Safi', 31.6295, -7.9811],
        ['Fès', 'Capitale spirituelle et culturelle', 'fes.jpg', 'Fès-Meknès', 34.0331, -5.0003],
        ['Chefchaouen', 'La perle bleue du Rif', 'chefchaouen.jpg', 'Tanger-Tétouan', 35.1713, -5.2697],
        ['Casablanca', 'Capitale économique', 'casablanca.jpg', 'Casablanca-Settat', 33.5731, -7.5898],
        ['Rabat', 'Capitale administrative', 'rabat.jpg', 'Rabat-Salé', 34.0209, -6.8416],
        ['Tanger', 'Porte de l\'Afrique', 'tanger.jpg', 'Tanger-Tétouan', 35.7595, -5.8340],
      ];

      for (const city of cities) {
        await db.runAsync(
          'INSERT INTO cities (name, description, image, region, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
          city
        );
      }
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Helper functions
export const getCities = async () => {
  return await db.getAllAsync('SELECT * FROM cities');
};

export const getCityById = async (cityId: number) => {
  const result = await db.getAllAsync('SELECT * FROM cities WHERE id = ?', [cityId]);
  return result[0];
};

export const getPlacesByCity = async (cityId: number, type?: string) => {
  let query = 'SELECT * FROM places WHERE cityId = ?';
  const params: (number | string)[] = [cityId];
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  return await db.getAllAsync(query, params);
};

export const getPlaceById = async (placeId: number) => {
  const result = await db.getAllAsync('SELECT * FROM places WHERE id = ?', [placeId]);
  return result[0];
};

export const getAllPlaces = async () => {
  return await db.getAllAsync('SELECT * FROM places');
};

export const addBooking = async (booking: any) => {
  const result = await db.runAsync(
    `INSERT INTO bookings (userId, placeId, placeName, placeType, date, time, guests, totalPrice, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [booking.userId, booking.placeId, booking.placeName, booking.placeType, 
     booking.date, booking.time, booking.guests, booking.totalPrice, 'pending']
  );
  return result;
};

export const getBookingsByUser = async (userId: number) => {
  return await db.getAllAsync('SELECT * FROM bookings WHERE userId = ? ORDER BY date DESC', [userId]);
};

export const getBookingsByPlace = async (placeId: number) => {
  return await db.getAllAsync('SELECT * FROM bookings WHERE placeId = ? ORDER BY date DESC', [placeId]);
};

export const updateBookingStatus = async (bookingId: number, status: string) => {
  await db.runAsync('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
};

export const addFavorite = async (userId: number, placeId: number) => {
  await db.runAsync('INSERT INTO favorites (userId, placeId) VALUES (?, ?)', [userId, placeId]);
};

export const removeFavorite = async (userId: number, placeId: number) => {
  await db.runAsync('DELETE FROM favorites WHERE userId = ? AND placeId = ?', [userId, placeId]);
};

export const getFavorites = async (userId: number) => {
  return await db.getAllAsync(
    `SELECT p.* FROM places p 
     INNER JOIN favorites f ON p.id = f.placeId 
     WHERE f.userId = ?`,
    [userId]
  );
};

export const isFavorite = async (userId: number, placeId: number): Promise<boolean> => {
  const result = await db.getAllAsync(
    'SELECT * FROM favorites WHERE userId = ? AND placeId = ?',
    [userId, placeId]
  );
  return result.length > 0;
};

export const addVendorBusiness = async (business: any) => {
  const result = await db.runAsync(
    `INSERT INTO vendor_businesses (userId, placeId, businessName, businessType, description, address, phone, email, image, latitude, longitude) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [business.userId, business.placeId, business.businessName, business.businessType, business.description,
     business.address, business.phone, business.email, business.image, business.latitude, business.longitude]
  );
  return result;
};

export const getVendorBusiness = async (userId: number) => {
  return await db.getAllAsync(
    `SELECT v.*, p.views, p.rating, p.id as placeId 
     FROM vendor_businesses v 
     LEFT JOIN places p ON v.placeId = p.id 
     WHERE v.userId = ?`,
    [userId]
  );
};
export const addUser = async (firstName: string, lastName: string, email: string, password: string, phone: string = '', role: string = 'tourist') => {
  const result = await db.runAsync(
    'INSERT INTO users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
    [firstName, lastName, email, phone, password, role]
  );
  return result;
};

export const getUserByEmail = async (email: string): Promise<any> => {
  try {
    const users = await db.getAllAsync('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export const addPlace = async (place: any) => {
  const result = await db.runAsync(
    `INSERT INTO places (cityId, vendorId, name, description, image, type, latitude, longitude, address, phone, priceRange, rating, openingHours) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [place.cityId, place.vendorId, place.name, place.description, place.image, place.type,
     place.latitude, place.longitude, place.address, place.phone, place.priceRange, place.rating, place.openingHours]
  );
  return result;
};

export const deletePlace = async (placeId: number) => {
  try {
    // Delete associated bookings first
    await db.runAsync('DELETE FROM bookings WHERE placeId = ?', [placeId]);
    // Delete associated favorites
    await db.runAsync('DELETE FROM favorites WHERE placeId = ?', [placeId]);
    // Delete associated reviews
    await db.runAsync('DELETE FROM reviews WHERE placeId = ?', [placeId]);
    // Finally delete the place
    await db.runAsync('DELETE FROM places WHERE id = ?', [placeId]);
  } catch (error) {
    console.error('Error deleting place:', error);
    throw error;
  }
};

export const updatePlace = async (placeId: number, data: any) => {
  await db.runAsync(
    'UPDATE places SET name = ?, description = ?, priceRange = ?, phone = ?, openingHours = ?, address = ? WHERE id = ?',
    [data.name, data.description, data.priceRange, data.phone, data.openingHours, data.address, placeId]
  );
};

// Views tracking
export const getPlaceViews = async (placeId: number) => {
  const result = await db.getAllAsync('SELECT views FROM places WHERE id = ?', [placeId]);
  return (result[0] as any)?.views || 0;
};

export const incrementPlaceViews = async (placeId: number) => {
  const currentViews = await getPlaceViews(placeId);
  await db.runAsync('UPDATE places SET views = ? WHERE id = ?', [currentViews + 1, placeId]);
};

// Reviews
export const addReview = async (review: any) => {
  const result = await db.runAsync(
    'INSERT INTO reviews (userId, placeId, rating, comment) VALUES (?, ?, ?, ?)',
    [review.userId, review.placeId, review.rating, review.comment]
  );
  return result;
};

export const getReviewsByPlace = async (placeId: number) => {
  return await db.getAllAsync('SELECT * FROM reviews WHERE placeId = ? ORDER BY createdAt DESC', [placeId]);
};

export const getAverageRating = async (placeId: number) => {
  const result = await db.getAllAsync('SELECT AVG(rating) as average FROM reviews WHERE placeId = ?', [placeId]);
  const avg = result[0] as { average: number } | undefined;
  return avg?.average || 0;
};
export const ensureViewsColumn = async () => {
  try {
    await db.execAsync('ALTER TABLE places ADD COLUMN views INTEGER DEFAULT 0');
    console.log('Views column added successfully');
  } catch (error) {
    // Column already exists, ignore
    console.log('Views column already exists');
  }
};
export default db;