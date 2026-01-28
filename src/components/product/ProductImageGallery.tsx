import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ZoomIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImageGalleryProps {
  images: string[];
  productTitle: string;
  selectedIndex: number;
  onImageSelect: (image: string, index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productTitle,
  selectedIndex,
  onImageSelect
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleNextImage = () => {
    if (images.length > 1) {
      const nextIndex = (selectedIndex + 1) % images.length;
      onImageSelect(images[nextIndex], nextIndex);
    }
  };

  const handlePrevImage = () => {
    if (images.length > 1) {
      const prevIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
      onImageSelect(images[prevIndex], prevIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const currentImage = images[selectedIndex];

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-24 h-24 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <p>No image available</p>
        </div>
      </div>
    );
  }

  // Single image - no thumbnails needed
  if (images.length === 1) {
    return (
      <div className="aspect-square bg-gray-100 rounded overflow-hidden group">
        <div
          className="relative w-full h-full cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentImage}
            alt={productTitle}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : {}
            }
          />
          
          {/* Zoom Icon */}
          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  // Multiple images - Alibaba style with left thumbnails
  return (
    <div className="flex gap-3">
      {/* Left: Vertical Thumbnail Gallery - Alibaba Style */}
      <div className="flex flex-col gap-2 w-16">
        {images.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => onImageSelect(image, index)}
            className={`w-16 h-16 rounded border-2 overflow-hidden transition-all ${
              selectedIndex === index
                ? 'border-teal-500 ring-1 ring-teal-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={image}
              alt={`${productTitle} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Right: Main Image Display */}
      <div className="flex-1">
        <div className="relative aspect-square bg-gray-100 rounded overflow-hidden group">
          <div
            className="relative w-full h-full cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={currentImage}
              alt={`${productTitle} - Image ${selectedIndex + 1}`}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />
            
            {/* Zoom Icon */}
            <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <ArrowRight className="w-4 h-4 text-gray-700" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;