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
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group ${className}`}
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse border-2 border-white dark:border-slate-900">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      {itemCount > 0 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-teal-500 rounded-full opacity-75 animate-ping"></div>
      )}
    </button>
  );
};

export default CartIcon;



