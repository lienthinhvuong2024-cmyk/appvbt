/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { Upload, FileType, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center w-full max-w-2xl p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-white hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        className="hidden" 
        accept="application/pdf,image/*" 
        onChange={onFileChange} 
      />
      <div className="p-6 bg-blue-100 rounded-full text-blue-600 mb-6 group-hover:scale-110 transition-transform">
        <Upload size={48} />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Tải lên bài tập của bạn</h3>
      <p className="text-slate-500 mb-8 text-center max-w-sm">
        Kéo và thả tệp PDF hoặc hình ảnh (PNG, JPG) của đề thi vào đây để bắt đầu.
      </p>
      
      <div className="flex gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm">
          <FileType size={18} className="text-red-500" />
          <span>PDF Document</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm">
          <ImageIcon size={18} className="text-blue-500" />
          <span>Image File</span>
        </div>
      </div>
    </div>
  );
};
