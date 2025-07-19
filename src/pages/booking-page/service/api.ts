import axios from 'axios';

export async function createBooking(bookingData: any, token: string) {
  return axios.post(
    'http://localhost:3000/api/v1/bookings',
    bookingData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function fetchPaymentMethods(token?: string) {
  return axios.get('http://localhost:3000/api/v1/payment-methods', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function processPaymentTransaction(paymentData: any, token?: string) {
  return axios.post(
    'http://localhost:3000/api/v1/payment-transactions/process',
    paymentData,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    }
  );
}
