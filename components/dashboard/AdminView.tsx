
import React, { useState } from 'react';
import { useDatabase } from '../../store/DatabaseContext';
import { Question } from '../../types';
// Fix: Import Type from @google/genai instead of local types
import { GoogleGenAI, Type } from '@google/genai';

interface Props {
  tab: string;
}

const AdminView: React.FC<Props> = ({ tab }) => {
  const { subjects, semesters, units, lessons, questions, addQuestion, deleteQuestion, updateQuestion, results, users } = useDatabase();
  
  const [qSubject, setQSubject] = useState('');
  const [qSemester, setQSemester] = useState('');
  const [qUnit, setQUnit] = useState('');
  const [qLesson, setQLesson] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQ, setNewQ] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const filteredQuestions = questions.filter(q => {
    if (qLesson) return q.lessonId === qLesson;
    if (qUnit) {
      const unitLessons = lessons.filter(l => l.unitId === qUnit).map(l => l.id);
      return unitLessons.includes(q.lessonId);
    }
    return true;
  });

  const handleSave = () => {
    if (!qLesson || !newQ.text || newQ.options.some(o => !o)) {
      alert('الرجاء اختيار الدرس وتعبئة كافة حقول السؤال');
      return;
    }
    
    if (editingId) {
      updateQuestion({ ...newQ, id: editingId, lessonId: qLesson });
    } else {
      addQuestion({ ...newQ, lessonId: qLesson });
    }
    setIsAdding(false);
    setEditingId(null);
    setNewQ({ text: '', options: ['', '', '', ''], correctAnswer: 0 });
  };

  const handleAiGenerate = async () => {
    if (!qLesson) {
      alert('يرجى اختيار درس أولاً لتوليد الأسئلة له');
      return;
    }
    setIsGenerating(true);
    try {
      // Fix: Always create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lessonName = lessons.find(l => l.id === qLesson)?.name;
      const unitName = units.find(u => u.id === qUnit)?.name;
      const subjName = subjects.find(s => s.id === qSubject)?.name;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 multiple choice questions in Arabic for a Tawjihi level exam. 
        Subject: ${subjName}, Unit: ${unitName}, Lesson: ${lessonName}.
        Each question must have exactly 4 options and one correct answer index (0-3).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER }
              },
              required: ["text", "options", "correctAnswer"]
            }
          }
        }
      });

      const generated = JSON.parse(response.text || '[]');
      generated.forEach((g: any) => {
        addQuestion({ ...g, lessonId: qLesson });
      });
      alert('تم توليد الأسئلة بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء توليد الأسئلة بالذكاء الاصطناعي');
    } finally {
      setIsGenerating(false);
    }
  };

  if (tab === 'all-results') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">سجل علامات الطلاب</h2>
          <div className="text-sm text-gray-400">عدد النتائج الكلي: {results.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-gray-600">الطالب</th>
                <th className="p-4 text-gray-600">المادة</th>
                <th className="p-4 text-gray-600">العلامة</th>
                <th className="p-4 text-gray-600">النسبة</th>
                <th className="p-4 text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد نتائج مسجلة حتى الآن</td></tr>
              ) : results.map(res => {
                const student = users.find(u => u.id === res.userId);
                return (
                  <tr key={res.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{student?.username}</td>
                    <td className="p-4">{res.subjectName}</td>
                    <td className="p-4 font-mono">{res.score}/{res.totalPoints}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${res.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {res.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{new Date(res.date).toLocaleString('ar-JO')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة بنك الأسئلة</h2>
            <p className="text-sm text-gray-500">إجمالي الأسئلة في النظام: {questions.length}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleAiGenerate}
              disabled={isGenerating || !qLesson}
              className="bg-secondary text-textPrimary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'جاري التوليد...' : '✨ توليد بالذكاء الاصطناعي'}
            </button>
            <button 
              onClick={() => { setEditingId(null); setIsAdding(true); }}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md"
            >
              + سؤال يدوي
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <select value={qSubject} onChange={e => {setQSubject(e.target.value); setQSemester(''); setQUnit(''); setQLesson('');}} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
            <option value="">كل المواد</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={qSemester} onChange={e => {setQSemester(e.target.value); setQUnit(''); setQLesson('');}} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
            <option value="">كل الفصول</option>
            {semesters.filter(s => s.subjectId === qSubject).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={qUnit} onChange={e => {setQUnit(e.target.value); setQLesson('');}} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
            <option value="">كل الوحدات</option>
            {units.filter(u => u.semesterId === qSemester).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={qLesson} onChange={e => setQLesson(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
            <option value="">كل الدروس</option>
            {lessons.filter(l => l.unitId === qUnit).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredQuestions.map((q, idx) => (
            <div key={q.id} className="p-6 border rounded-2xl bg-white hover:border-primary/30 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"># {idx + 1}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{lessons.find(l => l.id === q.lessonId)?.name}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4">{q.text}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-3 rounded-xl border text-sm flex items-center justify-between ${q.correctAnswer === oIdx ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <span>{opt}</span>
                        {q.correctAnswer === oIdx && <span className="text-lg">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingId(q.id); setNewQ(q); setQLesson(q.lessonId); setIsAdding(true); }}
                    className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    title="تعديل"
                  >✏️</button>
                  <button 
                    onClick={() => { if(confirm('هل أنت متأكد من الحذف؟')) deleteQuestion(q.id); }}
                    className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    title="حذف"
                  >🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-400">لا يوجد أسئلة لهذا الدرس حالياً.</p>
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-8 text-primary border-r-4 border-primary pr-4">
              {editingId ? 'تعديل السؤال الحالي' : 'إضافة سؤال يدوي جديد'}
            </h3>
            <div className="space-y-6">
              {!editingId && (
                <div className="p-4 bg-yellow-50 rounded-xl text-xs text-yellow-700">
                  سيتم إضافة هذا السؤال إلى: <span className="font-bold">
                    {subjects.find(s => s.id === qSubject)?.name || '?'} / 
                    {units.find(u => u.id === qUnit)?.name || '?'} / 
                    {lessons.find(l => l.id === qLesson)?.name || 'يرجى اختيار درس'}
                  </span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">نص السؤال التعليمي</label>
                <textarea 
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="اكتب السؤال هنا..."
                  value={newQ.text}
                  onChange={e => setNewQ({...newQ, text: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newQ.options.map((opt, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500">الخيار {idx + 1}</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder={`محتوى الخيار ${idx + 1}`}
                        className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={opt}
                        onChange={e => {
                          const opts = [...newQ.options];
                          opts[idx] = e.target.value;
                          setNewQ({...newQ, options: opts});
                        }}
                      />
                      <label className="cursor-pointer group relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="correct" 
                          checked={newQ.correctAnswer === idx}
                          onChange={() => setNewQ({...newQ, correctAnswer: idx})}
                          className="w-6 h-6 accent-green-500"
                        />
                        <span className="absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">الإجابة الصحيحة</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                >حفظ البيانات</button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >إلغاء التعديلات</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
