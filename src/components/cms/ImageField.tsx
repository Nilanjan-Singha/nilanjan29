import React, { useRef, useState } from 'react';
import { resizeImageFile, uploadFileToBucket } from '../../utils/cmsHelpers';

interface ImageFieldProps {
  label: string;
  value: string;
  maxWidth: number;
  round?: boolean;
  half?: boolean;
  wide?: boolean;
  folder?: string;
  onChange: (nextUrl: string) => void;
}

export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  maxWidth,
  round,
  half,
  wide,
  folder = 'images',
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const displayUrl = /^data:/.test(value || '') ? '' : value || '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const bucketUrl = await uploadFileToBucket(file, folder);
      if (bucketUrl) {
        onChange(bucketUrl);
      } else {
        const dataUrl = await resizeImageFile(file, maxWidth);
        onChange(dataUrl);
      }
    } catch {
      // ignore failed image read
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  return (
    <div className={`f${half ? '' : ' full'}${wide ? ' wide' : ''}`}>
      <span className="l">{label}</span>
      <div className="ir">
        <div
          className={`th${round ? ' rnd' : ''}`}
          style={{
            backgroundImage: value
              ? `url("${value.replace(/"/g, '%22')}")`
              : 'none',
          }}
        />
        <button
          className="b2"
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          type="text"
          className="iu"
          placeholder="or paste an image link"
          value={displayUrl}
          onChange={(e) => onChange(e.target.value.trim())}
        />
        <button
          className="ib"
          type="button"
          title="Remove image"
          aria-label="Remove image"
          hidden={!value}
          onClick={() => onChange('')}
        >
          ×
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
