import { BookingService } from './bookingService.js';
import { InMemoryDatabase } from './inMemoryDatabase.js';

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
    database = null;

    // PaymentGateway – do you want to verify parameters (correct amount)?
    // → Mock (with jest.fn() + verification) or Stub?
    paymentGateway = null;

    // EmailService – are details important or just "no exception"?
    // → Stub (only return) or Mock (with verification)?
    emailService = null;

    // AvailabilityChecker – only return value (true/false) important?
    // → Stub or Mock?
    availabilityChecker = null;

    service = new BookingService(
      paymentGateway,
      emailService,
      database,
      availabilityChecker
    );
  });

  test('createBooking() succeeds with valid data', async () => {
    // TODO: Arrange - create bookingData
    // TODO: Act - call createBooking
    // TODO: Assert - check booking.id, booking.status
  });

  test('createBooking() throws error when room not available', async () => {
    // TODO: Arrange - set availabilityChecker.check to false
    // TODO: Act & Assert - expect(...).rejects.toThrow('Room not available')
  });

  test('createBooking() charges payment with correct amount', async () => {
    // TODO: Which Test Double lets you verify parameters?
    // TODO: Use expect(...).toHaveBeenCalledWith({ amount: 400, ... })
  });

  test('createBooking() saves booking to database', async () => {
    // TODO: After createBooking() -> call findById()
    // TODO: Check paymentId, status='confirmed'
  });

  test('createBooking() sends confirmation email', async () => {
    // TODO: Is EmailService a Stub or Mock?
    // TODO: If Stub -> only toHaveBeenCalled(), no parameter checks
  });

  test('cancelBooking() refunds payment and updates status', async () => {
    // TODO: Arrange - create Booking in DB first
    // TODO: Act - cancelBooking(booking.id)
    // TODO: Assert - paymentGateway.refund called, status='cancelled'
  });

  test('cancelBooking() throws error when booking not found', async () => {
    // TODO: expect(...).rejects.toThrow('Booking not found')
  });

  test('getUpcomingBookings() returns only future confirmed bookings', async () => {
    // TODO: Arrange - create past + future bookings
    // TODO: Act - getUpcomingBookings()
    // TODO: Assert - only future bookings returned
  });
});
