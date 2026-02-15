
import { Subject, Semester, Unit, Lesson, UserRole, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'superadmin',
    email: 'super@tawjihi.com',
    role: UserRole.SUPER_ADMIN,
    passwordHash: 'super123'
  },
  {
    id: 'u2',
    username: 'admin',
    email: 'admin@tawjihi.com',
    role: UserRole.ADMIN,
    passwordHash: 'admin123'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 's1', name: 'المادة الأولى' },
  { id: 's2', name: 'المادة الثانية' }
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem1_s1', subjectId: 's1', name: 'الفصل الدراسي الأول' },
  { id: 'sem2_s1', subjectId: 's1', name: 'الفصل الدراسي الثاني' },
  { id: 'sem1_s2', subjectId: 's2', name: 'الفصل الدراسي الأول' },
  { id: 'sem2_s2', subjectId: 's2', name: 'الفصل الدراسي الثاني' }
];

const generateUnitsAndLessons = () => {
  const units: Unit[] = [];
  const lessons: Lesson[] = [];

  // 1. Subject 1
  // Semester 1
  const subj1U1 = { id: 'u1_s1', semesterId: 'sem1_s1', name: 'الوحدة الأولى: البيئة الطبيعية' };
  const subj1U2 = { id: 'u2_s1', semesterId: 'sem1_s1', name: 'الوحدة الثانية: الموارد الاقتصادية' };
  const subj1U3 = { id: 'u3_s1', semesterId: 'sem1_s1', name: 'الوحدة الثالثة: السكان' };
  // Semester 2
  const subj1U4 = { id: 'u4_s1', semesterId: 'sem2_s1', name: 'الوحدة الرابعة: المدن والحياة' };
  const subj1U5 = { id: 'u5_s1', semesterId: 'sem2_s1', name: 'الوحدة الخامسة: المشكلات البيئية' };
  const subj1U6 = { id: 'u6_s1', semesterId: 'sem2_s1', name: 'الوحدة السادسة: التقنيات الحديثة' };
  
  units.push(subj1U1, subj1U2, subj1U3, subj1U4, subj1U5, subj1U6);

  [subj1U1, subj1U2].forEach(u => {
    for(let i=1; i<=6; i++) lessons.push({ id: `l_${u.id}_${i}`, unitId: u.id, name: `الدرس ${i}` });
  });
  [subj1U3, subj1U4, subj1U5, subj1U6].forEach(u => {
    for(let i=1; i<=5; i++) lessons.push({ id: `l_${u.id}_${i}`, unitId: u.id, name: `الدرس ${i}` });
  });

  // 2. Subject 2
  // Semester 1
  const subj2U1 = { id: 'u1_s2', semesterId: 'sem1_s2', name: 'الوحدة الأولى: الاستقلال' };
  const subj2U2 = { id: 'u2_s2', semesterId: 'sem1_s2', name: 'الوحدة الثانية: الإنجازات السياسية' };
  const subj2U3 = { id: 'u3_s2', semesterId: 'sem1_s2', name: 'الوحدة الثالثة: السلطات الدستورية' };
  // Semester 2
  const subj2U4 = { id: 'u4_s2', semesterId: 'sem2_s2', name: 'الوحدة الرابعة: الحياة السياسية' };
  const subj2U5 = { id: 'u5_s2', semesterId: 'sem2_s2', name: 'الوحدة الخامسة: القوات المسلحة' };
  const subj2U6 = { id: 'u6_s2', semesterId: 'sem2_s2', name: 'الوحدة السادسة: النهضة التعليمية' };

  units.push(subj2U1, subj2U2, subj2U3, subj2U4, subj2U5, subj2U6);

  [subj2U1, subj2U2, subj2U3, subj2U4, subj2U5, subj2U6].forEach(u => {
    for(let i=1; i<=5; i++) lessons.push({ id: `l_${u.id}_${i}`, unitId: u.id, name: `الدرس ${i}` });
  });

  return { units, lessons };
};

const data = generateUnitsAndLessons();
export const INITIAL_UNITS = data.units;
export const INITIAL_LESSONS = data.lessons;
