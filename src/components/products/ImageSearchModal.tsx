/**
 * Image Search Modal Component
 * Similar to Alibaba.com's image search functionality
 * Supports drag & drop, file picker, and URL input
 */

import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Upload, Link as LinkIcon, Image as ImageIcon, Loader2, AlertCircle, Search } from 'lucide-react';
import { searchByImageFile, searchByImageUrl, ImageSearchResult } from '../../pages/admin/service/imageSearch';
import { useTranslation } from '../../hooks/useTranslation';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchComplete: (results: ImageSearchResult[]) => void;
  onNavigateToResults?: (results: ImageSearchResult[]) => void;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  isOpen,
  onClose,
  onSearchComplete,
  onNavigateToResults,
}) => {
  const { tSync } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleSearch = useCallback(async () => {
    if (activeTab === 'upload' && !imageFile) {
      setError('Please select an image file');
      return;
    }

    if (activeTab === 'url' && !imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || undefined;
      let result;

      if (activeTab === 'upload' && imageFile) {
        result = await searchByImageFile(imageFile, { threshold: 0.5 }, token);
      } else if (activeTab === 'url' && imageUrl.trim()) {
        result = await searchByImageUrl(imageUrl.trim(), { threshold: 0.5 }, token);
      } else {
        setError('Invalid search parameters');
        setIsSearching(false);
        return;
      }

      if (result.success && result.data) {
        const items = result.data.items || [];
        console.log('Image search results:', { 
          success: result.success, 
          itemsCount: items.length, 
          items: items,
          fullData: result.data 
        });
        
        if (items.length > 0) {
          onSearchComplete(items);
          if (onNavigateToResults) {
            onNavigateToResults(items);
          }
          onClose();
        } else {
          setError('No similar products found. Try a different image or lower the similarity threshold.');
        }
      } else {
        setError(result.error || 'Search failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
    } finally {
      setIsSearching(false);
    }
  }, [activeTab, imageFile, imageUrl, onSearchComplete, onNavigateToResults, onClose]);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tSync('Search by Image', 'Search by Image')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tSync('Upload an image to find similar products', 'Upload an image to find similar products')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('upload');
              handleReset();
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {tSync('Upload Image', 'Upload Image')}
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('url');
              handleReset();
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LinkIcon className="w-4 h-4" />
              {tSync('Image URL', 'Image URL')}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-64 rounded-lg shadow-lg"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {imageFile?.name}
                  </p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {tSync('Drag & drop an image here', 'Drag & drop an image here')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {tSync('or click to browse', 'or click to browse')}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {tSync('Select Image', 'Select Image')}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {tSync('Image URL', 'Image URL')}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {imageUrl && (
                  <div className="mt-4">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-full max-h-64 rounded-lg shadow-lg"
                      onError={() => setError('Failed to load image from URL')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSearching}
          >
            {tSync('Cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSearch}
            disabled={isSearching || (activeTab === 'upload' && !imageFile) || (activeTab === 'url' && !imageUrl.trim())}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {tSync('Searching...', 'Searching...')}
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                {tSync('Search', 'Search')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSearchModal;

