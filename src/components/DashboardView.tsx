import React, { useState } from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FolderOpen,
  Clock,
  MapPin,
  QrCode,
  ArrowUpRight,
  AlertCircle,
  PlusCircle,
  FileSpreadsheet,
  FileCheck,
  ChevronLeft,
  BarChart3,
  Activity as ActivityIcon,
  FileWarning,
  BellRing,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { INITIAL_HERO_IMAGE, INITIAL_ACTION_IMAGE, INITIAL_TECH_IMAGE } from '../data/initialData';

interface DashboardViewProps {
  onOpenNewActivity: () => void;
  onOpenNewMember: () => void;
  onOpenNewProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewActivity,
  onOpenNewMember,
  onOpenNewProject,
}) => {
  const {
    members,
    activities,
    programAxes,
    projects,
    alerts,
    smartNotifications,
    markNotificationAsRead,
    setActiveTab,
    openQRAttendanceModal,
    role,
  } = useApp();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'نشط').length;
  const scheduledCount = activities.filter((a) => a.status === 'مبرمج').length;
  const completedCount = activities.filter((a) => a.status === 'مكتمل').length;
  const ongoingProjects = projects.filter((p) => p.status === 'قيد التنفيذ').length;

  // Calculate annual execution rate
  const totalTargetActivities = programAxes.reduce((acc, ax) => acc + ax.targetActivities, 0);
  const totalCompletedActivities = programAxes.reduce((acc, ax) => acc + ax.completedActivities, 0);
  const annualExecutionRate = Math.round((totalCompletedActivities / totalTargetActivities) * 100);

  // Next upcoming activity
  const nextActivity = activities.find((a) => a.status === 'مبرمج') || activities[0];

  // Data visualization state and datasets
  const [selectedChartRange, setSelectedChartRange] = useState<'all' | 'recent'>('all');
  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'members' | 'participation'>('both');

  const rawMemberGrowthData = [
    { month: 'جانفي 2026', total: 45, volunteers: 20, active: 42 },
    { month: 'فيفري 2026', total: 62, volunteers: 28, active: 58 },
    { month: 'مارس 2026', total: 85, volunteers: 38, active: 80 },
    { month: 'أفريل 2026', total: 110, volunteers: 52, active: 104 },
    { month: 'ماي 2026', total: 135, volunteers: 65, active: 128 },
    { month: 'جوان 2026', total: 152, volunteers: 74, active: 144 },
    { month: 'جويلية 2026', total: 168, volunteers: 82, active: 160 },
    { month: 'أوت 2026', total: 176, volunteers: 86, active: 168 },
    { month: 'سبتمبر 2026', total: 184, volunteers: 92, active: 175 },
    { month: 'أكتوبر 2026 (مستهدف)', total: 215, volunteers: 105, active: 200 },
  ];

  const memberGrowthData =
    selectedChartRange === 'recent'
      ? rawMemberGrowthData.slice(4)
      : rawMemberGrowthData;

  const rawParticipationData = [
    { activity: 'دورة ريادة الأعمال', registered: 30, attended: 28, attendanceRate: 93 },
    { activity: 'ملتقى الإعلام الجمعوي', registered: 45, attended: 40, attendanceRate: 89 },
    { activity: 'ربيع المسرح الشبابي', registered: 75, attended: 70, attendanceRate: 93 },
    { activity: 'هاكاثون الابتكار الأخضر', registered: 50, attended: 46, attendanceRate: 92 },
    { activity: 'توزيع الحقيبة المدرسية', registered: 80, attended: 80, attendanceRate: 100 },
    { activity: 'ورشة الذكاء الاصطناعي', registered: 30, attended: 26, attendanceRate: 87 },
    { activity: 'حملة التشجير الخريفية', registered: 60, attended: 54, attendanceRate: 90 },
  ];

  const participationData =
    selectedChartRange === 'recent'
      ? rawParticipationData.slice(2)
      : rawParticipationData;

  return (
    <div className="space-y-6">
      {/* Association Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-sm">
        <div className="absolute inset-0">
          <img
            src={INITIAL_HERO_IMAGE}
            alt="شبانشة بلس - فضاء العمل الجمعوي"
            className="w-full h-full object-cover opacity-35 filter brightness-90"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 max-w-3xl space-y-4 text-right">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <span>نظام التشغيل الرقمي الموحد</span>
            <span aria-hidden="true">·</span>
            <span>جمعية شبانشة 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            حلقة الوصل الذكية بين إدارة الجمعية، المنخرطين، والمشاريع الميدانية
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            متابعة دقيقة للبرنامج السنوي، تحضير وإدارة النشاطات، تسجيل الحضور بـ QR Code، وأرشفة
            الوثائق والتقارير في منصة واحدة متكاملة.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {role === 'admin' && (
              <>
                <button
                  onClick={onOpenNewActivity}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  برمجة نشاط جديد
                </button>
                <button
                  onClick={onOpenNewMember}
                  className="px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  تسجيل منخرط رقمي
                </button>
              </>
            )}
            {role === 'manager' && (
              <button
                onClick={() => nextActivity && openQRAttendanceModal(nextActivity)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <QrCode className="w-4 h-4" />
                فتح شاشة حضور QR
              </button>
            )}
            {role === 'member' && (
              <button
                onClick={() => setActiveTab('portal')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                عرض بطاقتي الرقمية ومشاركاتي
              </button>
            )}
            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              توليد التقرير السداسي
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Tabular figures, single elevation, 60-30-10) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => setActiveTab('members')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">المنخرطون النشطون</span>
            <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
              {activeMembers}
            </span>
            <span className="text-xs text-slate-500">/ {totalMembers} مسجل</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>نسبة التجديد: 94%</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => setActiveTab('activities')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">النشاطات المبرمجة والمنجزة</span>
            <Calendar className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
              {completedCount + scheduledCount}
            </span>
            <span className="text-xs text-slate-500 font-mono-num">
              ({completedCount} مكتمل · {scheduledCount} مبرمج)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>معدل الحضور: 88%</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => setActiveTab('program')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">تنفيذ البرنامج السنوي</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-emerald-700">
              {annualExecutionRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono-num">
              {totalCompletedActivities}/{totalTargetActivities} نشاطاً
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${annualExecutionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => setActiveTab('projects')}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">المشاريع الشبابية الجارية</span>
            <FolderOpen className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
              {ongoingProjects}
            </span>
            <span className="text-xs text-slate-500 font-mono-num">مشاريع استراتيجية</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>متوسط الإنجاز: 78%</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          </div>
        </div>
      </div>

      {/* Smart Alerts Radar Banner (Auto-alerts for upcoming activities & overdue reports) */}
      {smartNotifications.filter((n) => n.severity === 'critical').length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white border border-rose-800/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/50">
                  رادار التنبيهات الذكي التلقائي
                </span>
                <span className="text-[11px] text-slate-400 font-mono-num">
                  {smartNotifications.filter((n) => n.severity === 'critical').length} تنبيهات استعجالية للمكتب والمسؤولين
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                تم رصد نشاط ميداني يقترب موعده خلال الساعات القادمة وتأخر في إيداع التقرير النهائي لمشروع شبابي.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => {
                const firstCrit = smartNotifications.find((n) => n.severity === 'critical');
                if (firstCrit) {
                  markNotificationAsRead(firstCrit.id);
                  setActiveTab(firstCrit.actionTab);
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <span>معالجة التنبيهات العاجلة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Data Visualization Section (Recharts) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                المؤشرات البيانية والتحليل التفاعلي لنشاط الجمعية
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              تتبع ديناميكية نمو المنخرطين ومعدلات الإقبال والحضور الميداني في الأنشطة عبر الزمن
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setActiveChartMetric('both')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeChartMetric === 'both'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                عرض شامل
              </button>
              <button
                onClick={() => setActiveChartMetric('members')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeChartMetric === 'members'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                نمو المنخرطين
              </button>
              <button
                onClick={() => setActiveChartMetric('participation')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeChartMetric === 'participation'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                حضور الأنشطة
              </button>
            </div>

            {/* Time Filter */}
            <select
              value={selectedChartRange}
              onChange={(e) => setSelectedChartRange(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="all">موسم 2026 كامل</option>
              <option value="recent">الأنشطة والشهور الأخيرة</option>
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Member Growth Over Time */}
          {(activeChartMetric === 'both' || activeChartMetric === 'members') && (
            <div
              className={`p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-4 text-right ${
                activeChartMetric === 'members' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    تطور نمو قاعدة المنخرطين وتوسع العضوية (شهرياً)
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    تدرج المنخرطين الجدد والمتطوعين منذ بداية السنة الجمعوية 2026
                  </div>
                </div>
                <div className="text-left font-mono-num">
                  <span className="text-xs font-bold text-emerald-700">
                    +{Math.round(((184 - 45) / 45) * 100)}%
                  </span>
                  <div className="text-[10px] text-slate-400">نسبة النمو الكلية</div>
                </div>
              </div>

              {/* Responsive Area Chart */}
              <div className="h-64 w-full pt-2" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={memberGrowthData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="memberGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="volunteerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const total = payload.find((p) => p.dataKey === 'total')?.value;
                          const volunteers = payload.find((p) => p.dataKey === 'volunteers')?.value;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-right text-xs space-y-1.5 border border-slate-700">
                              <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                                {label}
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num">
                                <span className="text-emerald-400 font-bold">{total} منخرط</span>
                                <span className="text-slate-400">إجمالي المسجلين:</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num">
                                <span className="text-sky-400 font-bold">{volunteers} متطوع</span>
                                <span className="text-slate-400">فوج المتطوعين:</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="إجمالي المنخرطين"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#memberGrowthGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="volunteers"
                      name="المتطوعون الميدانيون"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#volunteerGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Footnote Summary */}
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono-num">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    إجمالي المنخرطين (184)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                    فوج المتطوعين (92)
                  </span>
                </div>
                <span>الهدف السنوي: 215 منخرط</span>
              </div>
            </div>
          )}

          {/* Chart 2: Activity Participation Trends */}
          {(activeChartMetric === 'both' || activeChartMetric === 'participation') && (
            <div
              className={`p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-4 text-right ${
                activeChartMetric === 'participation' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ActivityIcon className="w-4 h-4 text-sky-600" />
                    اتجاهات الإقبال والحضور الفعلي بالأنشطة (مسجل vs حاضر)
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    مقارنة عدد المقاعد المحجوزة بالحضور الفعلي المؤكد بـ QR Code
                  </div>
                </div>
                <div className="text-left font-mono-num">
                  <span className="text-xs font-bold text-sky-700">92%</span>
                  <div className="text-[10px] text-slate-400">متوسط الحضور الفعلي</div>
                </div>
              </div>

              {/* Responsive Bar Chart */}
              <div className="h-64 w-full pt-2" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={participationData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="activity"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const reg = payload.find((p) => p.dataKey === 'registered')?.value;
                          const att = payload.find((p) => p.dataKey === 'attended')?.value;
                          const rate = payload[0]?.payload?.attendanceRate;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-right text-xs space-y-1.5 border border-slate-700">
                              <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                                {label}
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num">
                                <span className="text-slate-300 font-bold">{reg} مسجلاً</span>
                                <span className="text-slate-400">المسجلون:</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num">
                                <span className="text-emerald-400 font-bold">{att} حاضراً</span>
                                <span className="text-slate-400">الحضور الفعلي:</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num pt-1 border-t border-slate-800">
                                <span className="text-amber-400 font-bold">{rate}%</span>
                                <span className="text-slate-400">نسبة الالتزام:</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="registered"
                      name="المسجلون في النشاط"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="attended"
                      name="الحاضرون المؤكدون"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Footnote Summary */}
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono-num">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" />
                    المسجلين
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                    الحاضرين الفعليين (QR)
                  </span>
                </div>
                <span>أعلى نسبة حضور: 100% (قافلة الحقيبة المدرسية)</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Activity Spotlight (2 cols on lg) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">
                النشاط القادم خلال الأيام المقبلة
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('activities')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              عرض كل النشاطات
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextActivity && (
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative">
                <img
                  src={nextActivity.image || INITIAL_TECH_IMAGE}
                  alt={nextActivity.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 text-white font-mono-num text-[10px] px-2 py-0.5 rounded">
                  {nextActivity.code}
                </div>
              </div>

              <div className="flex-1 space-y-2 text-right">
                <div className="text-xs text-slate-500 font-mono-num flex items-center gap-2">
                  <span>{nextActivity.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{nextActivity.time}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer">
                  {nextActivity.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {nextActivity.goal}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {nextActivity.venue}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>المسؤول: {nextActivity.coordinatorName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num font-semibold text-slate-700">
                    {nextActivity.participants.length} / {nextActivity.maxSeats} مقعداً
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => openQRAttendanceModal(nextActivity)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    عرض رمز QR للحضور
                  </button>
                  <button
                    onClick={() => setActiveTab('activities')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    بطاقة التوصيف واللوجستيك
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Automated Smart Notifications & Urgent Tasks for Managers */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>التنبيهات الذكية التلقائية للمسؤولين</span>
            </h2>
            <span className="text-[11px] font-mono-num px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {smartNotifications.length} تنبيهات نشطة
            </span>
          </div>

          <div className="space-y-3">
            {smartNotifications.slice(0, 3).map((notif) => {
              const isReport =
                notif.category === 'overdue_project_report' || notif.category === 'overdue_activity_report';
              const isCritical = notif.severity === 'critical';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-colors text-right space-y-2 ${
                    isCritical
                      ? 'bg-rose-50/60 border-rose-200/90'
                      : 'bg-amber-50/50 border-amber-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isReport
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isReport ? <FileWarning className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {notif.category === 'upcoming_activity'
                        ? 'اقتراب موعد نشاط'
                        : 'تأخر تقرير نهائي لمشروع'}
                    </span>
                    <span className="text-[10px] font-mono-num text-slate-500">
                      {notif.timestamp}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {notif.title}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {notif.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    {notif.dueDate && (
                      <span className="text-[10px] text-slate-500 font-mono-num">
                        الاستحقاق: <strong className="text-slate-800">{notif.dueDate}</strong>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        setActiveTab(notif.actionTab);
                      }}
                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
                    >
                      <span>{notif.actionLabel}</span>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {smartNotifications.length === 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center text-xs space-y-1">
                <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
                <div className="font-bold">كافة الاستحقاقات منتظمة</div>
                <p className="text-[11px] text-emerald-700">لا توجد أنشطة قريبة بحاجة لتدخل أو تقارير متأخرة.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Annual Program Axes Progress Bar Breakdown */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              محاور البرنامج السنوي ومعدلات الإنجاز التراكمية
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة المؤشرات الميدانية المعتمدة في الجمعية العامة لسنة 2026
            </p>
          </div>
          <button
            onClick={() => setActiveTab('program')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            التفاصيل الكاملة للبرنامج ←
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {programAxes.map((axis) => (
            <div
              key={axis.id}
              onClick={() => setActiveTab('program')}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition-colors cursor-pointer space-y-2 text-right"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-num text-[11px] text-slate-400">{axis.code}</span>
                <span className="font-mono-num font-bold text-slate-800">
                  {axis.overallProgress}%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                {axis.name}
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${axis.overallProgress}%`,
                    backgroundColor: axis.color,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between font-mono-num">
                <span>المنجز: {axis.completedActivities}</span>
                <span>المستهدف: {axis.targetActivities}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Association Activity Gallery & Reports Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Gallery Spotlight */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              معرض الأنشطة والمبادرات الميدانية الأخيرة
            </h2>
            <span className="text-xs text-slate-500">توثيق بالصور الحية</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group relative">
              <div className="h-44 overflow-hidden">
                <img
                  src={INITIAL_ACTION_IMAGE}
                  alt="حملة التشجير شبانشة تتنفس أخضر"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 text-right bg-white space-y-1">
                <div className="text-[11px] text-slate-500 font-mono-num">
                  الحملة البيئية · 60 متطوعاً
                </div>
                <div className="text-xs font-bold text-slate-800">
                  حملة "شبانشة تتنفس أخضر" وغرس 300 شجرة
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group relative">
              <div className="h-44 overflow-hidden">
                <img
                  src={INITIAL_TECH_IMAGE}
                  alt="ورشة الذكاء الاصطناعي والتطوير"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 text-right bg-white space-y-1">
                <div className="text-[11px] text-slate-500 font-mono-num">
                  الابتكار والتقنية · المخبر الذكي
                </div>
                <div className="text-xs font-bold text-slate-800">
                  ورشة الذكاء الاصطناعي التوليدي وتمكين الشباب
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Report Access & Documentation */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">الوثائق والتقارير المعتمدة</h2>
            <button
              onClick={() => setActiveTab('documents')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              المكتبة ←
            </button>
          </div>

          <div className="space-y-2.5">
            <div
              onClick={() => setActiveTab('documents')}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-right flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">القانون الأساسي المعدل</div>
                <div className="text-[10px] text-slate-500">المرجع: SHB/LEG/2024/01 · 1.8 MB</div>
              </div>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>

            <div
              onClick={() => setActiveTab('reports')}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-right flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">التقرير الأدبي للسداسي الأول</div>
                <div className="text-[10px] text-slate-500">مصادق عليه من الجمعية العامة</div>
              </div>
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            </div>

            <div
              onClick={() => setActiveTab('documents')}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-right flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">اتفاقية الشراكة مع دار الشباب</div>
                <div className="text-[10px] text-slate-500">استغلال القاعات والمسرح</div>
              </div>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
