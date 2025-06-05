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

export default function FeedbackPage() {
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

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          <div className="space-y-2">
            <label
              htmlFor="feedbackType"
              className="block text-lg font-semibold tracking-tight text-gray-700"
            >
              反饋類型 <span className="text-red-500">*</span>
            </label>
            <select
              id="feedbackType"
              value={type}
              onChange={e => setType(e.target.value)}
              className="block w-full rounded-xl border-gray-200/80 bg-white/95 px-4 py-3 text-gray-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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
            <label
              htmlFor="title"
              className="block text-lg font-semibold tracking-tight text-gray-700"
            >
              問題概要 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="block w-full rounded-xl border-gray-200/80 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
              placeholder="請簡短描述您的問題"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="content"
              className="block text-lg font-semibold tracking-tight text-gray-700"
            >
              詳細說明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              className="block w-full rounded-xl border-gray-200/80 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
              placeholder="請詳細描述您遇到的問題或建議"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="file-upload"
              className="block text-lg font-semibold tracking-tight text-gray-700"
            >
              附加截圖（選填，限 5MB 內圖片）
            </label>
            <div
              {...getRootProps()}
              className={`mt-1 flex flex-col items-center justify-center border-2 px-6 pb-6 pt-5 ${isDragActive ? 'border-blue-500' : 'border-gray-200/50'} cursor-pointer rounded-xl border-dashed bg-white/80 transition-colors duration-200 hover:border-blue-400/50`}
            >
              <input {...getInputProps()} />

              {previewUrl && file ? (
                <div className="group relative flex w-full flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto mb-2 h-32 w-auto rounded-lg object-contain"
                  />
                  <p className="max-w-[calc(100%-2rem)] truncate text-sm text-gray-500">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setFileError(null);
                    }}
                    className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1 text-xs text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    移除
                  </button>
                </div>
              ) : isDragActive ? (
                <p className="font-semibold text-blue-600">
                  將檔案拖放到此處...
                </p>
              ) : (
                <div className="space-y-1 text-center">
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
                  <div className="flex text-sm text-gray-600">
                    <p className="relative cursor-pointer rounded-md bg-transparent font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                      <span>上傳檔案</span>
                    </p>
                    <p className="pl-1">或拖放檔案</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG、JPG、GIF 最大 5MB
                  </p>
                </div>
              )}
            </div>
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          <div className="space-y-6 rounded-xl border border-gray-200/60 bg-gray-50/70 p-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-lg font-semibold tracking-tight text-gray-700"
              >
                電子郵件 <span className="text-red-500">*</span>（用於接收回覆）
              </label>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-3">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full flex-grow rounded-xl border-gray-200/80 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
                    placeholder="your@email.com"
                    required
                    disabled={isCodeSent}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isSending || !email || !validateEmail(email)}
                    className={`flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-3 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 ${isCodeSent ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'}`}
                  >
                    {isSending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : isCodeSent ? (
                      <Send className="mr-2 h-5 w-5" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {isSending
                      ? isCodeSent
                        ? '重新發送中...'
                        : '發送中...'
                      : isCodeSent
                        ? '重新發送驗證碼'
                        : '發送驗證碼'}
                  </button>
                </div>
                {isCodeSent && successMessage && (
                  <div className="flex items-center rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-600">
                    <CheckCircle2 className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {isCodeSent && (
              <div className="space-y-2">
                <label
                  htmlFor="verificationCode"
                  className="block text-lg font-semibold tracking-tight text-gray-700"
                >
                  郵箱驗證碼 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={e => {
                      setVerificationCode(e.target.value);
                      setError(null);
                    }}
                    className="block w-full flex-grow rounded-xl border-gray-200/80 px-4 py-3 placeholder-gray-400/80 shadow-sm transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/50"
                    placeholder="請輸入您收到的6位驗證碼"
                    required
                    disabled={!isCodeSent || isSending}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !type ||
                !title ||
                !content ||
                !email ||
                !isCodeSent ||
                !verificationCode ||
                !verificationToken
              }
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-300/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              ) : (
                <Send className="mr-3 h-6 w-6" />
              )}{' '}
              提交反饋
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
