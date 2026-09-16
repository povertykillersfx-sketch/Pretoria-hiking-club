import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import Database from "better-sqlite3";
import { seedEvents } from "./seed-data";

const DATA_DIR = process.env.PHC_DATA_DIR
  ? path.resolve(process.env.PHC_DATA_DIR)
  : path.join(process.cwd(), ".data");

const DB_PATH = path.join(DATA_DIR, "pretoria-hiking-club.db");

declare global {
  var __phcDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const connection = new Database(DB_PATH);
  connection.pragma("journal_mode = WAL");
  connection.pragma("foreign_keys = ON");
  connection.pragma("busy_timeout = 5000");
  migrate(connection);
  seed(connection);
  return connection;
}

function migrate(connection: Database.Database) {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'hike',
      summary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      meeting_point TEXT NOT NULL DEFAULT '',
      map_url TEXT,
      event_date TEXT NOT NULL,
      start_time TEXT NOT NULL DEFAULT '08:30',
      arrival_time TEXT NOT NULL DEFAULT '07:00',
      end_time TEXT,
      distance_5km INTEGER NOT NULL DEFAULT 1,
      distance_10km INTEGER NOT NULL DEFAULT 1,
      difficulty TEXT NOT NULL DEFAULT 'Moderate',
      price_cents INTEGER NOT NULL DEFAULT 0,
      capacity INTEGER NOT NULL DEFAULT 60,
      image TEXT NOT NULL DEFAULT '/images/event-magaliesberg.jpg',
      gallery TEXT NOT NULL DEFAULT '[]',
      schedule TEXT NOT NULL DEFAULT '[]',
      includes TEXT NOT NULL DEFAULT '[]',
      bring TEXT NOT NULL DEFAULT '[]',
      published INTEGER NOT NULL DEFAULT 1,
      bookings_closed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      distance TEXT NOT NULL DEFAULT '5KM',
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      people INTEGER NOT NULL DEFAULT 1,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'free',
      payment_status TEXT NOT NULL DEFAULT 'not_required',
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      checkin_token TEXT,
      checked_in_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
  `);

  const bookingColumns = connection
    .prepare<[], { name: string }>("PRAGMA table_info(bookings)")
    .all()
    .map((column) => column.name);

  if (!bookingColumns.includes("checkin_token")) {
    connection.exec("ALTER TABLE bookings ADD COLUMN checkin_token TEXT");
  }
  if (!bookingColumns.includes("checked_in_at")) {
    connection.exec("ALTER TABLE bookings ADD COLUMN checked_in_at TEXT");
  }

  connection.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_checkin_token ON bookings(checkin_token) WHERE checkin_token IS NOT NULL",
  );

  const missingTokens = connection
    .prepare<[], { id: number }>(
      "SELECT id FROM bookings WHERE checkin_token IS NULL OR checkin_token = ''",
    )
    .all();

  if (missingTokens.length > 0) {
    const assign = connection.prepare("UPDATE bookings SET checkin_token = ? WHERE id = ?");
    const used = new Set(
      connection
        .prepare<[], { checkin_token: string }>(
          "SELECT checkin_token FROM bookings WHERE checkin_token IS NOT NULL AND checkin_token != ''",
        )
        .all()
        .map((row) => row.checkin_token),
    );

    for (const row of missingTokens) {
      let token = randomBytes(16).toString("hex");
      while (used.has(token)) token = randomBytes(16).toString("hex");
      used.add(token);
      assign.run(token, row.id);
    }
  }
}

function seed(connection: Database.Database) {
  const { count } = connection
    .prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM events")
    .get()!;

  if (count > 0) return;

  const insert = connection.prepare(`
    INSERT INTO events (
      slug, title, category, summary, description, location, meeting_point, map_url,
      event_date, start_time, arrival_time, end_time, distance_5km, distance_10km,
      difficulty, price_cents, capacity, image, gallery, schedule, includes, bring,
      published, bookings_closed
    ) VALUES (
      @slug, @title, @category, @summary, @description, @location, @meeting_point, @map_url,
      @event_date, @start_time, @arrival_time, @end_time, @distance_5km, @distance_10km,
      @difficulty, @price_cents, @capacity, @image, @gallery, @schedule, @includes, @bring,
      @published, @bookings_closed
    )
  `);

  const insertBooking = connection.prepare(`
    INSERT INTO bookings (
      reference, event_id, distance, name, email, phone, people,
      amount_cents, payment_method, payment_status, status, checkin_token
    ) VALUES (
      @reference, @event_id, @distance, @name, @email, @phone, @people,
      @amount_cents, @payment_method, @payment_status, 'confirmed', @checkin_token
    )
  `);

  const run = connection.transaction(() => {
    for (const event of seedEvents()) {
      const info = insert.run(event.row);
      const eventId = Number(info.lastInsertRowid);
      for (const booking of event.bookings) {
        insertBooking.run({
          ...booking,
          event_id: eventId,
          amount_cents: event.row.price_cents * booking.people,
          payment_method: event.row.price_cents > 0 ? booking.payment_method : "free",
          payment_status:
            event.row.price_cents > 0 ? booking.payment_status : "not_required",
          checkin_token: randomBytes(16).toString("hex"),
        });
      }
    }
  });

  run();
}

export function getDb(): Database.Database {
  if (!global.__phcDb) {
    global.__phcDb = createConnection();
  }
  return global.__phcDb;
}
