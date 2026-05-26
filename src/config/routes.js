import Dashboard from '../components/Dashboard';
import SleepRecords from '../components/SleepRecords';
import DiaperRecords from '../components/DiaperRecords';
import CryRecords from '../components/CryRecords';
import FeedingRecords from '../components/FeedingRecords';
import GrowthRecords from '../components/GrowthRecords';
import GrowthChart from '../components/GrowthChart';
import ReminderCenter from '../components/ReminderCenter';
import LabReportParser from '../components/LabReportParser';
import SymptomChecker from '../components/SymptomChecker';
import ChatHistory from '../components/ChatHistory';
import Chat from '../components/Chat';
import UploadComponent from '../components/Upload';
import RecordManagement from '../components/RecordManagement';

export const routes = [
  { path: '/', element: <Dashboard />, key: 'dashboard' },
  { path: '/upload', element: <UploadComponent />, key: 'upload' },
  { path: '/chat', element: <Chat />, key: 'chat' },
  { path: '/records', element: <RecordManagement />, key: 'records' },
  { path: '/sleep', element: <SleepRecords />, key: 'sleep' },
  { path: '/diaper', element: <DiaperRecords />, key: 'diaper' },
  { path: '/cry', element: <CryRecords />, key: 'cry' },
  { path: '/feeding', element: <FeedingRecords />, key: 'feeding' },
  { path: '/growth', element: <GrowthRecords />, key: 'growth' },
  { path: '/growth-chart', element: <GrowthChart />, key: 'growth-chart' },
  { path: '/reminder', element: <ReminderCenter />, key: 'reminder' },
  { path: '/lab-report', element: <LabReportParser />, key: 'lab-report' },
  { path: '/symptom', element: <SymptomChecker />, key: 'symptom' },
  { path: '/chat-history', element: <ChatHistory />, key: 'chat-history' },
];

export const routeKeys = {
  dashboard: '/',
  upload: '/upload',
  chat: '/chat',
  records: '/records',
  sleep: '/sleep',
  diaper: '/diaper',
  cry: '/cry',
  feeding: '/feeding',
  growth: '/growth',
  growthChart: '/growth-chart',
  reminder: '/reminder',
  labReport: '/lab-report',
  symptom: '/symptom',
  chatHistory: '/chat-history',
};
