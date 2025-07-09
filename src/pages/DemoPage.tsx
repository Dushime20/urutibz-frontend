import React from 'react';
import InteractiveBookingDemo from '../components/demo/InteractiveBookingDemo';
import BookingFlowDemo from '../components/demo/BookingFlowDemo';

const DemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Booking Flow Demo
          </h1>
          <p className="text-lg text-center max-w-3xl mx-auto">
            Explore four user scenarios: <span className="font-semibold">No Account</span>, 
            <span className="font-semibold"> Unverified User</span>, 
            <span className="font-semibold"> Partially Verified</span>, and 
            <span className="font-semibold"> Fully Verified</span>.
          </p>
        </div>
      </div>
      
      <InteractiveBookingDemo />
      
      <div className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Detailed Scenario Comparison
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Compare the booking flow for each user type below
          </p>
        </div>
        <BookingFlowDemo />
      </div>
    </div>
  );
};

export default DemoPage;
