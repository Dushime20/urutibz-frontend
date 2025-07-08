import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../../components/ui/DesignSystem';
import VerificationLayout from '../../components/verification/VerificationLayout';
import { Navigate, useNavigate } from 'react-router-dom';
import { IdCard, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const IdVerificationPage: React.FC = () => {
  const { user, updateVerificationStatus } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    front?: File;
    back?: File;
  }>({});
  const [previews, setPreviews] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Redirect if phone not verified
  if (!user?.verification.isPhoneVerified) {
    return <Navigate to="/verify/phone" replace />;
  }

  // Redirect if already verified
  if (user?.verification.isIdVerified) {
    return <Navigate to="/verify/address" replace />;
  }

  const handleFileUpload = (type: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => [...prev, 'Please upload only JPG or PNG files']);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => [...prev, 'File size must be less than 5MB']);
      return;
    }

    setUploadedFiles(prev => ({ ...prev, [type]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews(prev => ({ ...prev, [type]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);

    // Clear errors
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!uploadedFiles.front) {
      setErrors(['Please upload the front of your ID']);
      return;
    }

    if (!uploadedFiles.back) {
      setErrors(['Please upload the back of your ID']);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for ID verification
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real app, you would upload files to your server and verify them
      updateVerificationStatus({
        isIdVerified: true
      });

      // Navigate to next step
      navigate('/verify/address');
    } catch (error) {
      setErrors(['Failed to verify ID. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadBox: React.FC<{
    type: 'front' | 'back';
    title: string;
    description: string;
  }> = ({ type, title, description }) => (
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
      {previews[type] ? (
        <div className="space-y-4">
          <img 
            src={previews[type]} 
            alt={`ID ${type}`}
            className="w-full h-32 object-cover rounded-lg border"
          />
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Uploaded</span>
          </div>
          <label className="cursor-pointer">
            <span className="text-sm text-primary-600 hover:text-primary-700 underline">
              Change file
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload(type)}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h4 className="font-medium text-slate-800 mb-2">{title}</h4>
          <p className="text-sm text-slate-600 mb-4">{description}</p>
          <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg inline-block">
            Choose File
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload(type)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );

  return (
    <VerificationLayout
      currentStep="id"
      title="Verify Your Identity"
      description="Upload a clear photo of your government-issued ID to verify your identity and build trust with other users."
    >
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IdCard className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Upload Your ID Documents
            </h3>
            <p className="text-slate-600">
              We accept driver's licenses, passports, national ID cards, and other government-issued IDs
            </p>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-800">Please fix the following:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadBox
              type="front"
              title="Front of ID"
              description="Clear photo of the front side showing your face and details"
            />
            
            <FileUploadBox
              type="back"
              title="Back of ID"
              description="Clear photo of the back side with any additional information"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">Tips for best results:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Ensure all text is clearly visible and readable</li>
              <li>• Take photos in good lighting</li>
              <li>• Keep the entire ID within the frame</li>
              <li>• Avoid glare or shadows on the document</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={!uploadedFiles.front || !uploadedFiles.back}
              className="w-full"
            >
              {isLoading ? 'Verifying Documents...' : 'Submit for Verification'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                Skip for now
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center">
            Your documents are encrypted and stored securely. We never share your personal information.
          </div>
        </form>
      </Card>
    </VerificationLayout>
  );
};

export default IdVerificationPage;
