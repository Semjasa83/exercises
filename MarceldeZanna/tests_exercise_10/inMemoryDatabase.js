/**
 * Fake Database für Tests
 *
 * Ein Fake ist eine funktionierende Implementierung (nicht nur gemockte Return Values).
 * Diese In-Memory-DB verhält sich wie eine echte DB, nur schneller.
 */
export class InMemoryDatabase {
  constructor() {
    // Simuliert echte DB-Struktur: db.bookings.create()
    // Wie bei echten ORMs (Prisma, TypeORM, Sequelize)
    this.bookings = new BookingsRepository();
  }
}

class BookingsRepository {
  constructor() {
    this.data = [];  // In-Memory Array statt PostgreSQL/MySQL
    this.nextId = 1; // Auto-Increment Counter
  }

  /**
   * Alle Methoden sind async, auch wenn die Implementierung synchron ist.
   *
   * Warum? Weil echte DB-Calls async sind!
   *
   * Wenn Fake synchron ist, könnte vergessenes `await` in Production-Code
   * unentdeckt bleiben (funktioniert in Tests, crasht in Production).
   */
  async create(bookingData) {
    const booking = {
      id: `booking_${this.nextId++}`,  // Simuliert DB Auto-Increment
      ...bookingData,
      createdAt: new Date().toISOString()
    };
    this.data.push(booking);
    return booking;
  }

  async findById(id) {
    return this.data.find(b => b.id === id);
  }

  async findByEmail(email) {
    return this.data.filter(b => b.guestEmail === email);
  }

  async update(id, updates) {
    const booking = await this.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    // Object.assign mutiert booking direkt (wie DB UPDATE)
    Object.assign(booking, updates);
    return booking;
  }

  /**
   * Für Tests, die mid-test clearen wollen.
   *
   * Zwei Patterns:
   * 1. Neue Instanz in beforeEach() → automatisch leer
   * 2. Gleiche Instanz + clear() in beforeEach() → manuell leeren
   *
   * Beide sind valid. Pattern 1 ist klarer für Anfänger.
   */
  clear() {
    this.data = [];
    this.nextId = 1;
  }
}
