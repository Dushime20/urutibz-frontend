import React from 'react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

function SimpleModal({ isOpen, onClose, product }: SimpleModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '500px',
      height: '100vh',
      backgroundColor: 'white',
      zIndex: 9999,
      padding: '20px',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        backgroundColor: '#14b8a6',
        color: 'white',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Add to Cart</h2>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ padding: '20px' }}>
        <h3>Product: {product.title}</h3>
        <p>Price: ${product.pricePerDay}/day</p>
        <p>Currency: {product.currency}</p>
        
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#14b8a6',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default SimpleModal;