import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { clearTokens } from "@/services/api";
import {
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  ClipboardList,
  Users,
  GraduationCap,
  BookOpen,
  Newspaper,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Eye,
  Milestone,
  Building2,
  Handshake,
  UserPlus,
  FileText,
  BarChart3,
} from "lucide-react";

type NavGroup = {
  key: string;
  label: string;
  eyebrow: string;
  paths: string[];
  items: { to: string; label: string; icon: typeof Users }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    key: "about",
    label: "About",
    eyebrow: "Meet the ecosystem",
    paths: ["/admin/board", "/admin/team", "/admin/mentors"],
    items: [
      { to: "/admin/mentors", label: "Mentors", icon: GraduationCap },
      { to: "/admin/board", label: "Board", icon: ClipboardList },
      { to: "/admin/team", label: "Team", icon: Users },
    ],
  },
  {
    key: "announcement",
    label: "Announcement",
    eyebrow: "Press & stories",
    paths: ["/admin/case-studies", "/admin/press"],
    items: [
      { to: "/admin/case-studies", label: "Case Studies", icon: BookOpen },
      { to: "/admin/press", label: "Press", icon: Newspaper },
    ],
  },
  {
    key: "approach",
    label: "Approach",
    eyebrow: "Vision & journey",
    paths: ["/admin/vision-mission", "/admin/roadmap"],
    items: [
      { to: "/admin/vision-mission", label: "Vision & Mission", icon: Eye },
      { to: "/admin/roadmap", label: "Roadmap", icon: Milestone },
    ],
  },
  {
    key: "ecosystem",
    label: "Ecosystem",
    eyebrow: "Companies & startups",
    paths: ["/admin/startups", "/admin/infrastructure", "/admin/partners"],
    items: [
      { to: "/admin/startups", label: "Startup Portfolio", icon: Briefcase },
      { to: "/admin/infrastructure", label: "Infrastructure", icon: Building2 },
      { to: "/admin/partners", label: "Partners", icon: Handshake },
    ],
  },
  {
    key: "achievements",
    label: "Achievements",
    eyebrow: "Impact & milestones",
    paths: ["/admin/impact"],
    items: [
      { to: "/admin/impact", label: "Impact", icon: BarChart3 },
    ],
  },
  {
    key: "associate",
    label: "Associate",
    eyebrow: "Join & connect",
    paths: ["/admin/join-us", "/admin/pitch-to-us"],
    items: [
      { to: "/admin/join-us", label: "Join Us", icon: UserPlus },
      { to: "/admin/pitch-to-us", label: "Pitch to Us", icon: FileText },
    ],
  },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of NAV_GROUPS) {
      initial[group.key] = group.paths.some((p) => location.pathname === p);
    }
    return initial;
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    clearTokens();
    navigate("/admin/login");
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B00] text-sm font-bold text-white">
          A
        </div>
        <span className="font-semibold text-slate-900">A-Hub Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <Link
          to="/admin"
          end
          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === "/admin"
              ? "border-orange-200 bg-orange-50 text-[#e75710]"
              : "border-transparent text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {NAV_GROUPS.map((group) => {
          const isGroupActive = group.paths.some((p) => location.pathname === p);
          const isOpen = openGroups[group.key];

          return (
            <div key={group.key} className="pt-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  isGroupActive
                    ? "border-orange-200 bg-orange-50 text-[#e75710]"
                    : "border-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isOpen ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e75710]/70">
                    {group.eyebrow}
                  </span>
                  <span>{group.label}</span>
                </span>
              </button>

              {isOpen && (
                <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-orange-100 pl-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-orange-50 font-medium text-[#e75710]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={15} className={isActive ? "text-[#e75710]" : "text-slate-400"} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </nav>

      <div className="space-y-2 border-t border-slate-200 p-4">
        <a
          href="http://localhost:8080"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          View Site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
