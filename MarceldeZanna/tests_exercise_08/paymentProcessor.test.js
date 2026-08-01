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


    test('Payment without Token', async () => {
      // TODO: Test for missing token
      // Tip: await expect(...).rejects.toThrow('Payment token required')
      const fakeStripe = { charges: { create: jest.fn() } }
      const processor = new PaymentProcessor(fakeStripe);

      await expect(processor.processPayment({
        amount: 500,
      })).rejects.toThrow('Payment token required')
    })

    test('decline Card', async () => {
      // TODO: Test for declined card
      // Tip: mockRejectedValue(new Error('Your card was declined'))
      const fakeStripe = {
        charges: {
          create: jest.fn().mockRejectedValue(
            new Error('Ihre Karte wurde abgelehnt')
          )

        }
      };
      const processor = new PaymentProcessor(fakeStripe);

      const result = await processor.processPayment({
        amount: 500,
        token: 'tok_chargeDeclined',
        success: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ihre Karte wurde abgelehnt');
    })
  });

  describe('refundPayment()', () => {
    test('refund payment successful', async () => {
      // TODO: Test for successful refund
      // Tip: Similar to processPayment, but with refunds.create
      const fakeStripe = {
        refunds: {
          create: jest.fn().mockResolvedValue({
            id: 'test_refund_01',
            status: 'completed'
          })
        }
      };
      const processor = new PaymentProcessor(fakeStripe);

      const result = await processor.refundPayment('ch_test123');

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('test_refund_01');
      expect(result.status).toBe('completed');

      expect(fakeStripe.refunds.create).toHaveBeenCalledWith({
        charge: 'ch_test123'
      });
    })

    test('throws error for missing charge ID', async () => {
      // TODO: Test for missing charge ID
      const fakeStripe = { refunds: { create: jest.fn() } };
      const processor = new PaymentProcessor(fakeStripe);

      await expect(processor.refundPayment())
        .rejects.toThrow('Charge ID required');

      expect(fakeStripe.refunds.create).not.toHaveBeenCalled();
    });

    test('handles refund failure', async () => {
      // TODO: Test for refund error (e.g. "Already refunded")
      const fakeStripe = {
        refunds: {
          create: jest.fn().mockRejectedValue(
            new Error('Charge already refunded')
          )
        }
      };

      const processor = new PaymentProcessor(fakeStripe);
      const result = await processor.refundPayment('ch_test123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Charge already refunded');
    });
  });
});


/** Die Syntax hier mit results etc war jetzt nur noch raten nach Zahlen, die anderen Test exercises waren da klarer  */