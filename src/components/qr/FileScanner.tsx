import React from "react";

/**
 * File-based QR code scanner UI component.
 * Allows users to upload an image file containing a QR code for scanning.
 *
 * @prop fileInputRef - Ref to the hidden file input element
 * @prop onFileSelect - Callback when user selects a file
 */
interface FileScannerProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileScanner: React.FC<FileScannerProps> = ({ fileInputRef, onFileSelect }) => {
  return (
    <div className="mt-4 card p-4">
      <label htmlFor="qr-file-input" className="block text-sm font-medium text-slate-200 mb-2">
        Or upload a QR code image:
      </label>
      <input
        id="qr-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="block w-full text-sm text-slate-300
          file:mr-3 file:py-2.5 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-sky-600 file:text-white
          hover:file:bg-sky-500 file:cursor-pointer file:transition-colors"
      />
    </div>
  );
};
