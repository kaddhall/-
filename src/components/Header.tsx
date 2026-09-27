import React from 'react';
import {
  Users,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  Bell,
  CheckCircle2,
  FolderOpen,
  PieChart,
  MessageSquare,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';
import { Role } from '../types';
import { SmartNotificationCenter } from './SmartNotificationCenter';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    activeTab,
    setActiveTab,
    currentMember,
    members,
    setCurrentMemberId,
    smartNotifications,
    unreadNotificationsCount,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = React.useState(false);

  const navLinks: { tab: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'لوحة القيادة', icon: <Layers className="w-4 h-4" /> },
    { tab: 'members', label: 'المنخرطين', icon: <Users className="w-4 h-4" /> },
    { tab: 'activities', label: 'الأنشطة', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'program', label: 'البرنامج السنوي', icon: <PieChart className="w-4 h-4" /> },
    { tab: 'projects', label: 'المشاريع', icon: <FolderOpen className="w-4 h-4" /> },
    { tab: 'portal', label: 'فضاء المنخرط', icon: <UserCheck className="w-4 h-4" /> },
    { tab: 'documents', label: 'الوثائق', icon: <FileText className="w-4 h-4" /> },
    { tab: 'reports', label: 'التقارير', icon: <Award className="w-4 h-4" /> },
    { tab: 'communication', label: 'التواصل والاستطلاع', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const roleLabels: Record<Role, { title: string; desc: string; icon: React.ReactNode }> = {
    admin: {
      title: 'الإدارة العامة',
      desc: 'صلاحيات كاملة للمكتب التنفيذي والتقارير',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
    },
    manager: {
      title: 'مسؤول النشاط',
      desc: 'إدارة اللوجستيك والحضور والتقييمات',
      icon: <Calendar className="w-4 h-4 text-sky-600" />,
    },
    member: {
      title: 'فضاء المنخرط',
      desc: 'بطاقة العضوية والتسجيل والشهادات',
      icon: <UserCheck className="w-4 h-4 text-amber-600" />,
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-right focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
                ش+
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                  شبانشة+
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  جمعية شبانشة للتنمية والشباب
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single line, text with subtle hover) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.slice(0, 7).map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Role Switcher & Profile & Alerts) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Smart Notification Center Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationCenter(!showNotificationCenter);
                  setShowRoleMenu(false);
                }}
                className={`relative p-2 rounded-lg transition-colors ${
                  showNotificationCenter
                    ? 'bg-slate-900 text-white shadow-xs'
                    : unreadNotificationsCount > 0
                    ? 'text-slate-800 hover:bg-slate-100 bg-emerald-50/80 border border-emerald-200/80'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="مركز الإشعارات والتنبيهات الذكية"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-600 text-white rounded-full text-[10px] font-bold font-mono-num flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <SmartNotificationCenter
                isOpen={showNotificationCenter}
                onClose={() => setShowNotificationCenter(false)}
              />
            </div>

            {/* Role switcher menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotificationCenter(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors border border-slate-200/60"
              >
                {roleLabels[role].icon}
                <span className="font-semibold">{roleLabels[role].title}</span>
                <span className="text-slate-400 text-[10px]">▼</span>
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500">
                    تبديل مستوى الصلاحية (تجربة المنظومة)
                  </div>
                  {(['admin', 'manager', 'member'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-right transition-colors ${
                        role === r ? 'bg-emerald-50 text-emerald-950' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">{roleLabels[r].icon}</div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold flex items-center justify-between">
                          <span>{roleLabels[r].title}</span>
                          {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {roleLabels[r].desc}
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="px-2 pb-1 text-[10px] text-slate-400">
                      تبديل هوية المستخدم المسجل:
                    </div>
                    <div className="space-y-1">
                      {members.slice(0, 4).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setCurrentMemberId(m.id);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-right px-2 py-1 rounded text-xs truncate flex items-center justify-between ${
                            currentMember.id === m.id ? 'bg-slate-200 font-semibold' : 'hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">{m.memberType}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current user badge */}
            <div className="hidden sm:flex items-center gap-2 pl-1 border-r border-slate-200 pr-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {currentMember.name.slice(0, 1)}
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                  {currentMember.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {currentMember.memberType}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
