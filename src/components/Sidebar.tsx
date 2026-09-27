import React from 'react';
import {
  Layers,
  Users,
  Calendar,
  PieChart,
  QrCode,
  FolderOpen,
  FileText,
  Award,
  MessageSquare,
  UserCheck,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    members,
    activities,
    projects,
    documents,
    polls,
    role,
    openQRAttendanceModal,
  } = useApp();

  const scheduledActivities = activities.filter((a) => a.status === 'مبرمج' || a.status === 'جاري');

  const groups: {
    title: string;
    items: {
      tab?: NavigationTab;
      label: string;
      icon: React.ReactNode;
      count?: number;
      action?: () => void;
      highlight?: boolean;
    }[];
  }[] = [
    {
      title: 'الإدارة والمتابعة',
      items: [
        {
          tab: 'dashboard',
          label: 'لوحة القيادة',
          icon: <Layers className="w-4 h-4" />,
        },
        {
          tab: 'members',
          label: 'إدارة المنخرطين',
          icon: <Users className="w-4 h-4" />,
          count: members.length,
        },
        {
          tab: 'activities',
          label: 'إدارة النشاطات',
          icon: <Calendar className="w-4 h-4" />,
          count: scheduledActivities.length,
        },
        {
          tab: 'program',
          label: 'البرنامج السنوي',
          icon: <PieChart className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'التنفيذ الميداني',
      items: [
        {
          label: 'مسح وحضور QR',
          icon: <QrCode className="w-4 h-4 text-emerald-600" />,
          action: () => {
            const currentAct = activities.find((a) => a.status === 'مبرمج' || a.status === 'جاري') || activities[0];
            if (currentAct) {
              openQRAttendanceModal(currentAct);
            }
          },
          highlight: true,
        },
        {
          tab: 'projects',
          label: 'المشاريع الشبابية',
          icon: <FolderOpen className="w-4 h-4" />,
          count: projects.length,
        },
      ],
    },
    {
      title: 'التوثيق والتقارير',
      items: [
        {
          tab: 'documents',
          label: 'إدارة الوثائق',
          icon: <FileText className="w-4 h-4" />,
          count: documents.length,
        },
        {
          tab: 'reports',
          label: 'مركز التقارير والتصدير',
          icon: <Award className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'المشاركة والتواصل',
      items: [
        {
          tab: 'communication',
          label: 'التواصل والاستطلاعات',
          icon: <MessageSquare className="w-4 h-4" />,
          count: polls.filter((p) => p.isActive).length,
        },
        {
          tab: 'portal',
          label: 'فضاء المنخرط',
          icon: <UserCheck className="w-4 h-4 text-sky-600" />,
        },
      ],
    },
  ];

  const handleSelect = (tab?: NavigationTab, action?: () => void) => {
    if (action) {
      action();
    } else if (tab) {
      setActiveTab(tab);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 right-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-l border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-slate-500 tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5 mt-1.5">
                {group.items.map((item, i) => {
                  const isActive = item.tab && activeTab === item.tab;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(item.tab, item.action)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-right ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : item.highlight
                          ? 'bg-slate-50 text-slate-800 hover:bg-emerald-50/70 border border-emerald-200/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.count !== undefined && (
                          <span
                            className={`font-mono-num text-[11px] px-1.5 py-0.2 rounded-md ${
                              isActive
                                ? 'bg-emerald-200/70 text-emerald-900'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                        {isActive && <ChevronLeft className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Association signature card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="p-3 rounded-xl bg-white border border-slate-200/70 text-right space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                جمعية شبانشة
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                الموسم 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              نظام التشغيل والربط الذكي بين الإدارة والمنخرطين والمشاريع.
            </p>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>المستوى النشط:</span>
              <span className="font-semibold text-slate-700">
                {role === 'admin' ? 'الإدارة العامة' : role === 'manager' ? 'مسؤول نشاط' : 'منخرط'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
