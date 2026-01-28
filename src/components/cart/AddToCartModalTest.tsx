import React from 'react';
import { X, ShoppingCart } from 'lucide-react';

interface AddToCartModalTestProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    image?: string;
    pricePerDay: number;
    currency: string;
    ownerId: string;
    categoryId?: string;
    pickupAvailable?: boolean;
    deliveryAvailable?: boolean;
    pickup_methods?: string[] | any;
    address_line?: string;
    location?: { address?: string };
  };
}

const AddToCartModalTest: React.FC<AddToCartModalTestProps> = ({ isOpen, onClose, product }) => {
  console.log('🧪 TEST MODAL LOADED', { isOpen, product });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-teal-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShoppingCart className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">TEST MODAL</h2>
              <p className="text-teal-100">This is a test modal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">Product: {product.title}</h3>
            <p>Price: ${product.pricePerDay}/day</p>
            <p>Currency: {product.currency}</p>
          </div>

          <button
            onClick={() => {
              console.log('Add to cart clicked!');
              alert('Add to cart clicked!');
              onClose();
            }}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
          >
            Add to Cart (TEST)
          </button>
        </div>
      </div>
    </>
  );
};

export default AddToCartModalTest;