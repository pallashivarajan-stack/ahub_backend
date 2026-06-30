import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { BoardTab } from '@/components/admin/board/BoardTab';
import { TeamTab } from '@/components/admin/team/TeamTab';
import { MentorTab } from '@/components/admin/mentors/MentorTab';
import { StartupPortfolioTab } from '@/components/admin/startups/StartupPortfolioTab';
import { InfrastructureTab } from '@/components/admin/infrastructure/InfrastructureTab';
import { CaseStudyTab } from '@/components/admin/case-studies/CaseStudyTab';
import { PressTab } from '@/components/admin/press/PressTab';
import { VisionMissionTab } from '@/components/admin/vision-rd/VisionMissionTab';
import { RoadmapMilestoneTab } from '@/components/admin/vision-rd/RoadmapMilestoneTab';
import { PartnerTab } from '@/components/admin/partners/PartnerTab';
import { ImpactTab } from '@/components/admin/impact/ImpactTab';
import { JoinUsTab } from '@/components/admin/join-us/JoinUsTab';
import { LoginPage } from '@/components/admin/LoginPage';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LayoutDashboard, ClipboardList, Users, GraduationCap, BookOpen, Newspaper, Briefcase, Eye, Milestone, Building2, Handshake, UserPlus, FileText, BarChart3, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearTokens } from '@/services/api';
import { queryClient } from '@/main';

function AdminLayout() {
  const navigate = useNavigate();

  // Reactive token check - reads from localStorage on every render
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    // Clear auth tokens
    clearTokens();
    // Clear ALL cached query data so next login starts fresh
    queryClient.clear();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Content Management System</h1>
            <p className="text-xs text-slate-500">Manage public website content directly.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminDashboardHome() {
  const cards = [
    { to: '/admin/board', icon: ClipboardList, title: 'Board', desc: 'Manage board members, photos, bios, and LinkedIn links' },
    { to: '/admin/team', icon: Users, title: 'Team Page', desc: 'Edit team members, group photo, and page text' },
    { to: '/admin/mentors', icon: GraduationCap, title: 'Mentors', desc: 'Manage mentors, photos, titles, and LinkedIn profiles' },
    { to: '/admin/case-studies', icon: BookOpen, title: 'Case Studies', desc: 'Manage impact stories and startup journey highlights' },
    { to: '/admin/press', icon: Newspaper, title: 'Press', desc: 'Manage press coverage, media features, and publications' },
    { to: '/admin/vision-mission', icon: Eye, title: 'Vision & Mission', desc: 'Edit vision, mission, heading, description, and images' },
    { to: '/admin/roadmap', icon: Milestone, title: 'Roadmap', desc: 'Manage roadmap image and milestones' },
    { to: '/admin/startups', icon: Briefcase, title: 'Startup Portfolio', desc: 'Manage startup portfolio, logos, and ticker visibility' },
    { to: '/admin/infrastructure', icon: Building2, title: 'Infrastructure', desc: 'Manage infrastructure images, gallery, and facilities' },
    { to: '/admin/partners', icon: Handshake, title: 'Partners', desc: 'Manage partner logos, descriptions, and showcase order' },
    { to: '/admin/impact', icon: BarChart3, title: 'Impact', desc: 'Manage impact metrics and achievement numbers' },
    { to: '/admin/join-us', icon: UserPlus, title: 'Join Us', desc: 'Manage Join Us forms, fields, and review submissions' },
    { to: '/admin/pitch-to-us', icon: FileText, title: 'Pitch to Us', desc: 'Manage Pitch to Us forms, fields, and review submissions' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-[#e75710]">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Select a section from the sidebar to manage content.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-[#e75710]">
              <Icon size={24} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="board" element={<BoardTab />} />
          <Route path="team" element={<TeamTab />} />
          <Route path="mentors" element={<MentorTab />} />
          <Route path="case-studies" element={<CaseStudyTab />} />
          <Route path="press" element={<PressTab />} />
          <Route path="vision-mission" element={<VisionMissionTab />} />
          <Route path="roadmap" element={<RoadmapMilestoneTab />} />
          <Route path="startups" element={<StartupPortfolioTab />} />
          <Route path="infrastructure" element={<InfrastructureTab />} />
          <Route path="partners" element={<PartnerTab />} />
          <Route path="impact" element={<ImpactTab />} />
          <Route path="join-us" element={<JoinUsTab />} />
          <Route path="pitch-to-us" element={<JoinUsTab />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
