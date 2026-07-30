const { PaymentProcessor } = require('./paymentProcessor');

describe('PaymentProcessor', () => {
  describe('processPayment()', () => {
    test('processes payment successfully', async () => {
      // TODO: Create a fake Stripe client with jest.fn()
      // Tip: { charges: { create: jest.fn().mockResolvedValue({...}) } }
      //
      // Arrange:
      // - Fake Stripe client with charges.create mock
      // - PaymentProcessor with fake client injected
      //
      // Act:
      // - Call processPayment()
      //
      // Assert:
      // - result.success should be true
      // - Stripe should be called with correct parameters
    });

    // TODO: Test for invalid amount (negative or 0)
    // Tip: await expect(...).rejects.toThrow('Invalid amount')

    // TODO: Test for missing token
    // Tip: await expect(...).rejects.toThrow('Payment token required')

    // TODO: Test for declined card
    // Tip: mockRejectedValue(new Error('Your card was declined'))
  });

  describe('refundPayment()', () => {
    // TODO: Test for successful refund
    // Tip: Similar to processPayment, but with refunds.create

    // TODO: Test for missing charge ID

    // TODO: Test for refund error (e.g. "Already refunded")
  });
});
