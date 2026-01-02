import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, X, Sparkles, Check, ChevronLeft } from 'lucide-react';
import { AppState, Status, Task } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  state: AppState;
  updateTask: (task: Task) => void;
}

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ state, updateTask }) => {
  const [showOverdueAlert, setShowOverdueAlert] = useState(true);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const tasks = state.tasks;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === Status.Completed).length;
  const pendingTasks = tasks.filter(t => t.status === Status.Pending || t.status === Status.InProgress).length;
  const urgentTasks = tasks.filter(t => t.priority === 'عاجلة' && t.status !== Status.Completed).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    return t.status !== Status.Completed && dueDate < today;
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Data for Charts
  const tasksByCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(tasksByCategory).map(([name, value]) => ({ name, value }));

  const generateAiInsights = async () => {
    if (!process.env.API_KEY) {
      alert("API Key missing");
      return;
    }
    
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Prepare task summary for AI
      const taskSummary = state.tasks
        .filter(t => t.status !== Status.Completed)
        .map(t => `- ${t.title} (${t.priority}, Due: ${t.dueDate})`)
        .join('\n');

      const prompt = `
        بصفتك مساعد إنتاجية ذكي لفريلانسر، قم بتحليل المهام التالية وأعطني 3 نصائح قصيرة، محفزة، وقابلة للتنفيذ فوراً لمساعدتي على الإنجاز اليوم.
        اجعل النصائح مباشرة وباللغة العربية.
        
        المهام الحالية:
        ${taskSummary}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        // Simple parsing to split by newlines or bullets if formatted
        const tips = text.split('\n').filter(line => line.trim().length > 5).slice(0, 3);
        setAiTips(tips);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      setAiTips(["حدث خطأ أثناء تحليل البيانات. حاول مرة أخرى لاحقاً."]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === Status.Completed ? Status.Pending : Status.Completed;
    updateTask({ ...task, status: newStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">أهلاً بك، يا مبدع 👋</h2>
          <p className="text-gray-500 dark:text-gray-400">إليك نظرة عامة على إنتاجيتك اليوم.</p>
        </div>
        <div className="text-left hidden md:block">
          <span className="text-sm font-bold bg-primary-100 text-primary-700 px-3 py-1 rounded-full dark:bg-primary-900 dark:text-primary-200">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Overdue Notification */}
      {showOverdueAlert && overdueTasks.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-200">تنبيه: لديك {overdueTasks.length} مهام متأخرة!</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">يرجى مراجعة المهام المتأخرة والعمل عليها لتجنب تراكم العمل.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowOverdueAlert(false)}
            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="المهام المكتملة" 
          value={completedTasks} 
          icon={CheckCircle2} 
          color="bg-green-500" 
          subtitle={`${completionRate}% من إجمالي المهام`}
        />
        <StatCard 
          title="قيد التنفيذ" 
          value={pendingTasks} 
          icon={Clock} 
          color="bg-blue-500"
          subtitle="مهام تتطلب اهتمامك"
        />
        <StatCard 
          title="مهام عاجلة" 
          value={urgentTasks} 
          icon={AlertCircle} 
          color="bg-red-500"
          subtitle="تحتاج إلى تدخل فوري"
        />
        <StatCard 
          title="المشاريع النشطة" 
          value={state.projects.filter(p => p.status === 'active').length} 
          icon={TrendingUp} 
          color="bg-purple-500"
          subtitle="مشاريع قيد العمل"
        />
      </div>

      {/* Charts Section & Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">توزيع المهام حسب الفئة</h3>
            <div className="h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">المحلل الذكي</h3>
              </div>
              <button 
                onClick={generateAiInsights}
                disabled={isThinking}
                className="text-xs bg-white dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 px-3 py-1.5 rounded-full font-bold border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors flex items-center gap-1"
              >
                {isThinking ? 'جاري التحليل...' : '✨ تحليل إنتاجيتي'}
              </button>
            </div>
            
            {aiTips.length > 0 ? (
              <ul className="space-y-3">
                {aiTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">اضغط على الزر للحصول على نصائح ذكية لتحسين أدائك اليوم بناءً على مهامك الحالية.</p>
            )}
          </div>
        </div>

        {/* Completion Rate & Quick Tasks */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">معدل الإنجاز</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'مكتملة', value: completedTasks },
                      { name: 'متبقية', value: totalTasks - completedTasks }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-[-140px] mb-[60px]">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">{completionRate}%</span>
              <p className="text-sm text-gray-500">تم الإنجاز</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">مهام اليوم</h3>
                <span className="text-xs text-gray-500">{state.tasks.filter(t => t.status !== Status.Completed).length} متبقية</span>
             </div>
             <div className="space-y-3">
               {state.tasks.slice(0, 4).map(task => (
                 <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                   <div className="flex items-center gap-3 overflow-hidden">
                     <button 
                        onClick={() => toggleTaskStatus(task)}
                        title={task.status === Status.Completed ? "تحديد كغير مكتملة" : "تحديد كمكتملة"}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          task.status === Status.Completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 dark:border-gray-500 hover:border-primary-500'
                        }`}
                      >
                        {task.status === Status.Completed && <Check size={12} className="text-white" />}
                      </button>
                      <span className={`truncate text-sm ${task.status === Status.Completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        {task.title}
                      </span>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap ${
                     task.status === Status.Completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>{task.status}</span>
                 </div>
               ))}
               {state.tasks.length === 0 && (
                 <p className="text-center text-sm text-gray-400 py-4">لا توجد مهام حالياً</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};