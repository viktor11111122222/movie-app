const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from /main
app.use(express.static(path.join(__dirname, 'main')));

// ==================== DATABASE SETUP ====================
const db = new Database(path.join(__dirname, 'moviehub.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar_type TEXT DEFAULT 'color',
    avatar_color TEXT DEFAULT '#ffffff',
    avatar_image TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY,
    autoplay_trailers INTEGER DEFAULT 1,
    video_quality TEXT DEFAULT 'auto',
    language TEXT DEFAULT 'en',
    region TEXT DEFAULT 'US',
    track_history INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    movie_data TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS watched_movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS movie_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS movie_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    rating REAL NOT NULL CHECK(rating >= 0.5 AND rating <= 10),
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ==================== HELPER FUNCTIONS ====================

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Нисте пријављени' });
  }

  const session = db.prepare(`
    SELECT s.*, u.id as user_id, u.username, u.email, u.display_name, u.bio,
           u.avatar_type, u.avatar_color, u.avatar_image
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token);

  if (!session) {
    return res.status(401).json({ error: 'Сесија је истекла, пријавите се поново' });
  }

  req.user = {
    id: session.user_id,
    username: session.username,
    email: session.email,
    display_name: session.display_name,
    bio: session.bio,
    avatar_type: session.avatar_type,
    avatar_color: session.avatar_color,
    avatar_image: session.avatar_image
  };
  next();
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/register', (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Сва поља су обавезна' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Корисничко име мора имати бар 3 карактера' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Лозинка мора имати бар 6 карактера' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Неисправна имејл адреса' });
    }

    // Check if username exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Корисничко име је заузето' });
    }

    // Check if email exists
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Имејл адреса је већ регистрована' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const result = db.prepare(`
      INSERT INTO users (username, email, password, display_name, bio)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, email, hashedPassword, display_name || username, 'Movie enthusiast and avid cinema lover!');

    const userId = result.lastInsertRowid;

    // Create default settings
    db.prepare(`
      INSERT INTO user_settings (user_id) VALUES (?)
    `).run(userId);

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)
    `).run(userId, token, expiresAt);

    // Get user data
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        bio: user.bio,
        avatar_type: user.avatar_type,
        avatar_color: user.avatar_color,
        avatar_image: user.avatar_image
      },
      settings: {
        autoplay_trailers: !!settings.autoplay_trailers,
        video_quality: settings.video_quality,
        language: settings.language,
        region: settings.region,
        track_history: !!settings.track_history
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Грешка при регистрацији' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Сва поља су обавезна' });
    }

    // Find user by username or email
    const user = db.prepare(`
      SELECT * FROM users WHERE username = ? OR email = ?
    `).get(login, login);

    if (!user) {
      return res.status(400).json({ error: 'Погрешно корисничко име или лозинка' });
    }

    // Check password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Погрешно корисничко име или лозинка' });
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt);

    // Get settings
    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(user.id);

    // Get watchlist
    const watchlist = db.prepare('SELECT movie_id, movie_data FROM watchlist WHERE user_id = ?').all(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        bio: user.bio,
        avatar_type: user.avatar_type,
        avatar_color: user.avatar_color,
        avatar_image: user.avatar_image
      },
      settings: settings ? {
        autoplay_trailers: !!settings.autoplay_trailers,
        video_quality: settings.video_quality,
        language: settings.language,
        region: settings.region,
        track_history: !!settings.track_history
      } : null,
      watchlist: watchlist.map(w => JSON.parse(w.movie_data))
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Грешка при пријављивању' });
  }
});

// Logout
app.post('/api/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ success: true });
});

// ==================== USER ROUTES ====================

// Get current user
app.get('/api/user', authenticateToken, (req, res) => {
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  const watchlist = db.prepare('SELECT movie_id, movie_data FROM watchlist WHERE user_id = ?').all(req.user.id);
  const watchedCount = db.prepare('SELECT COUNT(*) as count FROM watched_movies WHERE user_id = ?').get(req.user.id);
  const viewsCount = db.prepare('SELECT COUNT(*) as count FROM movie_views WHERE user_id = ?').get(req.user.id);

  res.json({
    user: req.user,
    settings: settings ? {
      autoplay_trailers: !!settings.autoplay_trailers,
      video_quality: settings.video_quality,
      language: settings.language,
      region: settings.region,
      track_history: !!settings.track_history
    } : null,
    watchlist: watchlist.map(w => JSON.parse(w.movie_data)),
    stats: {
      watchlist_count: watchlist.length,
      watched_count: watchedCount.count,
      views_count: viewsCount.count
    }
  });
});

// Update profile
app.put('/api/user/profile', authenticateToken, (req, res) => {
  const { display_name, email, bio } = req.body;

  // Check if email is taken by another user
  if (email) {
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (existingEmail) {
      return res.status(400).json({ error: 'Имејл адреса је већ заузета' });
    }
  }

  db.prepare(`
    UPDATE users SET
      display_name = COALESCE(?, display_name),
      email = COALESCE(?, email),
      bio = COALESCE(?, bio),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(display_name || null, email || null, bio || null, req.user.id);

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  res.json({
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      display_name: updatedUser.display_name,
      bio: updatedUser.bio,
      avatar_type: updatedUser.avatar_type,
      avatar_color: updatedUser.avatar_color,
      avatar_image: updatedUser.avatar_image
    }
  });
});

// Update avatar
app.put('/api/user/avatar', authenticateToken, (req, res) => {
  const { avatar_type, avatar_color, avatar_image } = req.body;

  db.prepare(`
    UPDATE users SET
      avatar_type = ?,
      avatar_color = COALESCE(?, avatar_color),
      avatar_image = COALESCE(?, avatar_image),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(avatar_type, avatar_color || null, avatar_image || null, req.user.id);

  res.json({ success: true });
});

// Change password
app.put('/api/user/password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Сва поља су обавезна' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Нова лозинка мора имати бар 6 карактера' });
  }

  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
  const validPassword = bcrypt.compareSync(current_password, user.password);

  if (!validPassword) {
    return res.status(400).json({ error: 'Тренутна лозинка је нетачна' });
  }

  const hashedPassword = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(hashedPassword, req.user.id);

  res.json({ success: true });
});

// ==================== SETTINGS ROUTES ====================

app.put('/api/user/settings', authenticateToken, (req, res) => {
  const { autoplay_trailers, video_quality, language, region, track_history } = req.body;

  db.prepare(`
    INSERT INTO user_settings (user_id, autoplay_trailers, video_quality, language, region, track_history)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      autoplay_trailers = COALESCE(?, autoplay_trailers),
      video_quality = COALESCE(?, video_quality),
      language = COALESCE(?, language),
      region = COALESCE(?, region),
      track_history = COALESCE(?, track_history)
  `).run(
    req.user.id,
    autoplay_trailers !== undefined ? (autoplay_trailers ? 1 : 0) : 1,
    video_quality || 'auto',
    language || 'en',
    region || 'US',
    track_history !== undefined ? (track_history ? 1 : 0) : 1,
    autoplay_trailers !== undefined ? (autoplay_trailers ? 1 : 0) : null,
    video_quality || null,
    language || null,
    region || null,
    track_history !== undefined ? (track_history ? 1 : 0) : null
  );

  res.json({ success: true });
});

// ==================== WATCHLIST ROUTES ====================

app.post('/api/watchlist', authenticateToken, (req, res) => {
  const { movie_id, movie_data } = req.body;

  try {
    db.prepare(`
      INSERT OR REPLACE INTO watchlist (user_id, movie_id, movie_data)
      VALUES (?, ?, ?)
    `).run(req.user.id, movie_id, JSON.stringify(movie_data));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Грешка при додавању у листу' });
  }
});

app.delete('/api/watchlist/:movieId', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?')
    .run(req.user.id, req.params.movieId);
  res.json({ success: true });
});

app.get('/api/watchlist', authenticateToken, (req, res) => {
  const items = db.prepare('SELECT movie_id, movie_data FROM watchlist WHERE user_id = ? ORDER BY added_at DESC')
    .all(req.user.id);
  res.json(items.map(w => JSON.parse(w.movie_data)));
});

// ==================== TRACKING ROUTES ====================

app.post('/api/track/watched', authenticateToken, (req, res) => {
  const { movie_id } = req.body;
  try {
    db.prepare('INSERT OR IGNORE INTO watched_movies (user_id, movie_id) VALUES (?, ?)')
      .run(req.user.id, movie_id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true }); // Ignore duplicates
  }
});

app.post('/api/track/view', authenticateToken, (req, res) => {
  const { movie_id } = req.body;
  db.prepare('INSERT INTO movie_views (user_id, movie_id) VALUES (?, ?)')
    .run(req.user.id, movie_id);
  res.json({ success: true });
});

// ==================== RATING ROUTES ====================

// Rate a movie
app.post('/api/rate', authenticateToken, (req, res) => {
  const { movie_id, rating } = req.body;
  if (!movie_id || rating === undefined) {
    return res.status(400).json({ error: 'movie_id and rating are required' });
  }
  if (rating < 0.5 || rating > 10) {
    return res.status(400).json({ error: 'Rating must be between 0.5 and 10' });
  }
  try {
    db.prepare(`
      INSERT INTO movie_ratings (user_id, movie_id, rating)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, movie_id) DO UPDATE SET rating = ?, rated_at = CURRENT_TIMESTAMP
    `).run(req.user.id, movie_id, rating, rating);
    res.json({ success: true, rating });
  } catch (error) {
    console.error('Rate error:', error);
    res.status(500).json({ error: 'Error saving rating' });
  }
});

// Remove a rating
app.delete('/api/rate/:movieId', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
    .run(req.user.id, req.params.movieId);
  res.json({ success: true });
});

// Get all user ratings
app.get('/api/ratings', authenticateToken, (req, res) => {
  const ratings = db.prepare('SELECT movie_id, rating FROM movie_ratings WHERE user_id = ? ORDER BY rated_at DESC')
    .all(req.user.id);
  res.json(ratings);
});

// ==================== WATCHED ROUTES ====================

// Toggle watched status
app.post('/api/watched/toggle', authenticateToken, (req, res) => {
  const { movie_id } = req.body;
  if (!movie_id) {
    return res.status(400).json({ error: 'movie_id is required' });
  }
  const existing = db.prepare('SELECT id FROM watched_movies WHERE user_id = ? AND movie_id = ?')
    .get(req.user.id, movie_id);
  if (existing) {
    db.prepare('DELETE FROM watched_movies WHERE user_id = ? AND movie_id = ?')
      .run(req.user.id, movie_id);
    res.json({ success: true, watched: false });
  } else {
    db.prepare('INSERT INTO watched_movies (user_id, movie_id) VALUES (?, ?)')
      .run(req.user.id, movie_id);
    res.json({ success: true, watched: true });
  }
});

// Get all watched movie IDs
app.get('/api/watched', authenticateToken, (req, res) => {
  const watched = db.prepare('SELECT movie_id FROM watched_movies WHERE user_id = ? ORDER BY watched_at DESC')
    .all(req.user.id);
  res.json(watched.map(w => w.movie_id));
});

// Get movie-specific user status (rating + watched)
app.get('/api/movie-status/:movieId', authenticateToken, (req, res) => {
  const movieId = req.params.movieId;
  const rating = db.prepare('SELECT rating FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
    .get(req.user.id, movieId);
  const watched = db.prepare('SELECT id FROM watched_movies WHERE user_id = ? AND movie_id = ?')
    .get(req.user.id, movieId);
  res.json({
    rating: rating ? rating.rating : null,
    watched: !!watched
  });
});

// ==================== CATCH-ALL ====================
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'main', 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`\n🎬 MovieHub server running at http://localhost:${PORT}\n`);
  console.log('📁 Database: moviehub.db');
  console.log('📂 Serving static files from: /main\n');
});

// Cleanup expired sessions periodically
setInterval(() => {
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
}, 60 * 60 * 1000); // Every hour
