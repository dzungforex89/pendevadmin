"use client";

import React, { useRef, useState, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type ImageCropModalProps = {
  imageSrc: string;
  onClose: () => void;
  onApply: (croppedImageSrc: string) => void;
};

export default function ImageCropModal({ imageSrc, onClose, onApply }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const initialCrop = makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      naturalWidth / naturalHeight, // Free aspect ratio
      naturalWidth,
      naturalHeight
    );
    setCrop(centerCrop(initialCrop, naturalWidth, naturalHeight));
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

    return new Promise<string>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve('');
            return;
          }
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            resolve(reader.result as string);
          });
          reader.readAsDataURL(blob);
        },
        'image/png',
        1
      );
    });
  }, [completedCrop]);

  const handleApply = useCallback(async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onApply(croppedImageUrl);
    }
  }, [getCroppedImg, onApply]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col p-4 overflow-hidden"
        style={{ backgroundColor: 'oklch(0.98 0.01 260)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'oklch(0.22 0.04 260)' }}>
            Crop Image
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            style={{ color: 'oklch(0.22 0.04 260)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto mb-4">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                alt="Crop"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '70vh', maxWidth: '100%' }}
              />
            </ReactCrop>
          </div>
        </div>

        <div className="flex gap-2 justify-end border-t pt-4" style={{ borderColor: 'oklch(0.85 0.01 260)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded transition-colors text-sm"
            style={{
              backgroundColor: 'oklch(0.9 0.01 260)',
              color: 'oklch(0.22 0.04 260)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded transition-colors text-sm text-white"
            style={{
              backgroundColor: 'oklch(0.5638 0.2255 24.24)',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

