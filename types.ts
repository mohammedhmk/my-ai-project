export enum Priority {
  Low = 'منخفضة',
  Medium = 'متوسطة',
  High = 'عالية',
  Urgent = 'عاجلة'
}

export enum Status {
  Pending = 'قيد الانتظار',
  InProgress = 'قيد التنفيذ',
  Completed = 'مكتملة',
  Late = 'متأخرة'
}

export enum Category {
  AccountManagement = 'إدارة حسابات',
  ContentCreation = 'نشر محتوى',
  VideoEditing = 'مونتاج فيديو',
  Photography = 'تصوير',
  AdsManagement = 'إدارة إعلانات',
  Design = 'تصميم جرافيك',
  SelfLearning = 'تعلم ذاتي',
  Other = 'أخرى'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  category: Category;
  dueDate: string; // ISO string
  projectId?: string;
  createdAt: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: 'active' | 'completed' | 'on-hold';
  budget?: number;
  deadline?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  progress: number; // 0-100
  resources: string[];
}

export interface AppState {
  tasks: Task[];
  projects: Project[];
  skills: Skill[];
  darkMode: boolean;
}

export type ViewType = 'dashboard' | 'tasks' | 'projects' | 'pomodoro' | 'analytics';