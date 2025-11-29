"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type ThumbnailEditorProps = {
  value: string;
  onChange: (url: string) => void;
};

export default function ThumbnailEditor({ value, onChange }: ThumbnailEditorProps) {
  const [imgSrc, setImgSrc] = useState<string>(value || '');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isDragging, setIsDragging] = useState(false);
  const [isCropped, setIsCropped] = useState<boolean>(false);
  const [croppedImageSrc, setCroppedImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync imgSrc with value prop
  useEffect(() => {
    if (value && value !== imgSrc && value !== croppedImageSrc) {
      setImgSrc(value);
      setCroppedImageSrc(value);
      setIsCropped(true);
    } else if (!value && imgSrc) {
      // If value is cleared, clear imgSrc too
      setImgSrc('');
      setCroppedImageSrc('');
      setIsCropped(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const imageUrl = reader.result?.toString() || '';
        setImgSrc(imageUrl);
        setCrop(undefined);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      16 / 9, // Aspect ratio
      naturalWidth,
      naturalHeight
    );
    setCrop(centerCrop(crop, naturalWidth, naturalHeight));
  }, []);

  const getCroppedImg = useCallback(async (): Promise<string | null> => {
    if (!imgRef.current || !completedCrop) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        // Convert blob to base64 string
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop]);

  const handleCropComplete = useCallback(async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      setCroppedImageSrc(croppedImageUrl);
      setIsCropped(true);
      setCrop(undefined);
      setCompletedCrop(undefined);
      onChange(croppedImageUrl);
    }
  }, [getCroppedImg, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const imageUrl = reader.result?.toString() || '';
          setImgSrc(imageUrl);
          setCroppedImageSrc('');
          setIsCropped(false);
          setCrop(undefined);
          setCompletedCrop(undefined);
        });
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            const imageUrl = reader.result?.toString() || '';
            setImgSrc(imageUrl);
            setCroppedImageSrc('');
            setIsCropped(false);
            setCrop(undefined);
            setCompletedCrop(undefined);
          });
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  const handleRemove = useCallback(() => {
    setImgSrc('');
    setCroppedImageSrc('');
    setIsCropped(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const handleEditCrop = useCallback(() => {
    setIsCropped(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Thumbnail</label>
      
      {!imgSrc ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Kéo thả ảnh vào đây hoặc click để chọn
            </p>
            <p className="text-xs text-gray-500">
              Hoặc dán ảnh từ clipboard (Ctrl+V)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {isCropped && croppedImageSrc ? (
            <div className="relative border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={croppedImageSrc}
                alt="Thumbnail"
                className="w-full h-48 object-cover"
              />
            </div>
          ) : (
            <div className="relative border rounded-lg overflow-hidden bg-gray-100">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16 / 9}
                minWidth={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-64 w-auto mx-auto"
                  style={{ display: 'block', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
          )}
          <div className="flex gap-2">
            {!isCropped ? (
              <button
                type="button"
                onClick={handleCropComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Apply
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEditCrop}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Edit Crop
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Chọn ảnh khác
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Xóa
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

