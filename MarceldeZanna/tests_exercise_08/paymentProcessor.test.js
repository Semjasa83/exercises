const { PaymentProcessor } = require('./paymentProcessor');

describe('PaymentProcessor', () => {
  describe('processPayment()', () => {
    test('processes payment successfully', async () => {
      // TODO: Create a fake Stripe client with jest.fn()
      // Tip: { charges: { create: jest.fn().mockResolvedValue({...}) } }
      const fakeStripe = {
        charges: {
          create: jest.fn().mockResolvedValue({
            id: 'test_charge_01',
            amount: 500,
            status: 'completed'
          })
        }
      };
      // Arrange:
      // - Fake Stripe client with charges.create mock
      // - PaymentProcessor with fake client injected
      const processor = new PaymentProcessor(fakeStripe);
      // Act:
      // - Call processPayment()
      const result = await processor.processPayment({
        amount: 500,
        currency: 'EUR',
        token: 'tok_visa'
      });
      // Assert:
      // - result.success should be true
      // - Stripe should be called with correct parameters
      expect(result.success).toBe(true);
      expect(result.chargeId).toBe('test_charge_01')
      expect(fakeStripe.charges.create).toHaveBeenCalledWith({
        amount: 500,
        currency: 'EUR',
        source: 'tok_visa'
      })
    });

    test('Zero amount throws error', async () => {
      // TODO: Test for invalid amount (negative or 0)
      // Tip: await expect(...).rejects.toThrow('Invalid amount')
      const fakeStripe = { charges: { create: jest.fn() } };
      const processor = new PaymentProcessor(fakeStripe);

      await expect(processor.processPayment({
        amount: 0,
        currency: 'EUR',
        token: 'tok_visa'
      })).rejects.toThrow('Invalid amount')

    })


    //     test('Zero amount', () => {

    // })
    // TODO: Test for missing token
    // Tip: await expect(...).rejects.toThrow('Payment token required')

    //     test('Zero amount', () => {

    // })
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
