import React from 'react';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

const AddToCartModal = (props: AddToCartModalProps) => {
  const { isOpen, onClose, product } = props;
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2>Add to Cart</h2>
        <p>Product: {product.title}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddToCartModal;