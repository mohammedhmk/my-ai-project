import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar as CalendarIcon, 
  Check,
  CheckSquare
} from 'lucide-react';
import { AppState, Task, Priority, Category, Status } from '../types';
import { PRIORITY_COLORS, CATEGORY_ICONS } from '../constants';

interface TaskManagerProps {
  state: AppState;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ state, addTask, updateTask, deleteTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState<Category>(Category.Other);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      const taskDay = new Date(task.dueDate);
      taskDay.setHours(0,0,0,0);
      
      if (filterDate === 'overdue') {
        matchesDate = taskDay < today && task.status !== 'مكتملة';
      } else if (filterDate === 'today') {
        matchesDate = taskDay.getTime() === today.getTime();
      } else if (filterDate === 'week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        matchesDate = taskDay >= today && taskDay <= nextWeek;
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDate;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title,
      priority,
      status: 'قيد الانتظار',
      category,
      dueDate: dueDate || new Date().toISOString(),
      projectId: projectId || undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setPriority(Priority.Medium);
    setCategory(Category.Other);
    setDueDate('');
    setProjectId('');
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'مكتملة' ? 'قيد الانتظار' : 'مكتملة';
    updateTask({ ...task, status: newStatus as Status });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة المهام</h2>
          <p className="text-gray-500 dark:text-gray-400">نظم وقتك وأنجز مهامك بكفاءة عالية.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} />
          <span>مهمة جديدة</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن مهمة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg py-2.5 pr-10 pl-4 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'قيد الانتظار', label: 'قيد الانتظار' },
              { id: 'مكتملة', label: 'مكتملة' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
           <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500 dark:text-gray-400 mr-1">الأولوية</label>
             <select 
               value={filterPriority}
               onChange={(e) => setFilterPriority(e.target.value)}
               className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
             >
               <option value="all">جميع الأولويات</option>
               {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
             </select>
           </div>
           <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500 dark:text-gray-400 mr-1">المشروع</label>
             <select 
               value={filterProject}
               onChange={(e) => setFilterProject(e.target.value)}
               className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
             >
               <option value="all">جميع المشاريع</option>
               {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
           <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500 dark:text-gray-400 mr-1">التوقيت</label>
             <select 
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
               className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
             >
               <option value="all">كل الأوقات</option>
               <option value="overdue">متأخرة 🚨</option>
               <option value="today">اليوم</option>
               <option value="week">هذا الأسبوع</option>
             </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquareIcon className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد مهام مطابقة للبحث</p>
            <button onClick={() => {
              setFilterStatus('all');
              setFilterPriority('all');
              setFilterProject('all');
              setFilterDate('all');
              setSearchTerm('');
            }} className="mt-2 text-primary-600 hover:underline text-sm">إعادة تعيين الفلاتر</button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const CategoryIcon = CATEGORY_ICONS[task.category] || Filter;
            const project = state.projects.find(p => p.id === task.projectId);

            return (
              <div key={task.id} className="group bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button 
                    onClick={() => toggleTaskStatus(task)}
                    title={task.status === 'مكتملة' ? "إلغاء الإكمال" : "اضغط هنا لإتمام المهمة"}
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                      task.status === 'مكتملة' 
                        ? 'bg-green-500 border-green-500 scale-105' 
                        : 'border-gray-300 dark:border-gray-500 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    {task.status === 'مكتملة' ? (
                      <Check size={16} className="text-white" />
                    ) : (
                      <Check size={16} className="text-primary-500 opacity-0 hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-gray-800 dark:text-gray-200 truncate ${task.status === 'مكتملة' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CategoryIcon size={12} />
                        {task.category}
                      </span>
                      {project && (
                        <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                          {project.name}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 ${
                        new Date(task.dueDate) < new Date() && task.status !== 'مكتملة' ? 'text-red-500 font-medium' : ''
                      }`}>
                        <CalendarIcon size={12} />
                        {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 md:mt-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity self-end md:self-auto">
                   <select
                    value={task.status}
                    onChange={(e) => updateTask({ ...task, status: e.target.value as Status })}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-lg py-1.5 px-2 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="قيد الانتظار">قيد الانتظار</option>
                    <option value="مكتملة">مكتملة</option>
                  </select>
                   <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="حذف المهمة"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">إضافة مهمة جديدة</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان المهمة</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأولوية</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white"
                  >
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white"
                  >
                    {Object.values(Category).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموعد النهائي</label>
                   <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المشروع (اختياري)</label>
                   <select 
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white"
                  >
                    <option value="">بدون مشروع</option>
                    {state.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-colors"
                >
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckSquareIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);