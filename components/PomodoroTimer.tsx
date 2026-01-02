import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BrainCircuit } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            if (mode === 'work') {
              alert('انتهى وقت العمل! خذ استراحة قصيرة.');
              setMode('break');
              setMinutes(5);
            } else {
              alert('انتهت الاستراحة! حان وقت العودة للعمل.');
              setMode('work');
              setMinutes(25);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(25);
    setSeconds(0);
  };

  const setWorkMode = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(25);
    setSeconds(0);
  };

  const setBreakMode = () => {
    setIsActive(false);
    setMode('break');
    setMinutes(5);
    setSeconds(0);
  };

  const progress = mode === 'work' 
    ? ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100 
    : ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
        
        {/* Progress Background */}
        <div 
          className="absolute bottom-0 left-0 h-1.5 bg-primary-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />

        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={setWorkMode}
            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              mode === 'work' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 ring-2 ring-primary-500' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BrainCircuit size={18} />
            تركيز
          </button>
          <button 
            onClick={setBreakMode}
            className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              mode === 'break' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 ring-2 ring-blue-500' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Coffee size={18} />
            استراحة
          </button>
        </div>

        <div className="mb-10 relative">
          <div className="text-8xl font-black text-gray-800 dark:text-white tabular-nums tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-gray-500 mt-2 font-medium">
            {isActive ? (mode === 'work' ? '🔥 حافظ على تركيزك' : '☕ استمتع بقهوتك') : 'اضغط للبدء'}
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <button 
            onClick={toggleTimer}
            className="w-16 h-16 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <RotateCcw size={28} />
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm max-w-sm">
        <p>تقنية البومودورو تساعدك على تقسيم العمل إلى فترات زمنية (25 دقيقة) مفصولة باستراحات قصيرة لزيادة الإنتاجية.</p>
      </div>
    </div>
  );
};