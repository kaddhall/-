import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  Award,
  ListTodo,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member, MemberType, ClubDomain } from '../types';
import { QRCodeSVG } from '../utils/qrGenerator';

interface MembersViewProps {
  onOpenNewMemberModal: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ onOpenNewMemberModal }) => {
  const { members, updateMember, activities, role } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [activeMemberModal, setActiveMemberModal] = useState<Member | null>(null);
  const [showCardModal, setShowCardModal] = useState<Member | null>(null);

  const memberTypes: MemberType[] = ['عضو مكتب', 'مسؤول نشاط', 'مؤطر', 'متطوع', 'منخرط'];
  const clubDomains: ClubDomain[] = [
    'الابتكار والتقنية',
    'البيئة والتنمية المستدامة',
    'الثقافة والفنون',
    'العمل التطوعي والخيري',
    'الإعلام والتواصل',
    'الرياضة',
  ];

  // Filtering
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.occupation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || m.memberType === selectedType;
    const matchesClub = selectedClub === 'all' || m.club === selectedClub;

    return matchesSearch && matchesType && matchesClub;
  });

  const handleExportCSV = () => {
    const headers = ['الرمز', 'الاسم الكامل', 'نوع العضوية', 'النادي', 'رقم الهاتف', 'البريد', 'نسبة الحضور', 'ساعات التطوع'];
    const rows = filteredMembers.map((m) => [
      m.code,
      m.name,
      m.memberType,
      m.club,
      m.phone,
      m.email,
      `${m.attendanceRate}%`,
      m.volunteerHours,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shabansha_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleTask = (member: Member, taskId: string) => {
    const updatedTasks = member.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updated = { ...member, tasks: updatedTasks };
    updateMember(updated);
    if (activeMemberModal?.id === member.id) {
      setActiveMemberModal(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            إدارة المنخرطين والملفات الرقمية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            سجل أعضاء جمعية +: منخرطين، متطوعين، مؤطرين، وأعضاء المكتب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            تصدير Excel/CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap no-print"
          >
            <Printer className="w-4 h-4" />
            طباعة القائمة
          </button>
          {role === 'admin' && (
            <button
              onClick={onOpenNewMemberModal}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              إضافة منخرط جديد
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم، رمز العضوية (SHB-...)، رقم الهاتف أو المهنة..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-slate-800"
            />
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 shrink-0"
          >
            <option value="all">كل أصناف العضوية ({members.length})</option>
            {memberTypes.map((t) => (
              <option key={t} value={t}>
                {t} ({members.filter((m) => m.memberType === t).length})
              </option>
            ))}
          </select>

          {/* Club filter */}
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 shrink-0"
          >
            <option value="all">كافة النوادي واللجان</option>
            {clubDomains.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Unboxed Metadata Stats */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>النتائج المعروضة: <strong className="font-mono-num text-slate-800">{filteredMembers.length}</strong> منخرطاً</span>
          <span aria-hidden="true">·</span>
          <span>متوسط الالتزام بالحضور: <strong className="font-mono-num text-emerald-700">89%</strong></span>
          <span aria-hidden="true">·</span>
          <span>إجمالي ساعات التطوع الميداني: <strong className="font-mono-num text-slate-800">{members.reduce((acc, m) => acc + m.volunteerHours, 0)} ساعة</strong></span>
        </div>
      </div>

      {/* Members High-Density Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">المنخرط والرمز</th>
                <th className="py-3 px-4">نوع العضوية</th>
                <th className="py-3 px-4">النادي / المجال</th>
                <th className="py-3 px-4">تاريخ الانخراط</th>
                <th className="py-3 px-4 text-center">نسبة الحضور</th>
                <th className="py-3 px-4 text-center">ساعات التطوع</th>
                <th className="py-3 px-4 text-center">النشاطات</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => setActiveMemberModal(member)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {member.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {member.name}
                        </div>
                        <div className="text-[11px] font-mono-num text-slate-400">
                          {member.code} · {member.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {member.memberType}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {member.club}
                  </td>

                  <td className="py-3.5 px-4 font-mono-num text-slate-500">
                    {member.joinDate}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono-num font-bold text-emerald-700">
                      {member.attendanceRate}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-700">
                    {member.volunteerHours} س
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono-num font-semibold text-slate-800">
                    {member.activitiesCount}
                  </td>

                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setActiveMemberModal(member)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                        title="عرض الملف الرقمي"
                      >
                        الملف
                      </button>
                      <button
                        onClick={() => setShowCardModal(member)}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-[11px] transition-colors flex items-center gap-1"
                        title="بطاقة العضوية الذكية"
                      >
                        <QrCode className="w-3 h-3" />
                        البطاقة
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium">لا توجد نتائج مطابقة لخيارات البحث</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                        setSelectedClub('all');
                      }}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Drawer/Modal (الملف الرقمي المتكامل) */}
      {activeMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl text-right animate-in fade-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xl shadow-xs">
                  {activeMemberModal.name.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeMemberModal.name}</h2>
                  <div className="text-xs text-slate-500 font-mono-num mt-1 flex items-center gap-2">
                    <span>{activeMemberModal.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeMemberModal.memberType}</span>
                    <span aria-hidden="true">·</span>
                    <span>نادي {activeMemberModal.club}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCardModal(activeMemberModal)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  طباعة البطاقة الرقمية
                </button>
                <button
                  onClick={() => setActiveMemberModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500">نسبة الحضور</div>
                  <div className="text-lg font-bold font-mono-num text-emerald-700">
                    {activeMemberModal.attendanceRate}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500">ساعات التطوع</div>
                  <div className="text-lg font-bold font-mono-num text-slate-800">
                    {activeMemberModal.volunteerHours} س
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500">النشاطات المكتملة</div>
                  <div className="text-lg font-bold font-mono-num text-slate-800">
                    {activeMemberModal.activitiesCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] text-slate-500">الشهادات المكتسبة</div>
                  <div className="text-lg font-bold font-mono-num text-amber-600">
                    {activeMemberModal.certificates.length}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  البيانات الأساسية والهوية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">رقم الهاتف:</span>{' '}
                    <span className="font-mono-num font-semibold text-slate-800">{activeMemberModal.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">البريد الإلكتروني:</span>{' '}
                    <span className="font-mono-num text-slate-800">{activeMemberModal.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">المهنة / الدراسة:</span>{' '}
                    <span className="text-slate-800 font-medium">{activeMemberModal.occupation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">تاريخ الانخراط:</span>{' '}
                    <span className="font-mono-num text-slate-800">{activeMemberModal.joinDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">تاريخ الميلاد:</span>{' '}
                    <span className="font-mono-num text-slate-800">{activeMemberModal.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">زمرة الدم:</span>{' '}
                    <span className="font-mono-num font-bold text-rose-600">{activeMemberModal.bloodGroup || 'غير محدد'}</span>
                  </div>
                </div>
                {activeMemberModal.bio && (
                  <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {activeMemberModal.bio}
                  </div>
                )}
              </div>

              {/* Assigned Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-sky-600" />
                    المهام المسندة والتكليفات الميدانية
                  </h3>
                  <span className="text-xs text-slate-500">
                    {activeMemberModal.tasks.filter((t) => t.completed).length} / {activeMemberModal.tasks.length} منجزة
                  </span>
                </div>

                {activeMemberModal.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {activeMemberModal.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(activeMemberModal, task.id)}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                          task.completed
                            ? 'bg-slate-50/70 border-slate-100 text-slate-400 line-through'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {}}
                            className="rounded text-emerald-600"
                          />
                          <span className={task.completed ? 'line-through text-slate-400' : 'font-medium'}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono-num text-slate-500">
                          <span>تاريخ الاستحقاق: {task.dueDate}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                            task.priority === 'عاجل' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg">
                    لا توجد مهام مسندة حالياً لهذا العضو
                  </p>
                )}
              </div>

              {/* Certificates */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  الشهادات التقديرية والمساهمات
                </h3>

                {activeMemberModal.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeMemberModal.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 rounded-lg border border-amber-200/60 bg-amber-50/40 space-y-1 text-right"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono-num text-slate-500">{cert.code}</span>
                          <span className="text-amber-800 font-semibold">{cert.type}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{cert.title}</div>
                        <div className="text-[11px] text-slate-600">{cert.activityName}</div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-amber-100 font-mono-num">
                          تاريخ الإصدار: {cert.issueDate}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg">
                    لم تسجل شهادات تكريمية بعد
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership Smart Card (بطاقة المنخرط الذكية للطباعة أو الحفظ) */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden text-right">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-900">
                بطاقة العضوية الذكية - جمعية +
              </span>
              <button
                onClick={() => setShowCardModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-4">
              {/* Actual printable card layout */}
              <div
                id="membership-card-print"
                className="w-full rounded-2xl p-5 border border-slate-800 text-white relative overflow-hidden shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
                }}
              >
                <div className="flex items-center justify-between text-right border-b border-white/20 pb-3">
                  <div>
                    <div className="text-[10px] text-emerald-300 font-medium">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                    <div className="text-sm font-bold text-white tracking-wide">جمعية + للتنمية والشباب</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                    ج+
                  </div>
                </div>

                <div className="py-4 flex items-center gap-4 text-right">
                  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/30 text-white font-bold flex items-center justify-center text-2xl shrink-0">
                    {showCardModal.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-base font-bold text-white leading-tight">
                      {showCardModal.name}
                    </div>
                    <div className="text-xs text-emerald-300 font-semibold">
                      {showCardModal.memberType} · نادي {showCardModal.club}
                    </div>
                    <div className="text-[11px] font-mono-num text-slate-300">
                      رقم العضوية: {showCardModal.code}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-300">
                  <div className="text-right">
                    <div>صالحة للموسم: 2026/2027</div>
                    <div className="font-mono-num">بتاريخ: {showCardModal.joinDate}</div>
                  </div>
                  <div className="bg-white p-1 rounded-md">
                    <QRCodeSVG
                      value={`SHABANSHA_MEMBER:${showCardModal.code}:${showCardModal.name}`}
                      size={54}
                      includeBadge={false}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  طباعة البطاقة الرسمية
                </button>
                <button
                  onClick={() => setShowCardModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
