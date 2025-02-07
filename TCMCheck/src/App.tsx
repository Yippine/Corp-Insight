import React from 'react';
import QuestionnaireForm from './components/QuestionnaireForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white py-6 mb-8">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-2xl font-bold">中醫體質評估系統</h1>
          <p className="mt-2 text-green-100">根據您的症狀評估體質類型，獲取個人化調理建議</p>
        </div>
      </header>
      <main>
        <QuestionnaireForm />
      </main>
      <footer className="mt-12 py-6 text-center text-gray-600">
        <p>註：本評估僅供參考，具體診斷請諮詢專業中醫師</p>
      </footer>
    </div>
  );
}

export default App;