// LocalStorage wrapper for mock data persistence
import {
  seedUsers,
  seedPrograms,
  seedLessons,
  seedAccessGrants,
  seedProgress,
  seedSubmissions,
  seedTickets,
  seedNews,
  seedLibrary,
  seedMeditations,
  seedEvents,
  seedAdminNotes,
  seedPayments,
  seedExpenses,
  User,
  Program,
  Lesson,
  OutlineNode,
  OutlineSectionNode,
  OutlineLessonNode,
  AccessGrant,
  Progress,
  Submission,
  SupportTicket,
  NewsItem,
  LibraryItem,
  Meditation,
  EventItem,
  AdminNote,
  Payment,
  Attachment,
  Expense,
} from '@/data/mockData';

const STORAGE_KEYS = {
  users: 'estetika_users',
  programs: 'estetika_programs',
  lessons: 'estetika_lessons',
  accessGrants: 'estetika_access_grants',
  progress: 'estetika_progress',
  submissions: 'estetika_submissions',
  tickets: 'estetika_tickets',
  news: 'estetika_news',
  library: 'estetika_library',
  meditations: 'estetika_meditations',
  events: 'estetika_events',
  adminNotes: 'estetika_admin_notes',
  payments: 'estetika_payments',
  expenses: 'estetika_expenses',
  currentUser: 'estetika_current_user',
  impersonating: 'estetika_impersonating',
};

// Initialize storage with seed data if empty
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.programs)) {
    localStorage.setItem(STORAGE_KEYS.programs, JSON.stringify(seedPrograms));
  }
  if (!localStorage.getItem(STORAGE_KEYS.lessons)) {
    localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(seedLessons));
  }
  if (!localStorage.getItem(STORAGE_KEYS.accessGrants)) {
    localStorage.setItem(STORAGE_KEYS.accessGrants, JSON.stringify(seedAccessGrants));
  }
  if (!localStorage.getItem(STORAGE_KEYS.progress)) {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(seedProgress));
  }
  if (!localStorage.getItem(STORAGE_KEYS.submissions)) {
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(seedSubmissions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.tickets)) {
    localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(seedTickets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.news)) {
    localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(seedNews));
  }
  if (!localStorage.getItem(STORAGE_KEYS.library)) {
    localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(seedLibrary));
  }
  if (!localStorage.getItem(STORAGE_KEYS.meditations)) {
    localStorage.setItem(STORAGE_KEYS.meditations, JSON.stringify(seedMeditations));
  }
  if (!localStorage.getItem(STORAGE_KEYS.events)) {
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(seedEvents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.adminNotes)) {
    localStorage.setItem(STORAGE_KEYS.adminNotes, JSON.stringify(seedAdminNotes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.payments)) {
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(seedPayments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.expenses)) {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(seedExpenses));
  }
}

// Generic getters and setters
function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// Users
export const getUsers = () => getItems<User>(STORAGE_KEYS.users);
export const setUsers = (users: User[]) => setItems(STORAGE_KEYS.users, users);
export const getUserById = (id: string) => getUsers().find(u => u.id === id);
export const getUserByEmail = (email: string) => getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  setUsers(users);
  return user;
};

export const updateUser = (id: string, updates: Partial<User>) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    setUsers(users);
    return users[index];
  }
  return null;
};

// Programs
export const getPrograms = () => getItems<Program>(STORAGE_KEYS.programs);
export const setPrograms = (programs: Program[]) => setItems(STORAGE_KEYS.programs, programs);
export const getProgramById = (id: string) => getPrograms().find(p => p.id === id);

export const addProgram = (program: Program) => {
  const programs = getPrograms();
  programs.push(program);
  setPrograms(programs);
  return program;
};

export const updateProgram = (id: string, updates: Partial<Program>) => {
  const programs = getPrograms();
  const index = programs.findIndex(p => p.id === id);
  if (index !== -1) {
    programs[index] = { ...programs[index], ...updates };
    setPrograms(programs);
    return programs[index];
  }
  return null;
};

export const cloneProgram = (id: string) => {
  const program = getProgramById(id);
  if (!program) return null;
  
  const newProgram: Program = {
    ...JSON.parse(JSON.stringify(program)),
    id: `program-${Date.now()}`,
    title: `${program.title} (копия)`,
    status: 'hidden',
    createdAt: new Date().toISOString().split('T')[0],
  };
  
  return addProgram(newProgram);
};

// Lessons
export const getLessons = () => getItems<Lesson>(STORAGE_KEYS.lessons);
export const setLessons = (lessons: Lesson[]) => setItems(STORAGE_KEYS.lessons, lessons);
export const getLessonById = (id: string) => getLessons().find(l => l.id === id);

export const addLesson = (lesson: Lesson) => {
  const lessons = getLessons();
  lessons.push(lesson);
  setLessons(lessons);
  return lesson;
};

export const updateLesson = (id: string, updates: Partial<Lesson>) => {
  const lessons = getLessons();
  const index = lessons.findIndex(l => l.id === id);
  if (index !== -1) {
    lessons[index] = { ...lessons[index], ...updates };
    setLessons(lessons);
    return lessons[index];
  }
  return null;
};

export const deleteLesson = (id: string) => {
  const lessons = getLessons();
  setLessons(lessons.filter(l => l.id !== id));
};

export const addLessonAttachment = (lessonId: string, attachment: Attachment) => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  const attachments = lesson.attachments || [];
  attachments.push(attachment);
  return updateLesson(lessonId, { attachments });
};

export const removeLessonAttachment = (lessonId: string, attachmentId: string) => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  const attachments = (lesson.attachments || []).filter(a => a.id !== attachmentId);
  return updateLesson(lessonId, { attachments });
};

export const addProgramAttachment = (programId: string, attachment: Attachment) => {
  const program = getProgramById(programId);
  if (!program) return null;
  const attachments = program.attachments || [];
  attachments.push(attachment);
  return updateProgram(programId, { attachments });
};

export const removeProgramAttachment = (programId: string, attachmentId: string) => {
  const program = getProgramById(programId);
  if (!program) return null;
  const attachments = (program.attachments || []).filter(a => a.id !== attachmentId);
  return updateProgram(programId, { attachments });
};

// ============ OUTLINE MANAGEMENT ============

// Helper: find node in tree
function findNodeInOutline(nodes: OutlineNode[] | undefined, nodeId: string): { node: OutlineNode; parent: OutlineNode[]; index: number } | null {
  if (!nodes || !Array.isArray(nodes)) return null;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      return { node: nodes[i], parent: nodes, index: i };
    }
    if (nodes[i].type !== 'lesson') {
      const sectionNode = nodes[i] as OutlineSectionNode;
      const found = findNodeInOutline(sectionNode.children ?? [], nodeId);
      if (found) return found;
    }
  }
  return null;
}

// Helper: get max order in array
function getMaxOrder(nodes: OutlineNode[] | undefined): number {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return 0;
  return Math.max(...nodes.map(n => n.order));
}

// Add section to program
export const addSection = (programId: string, parentNodeId?: string): OutlineSectionNode | null => {
  const program = getProgramById(programId);
  if (!program) return null;
  
  // Ensure outline exists
  const outline = [...(program.outline ?? [])];
  const newSection: OutlineSectionNode = {
    id: `section-${Date.now()}`,
    type: 'section',
    title: 'Новый раздел',
    order: 0,
    children: [],
  };
  
  if (parentNodeId) {
    // Add inside a section as subsection
    const found = findNodeInOutline(outline, parentNodeId);
    if (found && found.node.type === 'section') {
      newSection.type = 'subsection';
      const parent = found.node as OutlineSectionNode;
      if (!parent.children) parent.children = [];
      newSection.order = getMaxOrder(parent.children) + 1;
      parent.children.push(newSection);
    }
  } else {
    // Add at root level
    newSection.order = getMaxOrder(outline) + 1;
    outline.push(newSection);
  }
  
  updateProgram(programId, { outline });
  return newSection;
};

// Add subsection
export const addSubsection = (programId: string, sectionNodeId: string): OutlineSectionNode | null => {
  const program = getProgramById(programId);
  if (!program) return null;
  
  const outline = [...(program.outline ?? [])];
  const found = findNodeInOutline(outline, sectionNodeId);
  
  if (!found || found.node.type === 'lesson') return null;
  
  const parent = found.node as OutlineSectionNode;
  if (!parent.children) parent.children = [];
  
  const newSubsection: OutlineSectionNode = {
    id: `subsection-${Date.now()}`,
    type: 'subsection',
    title: 'Новый подраздел',
    order: getMaxOrder(parent.children) + 1,
    children: [],
  };
  
  parent.children.push(newSubsection);
  updateProgram(programId, { outline });
  return newSubsection;
};

// Add lesson to outline (creates Lesson entity and outline node)
export const addLessonToOutline = (programId: string, parentNodeId?: string, lessonData?: Partial<Lesson>): Lesson | null => {
  const program = getProgramById(programId);
  if (!program) return null;
  
  // Create unique lesson ID
  const lessonId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create lesson entity
  const newLesson: Lesson = {
    id: lessonId,
    title: lessonData?.title || 'Новый урок',
    description: lessonData?.description || '',
    published: lessonData?.published ?? true,
    stopLessonMode: lessonData?.stopLessonMode || 'none',
    blocks: lessonData?.blocks || [
      { id: `block-${Date.now()}`, type: 'richtext', order: 1, content: '<p>Контент урока...</p>' }
    ],
    practice: lessonData?.practice,
    accessStart: lessonData?.accessStart,
    deadlineAt: lessonData?.deadlineAt,
    attachments: lessonData?.attachments || [],
  };
  
  // Add lesson to lessons storage
  addLesson(newLesson);
  
  // Create outline node
  const outline = [...(program.outline ?? [])];
  const lessonNode: OutlineLessonNode = {
    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'lesson',
    title: newLesson.title,
    order: 0,
    lessonId: newLesson.id,
  };
  
  if (parentNodeId) {
    const found = findNodeInOutline(outline, parentNodeId);
    if (found && found.node.type !== 'lesson') {
      const parent = found.node as OutlineSectionNode;
      if (!parent.children) parent.children = [];
      lessonNode.order = getMaxOrder(parent.children) + 1;
      parent.children.push(lessonNode);
    } else {
      // Parent not found or is a lesson - add to root
      lessonNode.order = getMaxOrder(outline) + 1;
      outline.push(lessonNode);
    }
  } else {
    lessonNode.order = getMaxOrder(outline) + 1;
    outline.push(lessonNode);
  }
  
  updateProgram(programId, { outline });
  return newLesson;
};

// Move outline node
export const moveOutlineNode = (programId: string, nodeId: string, newParentId: string | null, newIndex: number): boolean => {
  const program = getProgramById(programId);
  if (!program) return false;
  
  const outline = [...(program.outline ?? [])];
  
  // Find and remove node
  const found = findNodeInOutline(outline, nodeId);
  if (!found || !found.parent) return false;
  
  const [node] = found.parent.splice(found.index, 1);
  
  // Insert at new position
  if (newParentId) {
    const newParentFound = findNodeInOutline(outline, newParentId);
    if (newParentFound && newParentFound.node.type !== 'lesson') {
      const parent = newParentFound.node as OutlineSectionNode;
      if (!parent.children) parent.children = [];
      parent.children.splice(newIndex, 0, node);
      // Reorder
      parent.children.forEach((n, i) => n.order = i + 1);
    }
  } else {
    outline.splice(newIndex, 0, node);
    outline.forEach((n, i) => n.order = i + 1);
  }
  
  updateProgram(programId, { outline });
  return true;
};

// Update outline node title
export const updateOutlineNodeTitle = (programId: string, nodeId: string, title: string): boolean => {
  const program = getProgramById(programId);
  if (!program) return false;
  
  const outline = [...(program.outline ?? [])];
  const found = findNodeInOutline(outline, nodeId);
  
  if (!found) return false;
  
  found.node.title = title;
  
  // If it's a lesson node, also update the lesson entity
  if (found.node.type === 'lesson') {
    const lessonNode = found.node as OutlineLessonNode;
    updateLesson(lessonNode.lessonId, { title });
  }
  
  updateProgram(programId, { outline });
  return true;
};

// Delete outline node
export const deleteOutlineNode = (programId: string, nodeId: string): boolean => {
  const program = getProgramById(programId);
  if (!program) return false;
  
  const outline = [...(program.outline ?? [])];
  const found = findNodeInOutline(outline, nodeId);
  
  if (!found || !found.parent) return false;
  
  // If lesson, delete the entity
  if (found.node.type === 'lesson') {
    const lessonNode = found.node as OutlineLessonNode;
    deleteLesson(lessonNode.lessonId);
  } else {
    // If section/subsection, delete all nested lessons
    const deleteNestedLessons = (nodes?: OutlineNode[]) => {
      if (!nodes || !Array.isArray(nodes)) return;
      nodes.forEach(n => {
        if (n.type === 'lesson') {
          deleteLesson((n as OutlineLessonNode).lessonId);
        } else {
          deleteNestedLessons((n as OutlineSectionNode).children);
        }
      });
    };
    const sectionNode = found.node as OutlineSectionNode;
    deleteNestedLessons(sectionNode.children ?? []);
  }
  
  found.parent.splice(found.index, 1);
  updateProgram(programId, { outline });
  return true;
};

// Get all lesson IDs from outline
export const getAllLessonIdsFromOutline = (outline?: OutlineNode[]): string[] => {
  if (!outline || !Array.isArray(outline)) return [];
  const ids: string[] = [];
  const traverse = (nodes?: OutlineNode[]) => {
    if (!nodes || !Array.isArray(nodes)) return;
    nodes.forEach(n => {
      if (n.type === 'lesson') {
        ids.push((n as OutlineLessonNode).lessonId);
      } else {
        traverse((n as OutlineSectionNode).children);
      }
    });
  };
  traverse(outline);
  return ids;
};

// Access Grants
export const getAccessGrants = () => getItems<AccessGrant>(STORAGE_KEYS.accessGrants);
export const setAccessGrants = (grants: AccessGrant[]) => setItems(STORAGE_KEYS.accessGrants, grants);

export const getUserAccess = (userId: string) => getAccessGrants().filter(a => a.userId === userId);
export const hasAccess = (userId: string, programId: string) => {
  const grants = getAccessGrants();
  return grants.some(g => g.userId === userId && g.programId === programId);
};

export const grantAccess = (grant: Omit<AccessGrant, 'id' | 'createdAt'>) => {
  const grants = getAccessGrants();
  const newGrant: AccessGrant = {
    ...grant,
    id: `access-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  grants.push(newGrant);
  setAccessGrants(grants);
  return newGrant;
};

export const revokeAccess = (userId: string, programId: string) => {
  const grants = getAccessGrants();
  const filtered = grants.filter(g => !(g.userId === userId && g.programId === programId));
  setAccessGrants(filtered);
};

// Progress
export const getProgress = () => getItems<Progress>(STORAGE_KEYS.progress);
export const setProgress = (progress: Progress[]) => setItems(STORAGE_KEYS.progress, progress);

export const getUserProgress = (userId: string) => getProgress().filter(p => p.userId === userId);
export const getLessonProgress = (userId: string, lessonId: string) => 
  getProgress().find(p => p.userId === userId && p.lessonId === lessonId);

export const updateLessonProgress = (userId: string, lessonId: string, programId: string, updates: Partial<Progress>) => {
  const progress = getProgress();
  const index = progress.findIndex(p => p.userId === userId && p.lessonId === lessonId);
  
  if (index !== -1) {
    progress[index] = { ...progress[index], ...updates };
  } else {
    progress.push({
      id: `progress-${Date.now()}`,
      userId,
      lessonId,
      programId,
      videoWatched: false,
      acknowledged: false,
      homeworkSubmitted: false,
      homeworkApproved: false,
      percent: 0,
      ...updates,
    });
  }
  
  setProgress(progress);
};

// Calculate program progress percentage
export const getProgramProgress = (userId: string, programId: string) => {
  const program = getProgramById(programId);
  if (!program) return 0;
  
  const lessonIds = getAllLessonIdsFromOutline(program.outline);
  if (lessonIds.length === 0) return 0;
  
  const userProgress = getUserProgress(userId);
  const completedLessons = lessonIds.filter(id => {
    const progress = userProgress.find(p => p.lessonId === id);
    return progress && progress.percent === 100;
  });
  
  return Math.round((completedLessons.length / lessonIds.length) * 100);
};

// Submissions
export const getSubmissions = () => getItems<Submission>(STORAGE_KEYS.submissions);
export const setSubmissions = (submissions: Submission[]) => setItems(STORAGE_KEYS.submissions, submissions);

export const addSubmission = (submission: Omit<Submission, 'id' | 'createdAt' | 'status'>) => {
  const submissions = getSubmissions();
  const newSubmission: Submission = {
    ...submission,
    id: `submission-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'submitted',
  };
  submissions.push(newSubmission);
  setSubmissions(submissions);
  
  // Update progress
  updateLessonProgress(submission.userId, submission.lessonId, submission.programId, {
    homeworkSubmitted: true,
    percent: 90,
  });
  
  return newSubmission;
};

export const updateSubmission = (id: string, updates: Partial<Submission>) => {
  const submissions = getSubmissions();
  const index = submissions.findIndex(s => s.id === id);
  if (index !== -1) {
    submissions[index] = { ...submissions[index], ...updates };
    setSubmissions(submissions);
    
    // If approved, update progress
    if (updates.status === 'approved') {
      const sub = submissions[index];
      updateLessonProgress(sub.userId, sub.lessonId, sub.programId, {
        homeworkApproved: true,
        percent: 100,
      });
    }
    
    return submissions[index];
  }
  return null;
};

// Tickets
export const getTickets = () => getItems<SupportTicket>(STORAGE_KEYS.tickets);
export const setTickets = (tickets: SupportTicket[]) => setItems(STORAGE_KEYS.tickets, tickets);

export const addTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
  const tickets = getTickets();
  const newTicket: SupportTicket = {
    ...ticket,
    id: `ticket-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'open',
  };
  tickets.push(newTicket);
  setTickets(tickets);
  return newTicket;
};

export const updateTicket = (id: string, updates: Partial<SupportTicket>) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === id);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...updates };
    setTickets(tickets);
    return tickets[index];
  }
  return null;
};

// News
export const getNews = () => getItems<NewsItem>(STORAGE_KEYS.news);

// Library
export const getLibrary = () => getItems<LibraryItem>(STORAGE_KEYS.library);

// Meditations
export const getMeditations = () => getItems<Meditation>(STORAGE_KEYS.meditations);

// Events
export const getEvents = () => getItems<EventItem>(STORAGE_KEYS.events);

// Admin Notes
export const getAdminNotes = () => getItems<AdminNote>(STORAGE_KEYS.adminNotes);
export const setAdminNotes = (notes: AdminNote[]) => setItems(STORAGE_KEYS.adminNotes, notes);

export const getUserNotes = (userId: string, includePrivate: boolean) => {
  const notes = getAdminNotes();
  return notes.filter(n => n.userId === userId && (includePrivate || n.type === 'public'));
};

export const addAdminNote = (note: Omit<AdminNote, 'id' | 'createdAt'>) => {
  const notes = getAdminNotes();
  const newNote: AdminNote = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  notes.push(newNote);
  setAdminNotes(notes);
  return newNote;
};

// Payments
export const getPayments = () => getItems<Payment>(STORAGE_KEYS.payments);
export const setPayments = (payments: Payment[]) => setItems(STORAGE_KEYS.payments, payments);
export const getUserPayments = (userId: string) => getPayments().filter(p => p.userId === userId);

export const addPayment = (payment: Omit<Payment, 'id'>) => {
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: `pay-${Date.now()}`,
  };
  payments.push(newPayment);
  setPayments(payments);
  return newPayment;
};

export const updatePayment = (id: string, updates: Partial<Payment>) => {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === id);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...updates };
    setPayments(payments);
    return payments[index];
  }
  return null;
};

export const deletePayment = (id: string) => {
  const payments = getPayments();
  setPayments(payments.filter(p => p.id !== id));
};

// Expenses
export const getExpenses = () => getItems<Expense>(STORAGE_KEYS.expenses);
export const setExpenses = (expenses: Expense[]) => setItems(STORAGE_KEYS.expenses, expenses);

export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  expenses.push(newExpense);
  setExpenses(expenses);
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates };
    setExpenses(expenses);
    return expenses[index];
  }
  return null;
};

export const deleteExpense = (id: string) => {
  const expenses = getExpenses();
  setExpenses(expenses.filter(e => e.id !== id));
};

// Auth
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.currentUser);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    updateUser(user.id, { lastLoginAt: new Date().toISOString().split('T')[0] });
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
};

// Impersonation
export const getImpersonating = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.impersonating);
  return data ? JSON.parse(data) : null;
};

export const setImpersonating = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.impersonating, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.impersonating);
  }
};

export const stopImpersonating = () => {
  localStorage.removeItem(STORAGE_KEYS.impersonating);
};

// Get effective user (for impersonation)
export const getEffectiveUser = (): User | null => {
  return getImpersonating() || getCurrentUser();
};

// Reset all data to seed
export const resetToSeed = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
};
