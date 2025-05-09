'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import UnderDevelopment from '@/components/common/UnderDevelopment';

const feedbackTypes = [
  { id: 'data_correction', name: '資料勘誤', description: '回報資料錯誤或不準確的情況' },
  { id: 'business_cooperation', name: '業務合作', description: '討論商業合作機會' },
  { id: 'bug_report', name: '系統問題', description: '回報系統錯誤或異常' },
  { id: 'feature_request', name: '功能建議', description: '提供新功能或改進建議' },
  { id: 'other', name: '其他', description: '其他意見或建議' }
];

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function FeedbackPage() {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    
    if (typeFromUrl) {
      setType(decodeURIComponent(typeFromUrl));
    } else {
      setType('');
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('檔案大小不能超過 5MB。');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('只能上傳圖片檔案。');
        return;
      }

      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!email) {
      setError('請輸入電子郵件地址。');
      return;
    }

    if (!validateEmail(email)) {
      setError('請輸入有效的電子郵件地址。');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      console.log('Simulating sending verification code to:', email);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsCodeSent(true);
      alert('驗證碼已發送 (模擬)');
    } catch (err) {
      setError('驗證碼發送失敗，請稍後再試。');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('請輸入驗證碼。');
      return;
    }

    setError(null);

    try {
      console.log('Simulating verifying code:', verificationCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsVerified(true);
      alert('驗證碼驗證成功 (模擬)');
    } catch (err) {
      setError('驗證碼錯誤，請重新輸入。');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!type || !title || !content || !email || !isVerified) {
      setError('請填寫所有必填欄位並完成郵箱驗證！');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Simulating submitting feedback:', { type, title, content, email, file });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setType('');
      setTitle('');
      setContent('');
      setEmail('');
      setVerificationCode('');
      setIsCodeSent(false);
      setIsVerified(false);
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      alert('感謝您的反饋！我們會盡快處理。(模擬提交)');
    } catch (err) {
      setError('提交失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-[4rem]">
      <UnderDevelopment 
        message="意見回饋功能開發中，後端服務尚未啟用。目前表單提交僅為演示用途。" 
        year="2025"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20"
      >
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-md">
          <motion.h1 
            className="text-3xl font-bold text-white tracking-tighter"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            意見回饋
          </motion.h1>
          <p className="mt-2 text-blue-100/90 font-light">
            您的意見對我們很重要，我們會認真處理每一筆回饋。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-2">
            <label htmlFor="feedbackType" className="block text-lg font-semibold text-gray-700 tracking-tight">
              反饋類型 <span className="text-red-500">*</span>
            </label>
            <select
              id="feedbackType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full rounded-xl border-gray-200/80 shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 py-3 px-4 text-gray-700 bg-white/95"
              required
            >
              <option value="">請選擇反饋類型</option>
              {feedbackTypes.map(ft => (
                <option key={ft.id} value={ft.id}>
                  {ft.name} - {ft.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-lg font-semibold text-gray-700 tracking-tight">
              問題概要 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-xl border-gray-200/80 shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:shadow-md focus:border-blue-500 transition-all duration-200 py-3 px-4 placeholder-gray-400/80"
              placeholder="請簡短描述您的問題"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-lg font-semibold text-gray-700 tracking-tight">
              詳細說明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="block w-full rounded-xl border-gray-200/80 shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:shadow-md focus:border-blue-500 transition-all duration-200 py-3 px-4 placeholder-gray-400/80"
              placeholder="請詳細描述您遇到的問題或建議"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="file-upload" className="block text-lg font-semibold text-gray-700 tracking-tight">
              附加截圖（選填，限 5MB 內圖片）
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200/50 border-dashed rounded-xl bg-white/80 hover:border-blue-400/50 transition-colors duration-200">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="relative group">
                    <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-contain" />
                    <button 
                      type="button"
                      onClick={() => { setFile(null); if(previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      移除
                    </button>
                  </div>
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <div className="flex text-base text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>{previewUrl ? '更改檔案' : '上傳檔案'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">或拖放檔案</p>
                </div>
                <p className="text-sm text-gray-500">
                  PNG、JPG、GIF 最大 5MB
                </p>
              </div>
            </div>
            {previewUrl && (
              <motion.div 
                className="mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-32 w-auto rounded-lg shadow-sm border border-white/20"
                />
              </motion.div>
            )}
          </div>

          <div className="space-y-6 bg-gray-50/70 p-6 rounded-xl border border-gray-200/60">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-lg font-semibold text-gray-700 tracking-tight">
                電子郵件 <span className="text-red-500">*</span>（用於接收回覆）
              </label>
              <div className="flex space-x-3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow block w-full rounded-xl border-gray-200/80 shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:shadow-md focus:border-blue-500 transition-all duration-200 py-3 px-4 placeholder-gray-400/80"
                  placeholder="your@email.com"
                  required
                  disabled={isCodeSent}
                />
                {!isCodeSent && (
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isSending || !email || !validateEmail(email)}
                    className="px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center whitespace-nowrap"
                  >
                    {isSending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />} 發送驗證碼
                  </button>
                )}
              </div>
            </div>

            {isCodeSent && !isVerified && (
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="block text-lg font-semibold text-gray-700 tracking-tight">
                  郵箱驗證碼 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-grow block w-full rounded-xl border-gray-200/80 shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:shadow-md focus:border-blue-500 transition-all duration-200 py-3 px-4 placeholder-gray-400/80"
                    placeholder="請輸入您收到的6位驗證碼"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={!verificationCode}
                    className="px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                  >
                    驗證
                  </button>
                </div>
              </div>
            )}

            {isVerified && (
              <p className="text-green-600 font-medium text-center bg-green-50 p-3 rounded-lg border border-green-200">✓ 電子郵件已驗證成功！</p>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isVerified}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 flex items-center justify-center text-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-6 w-6 mr-3" /> : <Send className="h-6 w-6 mr-3" />} 提交反饋
            </button>
          </div>
        </form>
      </motion.div>
      <UnderDevelopment 
        message="意見回饋功能開發中，後端服務尚未啟用。目前表單提交僅為演示用途。" 
        year="2025"
      />
    </div>
  );
}