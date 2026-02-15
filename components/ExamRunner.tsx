
import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../store/DatabaseContext';
import { Question, User } from '../types';

interface Props {
  user: User;
  config: {
    subjectId: string;
    subjectName: string;
    unitId: string;
    unitName: string;
    lessonIds: string[];
    lessonNames: string[];
    questionCount: number;
    duration: number;
  };
  onFinish: () => void;
}

const ExamRunner: React.FC<Props> = ({ user, config, onFinish }) => {
  const { questions, addResult } = useDatabase();
  
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  // Fix: Use any or number for the timer ref to avoid "Cannot find namespace 'NodeJS'" in browser environments
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Randomize and select questions
    const pool = questions.filter(q => config.lessonIds.includes(q.lessonId));
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, config.questionCount));

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Anti-cheating measures
    const preventCopy = (e: any) => e.preventDefault();
    const preventRightClick = (e: any) => e.preventDefault();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        alert('تحذير: مغادرة صفحة الاختبار قد تؤدي إلى إلغائه!');
      }
    };

    window.addEventListener('copy', preventCopy);
    window.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('copy', preventCopy);
      window.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const submitExam = () => {
    if (isFinished) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let finalScore = 0;
    examQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        finalScore++;
      }
    });

    const percentage = (finalScore / examQuestions.length) * 100;
    setScore(finalScore);
    setIsFinished(true);

    addResult({
      userId: user.id,
      subjectName: config.subjectName,
      unitName: config.unitName,
      score: finalScore,
      totalPoints: examQuestions.length,
      percentage,
      date: new Date().toISOString(),
      lessonNames: config.lessonNames
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isFinished) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 no-select">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🏁</div>
          <h2 className="text-3xl font-bold mb-2">انتهى الاختبار!</h2>
          <p className="text-gray-500 mb-8">لقد أتممت الاختبار بنجاح، إليك تفاصيل نتيجتك:</p>
          
          <div className="bg-primary/10 rounded-2xl p-8 mb-8">
            <div className="text-5xl font-black text-primary mb-2">%{((score / examQuestions.length) * 100).toFixed(1)}</div>
            <div className="text-xl font-bold text-gray-700">العلامة: {score} من {examQuestions.length}</div>
          </div>

          <button 
            onClick={onFinish}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 no-select">
      {/* Header Sticky Bar */}
      <header className="sticky top-0 bg-white shadow-sm border-b p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">{config.subjectName} - {config.unitName}</h1>
            <p className="text-xs text-gray-500">{config.lessonNames.join('، ')}</p>
          </div>
          <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-xl ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={submitExam}
            className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 shadow-md"
          >
            إنهاء وتسليم
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-8 space-y-8">
        {examQuestions.length === 0 && <div className="text-center py-20 text-gray-400">جاري تحميل الأسئلة...</div>}
        {examQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex gap-3">
              <span className="text-primary">س{idx + 1}.</span>
              {q.text}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => setAnswers({...answers, [q.id]: optIdx})}
                  className={`p-4 text-right rounded-xl border-2 transition-all flex items-center gap-3 ${
                    answers[q.id] === optIdx 
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-inner' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full border ${answers[q.id] === optIdx ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'}`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/20">
        <p className="text-sm font-bold text-gray-600">تمت الإجابة على {Object.keys(answers).length} من {examQuestions.length}</p>
      </div>
    </div>
  );
};

export default ExamRunner;
