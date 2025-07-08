import React from 'react';
import FaqSection from '../components/sections/FaqSection';

const FaqPage: React.FC = () => {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb-bar bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">FAQ</h2>
              <nav aria-label="breadcrumb">
                <ol className="flex items-center justify-center space-x-2 text-gray-600">
                  <li>
                    <a href="/" className="text-blue-600 hover:text-blue-800">Home</a>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <a href="#" className="text-blue-600 hover:text-blue-800">Pages</a>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-500">FAQ</span>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FaqSection />
    </>
  );
};

export default FaqPage;
