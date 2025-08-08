'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useDropzone,
  FileRejection,
  DropzoneOptions,
  Accept,
} from 'react-dropzone';
import { trackBusinessEvents } from '@/components/GoogleAnalytics';
import { feedbackTypes } from '@/lib/feedback/options';
import { SITE_CONFIG } from '@/config/site';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function FeedbackForm() {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );

  const searchParams = useSearchParams();
  const router = useRouter();

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

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);
    setFileError(null);

    if (rejectedFiles && rejectedFiles.length > 0) {
      const firstError = rejectedFiles[0].errors[0];
      if (firstError) {
        setFileError(firstError.message || '檔案不符合上傳要求。');
      } else {
        setFileError('檔案不符合上傳要求。');
      }
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const currentFile = acceptedFiles[0];
      setFile(currentFile);
      setPreviewUrl(URL.createObjectURL(currentFile));
    }
  };

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
    } as Accept,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    validator: file => {
      if (file.size > 5 * 1024 * 1024) {
        return {
          code: 'file-too-large',
          message: `檔案大小超過 5MB 上限。`,
        };
      }
      const acceptedMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!acceptedMimeTypes.includes(file.type)) {
        return {
          code: 'file-invalid-type',
          message: `檔案格式不支援，僅接受 PNG, JPG, GIF。`,
        };
      }
      return null;
    },
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone(dropzoneOptions);

  useEffect(() => {
    if (fileRejections && fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0];
      setFileError(firstError.message || '檔案不符合上傳要求。');
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } else if (!fileRejections || fileRejections.length === 0) {
      if (file === null && (!fileRejections || fileRejections.length === 0)) {
        setFileError(null);
      }
    }
  }, [fileRejections, previewUrl, file]);

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
    setSuccessMessage(null);
    setVerificationToken(null);
    if (isCodeSent) {
      setVerificationCode('');
    }

    try {
      // 檢查是否為本地測試環境
      const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true';
      
      // 檢查當前是否在 aitools 域名下（非本地測試時）
      const apiUrl = !isLocalProd && typeof window !== 'undefined' && window.location.host.includes('aitools.leopilot.com')
        ? `${SITE_CONFIG.main.domain}/api/feedback/send-code`
        : '/api/feedback/send-code';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '驗證碼發送失敗，請稍後再試。');
      } else {
        setIsCodeSent(true);
        setSuccessMessage(data.message || `驗證碼已成功發送至 ${email}`);
        setVerificationToken(data.verificationToken);
      }
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setError('驗證碼發送請求失敗，請檢查您的網路連線或稍後再試。');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      !type ||
      !title ||
      !content ||
      !email ||
      !isCodeSent ||
      !verificationCode ||
      !verificationToken
    ) {
      setError(
        '請填寫所有必填欄位，發送並輸入郵箱驗證碼。務必先發送驗證碼。！'
      );
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('email', email);
    formData.append('verificationCode', verificationCode);
    formData.append('verificationToken', verificationToken);
    if (file) {
      formData.append('file', file);
    }

    try {
      // 檢查是否為本地測試環境
      const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true';
      
      // 檢查當前是否在 aitools 域名下（非本地測試時）
      const apiUrl = !isLocalProd && typeof window !== 'undefined' && window.location.host.includes('aitools.leopilot.com')
        ? `${SITE_CONFIG.main.domain}/api/feedback/submit`
        : '/api/feedback/submit';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '提交失敗，請稍後再試。');
      } else {
        // GA 追蹤回饋提交成功
        trackBusinessEvents.feedbackSubmit(type);
        router.push('/feedback/success');
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('提交請求失敗，請檢查您的網路連線或稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-[4rem] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-white/20 bg-white/50 shadow-xl backdrop-blur-lg"
      >
        <div className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 px-8 py-6 backdrop-blur-md">
          <motion.h1
            className="text-3xl font-bold tracking-tighter text-white"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            意見回饋
          </motion.h1>
          <p className="mt-2 font-light text-blue-100/90">
            您的意見對我們很重要，我們會認真處理每一筆回饋。
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-8 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Feedback Type */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold tracking-tight text-gray-700">
              回饋類型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {feedbackTypes.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-200 ${
                    type === item.id
                      ? 'border-blue-500 bg-blue-100/50 ring-2 ring-blue-500/80'
                      : 'border-gray-200/80 bg-white/80 shadow-sm hover:border-blue-400/50 hover:bg-white'
                  }`}
                >
                  <span className="font-semibold text-gray-800">
                    {item.name}
                  </span>
                  <span className="mt-1 text-sm text-gray-600">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-lg font-semibold tracking-tight text-gray-700"
            >
              問題概要 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="block w-full rounded-xl border-gray-200/80 bg-white/95 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
              placeholder="請簡要說明您的問題或建議"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="block text-lg font-semibold tracking-tight text-gray-700"
            >
              詳細說明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="block w-full rounded-xl border-gray-200/80 bg-white/95 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
              placeholder="請詳細描述您的問題、建議或合作內容"
              required
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold tracking-tight text-gray-700">
              附加截圖（選填）
            </label>
            <div
              {...getRootProps()}
              className={`mt-1 flex justify-center rounded-xl border-2 border-dashed bg-white/80 px-6 pb-6 pt-5 transition-colors duration-200 hover:border-blue-400/50 ${
                isDragActive ? 'border-blue-500' : 'border-gray-200/50'
              }`}
            >
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-auto rounded-lg border border-white/20 shadow-sm"
                    />
                  </motion.div>
                ) : (
                  <>
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
                    <div className="flex text-base text-gray-600">
                      <p className="relative cursor-pointer rounded-md bg-transparent font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                        <span>上傳檔案</span>
                        <input {...getInputProps()} />
                      </p>
                      <p className="pl-1">或拖放檔案</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF 最大 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          {/* Email and Verification */}
          <div className="space-y-4 rounded-xl bg-slate-50/80 p-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-lg font-semibold tracking-tight text-gray-700"
              >
                電子郵件 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block flex-1 rounded-xl border-gray-200/80 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
                  placeholder="your@email.com"
                  required
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendVerificationCode}
                  disabled={isSending}
                  className="inline-flex items-center rounded-xl border border-transparent bg-blue-600/90 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="tracking-tight">
                      {isCodeSent ? '重新發送' : '發送驗證碼'}
                    </span>
                  )}
                </motion.button>
              </div>
            </div>

            {isCodeSent && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label
                  htmlFor="verificationCode"
                  className="block text-lg font-semibold tracking-tight text-gray-700"
                >
                  驗證碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  className="block w-full rounded-xl border-gray-200/80 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50 sm:w-48"
                  placeholder="請輸入驗證碼"
                  required
                />
              </motion.div>
            )}
          </div>

          {/* Error and Success Messages */}
          {error && (
            <motion.div
              className="rounded-xl border border-red-100 bg-red-50/90 p-4"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400/90" />
                <p className="ml-3 text-base font-medium tracking-tight text-red-700/90">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-green-200 bg-green-50/90 p-4"
            >
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 shrink-0 text-green-500" />
                <p className="ml-3 text-base font-medium tracking-tight text-green-800/90">
                  {successMessage}
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            className="pt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600/90 to-blue-700/90 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700/90 hover:to-blue-800/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  <span className="tracking-tight">提交中...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  <span className="tracking-tight">提交回饋</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
