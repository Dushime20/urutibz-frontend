import React, { useRef, useEffect, useState } from 'react';

interface SelfieStepProps {
  verificationData: any;
  showCamera: boolean;
  setCameraMode: (mode: 'document' | 'selfie' | null) => void;
  startCamera: () => void;
  capturedSelfie: string | null;
  handleRetakeSelfie: () => void;
  nextStep: () => void;
  errors: Record<string, string>;
  setCapturedSelfie: (imageData: string | null) => void;
  onConfirmSelfie: (imageData: string) => void;
  onSubmitSelfie: () => void;
  showSubmitSelfie: boolean;
  isProcessing: boolean;
}

const SelfieStep: React.FC<SelfieStepProps> = ({
  verificationData,
  showCamera,
  setCameraMode,
  startCamera,
  capturedSelfie,
  handleRetakeSelfie,
  nextStep,
  errors,
  setCapturedSelfie,
  onConfirmSelfie,
  onSubmitSelfie,
  showSubmitSelfie,
  isProcessing
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera when showCamera is true
  useEffect(() => {
    if (showCamera) {
      startCameraPreview();
    }
    return () => {
      stopCamera();
    };
  }, [showCamera]);

  const startCameraPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Front camera for selfie
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob/base64
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setCapturedSelfie(base64String);
          setIsCapturing(false);
          stopCamera();
          setCameraMode(null);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleRetake = () => {
    handleRetakeSelfie();
  };

  const handleCloseCamera = () => {
    stopCamera();
    setCameraMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Selfie Verification</h2>
        <p className="text-gray-600">Take a selfie to verify your identity</p>
      </div>

      {/* Camera Preview */}
      {showCamera && !capturedSelfie && (
        <div className="relative bg-black rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto max-h-96 object-cover"
          />
          {/* Camera Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
            >
              {isCapturing ? 'Capturing...' : 'Capture Photo'}
            </button>
            <button
              onClick={handleCloseCamera}
              className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Initial Camera Button */}
      {!verificationData.selfieImage && !capturedSelfie && !showCamera && (
        <div className="text-center">
          <button
            onClick={() => {
              setCameraMode('selfie');
              startCamera();
            }}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Open Camera
          </button>
          {errors.selfie && (
            <p className="text-red-500 mt-2">{errors.selfie}</p>
          )}
        </div>
      )}

      {/* Captured Selfie Preview */}
      {capturedSelfie && (
        <div className="text-center space-y-4">
          <div className="inline-block rounded-2xl overflow-hidden shadow-lg">
            <img
              src={capturedSelfie}
              alt="Captured selfie"
              className="w-full max-w-md h-auto"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRetake}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      {/* Show Submit button after selfie is confirmed and uploaded */}
      {showSubmitSelfie && verificationData.selfieImage && !capturedSelfie && (
        <div className="text-center mt-6">
          <button
            onClick={onSubmitSelfie}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
            disabled={isProcessing}
          >
            {isProcessing ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SelfieStep;