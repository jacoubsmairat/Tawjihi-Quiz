
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import StudentView from './dashboard/StudentView';
import AdminView from './dashboard/AdminView';
import SuperAdminView from './dashboard/SuperAdminView';
import Leaderboard from './dashboard/Leaderboard';
import DailyChallenge from './dashboard/DailyChallenge';
import { useDatabase } from '../store/DatabaseContext';

interface Props {
  user: User;
  onLogout: () => void;
  onStartExam: (config: any) => void;
}

const Dashboard: React.FC<Props> = ({ user, onLogout, onStartExam }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { announcement, updateAnnouncement } = useDatabase();
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [tempAnnouncement, setTempAnnouncement] = useState(announcement);

  const getSidebarItems = () => {
    const common = [
      { id: 'home', label: 'الرئيسية', icon: '🏠' },
      { id: 'leaderboard', label: 'لائحة الشرف', icon: '🏆' },
    ];
    
    if (user.role === UserRole.STUDENT) {
      return [...common, 
        { id: 'exam-setup', label: 'بدء اختبار', icon: '📝' },
        { id: 'results', label: 'نتائجي', icon: '📊' }
      ];
    }
    
    if (user.role === UserRole.ADMIN) {
      return [...common,
        { id: 'questions', label: 'إدارة الأسئلة', icon: '❓' },
        { id: 'all-results', label: 'نتائج الطلاب', icon: '👥' }
      ];
    }
    
    if (user.role === UserRole.SUPER_ADMIN) {
      return [...common,
        { id: 'materials', label: 'إدارة المواد', icon: '📚' },
        { id: 'questions', label: 'إدارة الأسئلة', icon: '❓' },
        { id: 'users', label: 'إدارة المستخدمين', icon: '🛡️' },
        { id: 'all-results', label: 'النتائج والتحليلات', icon: '📊' }
      ];
    }
    return common;
  };

  const handleSaveAnnouncement = () => {
    updateAnnouncement(tempAnnouncement);
    setIsEditingAnnouncement(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-100 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-50 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-sm border border-gray-100 mb-3 flex items-center justify-center overflow-hidden">
            <img 
              src="image.png" 
              className="w-full h-full object-contain" 
              alt="Logo" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3413/3413535.png';
              }}
            />
          </div>
          <h2 className="font-bold text-lg text-primary">Tawjihi Quiz</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full mt-1">{user.role}</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {getSidebarItems().map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-right flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={onLogout}
            className="w-full text-right flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <span>🚪</span>
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background p-8">
        <header className="flex justify-between items-center mb-8 md:hidden">
          <div className="flex items-center gap-3">
            <img src="image.png" className="w-10 h-10 rounded-lg shadow-sm object-contain" alt="Logo" />
            <h2 className="text-2xl font-bold text-primary">Tawjihi Quiz</h2>
          </div>
          <button onClick={onLogout} className="text-red-500 font-bold">خروج</button>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Announcement Box */}
            <div className="lg:col-span-2 bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📢</span>
                  <h3 className="font-bold text-amber-800">إعلان هام للمنصة</h3>
                </div>
                {user.role === UserRole.SUPER_ADMIN && (
                  <button 
                    onClick={() => {
                      if (isEditingAnnouncement) {
                        handleSaveAnnouncement();
                      } else {
                        setIsEditingAnnouncement(true);
                        setTempAnnouncement(announcement);
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isEditingAnnouncement 
                      ? 'bg-amber-600 text-white hover:bg-amber-700' 
                      : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {isEditingAnnouncement ? '✅ حفظ' : '✏️ تعديل'}
                  </button>
                )}
              </div>
              
              <div className="mt-2">
                {isEditingAnnouncement ? (
                  <textarea 
                    className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 min-h-[80px]"
                    value={tempAnnouncement}
                    onChange={(e) => setTempAnnouncement(e.target.value)}
                    placeholder="اكتب الإعلان هنا..."
                  />
                ) : (
                  <p className="text-amber-900 leading-relaxed text-sm whitespace-pre-wrap">{announcement}</p>
                )}
              </div>
            </div>

            {/* Daily Challenge Box - Updated to receive onStartExam */}
            <DailyChallenge onStartExam={onStartExam} />
          </div>

          {activeTab === 'home' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold mb-4">مرحباً، {user.username}! 👋</h1>
              <p className="text-gray-500 leading-relaxed">أهلاً بك في لوحة التحكم الخاصة بـ Tawjihi Quiz. استعد للنجاح من خلال ممارسة الاختبارات اليومية.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="text-3xl mb-2">🎓</div>
                  <h3 className="font-bold text-blue-800">تعلم بذكاء</h3>
                  <p className="text-sm text-blue-600">اختبر مهاراتك بأسئلة مختارة بعناية.</p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="font-bold text-green-800">تتبع تقدمك</h3>
                  <p className="text-sm text-green-600">رسوم بيانية توضح تحسن مستواك الدراسي.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-bold text-purple-800">حقق هدفك</h3>
                  <p className="text-sm text-purple-600">نحن هنا لندعمك للوصول للعلامة الكاملة.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && <Leaderboard />}

          {activeTab === 'exam-setup' && user.role === UserRole.STUDENT && <StudentView mode="setup" onStartExam={onStartExam} userId={user.id} />}
          {activeTab === 'results' && user.role === UserRole.STUDENT && <StudentView mode="results" userId={user.id} />}
          
          {(activeTab === 'questions' || activeTab === 'all-results') && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) && (
            <AdminView tab={activeTab} />
          )}

          {(activeTab === 'materials' || activeTab === 'users') && user.role === UserRole.SUPER_ADMIN && (
            <SuperAdminView tab={activeTab} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
