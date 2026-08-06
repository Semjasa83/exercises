import { BookingService } from './bookingService.js';
import { InMemoryDatabase } from './inMemoryDatabase.js';
import { expect, jest } from '@jest/globals';

describe('BookingService', () => {
  let service;
  let database;
  let paymentGateway;
  let emailService;
  let availabilityChecker;

  beforeEach(() => {
    // TODO: Choose the right Test Doubles for each dependency
    // Use the decision guide from the README!

    // Database – needs complex logic (create, find, update, state)?
    // → Fake (InMemoryDatabase) or Mock?
    database = new InMemoryDatabase;

    // PaymentGateway – do you want to verify parameters (correct amount)?
    // → Mock (with jest.fn() + verification) or Stub? Mock + Verifizierung
    paymentGateway = {
      charge: jest.fn().mockResolvedValue({ id: 'ch_123' }),
      refund: jest.fn().mockResolvedValue({ success: true })
    };

    // EmailService – are details important or just "no exception"?
    // → Stub (only return) or Mock (with verification)? Mock
    emailService = {
      send: jest.fn().mockResolvedValue({ success: true })
    };

    // AvailabilityChecker – only return value (true/false) important?
    // → Stub or Mock? Mock
    availabilityChecker = {
      check: jest.fn().mockResolvedValue(true)
    };

    service = new BookingService(
      paymentGateway,
      emailService,
      database,
      availabilityChecker
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('createBooking() succeeds with valid data', async () => {
    // TODO: Arrange - create bookingData
    const bookingData = {
      roomId: 'room-01',
      guestEmail: 'test@fakemail.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      amount: 600
    };
    // TODO: Act - call createBooking
    const booking = await service.createBooking(bookingData);
    // TODO: Assert - check booking.id, booking.status
    expect(booking.id).toBeDefined();
    expect(booking.roomId).toBe('room-01');
    expect(booking.status).toBe('confirmed');
  });

  test('createBooking() throws error when room not available', async () => {
    // TODO: Arrange - set availabilityChecker.check to false
    availabilityChecker.check.mockResolvedValue(false);
    const bookingData = {
      roomId: 'room-01',
      guestEmail: 'test@fakemail.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      amount: 600
    };
    // TODO: Act & Assert - expect(...).rejects.toThrow('Room not available')
    await expect(service.createBooking(bookingData))
      .rejects.toThrow('Room not available');

    expect(paymentGateway.charge).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  test('createBooking() charges payment with correct amount', async () => {
    // TODO: Which Test Double lets you verify parameters? Mock verifiziert.
    const bookingData = {
      roomId: 'room_1',
      guestEmail: 'guest@example.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      amount: 400
    };

    await service.createBooking(bookingData);
    // TODO: Use expect(...).toHaveBeenCalledWith({ amount: 400, ... })
    expect(paymentGateway.charge).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 400,
        currency: 'EUR'
      })
    )
  });

  test('createBooking() saves booking to database', async () => {
    // TODO: After createBooking() -> call findById()
    const bookingData = {
      roomId: 'room-01',
      guestEmail: 'test@fakemail.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      amount: 600
    };
    const booking = await service.createBooking(bookingData);
    // TODO: Check paymentId, status='confirmed'
    const dbBooking = await database.bookings.findById(booking.id);
    expect(dbBooking).toBeDefined();
    expect(dbBooking.paymentId).toBe('ch_123');
    expect(dbBooking.status).toBe('confirmed');
  });

  test('createBooking() sends confirmation email', async () => {
    // TODO: Is EmailService a Stub or Mock? -> Stub
    const bookingData = {
      roomId: 'room-01',
      guestEmail: 'test@fakemail.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      amount: 600
    };
    const booking = await service.createBooking(bookingData);
    // TODO: If Stub -> only toHaveBeenCalled(), no parameter checks
    expect(emailService.send).toHaveBeenCalled();
  });

  test('cancelBooking() refunds payment and updates status', async () => {
    // TODO: Arrange - create Booking in DB first
    const booking = await database.bookings.create({
      roomId: 'room_1',
      guestEmail: 'guest@example.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-05',
      amount: 400,
      paymentId: 'ch_123',
      status: 'confirmed'
    });
    // TODO: Act - cancelBooking(booking.id)
    const result = await service.cancelBooking(booking.id);
    // TODO: Assert - paymentGateway.refund called, status='cancelled'
    expect(result.success).toBe(true);

    const cancelledBooking = await database.bookings.findById(booking.id);
    expect(cancelledBooking.status).toBe('cancelled');
  });

  test('cancelBooking() throws error when booking not found', async () => {
    // TODO: expect(...).rejects.toThrow('Booking not found')
    await expect(service.cancelBooking('invalid_id'))
      .rejects.toThrow('Booking not found');
  });

  test('getUpcomingBookings() returns only future confirmed bookings', async () => {
    // TODO: Arrange - create past + future bookings
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    await database.bookings.create({
      roomId: 'room_1',
      guestEmail: 'guest@example.com',
      checkIn: futureDate.toISOString(),
      checkOut: futureDate.toISOString(),
      status: 'confirmed'
    });

    await database.bookings.create({
      roomId: 'room_2',
      guestEmail: 'guest@example.com',
      checkIn: pastDate.toISOString(),
      checkOut: pastDate.toISOString(),
      status: 'confirmed'
    });
    // TODO: Act - getUpcomingBookings()
    const upcoming = await service.getUpcomingBookings('guest@example.com');
    // TODO: Assert - only future bookings returned
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].roomId).toBe('room_1');
  });
});
