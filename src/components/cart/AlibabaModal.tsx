import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

interface AlibabaModalProps {
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

function AlibabaModal({ isOpen, onClose, product }: AlibabaModalProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(nextWeek);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | 'meet_public' | 'visit'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const totalDays = calculateDays();
  const basePrice = product.pricePerDay * totalDays;
  const totalPrice = basePrice;

  const formatCurrency = (amount: number, currency: string): string => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'RWF': 'RWF'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return symbol === currency ? `${currency} ${amount.toFixed(2)}` : `${symbol}${amount.toFixed(2)}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to cart', 'info');
      navigate('/login');
      onClose();
      return;
    }

    if (!startDate || !endDate) {
      showToast('Please select rental dates', 'error');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showToast('End date must be after start date', 'error');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      showToast('Please provide delivery address', 'error');
      return;
    }

    addToCart({
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      pricePerDay: product.pricePerDay,
      currency: product.currency,
      ownerId: product.ownerId,
      categoryId: product.categoryId,
      pickupMethod: deliveryMethod,
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      meetPublicLocation: (deliveryMethod === 'meet_public' || deliveryMethod === 'visit') 
        ? (product.address_line || product.location?.address || '') 
        : undefined,
    });

    showToast('Item added to cart successfully!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          transition: 'opacity 0.3s'
        }}
        onClick={onClose}
      />

      {/* Alibaba-Style Right Drawer */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100%',
          width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 
                 typeof window !== 'undefined' && window.innerWidth >= 1024 ? '480px' : '420px',
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {/* Alibaba-Style Header */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            color: '#111827',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#14b8a6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '24px' }}>🛒</span>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  Add to Cart
                </h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                  Configure your rental details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#6b7280';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px',
          paddingBottom: '140px',
          minHeight: 0
        }}>
          {/* Product Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              {product.image && (
                <div style={{ position: 'relative' }}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#14b8a6',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    Available
                  </div>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                    {product.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#fef3c7',
                      padding: '4px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    ⭐ <span style={{ fontSize: '14px', fontWeight: '600', color: '#d97706' }}>4.8</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    🛡️ <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>Verified Seller</span>
                  </div>
                  
                  <div
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Price per day</p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#14b8a6' }}>
                          {formatCurrency(product.pricePerDay, product.currency)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Min rental</p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>1 day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                📅
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  Rental Period
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Select your rental dates
                </p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value >= endDate) {
                      const newEndDate = new Date(e.target.value);
                      newEndDate.setDate(newEndDate.getDate() + 1);
                      setEndDate(newEndDate.toISOString().split('T')[0]);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                />
              </div>
            </div>
            
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                ℹ️
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                    Rental Duration: {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6' }}>
                    Total cost: {formatCurrency(totalPrice, product.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#fed7aa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                🚚
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  Delivery Method
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Choose how you want to receive the item
                </p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: deliveryMethod === 'pickup' ? '2px solid #14b8a6' : '2px solid #d1d5db',
                  backgroundColor: deliveryMethod === 'pickup' ? '#f0fdfa' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: deliveryMethod === 'pickup' ? '#14b8a6' : '#e5e7eb',
                      color: deliveryMethod === 'pickup' ? 'white' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    📍
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: '600',
                        color: deliveryMethod === 'pickup' ? '#0f766e' : '#111827'
                      }}
                    >
                      Pickup
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      Collect from seller
                    </p>
                  </div>
                  {deliveryMethod === 'pickup' && (
                    <div style={{ color: '#14b8a6' }}>✓</div>
                  )}
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: deliveryMethod === 'delivery' ? '2px solid #14b8a6' : '2px solid #d1d5db',
                  backgroundColor: deliveryMethod === 'delivery' ? '#f0fdfa' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: deliveryMethod === 'delivery' ? '#14b8a6' : '#e5e7eb',
                      color: deliveryMethod === 'delivery' ? 'white' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    🚚
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: '600',
                        color: deliveryMethod === 'delivery' ? '#0f766e' : '#111827'
                      }}
                    >
                      Delivery
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      Delivered to your address
                    </p>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <div style={{ color: '#14b8a6' }}>✓</div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryMethod === 'delivery' && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
              }}
            >
              <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                Delivery Address
              </h4>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter delivery address"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: '#111827',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Order Summary */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              Order Summary
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Base price</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {formatCurrency(product.pricePerDay, product.currency)}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Duration</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {totalDays} {totalDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {formatCurrency(basePrice, product.currency)}
                </span>
              </div>
              
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#14b8a6' }}>
                    {formatCurrency(totalPrice, product.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}
          >
            <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              Why choose us?
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                🛡️ <span style={{ fontSize: '14px', color: '#374151' }}>Secure payment protection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                ✅ <span style={{ fontSize: '14px', color: '#374151' }}>Verified sellers only</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                🕐 <span style={{ fontSize: '14px', color: '#374151' }}>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '16px 24px 16px 24px',
            display: 'grid',
            gap: '8px',
            zIndex: 1,
            margin: 0
          }}
        >
          <button
            onClick={handleAddToCart}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(to right, #0d9488, #0f766e)',
              color: 'white',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
              margin: 0
            }}
          >
            🛒 Add to Cart
          </button>
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              color: '#374151',
              borderRadius: '16px',
              fontWeight: '600',
              backgroundColor: 'white',
              cursor: 'pointer',
              margin: 0
            }}
          >
            Continue Shopping
          </button>

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', paddingTop: '4px', margin: 0 }}>
            <p style={{ margin: '0 0 2px 0' }}>Free cancellation within 24 hours</p>
            <p style={{ margin: 0 }}>Instant booking confirmation</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AlibabaModal;