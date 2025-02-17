import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader2 } from 'lucide-react';

const feedbackTypes = [
  { id: 'data-correction', name: '資料勘誤', description: '回報資料錯誤或不準確的情況' },
  { id: 'business-cooperation', name: '業務合作', description: '討論商業合作機會' },
  { id: 'bug-report', name: '系統問題', description: '回報系統錯誤或異常' },
  { id: 'feature-request', name: '功能建議', description: '提供新功能或改進建議' },
  { id: 'other', name: '其他', description: '其他意見或建議' }
];

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

  useEffect(() => {
    // 從 URL 參數獲取反饋類型
    const params = new URLSearchParams(window.location.search);
    const typeFromUrl = params.get('type');
    if (typeFromUrl) {
      setType(typeFromUrl);
    }
  }, []);

  useEffect(() => {
    // 清理預覽 URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件大小（5MB 限制）
      if (file.size > 5 * 1024 * 1024) {
        setError('檔案大小不能超過 5MB');
        return;
      }
      
      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        setError('只能上傳圖片檔案');
        return;
      }

      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!email) {
      setError('請輸入電子郵件地址');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // 這裡應該調用後端 API 發送驗證碼
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬 API 調用
      setIsCodeSent(true);
    } catch (err) {
      setError('驗證碼發送失敗，請稍後再試');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('請輸入驗證碼');
      return;
    }

    setError(null);

    try {
      // 這裡應該調用後端 API 驗證驗證碼
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 API 調用
      setIsVerified(true);
    } catch (err) {
      setError('驗證碼錯誤，請重新輸入');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !title || !content || !email || !isVerified) {
      setError('請填寫所有必填欄位並完成郵箱驗證');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 這裡應該調用後端 API 提交反饋
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模擬 API 調用
      
      // 成功後重置表單
      setType('');
      setTitle('');
      setContent('');
      setEmail('');
      setVerificationCode('');
      setIsCodeSent(false);
      setIsVerified(false);
      setFile(null);
      setPreviewUrl(null);
      
      // 顯示成功消息
      alert('感謝您的反饋！我們會盡快處理。');
    } catch (err) {
      setError('提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-3xl font-bold text-white">
            意見回饋
          </h1>
          <p className="mt-2 text-blue-100">
            您的意見對我們很重要，我們會認真處理每一筆回饋。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 反饋類型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              反饋類型 <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">請選擇反饋類型</option>
              {feedbackTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* 問題概要 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              問題概要 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="請簡短描述您的問題"
            />
          </div>

          {/* 詳細說明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              詳細說明 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="請詳細描述您遇到的問題或建議"
            />
          </div>

          {/* 附件上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              附加截圖（選填）
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
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
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>上傳檔案</span>
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
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF 最大 5MB
                </p>
              </div>
            </div>
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-32 w-auto rounded-lg"
                />
              </div>
            )}
          </div>

          {/* 電子郵件和驗證 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電子郵件 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="your@email.com"
                  disabled={isCodeSent}
                />
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={!email || isCodeSent || isSending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    '發送驗證碼'
                  )}
                </button>
              </div>
            </div>

            {isCodeSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  驗證碼 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="block w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="000000"
                    disabled={isVerified}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={!verificationCode || isVerified}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    驗證
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 錯誤提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 提交按鈕 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isVerified || isSubmitting}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  提交反饋
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}