import React, { useRef, useEffect, useState } from 'react';

interface SelfieStepProps {
  showCamera: boolean;
  setShowCamera: (show: boolean) => void;
  setCameraMode: (mode: 'document' | 'selfie' | null) => void;
  startCamera: () => void;
  capturedSelfie: string | null;
  setCapturedSelfie: (imageData: string | null) => void;
  handleRetakeSelfie: () => void;
  errors: Record<string, string>;
  onConfirmSelfie: (imageData: string) => void;
  isProcessing?: boolean;
}

const SelfieStep: React.FC<SelfieStepProps> = ({
  showCamera,
  setShowCamera,
  setCameraMode,
  startCamera,
  capturedSelfie,
  setCapturedSelfie,
  handleRetakeSelfie,
  errors,
  onConfirmSelfie,
  isProcessing
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setCapturedSelfie(base64String);
          onConfirmSelfie(base64String);
          setShowCamera(false); // Hide camera preview after capture
          setIsCapturing(false);
          stopCamera();
          setCameraMode(null);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleRetake = () => {
    setCapturedSelfie(null);
    handleRetakeSelfie();
    setShowCamera(true);
    setCameraMode('selfie');
  };

  const handleCloseCamera = () => {
    stopCamera();
    setCameraMode(null);
    setShowCamera(false);
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
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* Initial Camera Button */}
      {!capturedSelfie && !showCamera && (
        <div className="text-center">
          <button
            onClick={() => {
              setCameraMode('selfie');
              startCamera();
              setShowCamera(true);
            }}
            className="bg-[#01aaa7] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#019c98] transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Open Camera
          </button>
          {errors.selfie && (
            <p className="text-red-500 mt-2">{errors.selfie}</p>
          )}
        </div>
      )}
      {/* Show captured selfie image after capture, with only Retake button */}
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
              disabled={isProcessing}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfieStep;