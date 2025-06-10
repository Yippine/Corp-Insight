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

const feedbackTypes = [
  {
    id: 'data_correction',
    name: '資料勘誤',
    description: '回報資料錯誤或不準確的情況',
  },
  {
    id: 'business_cooperation',
    name: '業務合作',
    description: '討論商業合作機會',
  },
  { id: 'bug_report', name: '系統問題', description: '回報系統錯誤或異常' },
  {
    id: 'feature_request',
    name: '功能建議',
    description: '提供新功能或改進建議',
  },
  { id: 'other', name: '其他', description: '其他意見或建議' },
];

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
      const response = await fetch('/api/feedback/send-code', {
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
      const response = await fetch('/api/feedback/submit', {
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
  
  // JSX for the form component...
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-center text-4xl font-bold tracking-tight text-gray-900">
            聯絡我們
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            您的意見是我們進步的動力，期待您的回饋！
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Feedback Type */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              回饋類型
            </label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {feedbackTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`flex flex-col items-center rounded-lg border p-4 text-center transition-all duration-200 ${
                    type === item.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              主旨
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="請簡要說明您的問題或建議"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              內容
            </label>
            <textarea
              id="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="請詳細描述您的問題、建議或合作內容"
              required
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              附件 (選填)
            </label>
            <div
              {...getRootProps()}
              className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } p-4 text-center transition-colors duration-200`}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full rounded-md object-contain"
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {isDragActive
                    ? '將檔案拖放到此處...'
                    : '將檔案拖放到此處，或點擊選擇檔案 (最多 5MB)'}
                </p>
              )}
            </div>
            {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
          </div>

          {/* Email and Verification */}
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                電子郵件 (用於接收確認信與回覆)
              </label>
              <div className="flex">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="your.email@example.com"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSending}
                  className="relative inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{isCodeSent ? '重新發送' : '發送驗證碼'}</span>
                </button>
              </div>
            </div>
            
            {isCodeSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label
                  htmlFor="verificationCode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  驗證碼
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="請輸入您收到的 6 位數驗證碼"
                  required
                />
              </motion.div>
            )}
          </div>
          
          {/* Error and Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center text-sm text-red-600"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </motion.div>
          )}
          {successMessage && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center text-sm text-green-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {successMessage}
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? '正在提交...' : '提交回饋'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}