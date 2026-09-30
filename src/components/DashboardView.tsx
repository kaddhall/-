import React, { useState } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  FolderOpen,
  ArrowUpRight,
  ChevronLeft,
  QrCode,
  FileSpreadsheet,
  PlusCircle,
  FileCheck,
  ShieldAlert,
  BarChart3,
  Clock,
  FileWarning,
  CheckCircle2,
  BellRing,
  Activity as ActivityIcon,
  ShieldCheck,
  Award,
  HeartHandshake,
  Check,
  Vote,
  Sparkles,
  Layers,
  MapPin,
  ListTodo,
  Boxes,
  UserCheck,
  ExternalLink,
  Kanban,
  KeyRound,
  Tag,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Activity, KanbanStatus, LogisticsItem } from '../types';
import {
  INITIAL_HERO_IMAGE,
  INITIAL_ACTION_IMAGE,
  INITIAL_TECH_IMAGE,
} from '../data/initialData';
import { QRCodeSVG } from '../utils/qrGenerator';

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
    currentMember,
    members,
    activities,
    programAxes,
    projects,
    projectTasks,
    updateProjectTaskStatus,
    smartNotifications,
    markNotificationAsRead,
    setActiveTab,
    openQRAttendanceModal,
    recordAttendance,
    verifyAttendancePin,
    toggleActivityEnrollment,
    updateLogisticsItem,
    polls,
    votePoll,
    announcements,
    role,
    setIsPermissionsModalOpen,
    addToast,
  } = useApp();

  // State for member quick PIN check-in on dashboard
  const [pinActId, setPinActId] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState<string>('');

  // General aggregation metrics
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'نشط').length;
  const scheduledCount = activities.filter((a) => a.status === 'مبرمج').length;
  const completedCount = activities.filter((a) => a.status === 'مكتمل').length;
  const ongoingProjects = projects.filter((p) => p.status === 'قيد التنفيذ').length;

  const totalTargetActivities = programAxes.reduce((acc, ax) => acc + ax.targetActivities, 0);
  const totalCompletedActivities = programAxes.reduce((acc, ax) => acc + ax.completedActivities, 0);
  const annualExecutionRate = Math.round((totalCompletedActivities / totalTargetActivities) * 100);

  // Next scheduled activity overall
  const nextActivity = activities.find((a) => a.status === 'مبرمج') || activities[0];

  // ================= MANAGER SPECIFIC CALCULATIONS =================
  // Activities managed by or involving the current user/manager
  const myActivities = activities.filter(
    (a) =>
      a.coordinatorId === currentMember.id ||
      a.coordinatorName === currentMember.name ||
      a.teamMembers.includes(currentMember.name)
  );
  const displayActivitiesForManager = myActivities.length > 0 ? myActivities : activities;
  const nextManagerActivity =
    displayActivitiesForManager.find((a) => a.status === 'مبرمج' || a.status === 'جاري') ||
    displayActivitiesForManager[0];

  // Logistics for manager's activities
  const allManagerLogistics: { act: Activity; item: LogisticsItem }[] = [];
  displayActivitiesForManager.forEach((act) => {
    act.logistics.forEach((item) => {
      allManagerLogistics.push({ act, item });
    });
  });
  const readyLogisticsCount = allManagerLogistics.filter((l) => l.item.status === 'ready').length;
  const totalLogisticsCount = allManagerLogistics.length || 1;
  const logisticsReadyPercentage = Math.round((readyLogisticsCount / totalLogisticsCount) * 100);

  // Kanban tasks assigned to manager
  const managerTasks = projectTasks.filter(
    (t) =>
      t.assignedTo === currentMember.name ||
      t.assignedTo === 'عبد القادر حليمي' ||
      t.assignedTo === 'مريم بن زيان'
  );
  const managerPendingTasksCount = managerTasks.filter((t) => t.status !== 'مكتمل').length;

  // Attendance metrics for manager's activities
  const myTotalRegistered = displayActivitiesForManager.reduce(
    (acc, a) => acc + a.participants.length,
    0
  );
  const myTotalAttended = displayActivitiesForManager.reduce(
    (acc, a) => acc + a.participants.filter((p) => p.attended).length,
    0
  );
  const myAttendancePercentage =
    myTotalRegistered > 0 ? Math.round((myTotalAttended / myTotalRegistered) * 100) : 92;

  // ================= MEMBER SPECIFIC CALCULATIONS =================
  const availableActivitiesToJoin = activities.filter((a) => a.status === 'مبرمج');
  const activePoll = polls[0];

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

  // Handle PIN check in
  const handleQuickPINSubmit = (activityId: string) => {
    if (!pinCode.trim()) return;
    const ok = verifyAttendancePin(activityId, pinCode, currentMember.id);
    if (ok) {
      setPinActId(null);
      setPinCode('');
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. ROLE-ADAPTIVE HERO BANNER                                   */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-sm">
        <div className="absolute inset-0">
          <img
            src={INITIAL_HERO_IMAGE}
            alt="جمعية + - فضاء العمل الجمعوي"
            className="w-full h-full object-cover opacity-35 filter brightness-90"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 max-w-3xl space-y-4 text-right">
          {/* Role badge */}
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            {role === 'admin' && (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>القيادة الاستراتيجية والرقابة العامة · الإدارة العامة (المكتب التنفيذي)</span>
              </>
            )}
            {role === 'manager' && (
              <>
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>لوحة القيادة الميدانية والتشغيلية · مسؤولو الأنشطة واللجان</span>
              </>
            )}
            {role === 'member' && (
              <>
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>فضاء العضوية والمشاركة الفعالة · منخرطو ومتطوعو جمعية +</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>الموسم الجمعوي 2026</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {role === 'admin' && 'الإشراف الشامل والمتابعة الاستراتيجية لكافة هيئات ومشاريع جمعية +'}
            {role === 'manager' && `مرحباً بك، ${currentMember.name} (مسؤول نشاط - ${currentMember.club})`}
            {role === 'member' && `أهلاً بك، ${currentMember.name} (رقم العضوية: ${currentMember.code})`}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {role === 'admin' &&
              'متابعة دقيقة للبرنامج السنوي، الرقابة على ميزانيات المشاريع، اعتماد سجلات المنخرطين، وإصدار التقارير الأدبية والمالية الرسمية.'}
            {role === 'manager' &&
              'إدارة الفعاليات الميدانية المسندة، التحقق من جاهزية العتاد واللوجستيك، تسجيل الحضور بـ QR Code، وتحريك مهام لوحة كانبان.'}
            {role === 'member' &&
              'استعرض بطاقتك الذكية، سجل في الأنشطة والمبادرات المفتوحة، وثق رصيد ساعاتك التطوعية، واستخرج شهاداتك التقديرية المعتمدة.'}
          </p>

          {/* Action buttons tailored by role */}
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
                <button
                  onClick={onOpenNewProject}
                  className="px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  إطلاق مشروع شبابي
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  توليد التقرير السداسي
                </button>
              </>
            )}

            {role === 'manager' && (
              <>
                <button
                  onClick={() => nextManagerActivity && openQRAttendanceModal(nextManagerActivity)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <QrCode className="w-4 h-4" />
                  فتح شاشة تسجيل حضور QR
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Kanban className="w-4 h-4 text-sky-400" />
                  لوحة كانبان لنقل المهام
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Boxes className="w-4 h-4 text-amber-400" />
                  فحص وتحديث العتاد
                </button>
              </>
            )}

            {role === 'member' && (
              <>
                <button
                  onClick={() => setActiveTab('portal')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <QrCode className="w-4 h-4" />
                  استعراض بطاقتي الذكية وشهاداتي
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  استكشاف الأنشطة المتاحة للتسجيل
                </button>
              </>
            )}

            {/* Universally visible Permissions Guide button */}
            <button
              onClick={() => setIsPermissionsModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>دليل ومصفوفة الصلاحيات</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAILORED PRIMARY KPI GRID ACCORDING TO USER ROLE            */}
      {/* ============================================================== */}
      {role === 'admin' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Admin KPI 1: Active Members */}
          <div
            onClick={() => setActiveTab('members')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs text-right"
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

          {/* Admin KPI 2: Activities */}
          <div
            onClick={() => setActiveTab('activities')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs text-right"
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

          {/* Admin KPI 3: Program Execution */}
          <div
            onClick={() => setActiveTab('program')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs text-right"
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

          {/* Admin KPI 4: Projects */}
          <div
            onClick={() => setActiveTab('projects')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs text-right"
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
      )}

      {role === 'manager' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Manager KPI 1: My activities */}
          <div
            onClick={() => setActiveTab('activities')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">أنشطتي المكلف بها</span>
              <Calendar className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                {displayActivitiesForManager.length}
              </span>
              <span className="text-xs text-slate-500 font-mono-num">نشاطات ميدانية</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{displayActivitiesForManager.filter((a) => a.status === 'مبرمج').length} بانتظار الانطلاق</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
            </div>
          </div>

          {/* Manager KPI 2: Logistics readiness */}
          <div
            onClick={() => setActiveTab('activities')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">جاهزية العتاد واللوجستيك</span>
              <Boxes className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-emerald-700">
                {logisticsReadyPercentage}%
              </span>
              <span className="text-xs text-slate-500 font-mono-num">
                {readyLogisticsCount} / {totalLogisticsCount} جاهز
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${logisticsReadyPercentage}%` }}
              />
            </div>
          </div>

          {/* Manager KPI 3: Kanban tasks */}
          <div
            onClick={() => setActiveTab('projects')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">مهام كانبان المسندة لي</span>
              <Kanban className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                {managerTasks.length}
              </span>
              <span className="text-xs text-slate-500 font-mono-num">مهام تنفيذية</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-amber-700 font-semibold">{managerPendingTasksCount} قيد المتابعة</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
            </div>
          </div>

          {/* Manager KPI 4: Attendees */}
          <div
            onClick={() => setActiveTab('activities')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">المشاركون والحضور الفعلي</span>
              <UserCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                {myTotalRegistered}
              </span>
              <span className="text-xs text-slate-500 font-mono-num">مسجلاً بأنشطتي</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>نسبة الالتزام بالـ QR: {myAttendancePercentage}%</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </div>
          </div>
        </div>
      )}

      {role === 'member' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Member KPI 1: Volunteer Hours */}
          <div
            onClick={() => setActiveTab('portal')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">ساعاتي التطوعية الموثقة</span>
              <HeartHandshake className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-emerald-700">
                {currentMember.volunteerHours}
              </span>
              <span className="text-xs text-slate-500">ساعة ميدانية</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>مساهمة فعالة في الجمعية</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
            </div>
          </div>

          {/* Member KPI 2: Attendance rate */}
          <div
            onClick={() => setActiveTab('portal')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">نسبة التزامي بالحضور</span>
              <CheckCircle2 className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                {currentMember.attendanceRate}%
              </span>
              <span className="text-xs text-slate-500">حضور مؤكد بـ QR</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentMember.attendanceRate}%` }}
              />
            </div>
          </div>

          {/* Member KPI 3: Certificates */}
          <div
            onClick={() => setActiveTab('portal')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">شهاداتي التقديرية</span>
              <Award className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                {currentMember.certificates.length}
              </span>
              <span className="text-xs text-slate-500">شهادات رسمية معتمدة</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>قابلة للمعاينة والطباعة</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
            </div>
          </div>

          {/* Member KPI 4: Available activities */}
          <div
            onClick={() => setActiveTab('activities')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs text-right"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">الأنشطة المتاحة للتسجيل</span>
              <Calendar className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                {availableActivitiesToJoin.length}
              </span>
              <span className="text-xs text-slate-500 font-mono-num">فعاليات مفتوحة</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">تسجيل فوري بضغطة زر</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. RADAR ALERTS BANNER (For Admins & Managers)                 */}
      {/* ============================================================== */}
      {(role === 'admin' || role === 'manager') &&
        smartNotifications.filter((n) => n.severity === 'critical').length > 0 && (
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
                    {smartNotifications.filter((n) => n.severity === 'critical').length} تنبيهات استعجالية
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  تم رصد نشاط ميداني يقترب موعده وتأخر في إيداع التقرير النهائي لمشروع أو نشاط جمعوي.
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

      {/* ============================================================== */}
      {/* 4. ROLE SPECIFIC FOCUSED WORKSPACES                           */}
      {/* ============================================================== */}

      {/* --- MANAGER SPECIFIC WORKSPACE --- */}
      {role === 'manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spotlight on Next Activity Managed with Quick Attendees & Logistics Checklist */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    النشاط الميداني القادم المكلف به
                  </h2>
                  <p className="text-xs text-slate-500">
                    تسجيل الحضور الآلي وإدارة لوجستيات النشاط مباشرة
                  </p>
                </div>
              </div>
              {nextManagerActivity && (
                <button
                  onClick={() => openQRAttendanceModal(nextManagerActivity)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>فتح شاشة الـ QR للحضور</span>
                </button>
              )}
            </div>

            {nextManagerActivity ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      {nextManagerActivity.title}
                    </span>
                    <span className="font-mono-num text-[11px] px-2 py-0.5 rounded bg-white border text-slate-600 font-semibold">
                      {nextManagerActivity.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {nextManagerActivity.goal}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-200/60 font-mono-num">
                    <span>التاريخ: {nextManagerActivity.date}</span>
                    <span>التوقيت: {nextManagerActivity.time}</span>
                    <span>الموقع: {nextManagerActivity.venue}</span>
                    <span className="text-emerald-700 font-bold">
                      المسجلون: {nextManagerActivity.participants.length} / {nextManagerActivity.maxSeats}
                    </span>
                  </div>
                </div>

                {/* Quick Logistics Inspector for Manager */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-amber-600" />
                      فحص جاهزية عتاد هذا النشاط (تعديل سريع لحظي):
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      انقر لتغيير الحالة فورياً
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {nextManagerActivity.logistics.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {item.item}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.quantity || 'طقم'} · المشرف: {item.assignedTo || 'المسؤول'}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const nextStatus =
                              item.status === 'ready'
                                ? 'pending'
                                : item.status === 'pending'
                                ? 'needed'
                                : 'ready';
                            updateLogisticsItem(nextManagerActivity.id, {
                              ...item,
                              status: nextStatus,
                            });
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 transition-colors ${
                            item.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : item.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {item.status === 'ready' && 'جاهز ✓'}
                          {item.status === 'pending' && 'قيد التحضير ⏳'}
                          {item.status === 'needed' && 'مطلوب ⚠'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Participants Attendance Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      تأكيد الحضور اليدوي للمشاركين المسجلين:
                    </span>
                    <button
                      onClick={() => setActiveTab('activities')}
                      className="text-emerald-700 hover:underline text-[11px] font-semibold"
                    >
                      كافة المشاركين ←
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {nextManagerActivity.participants.slice(0, 5).map((part) => (
                      <div
                        key={part.memberId}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {part.memberName.slice(0, 1)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{part.memberName}</span>
                            <span className="text-[10px] text-slate-500 font-mono-num mr-2">
                              {part.memberCode}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!part.attended) {
                              recordAttendance(nextManagerActivity.id, part.memberId);
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            part.attended
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-400'
                          }`}
                        >
                          {part.attended ? 'حاضر مؤكد ✓' : 'تأكيد الحضور'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد أنشطة ميدانية قادمة مسندة إليك حالياً.
              </div>
            )}
          </div>

          {/* Quick Kanban Tasks for Manager */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Kanban className="w-4 h-4 text-sky-600" />
                <span>مهام كانبان المسندة لي</span>
              </h2>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-sky-700 hover:underline font-semibold"
              >
                اللوحة الكاملة ←
              </button>
            </div>

            <div className="space-y-2.5">
              {managerTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2 text-right hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">{task.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'عاجل'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'متوسط'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {task.description || task.projectTitle}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono-num">
                      استحقاق: {task.dueDate}
                    </span>

                    {/* Quick status cycle button */}
                    <div className="flex items-center gap-1">
                      {(['قيد الانتظار', 'قيد التنفيذ', 'مكتمل'] as KanbanStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateProjectTaskStatus(task.id, st)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            task.status === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'قيد الانتظار' && 'انتظار'}
                          {st === 'قيد التنفيذ' && 'تنفيذ'}
                          {st === 'مكتمل' && 'تم ✓'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {managerTasks.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  لا توجد مهام كانبان مسندة حالياً.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MEMBER SPECIFIC WORKSPACE --- */}
      {role === 'member' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member's Digital Card & Quick QR Scanner Check-in Widget */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>بطاقة عضويتي الرقمية الذكية</span>
              </h2>
              <button
                onClick={() => setActiveTab('portal')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                طباعة البطاقة ←
              </button>
            </div>

            {/* Smart Digital Card Visual */}
            <div
              className="w-full rounded-2xl p-4 border border-slate-800 text-white relative overflow-hidden shadow-md text-right space-y-3"
              style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
              }}
            >
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div>
                  <div className="text-[9px] text-emerald-300">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                  <div className="text-xs font-bold text-white tracking-wide">جمعية + للتنمية والشباب</div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                  ج+
                </div>
              </div>

              <div className="py-1 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/30 text-white font-bold flex items-center justify-center text-lg shrink-0">
                  {currentMember.name.slice(0, 1)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="text-sm font-bold text-white leading-tight">
                    {currentMember.name}
                  </div>
                  <div className="text-[10px] text-emerald-300">
                    {currentMember.memberType} · {currentMember.club}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-300">
                    رقم العضوية: {currentMember.code}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-slate-300">
                <span>الموسم: 2026</span>
                <span className="text-emerald-400 font-bold">عضوية نشطة معتمدة ✓</span>
              </div>
            </div>

            {/* Quick Actions for Member */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('portal')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center transition-colors"
              >
                شهاداتي ({currentMember.certificates.length})
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold text-center transition-colors"
              >
                سجل حضوري
              </button>
            </div>
          </div>

          {/* Activities Open for Direct Enrollment for Member */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>أنشطة الجمعية المتاحة للتسجيل المباشر</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل الآن بضغطة زر أو أكد حضورك الفوري بالرمز السري (PIN)
                </p>
              </div>
              <button
                onClick={() => setActiveTab('activities')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                عرض كل الأنشطة ←
              </button>
            </div>

            <div className="space-y-3">
              {availableActivitiesToJoin.map((act) => {
                const isEnrolled = act.participants.some((p) => p.memberId === currentMember.id);
                const hasAttended = act.participants.some(
                  (p) => p.memberId === currentMember.id && p.attended
                );

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-emerald-300 transition-colors space-y-3 text-right"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{act.title}</h3>
                          <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-white border text-slate-500">
                            {act.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{act.goal}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isEnrolled ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                              {hasAttended ? 'تم تأكيد الحضور ✓' : 'أنت مسجل ✓'}
                            </span>
                            {!hasAttended && (
                              <button
                                onClick={() => setPinActId(act.id)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>إدخال PIN الحضور</span>
                              </button>
                            )}
                            <button
                              onClick={() => toggleActivityEnrollment(act.id, currentMember.id)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
                            >
                              إلغاء التسجيل
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleActivityEnrollment(act.id, currentMember.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
                          >
                            سجل الآن في النشاط
                          </button>
                        )}
                      </div>
                    </div>

                    {/* PIN input box if active */}
                    {pinActId === act.id && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                          <input
                            type="text"
                            maxLength={6}
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            placeholder="أدخل رمز الـ PIN المعروض في القاعة (مثال: 6149)"
                            className="flex-1 p-1.5 rounded-lg border border-amber-300 bg-white font-mono-num text-center text-sm font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleQuickPINSubmit(act.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                          >
                            تأكيد الحضور
                          </button>
                          <button
                            onClick={() => {
                              setPinActId(null);
                              setPinCode('');
                            }}
                            className="px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono-num">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {act.date} · {act.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {act.venue}
                        </span>
                      </div>
                      <span>
                        المقاعد المتاحة: {act.maxSeats - act.participants.length} من {act.maxSeats}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- Active Poll & Urgent Announcements (Especially for Members & Managers) --- */}
      {role === 'member' && activePoll && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  استطلاع رأي الجمعية: شارك بصوتك الآن
                </h3>
                <p className="text-xs text-slate-500">{activePoll.question}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              إجمالي الأصوات: {activePoll.totalVotes}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePoll.options.map((opt) => {
              const pct =
                activePoll.totalVotes > 0
                  ? Math.round((opt.votes / activePoll.totalVotes) * 100)
                  : 0;

              return (
                <button
                  key={opt.id}
                  onClick={() => votePoll(activePoll.id, opt.id)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-right space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-900">
                      {opt.text}
                    </span>
                    <span className="font-mono-num font-bold text-indigo-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-left font-mono-num">
                    {opt.votes} صوتاً
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. INTERACTIVE DATA VISUALIZATION SECTION (Recharts)           */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {role === 'admin'
                  ? 'المؤشرات البيانية والتحليل التفاعلي لنشاط الجمعية'
                  : role === 'manager'
                  ? 'مؤشرات الإقبال والمتابعة الميدانية للأنشطة'
                  : 'إحصائيات تفاعل ومشاركات المنخرطين في الأنشطة'}
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
                          const actv = payload.find((p) => p.dataKey === 'active')?.value;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-right text-xs space-y-1.5 border border-slate-700">
                              <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                                {label}
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num">
                                <span className="text-emerald-400 font-bold">{total} منخرط</span>
                                <span className="text-slate-400">إجمالي العضوية:</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num">
                                <span className="text-sky-400 font-bold">{volunteers} متطوع</span>
                                <span className="text-slate-400">فوج المتطوعين:</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono-num pt-1 border-t border-slate-800">
                                <span className="text-slate-300 font-bold">{actv} نشط</span>
                                <span className="text-slate-400">الاشتراك الساري:</span>
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
                      name="المتطوعون النشطون"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#volunteerGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Footnote Legend */}
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

      {/* ============================================================== */}
      {/* 6. NEXT ACTIVITY & SMART NOTIFICATIONS (For Admin)             */}
      {/* ============================================================== */}
      {role === 'admin' && (
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

          {/* Automated Smart Notifications & Urgent Tasks */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>التنبيهات الذكية للمكتب التنفيذي</span>
              </h2>
              <span className="text-[11px] font-mono-num px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {smartNotifications.length} نشطة
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
      )}

      {/* ============================================================== */}
      {/* 7. ANNUAL PROGRAM AXES BREAKDOWN (For Admin & Executive)      */}
      {/* ============================================================== */}
      {role === 'admin' && (
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
      )}

      {/* ============================================================== */}
      {/* 8. CALLOUT: PERMISSIONS MATRIX PROMPT CARD                    */}
      {/* ============================================================== */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-right">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                دليل ومصفوفة الصلاحيات المعتمدة في جمعية +
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60 font-semibold">
                الإدارة العامة · مسؤول النشاط · المنخرط
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              تعرّف بدقة على صلاحيات كل وظيفة بالجمعية: ما يستطيع فعله، معاينته، والتحكم فيه وما يُعرض له في لوحة القيادة حسب لوائح الجمعية.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPermissionsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap flex items-center gap-2 self-stretch md:self-auto justify-center"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>فتح دليل ومصفوفة الصلاحيات</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 9. GALLERY & OFFICIAL DOCUMENTATION                            */}
      {/* ============================================================== */}
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
                  alt="حملة التشجير البيئية الكبرى"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 text-right bg-white space-y-1">
                <div className="text-[11px] text-slate-500 font-mono-num">
                  الحملة البيئية · 60 متطوعاً
                </div>
                <div className="text-xs font-bold text-slate-800">
                  حملة "جمعية + تتنفس أخضر" وغرس 300 شجرة
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
                <div className="text-xs font-bold text-slate-800">القانون الأساسي لجمعية +</div>
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
