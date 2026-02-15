
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Subject, Semester, Unit, Lesson, Question, ExamResult, UserRole 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_SUBJECTS, INITIAL_SEMESTERS, INITIAL_UNITS, INITIAL_LESSONS
} from '../constants';

interface DatabaseContextType {
  users: User[];
  subjects: Subject[];
  semesters: Semester[];
  units: Unit[];
  lessons: Lesson[];
  questions: Question[];
  results: ExamResult[];
  announcement: string;
  dailyChallenge: string;
  dailyChallengeConfig: any;
  lastChallengeDate: string;
  
  addUser: (user: Partial<User>) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateAnnouncement: (text: string) => void;
  updateDailyChallenge: (text: string, config: any, date: string) => void;
  addSubject: (name: string) => void;
  deleteSubject: (id: string) => void;
  renameSubject: (id: string, name: string) => void;
  addSemester: (subjectId: string, name: string) => void;
  deleteSemester: (id: string) => void;
  renameSemester: (id: string, name: string) => void;
  addUnit: (semesterId: string, name: string) => void;
  deleteUnit: (id: string) => void;
  renameUnit: (id: string, name: string) => void;
  addLesson: (unitId: string, name: string) => void;
  deleteLesson: (id: string) => void;
  renameLesson: (id: string, name: string) => void;
  addQuestion: (q: Omit<Question, 'id'>) => void;
  deleteQuestion: (id: string) => void;
  updateQuestion: (q: Question) => void;
  addResult: (res: Omit<ExamResult, 'id'>) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tq_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('tq_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('tq_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('tq_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('tq_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });

  const [announcement, setAnnouncement] = useState<string>(() => {
    return localStorage.getItem('tq_announcement') || 'أهلاً بك في منصة Tawjihi Quiz! نتمنى لك التوفيق في دراستك.';
  });

  const [dailyChallenge, setDailyChallenge] = useState<string>(() => {
    return localStorage.getItem('tq_daily_challenge') || 'تحدي اليوم: قم بحل 15 سؤال من موادك الدراسية في أقل من 20 دقيقة!';
  });

  const [dailyChallengeConfig, setDailyChallengeConfig] = useState<any>(() => {
    const saved = localStorage.getItem('tq_daily_challenge_config');
    return saved ? JSON.parse(saved) : null;
  });

  const [lastChallengeDate, setLastChallengeDate] = useState<string>(() => {
    return localStorage.getItem('tq_last_challenge_date') || '';
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('tq_questions');
    if (saved) return JSON.parse(saved);
    const demoQuestions: Question[] = [];
    INITIAL_LESSONS.slice(0, 10).forEach((lesson, lIdx) => {
      for(let i=1; i<=10; i++) {
        demoQuestions.push({
          id: `q_demo_${lIdx}_${i}`,
          lessonId: lesson.id,
          text: `سؤال تجريبي رقم ${i} عن ${lesson.name}`,
          options: ['خيار أول', 'خيار ثاني صحيح', 'خيار ثالث', 'خيار رابع'],
          correctAnswer: 1
        });
      }
    });
    return demoQuestions;
  });

  const [results, setResults] = useState<ExamResult[]>(() => {
    const saved = localStorage.getItem('tq_results');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tq_users', JSON.stringify(users));
    localStorage.setItem('tq_subjects', JSON.stringify(subjects));
    localStorage.setItem('tq_semesters', JSON.stringify(semesters));
    localStorage.setItem('tq_units', JSON.stringify(units));
    localStorage.setItem('tq_lessons', JSON.stringify(lessons));
    localStorage.setItem('tq_questions', JSON.stringify(questions));
    localStorage.setItem('tq_results', JSON.stringify(results));
    localStorage.setItem('tq_announcement', announcement);
    localStorage.setItem('tq_daily_challenge', dailyChallenge);
    localStorage.setItem('tq_daily_challenge_config', JSON.stringify(dailyChallengeConfig));
    localStorage.setItem('tq_last_challenge_date', lastChallengeDate);
  }, [users, subjects, semesters, units, lessons, questions, results, announcement, dailyChallenge, dailyChallengeConfig, lastChallengeDate]);

  const addUser = (user: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: user.username!,
      email: user.email!,
      role: UserRole.STUDENT,
      passwordHash: user.passwordHash!
    };
    setUsers([...users, newUser]);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
  };

  const updateAnnouncement = (text: string) => {
    setAnnouncement(text);
  };

  const updateDailyChallenge = (text: string, config: any, date: string) => {
    setDailyChallenge(text);
    setDailyChallengeConfig(config);
    setLastChallengeDate(date);
  };

  const addSubject = (name: string) => {
    const id = 's' + Math.random().toString(36).substr(2, 5);
    setSubjects([...subjects, { id, name }]);
    setSemesters([...semesters, 
      { id: `sem1_${id}`, subjectId: id, name: 'الفصل الدراسي الأول' },
      { id: `sem2_${id}`, subjectId: id, name: 'الفصل الدراسي الثاني' }
    ]);
  };

  const deleteSubject = (id: string) => {
    const semsToDelete = semesters.filter(s => s.subjectId === id).map(s => s.id);
    const unitsToDelete = units.filter(u => semsToDelete.includes(u.semesterId)).map(u => u.id);
    const lessonsToDelete = lessons.filter(l => unitsToDelete.includes(l.unitId)).map(l => l.id);
    setSubjects(subjects.filter(s => s.id !== id));
    setSemesters(semesters.filter(s => s.subjectId !== id));
    setUnits(units.filter(u => !semsToDelete.includes(u.semesterId)));
    setLessons(lessons.filter(l => !unitsToDelete.includes(l.unitId)));
    setQuestions(questions.filter(q => !lessonsToDelete.includes(q.lessonId)));
  };

  const renameSubject = (id: string, name: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, name } : s));
  };

  const addSemester = (subjectId: string, name: string) => {
    setSemesters([...semesters, { id: 'sem' + Math.random().toString(36).substr(2, 5), subjectId, name }]);
  };

  const deleteSemester = (id: string) => {
    const unitsToDelete = units.filter(u => u.semesterId === id).map(u => u.id);
    const lessonsToDelete = lessons.filter(l => unitsToDelete.includes(l.unitId)).map(l => l.id);
    setSemesters(semesters.filter(s => s.id !== id));
    setUnits(units.filter(u => u.semesterId !== id));
    setLessons(lessons.filter(l => !unitsToDelete.includes(l.unitId)));
    setQuestions(questions.filter(q => !lessonsToDelete.includes(q.lessonId)));
  };

  const renameSemester = (id: string, name: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, name } : s));
  };

  const addUnit = (semesterId: string, name: string) => {
    setUnits([...units, { id: 'u' + Math.random().toString(36).substr(2, 5), semesterId, name }]);
  };

  const deleteUnit = (id: string) => {
    const lessonsToDelete = lessons.filter(l => l.unitId === id).map(l => l.id);
    setUnits(units.filter(u => u.id !== id));
    setLessons(lessons.filter(l => l.unitId !== id));
    setQuestions(questions.filter(q => !lessonsToDelete.includes(q.lessonId)));
  };

  const renameUnit = (id: string, name: string) => {
    setUnits(units.map(u => u.id === id ? { ...u, name } : u));
  };

  const addLesson = (unitId: string, name: string) => {
    setLessons([...lessons, { id: 'l' + Math.random().toString(36).substr(2, 5), unitId, name }]);
  };

  const deleteLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
    setQuestions(questions.filter(q => q.lessonId !== id));
  };

  const renameLesson = (id: string, name: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, name } : l));
  };

  const addQuestion = (q: Omit<Question, 'id'>) => {
    setQuestions([...questions, { ...q, id: 'q' + Math.random().toString(36).substr(2, 7) }]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (q: Question) => {
    setQuestions(questions.map(curr => curr.id === q.id ? q : curr));
  };

  const addResult = (res: Omit<ExamResult, 'id'>) => {
    setResults([...results, { ...res, id: 'res' + Math.random().toString(36).substr(2, 7) }]);
  };

  return (
    <DatabaseContext.Provider value={{
      users, subjects, semesters, units, lessons, questions, results, announcement, dailyChallenge, dailyChallengeConfig, lastChallengeDate,
      addUser, updateUserRole, updateAnnouncement, updateDailyChallenge,
      addSubject, deleteSubject, renameSubject,
      addSemester, deleteSemester, renameSemester,
      addUnit, deleteUnit, renameUnit,
      addLesson, deleteLesson, renameLesson,
      addQuestion, deleteQuestion, updateQuestion,
      addResult
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within a DatabaseProvider');
  return context;
};
