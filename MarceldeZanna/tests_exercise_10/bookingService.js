export class BookingService {
  constructor(paymentGateway, emailService, database, availabilityChecker) {
    this.paymentGateway = paymentGateway;
    this.emailService = emailService;
    this.database = database;
    this.availabilityChecker = availabilityChecker;
  }

  async createBooking(bookingData) {
    // 1. Validate input
    if (!bookingData.roomId || !bookingData.guestEmail) {
      throw new Error('Missing required fields');
    }

    // 2. Check availability
    const isAvailable = await this.availabilityChecker.check(
      bookingData.roomId,
      bookingData.checkIn,
      bookingData.checkOut
    );

    if (!isAvailable) {
      throw new Error('Room not available');
    }

    // 3. Process payment
    const payment = await this.paymentGateway.charge({
      amount: bookingData.amount,
      currency: 'EUR',
      description: `Booking for room ${bookingData.roomId}`
    });

    // 4. Save booking to database
    const booking = await this.database.bookings.create({
      roomId: bookingData.roomId,
      guestEmail: bookingData.guestEmail,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      amount: bookingData.amount,
      paymentId: payment.id,
      status: 'confirmed'
    });

    // 5. Send confirmation email
    await this.emailService.send({
      to: bookingData.guestEmail,
      subject: 'Booking Confirmation',
      text: `Your booking for room ${bookingData.roomId} is confirmed.`
    });

    return booking;
  }

  async cancelBooking(bookingId) {
    const booking = await this.database.bookings.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }

    // Refund payment
    await this.paymentGateway.refund(booking.paymentId);

    // Update booking status
    await this.database.bookings.update(bookingId, {
      status: 'cancelled'
    });

    // Send cancellation email
    await this.emailService.send({
      to: booking.guestEmail,
      subject: 'Booking Cancelled',
      text: `Your booking ${bookingId} has been cancelled.`
    });

    return { success: true, bookingId };
  }

  async getUpcomingBookings(guestEmail) {
    const bookings = await this.database.bookings.findByEmail(guestEmail);

    const now = new Date();
    return bookings.filter(b =>
      new Date(b.checkIn) > now && b.status === 'confirmed'
    );
  }
}
