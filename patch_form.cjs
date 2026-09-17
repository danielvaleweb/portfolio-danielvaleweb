const fs = require('fs');

let content = fs.readFileSync('src/components/ProjectForm.tsx', 'utf8');

// Add imports
if (!content.includes('import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";')) {
    content = content.replace(
        'import { Save, Image as ImageIcon, Video, Tag, X, ChevronDown, Check, Upload, Link } from "lucide-react";',
        `import { Save, Image as ImageIcon, Video, Tag, X, ChevronDown, Check, Upload, Link, Loader } from "lucide-react";\nimport { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";\nimport { storage } from "../firebase";`
    );
}
if (!content.includes('import { useRef }')) {
    content = content.replace('import React, { useState, useEffect } from', 'import React, { useState, useEffect, useRef } from');
}

// Add state & refs
const statesToAdd = `
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState<'thumbnail' | 'videoUrl' | 'downloadUrl' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'thumbnail' | 'videoUrl' | 'downloadUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(fieldName);
    setUploadProgress(0);

    const storageRef = ref(storage, \`projects/\${Date.now()}_\${file.name}\`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(null);
        alert("Upload failed. Try again.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({ ...prev, [fieldName]: downloadURL }));
          setUploading(null);
        });
      }
    );
  };
`;

const stateInsertPoint = 'const [tagInput, setTagInput] = useState(\'\');';
if (!content.includes('const thumbnailInputRef')) {
    content = content.replace(stateInsertPoint, stateInsertPoint + statesToAdd);
}

// Change Thumbnail URL input
const thumbSearch = `            <input 
              type="url" 
              name="thumbnail"`;
const thumbReplace = `            <div className="flex gap-2">
              <input type="file" ref={thumbnailInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
              <input 
                type="url" 
                name="thumbnail"`;
const thumbEndSearch = `              placeholder="https://..."
            />`;
const thumbEndReplace = `              placeholder="https://..."
              />
              <button 
                type="button" 
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploading === 'thumbnail'}
                className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {uploading === 'thumbnail' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
              </button>
            </div>`;

content = content.replace(thumbSearch, thumbReplace);
content = content.replace(thumbEndSearch, thumbEndReplace);

// Change Video URL input
const videoSearch = `            <input 
              type="url" 
              name="videoUrl"`;
const videoReplace = `            <div className="flex gap-2">
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoUrl')} />
              <input 
                type="url" 
                name="videoUrl"`;
const videoEndSearch = `              placeholder="https://youtube.com/..."
            />`;
const videoEndReplace = `              placeholder="https://youtube.com/..."
              />
              <button 
                type="button" 
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading === 'videoUrl'}
                className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {uploading === 'videoUrl' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
              </button>
            </div>`;
content = content.replace(videoSearch, videoReplace);
content = content.replace(videoEndSearch, videoEndReplace);

// Change Download File URL input
const downloadSearch = `                   <div className="flex gap-2">
                     <input 
                       type="url" 
                       name="downloadUrl"`;
const downloadReplace = `                   <div className="flex gap-2">
                     <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'downloadUrl')} />
                     <input 
                       type="url" 
                       name="downloadUrl"`;
const downloadBtnSearch = `                     <button type="button" className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2">
                       <Upload size={16} /> Upload
                     </button>`;
const downloadBtnReplace = `                     <button 
                       type="button" 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={uploading === 'downloadUrl'}
                       className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                     >
                       {uploading === 'downloadUrl' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
                     </button>`;
content = content.replace(downloadSearch, downloadReplace);
content = content.replace(downloadBtnSearch, downloadBtnReplace);

fs.writeFileSync('src/components/ProjectForm.tsx', content);

