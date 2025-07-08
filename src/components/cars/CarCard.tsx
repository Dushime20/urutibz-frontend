import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings, Fuel, Star } from 'lucide-react';
import type { Car } from '../../data/mockData';
import { Button, Badge, AIBadge } from '../ui/DesignSystem';
import { formatPrice } from '../../lib/utils';

interface CarCardProps {
  car: Car;
  listView?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, listView = false }) => {
  const {
    id,
    name,
    price,
    priceType,
    images,
    passengers,
    transmission,
    fuelType,
    year,
    rating,
    reviewCount,
    available,
  } = car;

  if (listView) {
    return (
      <div className="card-interactive">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-60 md:h-auto relative">
            <img 
              src={images[0]} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            {!available && (
              <Badge variant="error" className="absolute top-2 right-2">
                Unavailable
              </Badge>
            )}
            {/* Add AI badge for demonstration */}
            <AIBadge className="absolute top-2 left-2">
              AI Pick
            </AIBadge>
          </div>
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold text-platform-dark-grey font-outfit">{name}</h3>
                <p className="text-sm text-platform-grey">{year} • {transmission}</p>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-platform-dark-grey">{rating}</span>
                <span className="text-xs text-platform-grey ml-1">({reviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 my-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-platform-grey mr-2" />
                <span className="text-sm text-platform-dark-grey">{passengers} People</span>
              </div>
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-platform-grey mr-2" />
                <span className="text-sm text-platform-dark-grey">{transmission}</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-5 h-5 text-platform-grey mr-2" />
                <span className="text-sm text-platform-dark-grey">{fuelType}</span>
              </div>
            </div>
            
            <div className="mt-auto flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-active">{formatPrice(price)}</span>
                <span className="text-platform-grey">/{priceType}</span>
              </div>
              
              <div>
                <Link to={`/cars/${id}`}>
                  <Button>View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card">
      <div className="relative overflow-hidden">
        <img 
          src={images[0]} 
          alt={name} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!available && (
          <Badge variant="error" className="absolute top-2 right-2">
            Unavailable
          </Badge>
        )}
        <AIBadge className="absolute top-2 left-2">
          AI Pick
        </AIBadge>
        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-active to-active-dark text-white text-sm font-bold px-4 py-2 rounded-full shadow-platform">
          {formatPrice(price)}/{priceType}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-platform-dark-grey group-hover:text-active transition-colors font-outfit">{name}</h3>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-platform">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-yellow-700">{rating}</span>
          </div>
        </div>
        <p className="text-sm text-platform-grey mb-4">{year} • {transmission}</p>
        
        <div className="flex justify-between items-center text-sm text-platform-grey mb-6">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{passengers}</span>
          </div>
          <div className="flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center">
            <Fuel className="w-4 h-4 mr-1" />
            <span>{fuelType}</span>
          </div>
        </div>
        
        <Link to={`/cars/${id}`} className="block">
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
