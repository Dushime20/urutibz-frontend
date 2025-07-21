import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

export async function createBooking(bookingData: any, token: string) {
  return axios.post(
    `${API_BASE_URL}/bookings`,
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
  const response = await axios.get(`${API_BASE_URL}/payment-methods`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data?.data || response.data || [];
}

export async function addPaymentMethod(paymentData: any, token: string) {
  const response = await axios.post(
    `${API_BASE_URL}/payment-methods`,
    paymentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function processPaymentTransaction(paymentData: any, token?: string) {
  const response = await axios.post(
    `${API_BASE_URL}/payment-transactions/process`,
    paymentData,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
