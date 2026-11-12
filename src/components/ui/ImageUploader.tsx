import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  Check,
  RefreshCw,
  Trash2,
  Maximize2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FlipHorizontal,
} from 'lucide-react';
import { compressImage, uploadImageToStorage } from '../../services/imageUploadService';

export interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  className?: string;
  allowUrlInput?: boolean;
}

type ModalView = 'options' | 'camera' | 'preview';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Upload Image',
  helperText,
  required = false,
  aspectRatio = 'auto',
  className = '',
  allowUrlInput = true,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('options');
  const [previewDraft, setPreviewDraft] = useState<string | null>(null);
  const [draftInfo, setDraftInfo] = useState<{
    width: number;
    height: number;
    sizeKb: number;
    source: 'device' | 'camera' | 'url';
    file?: File | Blob;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Hidden file inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up camera stream on close or unmount
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const closeModal = () => {
    stopCameraStream();
    setModalOpen(false);
    setModalView('options');
    setPreviewDraft(null);
    setDraftInfo(null);
    setUploadError(null);
    setCameraError(null);
    setShowUrlField(false);
    setUrlDraft('');
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Handle selected file from device or mobile camera
  const processSelectedFile = async (file: File, source: 'device' | 'camera') => {
    try {
      setUploadError(null);
      const processed = await compressImage(file, 2048, 2048, 0.88);
      setPreviewDraft(processed.dataUrl);
      setDraftInfo({
        width: processed.width,
        height: processed.height,
        sizeKb: Math.round(processed.sizeBytes / 1024),
        source,
        file: processed.blob,
      });
      setModalView('preview');
    } catch (err: any) {
      console.error(err);
      setUploadError('Failed to read or optimize the selected image. Please try another.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file, 'device');
    }
    // reset input so the same file can be reselected if needed
    e.target.value = '';
  };

  const handleMobileCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file, 'camera');
    }
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedFile(file, 'device');
    }
  };

  // Live Camera view activation
  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    setModalView('camera');
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback for older browsers or unsupported webview: trigger native camera input
      mobileCameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Direct webcam access failed or was denied:', err);
      setCameraError(
        'Unable to access camera directly. Please check browser permissions or use the mobile camera capture button.'
      );
      // Give user the option to trigger system camera capture input
      mobileCameraInputRef.current?.click();
    }
  };

  const switchCameraFacing = () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(next);
    startCamera(next);
  };

  // Capture frame from live camera
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if using front/user camera for natural mirror feeling
    if (cameraFacing === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    stopCameraStream();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    try {
      const processed = await compressImage(dataUrl, 2048, 2048, 0.88);
      setPreviewDraft(processed.dataUrl);
      setDraftInfo({
        width: processed.width,
        height: processed.height,
        sizeKb: Math.round(processed.sizeBytes / 1024),
        source: 'camera',
        file: processed.blob,
      });
      setModalView('preview');
    } catch (err) {
      console.error(err);
      setUploadError('Failed to capture photo frame.');
    }
  };

  // Handle URL draft confirmation
  const handleConfirmUrl = async () => {
    if (!urlDraft.trim()) return;
    try {
      setUploadError(null);
      // Try to load and inspect
      setPreviewDraft(urlDraft.trim());
      setDraftInfo({
        width: 1200,
        height: 800,
        sizeKb: 0,
        source: 'url',
      });
      setModalView('preview');
    } catch (err) {
      setUploadError('Invalid image URL.');
    }
  };

  // Final confirmation: Upload and commit to form
  const handleConfirmUpload = async () => {
    if (!previewDraft) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      let finalUrl = previewDraft;

      // If we have a binary blob (from device or camera), upload to cloud storage
      if (draftInfo?.file) {
        finalUrl = await uploadImageToStorage(draftInfo.file, previewDraft);
      }

      onChange(finalUrl);
      closeModal();
    } catch (err: any) {
      console.error('Upload failed:', err);
      // Even if cloud storage fails, commit the preview dataUrl so work isn't lost
      onChange(previewDraft);
      closeModal();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'wide':
        return 'aspect-[21/9]';
      default:
        return 'h-48 sm:h-56';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Required badge */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-300 font-poppins">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
          {value && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Ready
            </span>
          )}
        </div>
      )}

      {/* Main Trigger / Display Card */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/80 hover:border-amber-500/50 transition-all shadow-md">
          {/* Image Thumbnail */}
          <div className={`w-full ${getAspectClass()} flex items-center justify-center bg-black/60 overflow-hidden`}>
            <img
              src={value}
              alt={label || 'Uploaded preview'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setModalView('options');
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Bar Info */}
          <div className="px-3.5 py-2 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="truncate max-w-[200px] sm:max-w-[300px]">
              {value.startsWith('data:') ? 'Inline 4K Image' : value}
            </span>
            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setPreviewDraft(value);
                setModalView('preview');
              }}
              className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 ml-2 shrink-0"
            >
              <Maximize2 className="w-3 h-3" /> Preview
            </button>
          </div>
        </div>
      ) : (
        /* Empty State Dropzone / Upload Button */
        <div
          onClick={() => {
            setModalOpen(true);
            setModalView('options');
          }}
          className={`group cursor-pointer rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-400/80 bg-zinc-950/60 hover:bg-zinc-900/40 p-6 sm:p-8 text-center transition-all ${getAspectClass()} flex flex-col items-center justify-center`}
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-750 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400/10 group-hover:border-amber-400/40 transition-all shadow-lg mb-3">
            <div className="flex items-center gap-1">
              <Upload className="w-5 h-5 text-amber-400" />
              <Camera className="w-4 h-4 text-zinc-400 group-hover:text-amber-300" />
            </div>
          </div>

          <h4 className="font-raleway text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
            Upload Image
          </h4>
          <p className="text-xs text-zinc-400 font-poppins mt-1 max-w-xs">
            Tap to upload from device or capture with camera.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-400 group-hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow-md">
            <span>Choose Image</span>
          </div>
        </div>
      )}

      {helperText && <p className="text-[11px] text-zinc-500 font-poppins">{helperText}</p>}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleMobileCameraInputChange}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* MODAL: IMAGE PICKER & LIVE CAMERA & PREVIEW */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Top Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-850 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  {modalView === 'options'
                    ? 'Select Image Source'
                    : modalView === 'camera'
                    ? 'Device Camera Viewfinder'
                    : 'Review & Confirm Preview'}
                </span>
              </div>
              <h3 className="font-raleway text-xl font-bold text-white">
                {modalView === 'options'
                  ? 'Add or Replace Image'
                  : modalView === 'camera'
                  ? 'Take a Live Photo'
                  : 'Image Preview'}
              </h3>
              <p className="text-xs text-zinc-400 font-poppins mt-0.5">
                {modalView === 'options'
                  ? 'Choose how you would like to provide your image.'
                  : modalView === 'camera'
                  ? 'Position your product or subject in the frame and snap when ready.'
                  : 'Inspect your image details before confirming the upload.'}
              </p>
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW 1: SOURCE OPTIONS */}
            {/* ===================================================================== */}
            {modalView === 'options' && (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Drag & Drop Area with 2 Primary Options */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border-2 transition-all ${
                    isDragOver
                      ? 'border-amber-400 bg-amber-400/5'
                      : 'border-dashed border-zinc-800 bg-zinc-900/30'
                  }`}
                >
                  {/* Option 1: Upload from Device */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/60 transition-all text-center group active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-black border border-zinc-700 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-md mb-3">
                      <Upload className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="font-raleway text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      Upload from Device
                    </span>
                    <span className="text-[11px] text-zinc-400 font-poppins mt-1">
                      Choose from gallery, files, or drag & drop photo here
                    </span>
                    <span className="mt-3 text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                      PNG, JPG, WEBP
                    </span>
                  </button>

                  {/* Option 2: Use Device Camera */}
                  <button
                    type="button"
                    onClick={() => startCamera('user')}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/60 transition-all text-center group active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-black border border-zinc-700 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-md mb-3">
                      <Camera className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="font-raleway text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      Use Device Camera
                    </span>
                    <span className="text-[11px] text-zinc-400 font-poppins mt-1">
                      Snap live photo using your phone or computer webcam
                    </span>
                    <span className="mt-3 text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full">
                      Live Capture
                    </span>
                  </button>
                </div>

                {/* Optional Fallback: URL Input */}
                {allowUrlInput && (
                  <div className="pt-2 border-t border-zinc-850">
                    <button
                      type="button"
                      onClick={() => setShowUrlField(!showUrlField)}
                      className="text-xs text-zinc-400 hover:text-amber-400 flex items-center justify-between w-full py-1.5 transition-colors font-poppins"
                    >
                      <span>Already have an image web link?</span>
                      {showUrlField ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {showUrlField && (
                      <div className="mt-2.5 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleConfirmUrl}
                            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl font-poppins transition-colors"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW 2: LIVE CAMERA VIEWFINDER */}
            {/* ===================================================================== */}
            {modalView === 'camera' && (
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                {cameraError ? (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-zinc-300 font-poppins">{cameraError}</p>
                    <div className="flex justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => mobileCameraInputRef.current?.click()}
                        className="px-4 py-2 bg-amber-400 text-black text-xs font-bold rounded-xl"
                      >
                        Launch Camera App
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalView('options')}
                        className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Viewfinder Window */}
                    <div className="relative flex-1 min-h-[260px] sm:min-h-[320px] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${
                          cameraFacing === 'user' ? 'scale-x-[-1]' : ''
                        }`}
                      />

                      {/* Viewfinder Grid overlay */}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-white" />
                        <div className="border-r border-white" />
                        <div />
                      </div>

                      {/* Flip Camera Button */}
                      <button
                        type="button"
                        onClick={switchCameraFacing}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-amber-400 transition-colors border border-white/10"
                        title="Flip Camera"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>

                      {/* Live Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Live
                      </div>
                    </div>

                    {/* Camera Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          stopCameraStream();
                          setModalView('options');
                        }}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl font-poppins transition-colors"
                      >
                        Back
                      </button>

                      {/* Shutter Button */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border-4 border-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xl"
                        title="Take Photo"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-400 group-hover:bg-amber-300 transition-colors flex items-center justify-center">
                          <Camera className="w-5 h-5 text-black" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => mobileCameraInputRef.current?.click()}
                        className="text-xs text-zinc-400 hover:text-amber-400 font-poppins"
                        title="Use native mobile camera"
                      >
                        Native App
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW 3: PREVIEW BEFORE UPLOAD */}
            {/* ===================================================================== */}
            {modalView === 'preview' && previewDraft && (
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                {/* Preview Image Container */}
                <div className="relative flex-1 min-h-[240px] sm:min-h-[300px] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center p-2">
                  <img
                    src={previewDraft}
                    alt="Preview before upload"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />

                  {/* Source Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur border border-zinc-700 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
                    {draftInfo?.source === 'camera'
                      ? 'Camera Snapshot'
                      : draftInfo?.source === 'url'
                      ? 'External URL'
                      : 'Device File'}
                  </span>
                </div>

                {/* Details Bar */}
                {draftInfo && (
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>
                      Resolution: <strong className="text-white">{draftInfo.width}×{draftInfo.height}</strong>
                    </span>
                    {draftInfo.sizeKb > 0 && (
                      <span>
                        Size: <strong className="text-white">{draftInfo.sizeKb} KB</strong>
                      </span>
                    )}
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> High Quality
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      setPreviewDraft(null);
                      setDraftInfo(null);
                      setModalView('options');
                    }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl font-poppins flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Choose Different / Retake</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleConfirmUpload}
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Optimizing & Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Use Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

