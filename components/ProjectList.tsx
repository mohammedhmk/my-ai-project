import React, { useState } from 'react';
import { Briefcase, User, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react';
import { AppState, Project } from '../types';

interface ProjectListProps {
  state: AppState;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ state, addProject, updateProject, deleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      name,
      clientName,
      status: 'active',
      budget: Number(budget),
      deadline
    });
    setIsModalOpen(false);
    setName('');
    setClientName('');
    setBudget('');
    setDeadline('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">المشاريع</h2>
          <p className="text-gray-500 dark:text-gray-400">إدارة مشاريعك وعملائك في مكان واحد.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} />
          <span>مشروع جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.projects.length === 0 ? (
           <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
             <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 dark:text-gray-400">لا توجد مشاريع حالياً. ابدأ بإضافة مشروعك الأول!</p>
           </div>
        ) : (
          state.projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Briefcase size={24} />
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                project.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {project.status === 'active' ? 'نشط' : project.status === 'completed' ? 'مكتمل' : 'معلق'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 truncate" title={project.name}>{project.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-6">
              <User size={14} />
              {project.clientName}
            </div>

            <div className="mt-auto space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <DollarSign size={14} /> الميزانية
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{project.budget ? `$${project.budget}` : '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar size={14} /> الموعد
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString('ar-EG') : '-'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <select
                    value={project.status}
                    onChange={(e) => updateProject({ ...project, status: e.target.value as any })}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="on-hold">معلق</option>
                </select>
                <button 
                    onClick={() => deleteProject(project.id)}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 rounded-lg transition-all"
                    title="حذف المشروع نهائياً"
                >
                    <Trash2 size={20} />
                </button>
            </div>
          </div>
        )))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">مشروع جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المشروع</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العميل</label>
                <input 
                  type="text" 
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الميزانية ($)</label>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموعد النهائي</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 outline-none dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-colors"
                >
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};