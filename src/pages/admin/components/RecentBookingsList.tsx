import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Camera, Laptop, Gamepad2 } from 'lucide-react';

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

interface RecentBookingsListProps {
  recentBookings: RecentBooking[];
}

const RecentBookingsList: React.FC<RecentBookingsListProps> = ({ recentBookings }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
      <Link 
        to="#" 
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group"
      >
        View all
        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </div>
    <div className="space-y-4">
      {recentBookings.map((booking) => (
        <div key={booking.id} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
          <div className="relative">
            <img 
              src={booking.itemImage} 
              alt={booking.itemName} 
              className="w-12 h-12 rounded-xl object-cover" 
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
              <booking.icon className="w-3 h-3 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm">{booking.itemName}</h4>
            <p className="text-sm text-gray-500">{booking.customerName}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                {booking.category}
              </span>
              <span className="text-xs text-gray-400">{booking.bookingId}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">${booking.amount}/day</p>
            <span className={`text-xs px-2 py-1 rounded-lg ${
              booking.status === 'Active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {booking.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentBookingsList; 