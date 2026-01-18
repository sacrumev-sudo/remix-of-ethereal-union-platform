import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { StudentLayout } from "@/layouts/StudentLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Public Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { PhilosophyPage, ContactsPage, PrivacyPage, OfferPage } from "@/pages/PlaceholderPages";
import NotFound from "@/pages/NotFound";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentNews from "@/pages/student/News";
import StudentLibrary from "@/pages/student/Library";
import StudentMeditations from "@/pages/student/Meditations";
import StudentSupport from "@/pages/student/Support";
import StudentProgram from "@/pages/student/Program";
import StudentLesson from "@/pages/student/Lesson";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClients from "@/pages/admin/Clients";
import AdminClientDetail from "@/pages/admin/ClientDetail";
import AdminClientProgress from "@/pages/admin/ClientProgress";
import AdminPrograms from "@/pages/admin/Programs";
import AdminProgramEdit from "@/pages/admin/ProgramEdit";
import AdminSubmissions from "@/pages/admin/Submissions";
import AdminTickets from "@/pages/admin/Tickets";
import AdminFinance from "@/pages/admin/Finance";
import AdminSalesPages from "@/pages/admin/SalesPages";
import AdminLessonEdit from "@/pages/admin/LessonEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/philosophy" element={<PhilosophyPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/docs/privacy" element={<PrivacyPage />} />
          <Route path="/docs/offer" element={<OfferPage />} />

          {/* Student Routes */}
          <Route path="/app" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="news" element={<StudentNews />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="meditations" element={<StudentMeditations />} />
            <Route path="support" element={<StudentSupport />} />
            <Route path="programs/:programId" element={<StudentProgram />} />
            <Route path="programs/:programId/lessons/:lessonId" element={<StudentLesson />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:userId" element={<AdminClientDetail />} />
            <Route path="clients/:userId/programs/:programId" element={<AdminClientProgress />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="programs/:programId/edit" element={<AdminProgramEdit />} />
            <Route path="programs/:programId/lessons/new" element={<AdminLessonEdit />} />
            <Route path="programs/:programId/lessons/:lessonId/edit" element={<AdminLessonEdit />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="sales-pages" element={<AdminSalesPages />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
