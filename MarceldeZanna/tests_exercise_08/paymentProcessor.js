class PaymentProcessor {
  constructor(stripeClient) {
    this.stripe = stripeClient;
  }

  async processPayment(paymentData) {
    // Validierung
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!paymentData.token) {
      throw new Error('Payment token required');
    }

    try {
      // Stripe-Call
      const charge = await this.stripe.charges.create({
        amount: paymentData.amount,
        currency: paymentData.currency || 'EUR',
        source: paymentData.token,
        description: paymentData.description
      });

      return {
        success: true,
        chargeId: charge.id,
        amount: charge.amount,
        status: charge.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refundPayment(chargeId) {
    if (!chargeId) {
      throw new Error('Charge ID required');
    }

    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId
      });

      return {
        success: true,
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = { PaymentProcessor };
