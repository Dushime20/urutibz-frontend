import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartIconProps {
  onClick: () => void;
  className?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ onClick, className = '' }) => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${className}`}
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-slate-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;

