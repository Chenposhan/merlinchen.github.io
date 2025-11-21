import React, { useState, useEffect } from 'react';
import { calculateChart } from './services/ziweiEngine';
import { interpretChart } from './services/geminiService';
import { storageService } from './services/storageService';
import { ChartGrid } from './components/ChartGrid';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { ChartData, User, SavedChart, Gender } from './types';

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>({ username: '訪客', passwordHash: '' });
  
  // Chart State
  const [birthDate, setBirthDate] = useState('1990-06-15');
  const [birthTime, setBirthTime] = useState('14:00');
  const [gender, setGender] = useState<Gender>('M');
  const [chartName, setChartName] = useState('');
  const [currentChartId, setCurrentChartId] = useState<string | null>(null); 
  
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Sidebar & Saved Data
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);

  useEffect(() => {
    if (user) {
      loadSavedCharts();
    }
  }, [user]);

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSavedCharts = async () => {
    if (!user) return;
    const charts = await storageService.getChartsByUser(user.username);
    setSavedCharts(charts);
  };

  const handleGenerate = () => {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    const data = calculateChart(year, month, day, hour, gender);
    setChartData(data);
    setInterpretation(''); 
  };

  const handleAIInterpret = async () => {
    if (!chartData) return;
    setLoadingAI(true);
    const result = await interpretChart(chartData);
    setInterpretation(result);
    setLoadingAI(false);
  };

  const handleSaveChart = async () => {
    if (!user) return;
    const name = prompt("請輸入命盤名稱：", chartName || `${user.username} 的命盤`);
    if (!name) return;

    setChartName(name);

    try {
      if (currentChartId) {
        await storageService.updateChart(currentChartId, {
          name,
          birthDate,
          birthTime,
          gender
        });
        alert('命盤更新成功！');
      } else {
        const newChart = await storageService.saveChart({
          username: user.username,
          name,
          birthDate,
          birthTime,
          gender
        });
        setCurrentChartId(newChart.id);
        alert('命盤儲存成功！');
      }
      loadSavedCharts();
    } catch (e) {
      alert('儲存失敗');
    }
  };

  const handleLoadChart = (saved: SavedChart) => {
    setBirthDate(saved.birthDate);
    setBirthTime(saved.birthTime);
    setGender(saved.gender);
    setChartName(saved.name);
    setCurrentChartId(saved.id);
    
    const [year, month, day] = saved.birthDate.split('-').map(Number);
    const [hour, minute] = saved.birthTime.split(':').map(Number);
    const data = calculateChart(year, month, day, hour, saved.gender);
    setChartData(data);
    setInterpretation('');
    
    setIsSidebarOpen(false);
  };

  const handleDeleteChart = async (id: string) => {
    if (confirm("確定要刪除此命盤嗎？")) {
      await storageService.deleteChart(id);
      if (currentChartId === id) {
        setCurrentChartId(null);
        setChartName('');
      }
      loadSavedCharts();
    }
  };

  const handleNewChart = () => {
    setBirthDate('1990-01-01');
    setBirthTime('12:00');
    setGender('M');
    setChartName('');
    setCurrentChartId(null);
    setInterpretation('');
    // Do not auto generate, let user click
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-gray-800 p-4 md:p-8">
      
      {/* Navbar */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold text-purple-900">歡迎, {user.username}</span>
          <button 
            onClick={() => setUser(null)} 
            className="text-xs text-gray-500 hover:text-purple-700 underline"
          >
            {user.username === '訪客' ? '登入 / 註冊' : '登出'}
          </button>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 bg-white border border-purple-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition text-purple-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          我的命盤
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-calligraphy text-purple-900 mb-2">紫微大師</h1>
          <p className="text-gray-500 font-serif">Professional Zi Wei Dou Shu Charting</p>
          {chartName && <div className="mt-2 text-xl text-purple-800 font-bold font-serif">「{chartName}」</div>}
        </header>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 mb-8">
          <div className="flex flex-wrap gap-4 items-end justify-center">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-purple-800 uppercase tracking-wider">出生日期 (公曆)</label>
              <input 
                type="date" 
                value={birthDate}
                onChange={(e) => { setBirthDate(e.target.value); setCurrentChartId(null); }}
                className="p-2 border border-gray-300 rounded font-serif focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-purple-800 uppercase tracking-wider">出生時間</label>
              <input 
                type="time" 
                value={birthTime}
                onChange={(e) => { setBirthTime(e.target.value); setCurrentChartId(null); }}
                className="p-2 border border-gray-300 rounded font-serif focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
               <label className="text-xs font-bold text-purple-800 uppercase tracking-wider">性別</label>
               <div className="flex bg-gray-100 rounded p-1">
                 <button 
                   onClick={() => { setGender('M'); setCurrentChartId(null); }}
                   className={`px-4 py-1 rounded transition ${gender === 'M' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
                 >
                   男
                 </button>
                 <button 
                   onClick={() => { setGender('F'); setCurrentChartId(null); }}
                   className={`px-4 py-1 rounded transition ${gender === 'F' ? 'bg-white shadow text-pink-600 font-bold' : 'text-gray-500'}`}
                 >
                   女
                 </button>
               </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <button 
                onClick={() => { handleGenerate(); setCurrentChartId(null); setChartName(''); }}
                className="flex-1 bg-purple-900 hover:bg-purple-800 text-white px-6 py-2 rounded font-serif transition shadow-lg whitespace-nowrap"
              >
                排盤
              </button>
              <button 
                onClick={handleSaveChart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-serif transition shadow-lg whitespace-nowrap"
              >
                {currentChartId ? '更新' : '儲存'}
              </button>
            </div>
          </div>
           <div className="text-center mt-4">
              <button onClick={handleNewChart} className="text-xs text-gray-400 underline hover:text-purple-600">重置 / 新命盤</button>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow lg:w-2/3">
            {chartData && <ChartGrid data={chartData} />}
          </div>

          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 h-full">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-purple-100">
                <SparklesIcon />
                <h3 className="text-xl font-bold text-purple-900">AI 命盤解析</h3>
              </div>
              
              {!interpretation && !loadingAI && (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4 font-serif text-sm">
                    點擊下方按鈕，讓 Google Gemini 為您解析命宮、財帛與官祿運勢。
                  </p>
                  <button 
                    onClick={handleAIInterpret}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto w-full"
                  >
                    <SparklesIcon /> 開始分析
                  </button>
                </div>
              )}

              {loadingAI && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-purple-800 font-serif animate-pulse">大師正在思考中...</p>
                </div>
              )}

              {interpretation && (
                <div className="prose prose-purple prose-sm max-w-none font-serif leading-relaxed animate-fade-in">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {interpretation}
                  </div>
                  <button 
                    onClick={() => setInterpretation('')}
                    className="mt-6 text-xs text-gray-400 underline hover:text-purple-600"
                  >
                    清空結果
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        charts={savedCharts}
        onLoadChart={handleLoadChart}
        onDeleteChart={handleDeleteChart}
      />
    </div>
  );
};

export default App;