
import React, { useState } from 'react';
import { useDatabase } from '../../store/DatabaseContext';
import { UserRole } from '../../types';

interface Props {
  tab: string;
}

const SuperAdminView: React.FC<Props> = ({ tab }) => {
  const { 
    subjects, semesters, units, lessons, users, updateUserRole,
    addSubject, deleteSubject, renameSubject,
    addSemester, deleteSemester, renameSemester,
    addUnit, deleteUnit, renameUnit,
    addLesson, deleteLesson, renameLesson
  } = useDatabase();

  const [activeSubj, setActiveSubj] = useState('');
  const [activeSem, setActiveSem] = useState('');
  const [activeUnit, setActiveUnit] = useState('');
  
  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  if (tab === 'users') {
    const filteredUsers = users.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
                           u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    const stats = {
      total: users.length,
      students: users.filter(u => u.role === UserRole.STUDENT).length,
      admins: users.filter(u => u.role === UserRole.ADMIN).length,
      superAdmins: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">إجمالي المستخدمين</p>
            <p className="text-2xl font-black text-primary">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">الطلاب</p>
            <p className="text-2xl font-black text-gray-700">{stats.students}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">المشرفين</p>
            <p className="text-2xl font-black text-blue-600">{stats.admins}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">المدراء</p>
            <p className="text-2xl font-black text-purple-600">{stats.superAdmins}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b space-y-4">
            <h2 className="text-xl font-bold">إدارة المستخدمين والأدوار</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <input 
                  type="text"
                  placeholder="ابحث باسم المستخدم أو البريد الإلكتروني..."
                  className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['all', UserRole.STUDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      roleFilter === role 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {role === 'all' ? 'الكل' : role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-gray-600 text-sm font-bold">المستخدم</th>
                  <th className="p-4 text-gray-600 text-sm font-bold">البريد الإلكتروني</th>
                  <th className="p-4 text-gray-600 text-sm font-bold">الدور الحالي</th>
                  <th className="p-4 text-gray-600 text-sm font-bold">تغيير الصلاحيات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800">{u.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide ${
                        u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-700' :
                        u.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={u.role}
                        onChange={(e) => {
                          if (confirm(`هل أنت متأكد من تغيير دور المستخدم ${u.username} إلى ${e.target.value}؟`)) {
                            updateUserRole(u.id, e.target.value as UserRole);
                          }
                        }}
                        className="p-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value={UserRole.STUDENT}>طالب (Student)</option>
                        <option value={UserRole.ADMIN}>مشرف (Admin)</option>
                        <option value={UserRole.SUPER_ADMIN}>مدير نظام (Super Admin)</option>
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400">
                      <div className="text-3xl mb-2">👤</div>
                      <p>لم يتم العثور على مستخدمين يطابقون بحثك</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const filteredSemesters = semesters.filter(s => s.subjectId === activeSubj);
  const filteredUnits = units.filter(u => u.semesterId === activeSem);
  const filteredLessons = lessons.filter(l => l.unitId === activeUnit);

  const handleDeleteSubject = (id: string) => {
    if (confirm('⚠️ تحذير: حذف المادة سيؤدي لحذف الفصول والوحدات والدروس والأسئلة التابعة لها نهائياً!')) {
      deleteSubject(id);
      if (activeSubj === id) {
        setActiveSubj('');
        setActiveSem('');
        setActiveUnit('');
      }
    }
  };

  const handleDeleteSemester = (id: string) => {
    if (confirm('⚠️ حذف الفصل سيحذف كافة الوحدات والدروس التابعة له. هل أنت متأكد؟')) {
      deleteSemester(id);
      if (activeSem === id) {
        setActiveSem('');
        setActiveUnit('');
      }
    }
  };

  const handleDeleteUnit = (id: string) => {
    if (confirm('⚠️ حذف الوحدة سيحذف جميع دروسها وأسئلتها. هل أنت متأكد؟')) {
      deleteUnit(id);
      if (activeUnit === id) {
        setActiveUnit('');
      }
    }
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الدرس وأسئلته؟')) {
      deleteLesson(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">إدارة هيكلية المواد التعليمية</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Subjects */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/30">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-700">المواد</h3>
              <button 
                onClick={() => { const n = prompt('اسم المادة الجديدة؟'); if(n) addSubject(n); }} 
                className="text-[10px] bg-primary text-white px-2 py-1 rounded-md shadow-sm"
              >+ إضافة</button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
              {subjects.map(s => (
                <div key={s.id} className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${activeSubj === s.id ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-white border border-transparent hover:border-gray-200'}`}>
                  <span onClick={() => { setActiveSubj(s.id); setActiveSem(''); setActiveUnit(''); }} className="flex-1 font-semibold truncate text-xs">{s.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
                    <button onClick={() => { const n = prompt('تغيير اسم المادة؟', s.name); if(n) renameSubject(s.id, n); }} className="p-1 hover:bg-gray-100 rounded">✏️</button>
                    <button onClick={() => handleDeleteSubject(s.id)} className="p-1 hover:bg-red-50 rounded">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semesters */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/30">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-700">الفصول</h3>
              <button 
                disabled={!activeSubj}
                onClick={() => { const n = prompt('اسم الفصل الدراسي؟'); if(n) addSemester(activeSubj, n); }} 
                className="text-[10px] bg-primary text-white px-2 py-1 rounded-md shadow-sm disabled:bg-gray-300"
              >+ إضافة</button>
            </div>
            <div className="space-y-2">
              {filteredSemesters.map(s => (
                <div key={s.id} className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${activeSem === s.id ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-white border border-transparent hover:border-gray-200'}`}>
                  <span onClick={() => { setActiveSem(s.id); setActiveUnit(''); }} className="flex-1 font-semibold truncate text-xs">{s.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { const n = prompt('تغيير اسم الفصل؟', s.name); if(n) renameSemester(s.id, n); }} className="p-1 hover:bg-gray-100 rounded">✏️</button>
                    <button onClick={() => handleDeleteSemester(s.id)} className="p-1 hover:bg-red-50 rounded">🗑️</button>
                  </div>
                </div>
              ))}
              {!activeSubj && <p className="text-[10px] text-gray-400 text-center py-4">اختر مادة أولاً</p>}
            </div>
          </div>

          {/* Units */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/30">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-700">الوحدات</h3>
              <button 
                disabled={!activeSem}
                onClick={() => { const n = prompt('اسم الوحدة الجديدة؟'); if(n) addUnit(activeSem, n); }} 
                className="text-[10px] bg-primary text-white px-2 py-1 rounded-md shadow-sm disabled:bg-gray-300"
              >+ إضافة</button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
              {filteredUnits.map(u => (
                <div key={u.id} className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${activeUnit === u.id ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-white border border-transparent hover:border-gray-200'}`}>
                  <span onClick={() => setActiveUnit(u.id)} className="flex-1 font-semibold truncate text-xs">{u.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { const n = prompt('تغيير اسم الوحدة؟', u.name); if(n) renameUnit(u.id, n); }} className="p-1 hover:bg-gray-100 rounded">✏️</button>
                    <button onClick={() => handleDeleteUnit(u.id)} className="p-1 hover:bg-red-50 rounded">🗑️</button>
                  </div>
                </div>
              ))}
              {!activeSem && <p className="text-[10px] text-gray-400 text-center py-4">اختر فصلاً أولاً</p>}
            </div>
          </div>

          {/* Lessons */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/30">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-700">الدروس</h3>
              <button 
                disabled={!activeUnit}
                onClick={() => { const n = prompt('اسم الدرس الجديد؟'); if(n) addLesson(activeUnit, n); }} 
                className="text-[10px] bg-primary text-white px-2 py-1 rounded-md shadow-sm disabled:bg-gray-300"
              >+ إضافة</button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
              {filteredLessons.map(l => (
                <div key={l.id} className="p-2 bg-white border border-transparent hover:border-gray-200 rounded-lg flex justify-between items-center transition-all">
                  <span className="flex-1 font-medium truncate text-[11px]">{l.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { const n = prompt('تغيير اسم الدرس؟', l.name); if(n) renameLesson(l.id, n); }} className="p-1 hover:bg-gray-100 rounded text-[10px]">✏️</button>
                    <button onClick={() => handleDeleteLesson(l.id)} className="p-1 hover:bg-red-50 rounded text-[10px]">🗑️</button>
                  </div>
                </div>
              ))}
              {!activeUnit && <p className="text-[10px] text-gray-400 text-center py-4">اختر وحدة أولاً</p>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-700">
        💡 <strong>نصيحة:</strong> يمكنك تعديل أي مسمى من خلال الضغط على أيقونة القلم (✏️) أو الحذف من خلال أيقونة السلة (🗑️). تذكر أن الحذف سيؤدي لمسح كافة البيانات المتفرعة (مثلاً حذف الوحدة يحذف دروسها وأسئلتها).
      </div>
    </div>
  );
};

export default SuperAdminView;
