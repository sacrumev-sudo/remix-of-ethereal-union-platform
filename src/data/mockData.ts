// Mock Data for Эстетика чувственной близости Platform

export type UserRole = 'admin' | 'assistant' | 'student' | 'developer';

export interface User {
  id: string;
  email: string;
  password: string; // Mock - in real app would be hashed
  name: string;
  role: UserRole;
  dob: string; // DD.MM.YYYY
  telegramUsername?: string;
  createdAt: string;
  lastLoginAt: string;
  notificationsEnabled: boolean;
  questionnaire?: Record<string, string>; // Private data for admin only
}

// ============ NEW OUTLINE STRUCTURE (Book-like) ============

export type OutlineNodeType = 'section' | 'subsection' | 'lesson';

export interface OutlineNodeBase {
  id: string;
  type: OutlineNodeType;
  title: string;
  order: number;
}

export interface OutlineSectionNode extends OutlineNodeBase {
  type: 'section' | 'subsection';
  children: OutlineNode[];
  collapsed?: boolean;
}

export interface OutlineLessonNode extends OutlineNodeBase {
  type: 'lesson';
  lessonId: string; // reference to Lesson entity
}

export type OutlineNode = OutlineSectionNode | OutlineLessonNode;

export interface Attachment {
  id: string;
  title: string;
  url: string;
}

export interface PracticeBlock {
  enabled: boolean;
  title: string;
  description?: string;
  required?: boolean;
  type?: 'open' | 'checkboxes';
  checkboxItems?: string[];
}

export type LessonBlockType = 'richtext' | 'video' | 'image' | 'audio' | 'divider' | 'callout';

export interface LessonBlock {
  id: string;
  type: LessonBlockType;
  order: number;
  content: any; // depends on type
}

export interface LessonTask {
  id: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  
  accessStart?: string;
  deadlineAt?: string;
  
  stopLessonMode: 'none' | 'auto' | 'manual';
  stopReason?: string;
  
  blocks: LessonBlock[];
  attachments?: Attachment[];
  practice?: PracticeBlock;
  tasks?: LessonTask[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  status: 'published' | 'hidden';
  coverImage?: string;
  createdAt: string;
  outline: OutlineNode[];
  attachments?: Attachment[];
  
  // Legacy fields for migration
  hasModules?: boolean;
  modules?: LegacyModule[];
  lessons?: LegacyLesson[];
}

// Legacy types for migration
export interface LegacyModule {
  id: string;
  title: string;
  order: number;
  lessons: LegacyLesson[];
}

export interface LegacyLesson {
  id: string;
  title: string;
  type: 'regular' | 'test';
  blocks: { id: string; type: string; content: string; order: number }[];
  published: boolean;
  accessStart?: string;
  accessEnd?: string;
  hasHomework: boolean;
  stopLessonMode: 'auto' | 'manual' | 'hybrid' | 'none';
  kinescopeId?: string;
  order: number;
}

export interface AccessGrant {
  id: string;
  userId: string;
  programId: string;
  startDate?: string;
  endDate?: string;
  reason: string;
  grantedBy: string;
  createdAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  programId: string;
  videoWatched: boolean;
  acknowledged: boolean;
  homeworkSubmitted: boolean;
  homeworkApproved: boolean;
  percent: number;
}

export interface Submission {
  id: string;
  userId: string;
  programId: string;
  lessonId: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  status: 'submitted' | 'approved' | 'rejected';
  adminReply?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  createdAt: string;
  status: 'open' | 'closed';
  adminReply?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  text: string;
  date: string;
  imageUrl?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'pdf' | 'video' | 'audio';
  contentUrl: string;
  accessRule: 'freeForAll' | 'paidOnly' | 'programOnly';
  programIds?: string[];
  category: 'free' | 'students';
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  datetime: string;
  type: 'webinar' | 'practice' | 'meeting';
}

export interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'audio' | 'text';
  contentUrl?: string;
}

export interface AdminNote {
  id: string;
  userId: string;
  type: 'public' | 'private';
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Payment {
  id: string;
  userId: string;
  programId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'installment';
  installmentRemaining?: number;
}

// ============ SEED DATA ============

export const seedUsers: User[] = [
  {
    id: 'admin-1',
    email: 'ekaterina@estetika.ru',
    password: 'admin123',
    name: 'Екатерина Вольпер',
    role: 'admin',
    dob: '15.03.1985',
    telegramUsername: 'ekaterina_volper',
    createdAt: '2024-01-01',
    lastLoginAt: '2025-01-17',
    notificationsEnabled: true,
  },
  {
    id: 'assistant-1',
    email: 'assistant@estetika.ru',
    password: 'assistant123',
    name: 'Анна Помощник',
    role: 'assistant',
    dob: '22.07.1990',
    telegramUsername: 'anna_helper',
    createdAt: '2024-03-15',
    lastLoginAt: '2025-01-17',
    notificationsEnabled: true,
  },
  {
    id: 'student-1',
    email: 'elena@mail.ru',
    password: 'student123',
    name: 'Елена Иванова',
    role: 'student',
    dob: '05.09.1992',
    telegramUsername: 'elena_ivanova',
    createdAt: '2024-06-10',
    lastLoginAt: '2025-01-16',
    notificationsEnabled: true,
    questionnaire: {
      goals: 'Развитие женственности и уверенности',
      experience: 'Новичок',
      expectations: 'Научиться понимать себя',
    },
  },
  {
    id: 'student-2',
    email: 'maria@gmail.com',
    password: 'student123',
    name: 'Мария Петрова',
    role: 'student',
    dob: '12.11.1988',
    telegramUsername: 'maria_petrova',
    createdAt: '2024-08-20',
    lastLoginAt: '2025-01-15',
    notificationsEnabled: false,
    questionnaire: {
      goals: 'Улучшить отношения',
      experience: 'Средний уровень',
      expectations: 'Практические инструменты',
    },
  },
  {
    id: 'student-3',
    email: 'svetlana@yandex.ru',
    password: 'student123',
    name: 'Светлана Козлова',
    role: 'student',
    dob: '28.02.1995',
    telegramUsername: 'sveta_kozlova',
    createdAt: '2024-12-01',
    lastLoginAt: '2025-01-10',
    notificationsEnabled: true,
  },
  {
    id: 'student-4',
    email: 'olga@inbox.ru',
    password: 'student123',
    name: 'Ольга Смирнова',
    role: 'student',
    dob: '18.06.1991',
    createdAt: '2024-11-15',
    lastLoginAt: '2024-12-28',
    notificationsEnabled: true,
  },
];

// Lesson entities (separate from outline)
export const seedLessons: Lesson[] = [
  {
    id: 'lesson-1-1-1',
    title: 'Что такое женственность сегодня',
    description: 'Введение в понимание современной женственности',
    published: true,
    stopLessonMode: 'auto',
    blocks: [
      { id: 'b1', type: 'video', order: 1, content: { kinescopeId: 'kinescope-id-1' } },
      { id: 'b2', type: 'richtext', order: 2, content: '<h2>Добро пожаловать!</h2><p>В этом уроке мы погрузимся в понимание современной женственности...</p>' },
    ],
    practice: {
      enabled: true,
      title: 'Практика',
      description: 'Напишите эссе о том, что для вас значит женственность (минимум 300 слов)',
      required: true,
    },
  },
  {
    id: 'lesson-1-1-2',
    title: 'Архетипы женщины',
    description: 'Изучаем 7 основных архетипов',
    published: true,
    stopLessonMode: 'none',
    blocks: [
      { id: 'b4', type: 'video', order: 1, content: { kinescopeId: 'kinescope-id-2' } },
      { id: 'b5', type: 'richtext', order: 2, content: '<p>Изучаем 7 основных архетипов женщины...</p>' },
    ],
  },
  {
    id: 'lesson-1-2-1',
    title: 'Работа с телом',
    description: 'Практики для раскрытия телесной чувственности',
    published: true,
    stopLessonMode: 'manual',
    blocks: [
      { id: 'b6', type: 'video', order: 1, content: { kinescopeId: 'kinescope-id-3' } },
      { id: 'b7', type: 'richtext', order: 2, content: '<p>Практики для раскрытия телесной чувственности...</p>' },
    ],
    practice: {
      enabled: true,
      title: 'Закрепление',
      description: 'Выполните практику и опишите свои ощущения',
      required: true,
    },
  },
  {
    id: 'lesson-2-1',
    title: 'День 1: Пробуждение',
    description: 'Сегодня начинается ваша трансформация',
    published: true,
    stopLessonMode: 'auto',
    accessStart: '2025-01-01',
    blocks: [
      { id: 'b9', type: 'richtext', order: 1, content: '<h2>День первый</h2><p>Сегодня начинается ваша трансформация...</p>' },
      { id: 'b10', type: 'audio', order: 2, content: { url: 'meditation-audio-1.mp3', title: 'Утренняя медитация' } },
    ],
    practice: {
      enabled: true,
      title: 'Практика дня',
      description: 'Записать 3 инсайта дня',
      required: false,
    },
  },
  {
    id: 'lesson-2-2',
    title: 'День 2: Принятие',
    description: 'Практика принятия себя',
    published: true,
    stopLessonMode: 'auto',
    blocks: [
      { id: 'b12', type: 'richtext', order: 1, content: '<h2>День второй</h2><p>Практика принятия себя...</p>' },
    ],
    practice: {
      enabled: true,
      title: 'Практика',
      description: 'Написать письмо себе',
      required: true,
    },
  },
  {
    id: 'lesson-2-3',
    title: 'День 3: Открытость',
    description: 'Открываемся миру',
    published: true,
    stopLessonMode: 'none',
    blocks: [
      { id: 'b14', type: 'richtext', order: 1, content: '<h2>День третий</h2><p>Открываемся миру...</p>' },
    ],
  },
  {
    id: 'lesson-3-1-1',
    title: 'Введение в практики',
    description: 'Начинаем путь',
    published: true,
    stopLessonMode: 'none',
    blocks: [
      { id: 'b15', type: 'video', order: 1, content: { kinescopeId: 'kinescope-id-5' } },
      { id: 'b16', type: 'richtext', order: 2, content: '<p>Начинаем путь...</p>' },
    ],
  },
];

// Programs with new outline structure
export const seedPrograms: Program[] = [
  {
    id: 'program-1',
    title: 'Искусство женственности',
    description: 'Глубокое погружение в искусство быть женщиной. 12 модулей трансформации.',
    status: 'published',
    createdAt: '2024-01-15',
    outline: [
      {
        id: 'section-1',
        type: 'section',
        title: 'Введение в женственность',
        order: 1,
        children: [
          { id: 'node-1-1', type: 'lesson', title: 'Что такое женственность сегодня', order: 1, lessonId: 'lesson-1-1-1' },
          { id: 'node-1-2', type: 'lesson', title: 'Архетипы женщины', order: 2, lessonId: 'lesson-1-1-2' },
        ],
      },
      {
        id: 'section-2',
        type: 'section',
        title: 'Энергия и тело',
        order: 2,
        children: [
          {
            id: 'subsection-2-1',
            type: 'subsection',
            title: 'Телесные практики',
            order: 1,
            children: [
              { id: 'node-2-1-1', type: 'lesson', title: 'Работа с телом', order: 1, lessonId: 'lesson-1-2-1' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'program-2',
    title: '7-дневный интенсив',
    description: 'Быстрый старт в мир чувственности. Ежедневные практики и инсайты.',
    status: 'published',
    createdAt: '2024-03-01',
    outline: [
      { id: 'node-p2-1', type: 'lesson', title: 'День 1: Пробуждение', order: 1, lessonId: 'lesson-2-1' },
      { id: 'node-p2-2', type: 'lesson', title: 'День 2: Принятие', order: 2, lessonId: 'lesson-2-2' },
      { id: 'node-p2-3', type: 'lesson', title: 'День 3: Открытость', order: 3, lessonId: 'lesson-2-3' },
    ],
  },
  {
    id: 'program-3',
    title: 'Практики близости',
    description: 'Углубленный курс для тех, кто готов к трансформации отношений.',
    status: 'published',
    createdAt: '2024-06-01',
    outline: [
      {
        id: 'section-p3-1',
        type: 'section',
        title: 'Основы близости',
        order: 1,
        children: [
          { id: 'node-p3-1-1', type: 'lesson', title: 'Введение в практики', order: 1, lessonId: 'lesson-3-1-1' },
        ],
      },
    ],
  },
];

export const seedAccessGrants: AccessGrant[] = [
  { id: 'access-1', userId: 'student-1', programId: 'program-1', reason: 'Покупка курса', grantedBy: 'system', createdAt: '2024-06-15' },
  { id: 'access-2', userId: 'student-1', programId: 'program-2', reason: 'Бонус к основному курсу', grantedBy: 'admin-1', createdAt: '2024-06-15' },
  { id: 'access-3', userId: 'student-2', programId: 'program-2', reason: 'Покупка интенсива', grantedBy: 'system', createdAt: '2024-08-25' },
  { id: 'access-4', userId: 'student-3', programId: 'program-1', reason: 'Покупка курса', grantedBy: 'system', createdAt: '2024-12-05' },
];

export const seedProgress: Progress[] = [
  { id: 'progress-1', userId: 'student-1', lessonId: 'lesson-1-1-1', programId: 'program-1', videoWatched: true, acknowledged: true, homeworkSubmitted: true, homeworkApproved: true, percent: 100 },
  { id: 'progress-2', userId: 'student-1', lessonId: 'lesson-1-1-2', programId: 'program-1', videoWatched: true, acknowledged: true, homeworkSubmitted: false, homeworkApproved: false, percent: 100 },
  { id: 'progress-3', userId: 'student-1', lessonId: 'lesson-2-1', programId: 'program-2', videoWatched: false, acknowledged: true, homeworkSubmitted: true, homeworkApproved: false, percent: 90 },
];

export const seedSubmissions: Submission[] = [
  { id: 'submission-1', userId: 'student-1', programId: 'program-1', lessonId: 'lesson-1-1-1', content: 'Для меня женственность — это прежде всего внутреннее ощущение гармонии и принятия себя...', createdAt: '2024-07-01', status: 'approved', adminReply: 'Прекрасная работа! Вы глубоко раскрыли тему.' },
  { id: 'submission-2', userId: 'student-1', programId: 'program-2', lessonId: 'lesson-2-1', content: '1. Осознала важность утренних практик\n2. Почувствовала связь с телом\n3. Поняла, что хочу больше внимания себе', createdAt: '2025-01-15', status: 'submitted' },
  { id: 'submission-3', userId: 'student-3', programId: 'program-1', lessonId: 'lesson-1-1-1', content: 'Эссе о женственности в современном мире...', createdAt: '2025-01-14', status: 'submitted' },
];

export const seedTickets: SupportTicket[] = [
  { id: 'ticket-1', userId: 'student-1', subject: 'Не могу открыть урок', message: 'Добрый день! При попытке открыть урок "Работа с телом" появляется ошибка. Помогите, пожалуйста!', createdAt: '2025-01-10', status: 'closed', adminReply: 'Добрый день! Проверили, доступ восстановлен. Приятного обучения!' },
  { id: 'ticket-2', userId: 'student-2', subject: 'Вопрос по оплате', message: 'Здравствуйте, хотела бы узнать о возможности рассрочки на основной курс.', createdAt: '2025-01-16', status: 'open' },
];

export const seedNews: NewsItem[] = [
  { id: 'news-1', title: 'Новый курс уже скоро!', text: 'Дорогие ученицы! Рада сообщить, что в феврале стартует новый углублённый курс "Путь к себе". Готовьтесь к трансформации!', date: '2025-01-15' },
  { id: 'news-2', title: 'Итоги декабрьского интенсива', text: 'Благодарю всех участниц декабрьского интенсива! Ваши отзывы вдохновляют на создание ещё более глубоких программ.', date: '2025-01-10' },
  { id: 'news-3', title: 'Обновление библиотеки', text: 'В библиотеку добавлены новые материалы по практикам женственности. Заходите в раздел "Для учениц".', date: '2025-01-05' },
];

export const seedLibrary: LibraryItem[] = [
  { id: 'lib-1', title: 'Утренняя практика пробуждения', description: 'Бесплатная практика для начала дня с осознанностью', type: 'audio', contentUrl: '#', accessRule: 'freeForAll', category: 'free' },
  { id: 'lib-2', title: 'Статья: 5 шагов к женственности', description: 'Базовые принципы развития внутренней силы', type: 'article', contentUrl: '#', accessRule: 'freeForAll', category: 'free' },
  { id: 'lib-3', title: 'Глубокая медитация связи', description: 'Практика для участниц курсов', type: 'audio', contentUrl: '#', accessRule: 'paidOnly', category: 'students' },
  { id: 'lib-4', title: 'Рабочая тетрадь курса', description: 'PDF-пособие к курсу "Искусство женственности"', type: 'pdf', contentUrl: '#', accessRule: 'programOnly', programIds: ['program-1'], category: 'students' },
  { id: 'lib-5', title: 'Дневник практик', description: 'Шаблон для ведения дневника', type: 'pdf', contentUrl: '#', accessRule: 'paidOnly', category: 'students' },
];

export const seedMeditations: Meditation[] = [
  { id: 'med-1', title: 'Утреннее пробуждение', description: 'Мягкая практика для начала дня', duration: '10 мин', type: 'audio', contentUrl: '#' },
  { id: 'med-2', title: 'Связь с телом', description: 'Практика телесного осознания', duration: '15 мин', type: 'audio', contentUrl: '#' },
  { id: 'med-3', title: 'Вечерняя благодарность', description: 'Завершение дня с благодарностью', duration: '12 мин', type: 'audio', contentUrl: '#' },
  { id: 'med-4', title: 'Дыхание любви', description: 'Практика открытия сердца', duration: '20 мин', type: 'audio', contentUrl: '#' },
];

export const seedEvents: EventItem[] = [
  { id: 'event-1', title: 'Онлайн-встреча с Екатериной', description: 'Ответы на вопросы учениц', datetime: '2025-01-25T19:00:00', type: 'meeting' },
  { id: 'event-2', title: 'Групповая практика', description: 'Совместная медитация в прямом эфире', datetime: '2025-01-28T20:00:00', type: 'practice' },
];

export const seedAdminNotes: AdminNote[] = [
  { id: 'note-1', userId: 'student-1', type: 'public', content: 'Очень мотивированная ученица, активно участвует в практиках.', createdAt: '2024-07-15', createdBy: 'admin-1' },
  { id: 'note-2', userId: 'student-1', type: 'private', content: 'VIP-клиентка, предложить персональную консультацию.', createdAt: '2024-08-01', createdBy: 'admin-1' },
  { id: 'note-3', userId: 'student-4', type: 'public', content: 'Давно не заходила, возможно нужно напомнить о курсе.', createdAt: '2025-01-05', createdBy: 'assistant-1' },
];

export const seedPayments: Payment[] = [
  { id: 'pay-1', userId: 'student-1', programId: 'program-1', amount: 45000, date: '2024-06-15', status: 'completed' },
  { id: 'pay-2', userId: 'student-2', programId: 'program-2', amount: 7000, date: '2024-08-25', status: 'completed' },
  { id: 'pay-3', userId: 'student-3', programId: 'program-1', amount: 15000, date: '2024-12-05', status: 'installment', installmentRemaining: 30000 },
  { id: 'pay-4', userId: 'student-4', programId: 'program-1', amount: 45000, date: '2024-11-20', status: 'completed' },
  { id: 'pay-5', userId: 'student-1', programId: 'program-3', amount: 25000, date: '2025-01-10', status: 'completed' },
  { id: 'pay-6', userId: 'student-2', programId: 'program-1', amount: 20000, date: '2025-01-05', status: 'installment', installmentRemaining: 25000 },
];

// ============ EXPENSES ============

export type ExpenseCategory = 
  | 'marketing'      // Реклама и маркетинг
  | 'content'        // Создание контента
  | 'software'       // Программное обеспечение
  | 'taxes'          // Налоги
  | 'contractors'    // Подрядчики
  | 'other';         // Прочее

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  programId?: string; // привязка к курсу (опционально)
  createdAt: string;
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  marketing: 'Маркетинг',
  content: 'Контент',
  software: 'Сервисы',
  taxes: 'Налоги',
  contractors: 'Подрядчики',
  other: 'Прочее',
};

export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  marketing: 'bg-blue-500',
  content: 'bg-purple-500',
  software: 'bg-green-500',
  taxes: 'bg-red-500',
  contractors: 'bg-orange-500',
  other: 'bg-gray-500',
};

export const seedExpenses: Expense[] = [
  { id: 'exp-1', amount: 15000, date: '2025-01-10', description: 'Таргетированная реклама VK', category: 'marketing', createdAt: '2025-01-10' },
  { id: 'exp-2', amount: 5000, date: '2025-01-05', description: 'Kinescope подписка', category: 'software', createdAt: '2025-01-05' },
  { id: 'exp-3', amount: 20000, date: '2024-12-20', description: 'Видеопродакшн для курса', category: 'content', programId: 'program-1', createdAt: '2024-12-20' },
  { id: 'exp-4', amount: 8000, date: '2024-12-15', description: 'Telegram Ads', category: 'marketing', createdAt: '2024-12-15' },
  { id: 'exp-5', amount: 12000, date: '2024-11-28', description: 'Дизайнер обложек', category: 'contractors', programId: 'program-3', createdAt: '2024-11-28' },
  { id: 'exp-6', amount: 35000, date: '2024-11-15', description: 'Налог УСН', category: 'taxes', createdAt: '2024-11-15' },
  { id: 'exp-7', amount: 3500, date: '2025-01-15', description: 'GetCourse подписка', category: 'software', createdAt: '2025-01-15' },
  { id: 'exp-8', amount: 10000, date: '2024-10-20', description: 'Копирайтер для продающих текстов', category: 'content', programId: 'program-2', createdAt: '2024-10-20' },
];
