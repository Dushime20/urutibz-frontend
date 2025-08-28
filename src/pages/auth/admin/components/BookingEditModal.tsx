import React, { useState } from 'react';
import { updateBooking } from '../service';

interface BookingEditModalProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onSave: (updated: any) => void;
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({ open, onClose, booking, onSave }) => {
  const [form, setForm] = useState<any>(booking);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !booking) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const { data, error } = await updateBooking(booking.id, form, token || undefined);
      if (error) throw new Error(error);
      onSave(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col">
        <div className="bg-my-primary px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Booking</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select name="payment_status" value={form.payment_status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" name="start_date" value={form.start_date?.slice(0,10) || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" name="end_date" value={form.end_date?.slice(0,10) || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Renter Notes</label>
            <textarea name="renter_notes" value={form.renter_notes || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Notes</label>
            <textarea name="owner_notes" value={form.owner_notes || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-my-primary text-white hover:bg-my-primary/80 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingEditModal; 