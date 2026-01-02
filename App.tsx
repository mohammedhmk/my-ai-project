import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ViewType, Task, Project } from './types';
import { NAV_ITEMS } from './constants';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ProjectList } from './components/ProjectList';
import { Moon, Sun, Menu, X, Bell, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const INITIAL_STATE: AppState = {
  tasks: [],
  projects: [],
  skills: [],
  darkMode: false,
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-fade-in-up min-w-[300px]
            ${toast.type === 'success' ? 'bg-white border-r-4 border-green-500 text-gray-800 dark:bg-dark-card dark:text-white' : ''}
            ${toast.type === 'error' ? 'bg-white border-r-4 border-red-500 text-gray-800 dark:bg-dark-card dark:text-white' : ''}
            ${toast.type === 'info' ? 'bg-white border-r-4 border-blue-500 text-gray-800 dark:bg-dark-card dark:text-white' : ''}
            ${toast.type === 'warning' ? 'bg-white border-r-4 border-yellow-500 text-gray-800 dark:bg-dark-card dark:text-white' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
          {toast.type === 'error' && <Trash2 size={20} className="text-red-500" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
          {toast.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
          <p className="font-medium text-sm">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="mr-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return { 
      ...INITIAL_STATE, 
      darkMode: savedMode === 'true' 
    };
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const qTasks = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setState(prev => ({ ...prev, tasks: tasksData }));
    }, (error) => {
      console.error("Error fetching tasks:", error);
    });

    const qProjects = query(collection(db, 'projects'));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setState(prev => ({ ...prev, projects: projectsData }));
    });

    return () => {
      unsubscribeTasks();
      unsubscribeProjects();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(state.darkMode));
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        createdAt: new Date().toISOString(),
      });
      notify("تمت إضافة المهمة بنجاح", "success");
    } catch (error) {
      console.error(error);
      notify("حدث خطأ أثناء الإضافة", "error");
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const taskRef = doc(db, 'tasks', updatedTask.id);
      await updateDoc(taskRef, { ...updatedTask });
      if (updatedTask.status === 'مكتملة') {
        notify("عظيم! تم إنجاز المهمة", "success");
      }
    } catch (error) {
      console.error(error);
      notify("حدث خطأ أثناء التحديث", "error");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      notify("تم حذف المهمة", "error");
    } catch (error) {
      console.error(error);
      notify("فشل الحذف", "error");
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      await addDoc(collection(db, 'projects'), project);
      notify("تم إنشاء المشروع الجديد", "success");
    } catch (error) {
      console.error(error);
      notify("فشل إنشاء المشروع", "error");
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const projectRef = doc(db, 'projects', updatedProject.id);
      await updateDoc(projectRef, { ...updatedProject });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      notify("تم حذف المشروع", "success");
    } catch (error) {
      console.error(error);
      notify("حدث خطأ أثناء الحذف", "error");
    }
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={state} updateTask={updateTask} />;
      case 'tasks':
        return <TaskManager state={state} addTask={addTask} updateTask={updateTask} deleteTask={deleteTask} />;
      case 'projects':
        return <ProjectList state={state} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject} />;
      case 'pomodoro':
        return <PomodoroTimer />;
      default:
        return <Dashboard state={state} updateTask={updateTask} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex transition-colors duration-300 font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white dark:bg-dark-card border-l border-gray-100 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:block
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h1 className="text-2xl font-black text-primary-600 dark:text-primary-500 tracking-tight">إنجاز</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as ViewType);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-50 dark:border-gray-800">
             <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
               <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                 ME
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-gray-800 dark:text-white truncate">أحمد الفريلانسر</p>
                 <p className="text-xs text-gray-500 truncate">الخطة الاحترافية</p>
               </div>
             </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white md:hidden">
                {NAV_ITEMS.find(i => i.id === currentView)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors">
                 <Bell size={20} />
                 {state.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'مكتملة').length > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-card"></span>
                 )}
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                title={state.darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
              >
                {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;