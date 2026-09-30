import React, { useState } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
  FolderOpen,
  X,
  ChevronLeft,
  Sparkles,
  CheckCheck,
  Trash2,
  Eye,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';
import { SmartNotification } from '../types';

interface SmartNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    smartNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    dismissSmartNotification,
    markAllNotificationsAsRead,
    setActiveTab,
    role,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'activities' | 'reports' | 'unread'>('all');

  if (!isOpen) return null;

  // Filter notifications
  const filteredNotifications = smartNotifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'activities') return n.category === 'upcoming_activity';
    if (activeFilter === 'reports')
      return n.category === 'overdue_project_report' || n.category === 'overdue_activity_report';
    return true;
  });

  const handleActionClick = (notif: SmartNotification) => {
    markNotificationAsRead(notif.id);
    setActiveTab(notif.actionTab);
    onClose();
  };

  return (
    <div className="absolute left-0 sm:left-4 top-16 mt-2 w-[calc(100vw-2rem)] sm:w-96 md:w-[420px] max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-right animate-in fade-in slide-in-from-top-2">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>نظام التنبيهات والإشعارات الذكي</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono-num font-normal">
                {smartNotifications.length} تنبيهات
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              تتبع آلي لمواعيد الأنشطة واستحقاقات تقارير المشاريع
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            الكل ({smartNotifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('activities')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'activities'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            أنشطة قريبة ({smartNotifications.filter((n) => n.category === 'upcoming_activity').length})
          </button>
          <button
            onClick={() => setActiveFilter('reports')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'reports'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            تقارير متأخرة ({
              smartNotifications.filter(
                (n) => n.category === 'overdue_project_report' || n.category === 'overdue_activity_report'
              ).length
            })
          </button>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 shrink-0"
            title="تحديد كل التنبيهات كمقروءة"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مقروء للكل</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
        {filteredNotifications.map((notif) => {
          const isCritical = notif.severity === 'critical';
          const isReportCategory =
            notif.category === 'overdue_project_report' || notif.category === 'overdue_activity_report';

          return (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border transition-all text-right space-y-2 ${
                !notif.isRead
                  ? isCritical
                    ? 'bg-rose-50/50 border-rose-200/80 shadow-2xs'
                    : 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                  : 'bg-white border-slate-100 opacity-90'
              }`}
            >
              {/* Category & Badge Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isReportCategory
                        ? 'bg-rose-100 text-rose-700'
                        : isCritical
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isReportCategory ? (
                      <FileWarning className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isReportCategory
                          ? 'bg-rose-100 text-rose-800'
                          : isCritical
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {notif.category === 'upcoming_activity'
                        ? 'اقتراب موعد نشاط'
                        : notif.category === 'overdue_project_report'
                        ? 'تأخر تقرير نهائي لمشروع'
                        : 'تأخر تقرير نشاط'}
                    </span>
                    {!notif.isRead && (
                      <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono-num">
                  <span>{notif.timestamp}</span>
                  <button
                    onClick={() => dismissSmartNotification(notif.id)}
                    className="p-1 hover:text-rose-600 rounded text-slate-400 transition-colors"
                    title="إخفاء التنبيه"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {notif.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {notif.description}
                </p>
              </div>

              {/* Action and Timing Footer */}
              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
                {notif.dueDate && (
                  <span className="text-[10px] font-mono-num text-slate-500">
                    الاستحقاق: <strong className="text-slate-700">{notif.dueDate}</strong>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-medium"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                  <button
                    onClick={() => handleActionClick(notif)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
                  >
                    <span>{notif.actionLabel}</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="py-12 px-4 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-xs font-bold text-slate-700">لا توجد تنبيهات متأخرة أو عاجلة</div>
            <p className="text-[11px] text-slate-500">
              كافة الأنشطة المبرمجة والتقارير تسير وفق المخطط الزمني المعتمد لجمعية +.
            </p>
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>المراقبة اللحظية مفعلة تلقائياً</span>
        </span>
        <button
          onClick={() => {
            setActiveTab('dashboard');
            onClose();
          }}
          className="text-emerald-700 hover:underline font-semibold"
        >
          رادار الجمعية ←
        </button>
      </div>
    </div>
  );
};
