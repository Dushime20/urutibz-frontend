import React from 'react';
import VerificationGuard from '../components/auth/VerificationGuard';
import { Card, Button } from '../components/ui/DesignSystem';
import { Plus, Camera, MapPin, DollarSign } from 'lucide-react';

const CreateListingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="content-grid py-8 sm:py-12">
        <div className="content">
          <VerificationGuard action="list">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  List Your Item
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Share your items with the UrutiBz community and start earning money from things you own.
                </p>
              </div>

              <Card className="p-8">
                <form className="space-y-8">
                  {/* Item Category */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      What are you listing?
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        'Electronics',
                        'Vehicles',
                        'Tools',
                        'Photography',
                        'Sports',
                        'Home & Garden',
                        'Fashion',
                        'Other'
                      ].map(category => (
                        <button
                          key={category}
                          type="button"
                          className="p-4 border border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Add Photos
                    </h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                      <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">Upload photos of your item</p>
                      <Button variant="outline">
                        Choose Photos
                      </Button>
                    </div>
                  </div>

                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Canon EOS R5 Camera"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Price per Day *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe your item, its condition, what's included..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="City, State"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-6 border-t">
                    <Button variant="primary" className="w-full">
                      <Plus className="w-5 h-5 mr-2" />
                      List Your Item
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </VerificationGuard>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
