import { Category, Priority, Status } from './types';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  Timer, 
  BarChart2, 
  Settings,
  Palette,
  Video,
  Camera,
  Megaphone,
  BookOpen,
  MonitorPlay,
  Layers
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'tasks', label: 'المهام', icon: CheckSquare },
  { id: 'projects', label: 'المشاريع', icon: Briefcase },
  { id: 'pomodoro', label: 'بومودورو', icon: Timer },
  { id: 'analytics', label: 'التقارير', icon: BarChart2 },
];

export const CATEGORY_ICONS: Record<Category, any> = {
  [Category.AccountManagement]: Layers,
  [Category.ContentCreation]: Megaphone,
  [Category.VideoEditing]: Video,
  [Category.Photography]: Camera,
  [Category.AdsManagement]: MonitorPlay,
  [Category.Design]: Palette,
  [Category.SelfLearning]: BookOpen,
  [Category.Other]: Settings,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.Low]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [Priority.Medium]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [Priority.High]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [Priority.Urgent]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const STATUS_COLORS: Record<Status, string> = {
  [Status.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [Status.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [Status.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [Status.Late]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};