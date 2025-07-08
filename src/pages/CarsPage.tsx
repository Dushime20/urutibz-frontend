import React, { useState } from 'react';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import Button from '../components/ui/Button';
import CarCard from '../components/cars/CarCard';
import { mockCars } from '../data/mockData';

const CarsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    carType: [] as string[],
    transmission: [] as string[],
    fuelType: [] as string[],
  });

  const carTypes = ['sedan', 'suv', 'hatchback', 'convertible', 'coupe'];
  const transmissionTypes = ['automatic', 'manual'];
  const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType as keyof typeof prev] as string[];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterType]: updatedValues,
      };
    });
  };

  // Apply filters to cars
  const filteredCars = mockCars.filter(car => {
    const priceInRange = car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];
    const typeMatch = filters.carType.length === 0 || filters.carType.includes(car.type);
    const transmissionMatch = filters.transmission.length === 0 || filters.transmission.includes(car.transmission);
    const fuelMatch = filters.fuelType.length === 0 || filters.fuelType.includes(car.fuelType);
    
    return priceInRange && typeMatch && transmissionMatch && fuelMatch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Available Cars</h1>
                <p className="text-gray-600 mt-1">
                  {filteredCars.length} cars available for rent
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range (per day)</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [0, parseInt(e.target.value)]
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$0</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Car Type */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Car Type</h4>
                  <div className="space-y-2">
                    {carTypes.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.carType.includes(type)}
                          onChange={() => handleFilterChange('carType', type)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Transmission</h4>
                  <div className="space-y-2">
                    {transmissionTypes.map((transmission) => (
                      <label key={transmission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.transmission.includes(transmission)}
                          onChange={() => handleFilterChange('transmission', transmission)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{transmission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Fuel Type</h4>
                  <div className="space-y-2">
                    {fuelTypes.map((fuel) => (
                      <label key={fuel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.fuelType.includes(fuel)}
                          onChange={() => handleFilterChange('fuelType', fuel)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{fuel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters({
                    priceRange: [0, 200],
                    carType: [],
                    transmission: [],
                    fuelType: [],
                  })}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>

            {/* Cars Grid/List */}
            <div className="flex-1">
              {filteredCars.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Filter className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-6'
                }>
                  {filteredCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CarsPage;
