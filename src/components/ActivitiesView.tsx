import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Sparkles,
  FileCheck,
  Star,
  CheckSquare,
  Square,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity, LogisticsItem } from '../types';
import { INITIAL_TECH_IMAGE, INITIAL_ACTION_IMAGE } from '../data/initialData';

interface ActivitiesViewProps {
  onOpenNewActivityModal: () => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ onOpenNewActivityModal }) => {
  const {
    activities,
    updateLogisticsItem,
    addLogisticsItem,
    recordAttendance,
    saveActivityReport,
    openQRAttendanceModal,
    members,
    role,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Logistics form state
  const [newLogisticsItem, setNewLogisticsItem] = useState('');
  const [newLogisticsQty, setNewLogisticsQty] = useState('');

  // Report form state
  const [evalScore, setEvalScore] = useState<number>(9);
  const [reportSummary, setReportSummary] = useState('');
  const [newResultText, setNewResultText] = useState('');
  const [resultsList, setResultsList] = useState<string[]>([]);

  const filteredActivities = activities.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const handleOpenDetailModal = (act: Activity) => {
    setSelectedActivity(act);
    setEvalScore(act.evaluationScore || 9);
    setReportSummary(act.finalReportSummary || '');
    setResultsList(act.results || []);
  };

  const handleAddLogistics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !newLogisticsItem.trim()) return;
    addLogisticsItem(selectedActivity.id, {
      item: newLogisticsItem.trim(),
      quantity: newLogisticsQty.trim() || '1',
      status: 'pending',
      assignedTo: selectedActivity.coordinatorName,
    });
    setNewLogisticsItem('');
    setNewLogisticsQty('');

    // Keep active modal fresh
    const updated = activities.find((a) => a.id === selectedActivity.id);
    if (updated) setSelectedActivity(updated);
  };

  const handleSaveReport = () => {
    if (!selectedActivity) return;
    saveActivityReport(
      selectedActivity.id,
      evalScore,
      reportSummary,
      resultsList.length > 0 ? resultsList : selectedActivity.results || []
    );
    const updated = activities.find((a) => a.id === selectedActivity.id);
    if (updated) setSelectedActivity(updated);
  };

  const handleAddResultItem = () => {
    if (!newResultText.trim()) return;
    setResultsList([...resultsList, newResultText.trim()]);
    setNewResultText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            إدارة وتتبع النشاطات الجمعوية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            بطاقات التوصيف، اللوجستيك، قوائم الحضور الذكية، والتقارير الختامية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role !== 'member' && (
            <button
              onClick={onOpenNewActivityModal}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              إنشاء بطاقة نشاط جديد
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Metadata bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: `كل النشاطات (${activities.length})` },
              { id: 'مبرمج', label: `مبرمج (${activities.filter((a) => a.status === 'مبرمج').length})` },
              { id: 'جاري', label: `جاري (${activities.filter((a) => a.status === 'جاري').length})` },
              { id: 'مكتمل', label: `مكتمل (${activities.filter((a) => a.status === 'مكتمل').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono-num">
            إجمالي المسجلين: {activities.reduce((acc, a) => acc + a.participants.length, 0)} مشاركاً
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => {
          const attendedCount = act.participants.filter((p) => p.attended).length;
          const attendancePercent =
            act.participants.length > 0
              ? Math.round((attendedCount / act.participants.length) * 100)
              : 0;

          return (
            <div
              key={act.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image & Code */}
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={act.image || INITIAL_TECH_IMAGE}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono-num px-2 py-0.5 rounded">
                    {act.code}
                  </div>
                  {/* Smart deadline warning badge */}
                  {(() => {
                    const cur = new Date('2026-09-26');
                    const target = new Date(act.date);
                    const diffDays = Math.ceil((target.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
                    if ((act.status === 'مبرمج' || act.status === 'جاري') && diffDays >= 0 && diffDays <= 3) {
                      return (
                        <div className="absolute top-2 left-2 bg-rose-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1 animate-pulse">
                          <span>موعد وشيك: خلال {diffDays === 0 ? 'اليوم' : diffDays === 1 ? 'الغد' : `${diffDays} أيام`}</span>
                        </div>
                      );
                    }
                    if ((act.status === 'مبرمج' || act.status === 'جاري') && diffDays > 3 && diffDays <= 10) {
                      return (
                        <div className="absolute top-2 left-2 bg-amber-600/90 text-white font-semibold text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <span>متبقي {diffDays} أيام</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="absolute bottom-2 right-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs ${
                        act.status === 'مكتمل'
                          ? 'bg-emerald-900/80 text-emerald-200'
                          : act.status === 'جاري'
                          ? 'bg-sky-900/80 text-sky-200'
                          : 'bg-amber-900/80 text-amber-200'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 text-right">
                  <div className="text-[11px] font-mono-num text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.date}</span>
                    <span aria-hidden="true">·</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.time}</span>
                  </div>

                  <h3
                    onClick={() => handleOpenDetailModal(act)}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                  >
                    {act.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {act.goal}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{act.venue}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>المسؤول: <strong>{act.coordinatorName}</strong></span>
                      <span className="font-mono-num text-slate-700">
                        {act.participants.length} / {act.maxSeats} مقعداً
                      </span>
                    </div>
                  </div>

                  {/* Attendance mini-bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono-num">
                      <span>حضور: {attendedCount}/{act.participants.length}</span>
                      <span className="font-bold text-emerald-700">{attendancePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${attendancePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openQRAttendanceModal(act)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="عرض شاشة QR لتسجيل حضور المشاركين"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  حضور QR
                </button>

                <button
                  onClick={() => handleOpenDetailModal(act)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  بطاقة النشاط
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Detailed Modal (بطاقة النشاط واللوجستيك والتقرير) */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl text-right animate-in fade-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono-num text-slate-500">
                  <span>{selectedActivity.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">{selectedActivity.status}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedActivity.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openQRAttendanceModal(selectedActivity)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  فتح كود QR
                </button>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              {/* Section 1: Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500">الهدف من النشاط:</span>
                    <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">{selectedActivity.goal}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">الفئة المستهدفة:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedActivity.targetAudience}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">التاريخ والتوقيت:</span>
                    <span className="font-mono-num font-semibold text-slate-800">
                      {selectedActivity.date} ({selectedActivity.time})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">المكان والمرفق:</span>
                    <span className="font-semibold text-slate-800">{selectedActivity.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">المسؤول عن النشاط:</span>
                    <span className="font-semibold text-emerald-800">{selectedActivity.coordinatorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">الفريق المكلف:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedActivity.teamMembers.join('، ') || 'المكتب التنفيذي'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Logistics & Equipment Needs (الوسائل والاحتياجات) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    الوسائل والاحتياجات اللوجستية للنشاط
                  </h3>
                  <span className="text-xs text-slate-500 font-mono-num">
                    {selectedActivity.logistics.filter((l) => l.status === 'ready').length} / {selectedActivity.logistics.length} جاهز
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedActivity.logistics.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            const nextStatus = item.status === 'ready' ? 'pending' : 'ready';
                            updateLogisticsItem(selectedActivity.id, { ...item, status: nextStatus });
                            const updated = activities.find((a) => a.id === selectedActivity.id);
                            if (updated) setSelectedActivity(updated);
                          }}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {item.status === 'ready' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <span className={item.status === 'ready' ? 'line-through text-slate-400 font-medium' : 'font-medium text-slate-800'}>
                          {item.item}
                        </span>
                        {item.quantity && (
                          <span className="text-[11px] text-slate-500 font-mono-num">
                            ({item.quantity})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          المسؤول: {item.assignedTo || selectedActivity.coordinatorName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.status === 'ready'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.status === 'ready' ? 'جاهز' : item.status === 'pending' ? 'قيد التوفير' : 'مطلوب توفيره'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add logistics form */}
                <form onSubmit={handleAddLogistics} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newLogisticsItem}
                    onChange={(e) => setNewLogisticsItem(e.target.value)}
                    placeholder="إضافة وسيلة أو مستلزم جديد..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-slate-800"
                  />
                  <input
                    type="text"
                    value={newLogisticsQty}
                    onChange={(e) => setNewLogisticsQty(e.target.value)}
                    placeholder="الكمية"
                    className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    إضافة
                  </button>
                </form>
              </div>

              {/* Section 3: Participants Roster & Attendance Tracking */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    قائمة المسجلين والحضور الفعلي
                  </h3>
                  <div className="text-xs text-slate-500 font-mono-num flex items-center gap-2">
                    <span>المسجلين: {selectedActivity.participants.length}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-bold">
                      الحاضرين: {selectedActivity.participants.filter((p) => p.attended).length}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-600 font-bold">
                      الغائبين: {selectedActivity.participants.filter((p) => !p.attended).length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3">الاسم والرمز</th>
                        <th className="py-2.5 px-3">نوع العضوية</th>
                        <th className="py-2.5 px-3">تاريخ التسجيل</th>
                        <th className="py-2.5 px-3">حالة الحضور</th>
                        <th className="py-2.5 px-3 text-center">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedActivity.participants.map((part) => (
                        <tr key={part.memberId} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {part.memberName}{' '}
                            <span className="font-mono-num text-[11px] text-slate-400">
                              ({part.memberCode})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{part.memberType}</td>
                          <td className="py-2.5 px-3 font-mono-num text-slate-500">{part.registeredAt}</td>
                          <td className="py-2.5 px-3">
                            {part.attended ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono-num text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                حاضر ({part.checkInTime || 'تم التسجيل'})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">لم يسجل بعد</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {!part.attended ? (
                              <button
                                onClick={() => {
                                  recordAttendance(selectedActivity.id, part.memberId);
                                  const updated = activities.find((a) => a.id === selectedActivity.id);
                                  if (updated) setSelectedActivity(updated);
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors"
                              >
                                تأكيد الحضور الآن
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">مؤكد ✓</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {selectedActivity.participants.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            لم يسجل أي مشارك في هذا النشاط حتى الآن
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Results, Evaluation & Final Report Summary */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    تقييم النشاط والتقرير النهائي
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">علامة التقييم:</span>
                    <div className="flex items-center gap-1">
                      {[7, 8, 9, 10].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setEvalScore(score)}
                          className={`w-6 h-6 rounded text-xs font-bold font-mono-num transition-colors ${
                            evalScore === score
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    النتائج المحققة (المخرجات الميدانية):
                  </label>
                  <div className="space-y-1.5">
                    {resultsList.map((res, i) => (
                      <div key={i} className="text-xs bg-slate-50 p-2 rounded border border-slate-200/80 flex items-center justify-between">
                        <span>• {res}</span>
                        <button
                          onClick={() => setResultsList(resultsList.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newResultText}
                      onChange={(e) => setNewResultText(e.target.value)}
                      placeholder="أضف نتيجة أو أثراً محققاً..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddResultItem}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      إضافة نتيجة
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    ملخص التقرير النهائي للنشاط:
                  </label>
                  <textarea
                    rows={3}
                    value={reportSummary}
                    onChange={(e) => setReportSummary(e.target.value)}
                    placeholder="اكتب خلاصة تنفيذ النشاط، الصعوبات المواجهة، والتوصيات للنشاطات القادمة..."
                    className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveReport}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    حفظ واعتماد التقرير النهائي للنشاط
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
