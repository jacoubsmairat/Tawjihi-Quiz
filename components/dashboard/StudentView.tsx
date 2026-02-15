
import React, { useState } from 'react';
import { useDatabase } from '../../store/DatabaseContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface Props {
  mode: 'setup' | 'results';
  userId: string;
  onStartExam?: (config: any) => void;
}

const StudentView: React.FC<Props> = ({ mode, userId, onStartExam }) => {
  const { subjects, semesters, units, lessons, questions, results } = useDatabase();
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);

  const filteredSemesters = semesters.filter(s => s.subjectId === selectedSubject);
  const filteredUnits = units.filter(u => u.semesterId === selectedSemester);
  const filteredLessons = lessons.filter(l => l.unitId === selectedUnit);
  const myResults = results.filter(r => r.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleToggleLesson = (id: string) => {
    if (selectedLessons.includes(id)) {
      setSelectedLessons(selectedLessons.filter(l => l !== id));
    } else {
      setSelectedLessons([...selectedLessons, id]);
    }
  };

  if (mode === 'results') {
    const chartData = myResults.slice(0, 5).reverse().map(r => ({
      name: r.date.split('T')[0],
      score: r.percentage
    }));

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">نتائجي وسجل الاختبارات</h2>
        
        {myResults.length > 0 ? (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
              <h3 className="text-lg font-bold mb-4">أداء الاختبارات الأخيرة (%)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4A90E2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">المادة</th>
                    <th className="p-4">الوحدة</th>
                    <th className="p-4">الدرجة</th>
                    <th className="p-4">النسبة</th>
                    <th className="p-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {myResults.map(res => (
                    <tr key={res.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-semibold">{res.subjectName}</td>
                      <td className="p-4 text-gray-500">{res.unitName}</td>
                      <td className="p-4">{res.score} / {res.totalPoints}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${res.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {res.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{new Date(res.date).toLocaleDateString('ar-JO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">لا يوجد نتائج لعرضها بعد. ابدأ أول اختبار لك!</p>
          </div>
        )}
      </div>
    );
  }

  const canStart = selectedSubject && selectedSemester && selectedUnit && selectedLessons.length > 0;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">تجهيز الاختبار</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اختر المادة</label>
            <select 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              value={selectedSubject}
              onChange={e => { setSelectedSubject(e.target.value); setSelectedSemester(''); setSelectedUnit(''); setSelectedLessons([]); }}
            >
              <option value="">-- اختر مادة --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الفصل الدراسي</label>
            <select 
              disabled={!selectedSubject}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              value={selectedSemester}
              onChange={e => { setSelectedSemester(e.target.value); setSelectedUnit(''); setSelectedLessons([]); }}
            >
              <option value="">-- اختر الفصل --</option>
              {filteredSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الوحدة</label>
            <select 
              disabled={!selectedSemester}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              value={selectedUnit}
              onChange={e => { setSelectedUnit(e.target.value); setSelectedLessons([]); }}
            >
              <option value="">-- اختر الوحدة --</option>
              {filteredUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عدد الأسئلة</label>
              <select 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
              >
                {[20, 30, 50, 75, 100].map(c => <option key={c} value={c}>{c} سؤال</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">مدة الاختبار</label>
              <select 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
              >
                {[10, 15, 30, 45, 60, 75, 90, 120].map(d => <option key={d} value={d}>{d} دقيقة</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">اختر الدروس (من نفس الوحدة)</label>
          <div className="border rounded-xl p-4 h-[300px] overflow-y-auto space-y-2">
            {!selectedUnit && <p className="text-gray-400 text-sm text-center mt-10">اختر الوحدة أولاً لعرض الدروس</p>}
            {filteredLessons.map(l => (
              <label key={l.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedLessons.includes(l.id)}
                  onChange={() => handleToggleLesson(l.id)}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-semibold">{l.name}</span>
              </label>
            ))}
          </div>
          
          <button
            disabled={!canStart}
            onClick={() => onStartExam!({
              subjectId: selectedSubject,
              subjectName: subjects.find(s => s.id === selectedSubject)?.name,
              semesterId: selectedSemester,
              unitId: selectedUnit,
              unitName: units.find(u => u.id === selectedUnit)?.name,
              lessonIds: selectedLessons,
              lessonNames: lessons.filter(l => selectedLessons.includes(l.id)).map(l => l.name),
              questionCount,
              duration
            })}
            className="w-full mt-6 bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-gray-300 disabled:shadow-none"
          >
            ابدأ الاختبار الآن 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
