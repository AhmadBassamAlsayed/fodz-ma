const axios = require('axios');
const crypto = require('crypto');

class PayMobService {
  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.integrationId = process.env.PAYMOB_INTEGRATION_ID;
    this.iframeId = process.env.PAYMOB_IFRAME_ID;
    this.hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    this.apiUrl = process.env.PAYMOB_API_URL || 'https://accept.paymob.com/api';
    
    this.authToken = null;
    this.tokenExpiry = null;
    
    this.validateConfig();
  }

  validateConfig() {
    const required = ['apiKey', 'integrationId', 'iframeId', 'hmacSecret'];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing Paymob configuration: ${missing.join(', ')}. Check your .env file.`);
    }
  }

  async getAuthToken() {
    try {
      if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.authToken;
      }

      const response = await axios.post(`${this.apiUrl}/auth/tokens`, {
        api_key: this.apiKey
      }, {
        timeout: 10000
      });

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from Paymob authentication');
      }

      this.authToken = response.data.token;
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);

      return this.authToken;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message;
      console.error('Paymob authentication failed:', errorMsg);
      throw new Error(`Paymob authentication failed: ${errorMsg}`);
    }
  }

  async registerOrder({ amount_cents, currency = 'EGP', merchant_order_id, items = [] }) {
    try {
      if (!amount_cents || amount_cents <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const authToken = await this.getAuthToken();

      const response = await axios.post(`${this.apiUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: Math.round(amount_cents),
        currency: currency.toUpperCase(),
        merchant_order_id: merchant_order_id,
        items: items
      }, {
        timeout: 10000
      });

      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from Paymob order creation');
      }

      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message;
      console.error('Paymob order creation failed:', errorMsg);
      throw new Error(`Failed to create Paymob order: ${errorMsg}`);
    }
  }

  async generatePaymentKey({ order_id, amount_cents, billing_data, currency = 'EGP' }) {
    try {
      if (!order_id) {
        throw new Error('Order ID is required');
      }

      const authToken = await this.getAuthToken();

      const fullBillingData = {
        apartment: billing_data.apartment || 'NA',
        email: billing_data.email || 'customer@example.com',
        floor: billing_data.floor || 'NA',
        first_name: billing_data.first_name || 'Customer',
        street: billing_data.street || 'NA',
        building: billing_data.building || 'NA',
        phone_number: billing_data.phone_number || '01000000000',
        shipping_method: 'NA',
        postal_code: billing_data.postal_code || 'NA',
        city: billing_data.city || 'NA',
        country: billing_data.country || 'EG',
        last_name: billing_data.last_name || 'Customer',
        state: billing_data.state || 'NA'
      };

      const response = await axios.post(`${this.apiUrl}/acceptance/payment_keys`, {
        auth_token: authToken,
        amount_cents: Math.round(amount_cents),
        expiration: 3600,
        order_id: order_id.toString(),
        billing_data: fullBillingData,
        currency: currency.toUpperCase(),
        integration_id: parseInt(this.integrationId)
      }, {
        timeout: 10000
      });

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from Paymob payment key generation');
      }

      return response.data.token;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message;
      console.error('Paymob payment key generation failed:', errorMsg);
      throw new Error(`Failed to generate payment key: ${errorMsg}`);
    }
  }

  async verifyTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const authToken = await this.getAuthToken();

      const response = await axios.get(`${this.apiUrl}/acceptance/transactions/${transactionId}`, {
        params: { token: authToken },
        timeout: 10000
      });

      if (!response.data) {
        throw new Error('Invalid response from Paymob transaction verification');
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const authToken = await this.getAuthToken();
          const retryResponse = await axios.get(`${this.apiUrl}/acceptance/transactions/${transactionId}`, {
            params: { token: authToken },
            timeout: 10000
          });
          return retryResponse.data;
        } catch (retryError) {
          const err = new Error('Transaction not found');
          err.code = 'PAYMOB_TRANSACTION_NOT_FOUND';
          err.status = 404;
          throw err;
        }
      }
      
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message;
      console.error('Paymob transaction verification failed:', errorMsg);
      throw new Error(`Failed to verify transaction: ${errorMsg}`);
    }
  }

  verifyWebhookSignature(data, receivedHmac) {
    try {
      if (!receivedHmac) {
        return false;
      }

      const toStr = (v) => {
        if (v === null || v === undefined) return '';
        return String(v);
      };

      const orderId = data.order?.id || data.order;
      const sourceDataPan = data.source_data?.pan;

      const concatenatedString = [
        toStr(data.amount_cents),
        toStr(data.created_at),
        toStr(data.currency),
        toStr(data.error_occured),
        toStr(data.has_parent_transaction),
        toStr(data.id),
        toStr(data.integration_id),
        toStr(data.is_3d_secure),
        toStr(data.is_auth),
        toStr(data.is_capture),
        toStr(data.is_refunded),
        toStr(data.is_standalone_payment),
        toStr(data.is_voided),
        toStr(orderId),
        toStr(data.owner),
        toStr(data.pending),
        toStr(sourceDataPan),
        toStr(data.success)
      ].join('');

      const calculatedHmac = crypto
        .createHmac('sha512', this.hmacSecret)
        .update(concatenatedString)
        .digest('hex');

      const isValid = calculatedHmac === receivedHmac;
      
      if (!isValid) {
        console.error('HMAC verification failed');
      }
      
      return isValid;
    } catch (error) {
      console.error('HMAC verification error:', error.message);
      return false;
    }
  }

  getIframeUrl(paymentToken) {
    if (!paymentToken) {
      throw new Error('Payment token is required');
    }
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentToken}`;
  }
}

module.exports = new PayMobService();
