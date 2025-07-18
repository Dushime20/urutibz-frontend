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
