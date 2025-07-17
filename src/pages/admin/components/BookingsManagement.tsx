import React from 'react';
import { Calendar, Filter, Plus } from 'lucide-react';

interface RecentBooking {
  id: string | number;
  bookingId: string;
  itemName: string;
  itemImage: string;
  customerName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  category: string;
  icon: React.ElementType;
}

interface BookingsManagementProps {
  recentBookings: RecentBooking[];
}

const BookingsManagement: React.FC<BookingsManagementProps> = ({ recentBookings }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900">Bookings</h3>
      <div className="flex items-center space-x-3">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Booking
        </button>
      </div>
    </div>
    {/* Bookings List */}
    <div className="space-y-4">
      {recentBookings.map((booking) => (
        <div key={booking.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <div className="relative">
            <img 
              src={booking.itemImage} 
              alt={booking.itemName} 
              className="w-16 h-16 rounded-xl object-cover" 
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
              <booking.icon className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">{booking.itemName}</h4>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                booking.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {booking.status}
              </span>
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                {booking.category}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Customer: {booking.customerName}</p>
            <p className="text-xs text-gray-400 mb-1">Booking ID: {booking.bookingId}</p>
            <p className="text-xs text-gray-400">{booking.startDate} - {booking.endDate}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">${booking.amount}/day</p>
            <Calendar className="w-5 h-5 text-blue-600 mt-2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BookingsManagement; 