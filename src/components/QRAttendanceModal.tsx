import React, { useState } from 'react';
import {
  X,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from '../utils/qrGenerator';

export const QRAttendanceModal: React.FC = () => {
  const {
    activeQRActivity,
    closeQRAttendanceModal,
    recordAttendance,
    members,
    activities,
  } = useApp();

  const [selectedSimMemberId, setSelectedSimMemberId] = useState(members[3]?.id || members[0]?.id);

  if (!activeQRActivity) return null;

  // Re-fetch latest state for active activity
  const currentAct = activities.find((a) => a.id === activeQRActivity.id) || activeQRActivity;

  const totalRegistered = currentAct.participants.length;
  const attendedCount = currentAct.participants.filter((p) => p.attended).length;
  const absentCount = totalRegistered - attendedCount;
  const attendanceRate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  const handleSimulateScan = () => {
    if (selectedSimMemberId) {
      recordAttendance(currentAct.id, selectedSimMemberId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-slate-200 shadow-2xl text-right flex flex-col">
        {/* Top bar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-num text-slate-500">
                <span>{currentAct.code}</span>
                <span aria-hidden="true">·</span>
                <span>تاريخ النشاط: {currentAct.date}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                شاشة تسجيل الحضور الذكي بـ QR Code
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors no-print"
              title="طباعة محضر الحضور"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={closeQRAttendanceModal}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presentation Area */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
          {/* QR Display Card */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/80 text-center space-y-4">
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              امسح الرمز عبر كاميرا هاتفك لتسجيل الحضور فوراً
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/70 inline-block">
              <QRCodeSVG
                value={`https://jamia-plus.app/attendance/${currentAct.id}?pin=${currentAct.attendancePin}`}
                size={220}
                fgColor="#042f2e"
                badgeText="جمعية +"
              />
            </div>

            {/* PIN Code Backup */}
            <div className="w-full pt-3 border-t border-slate-200/60 flex flex-col items-center">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                أو أدخل رمز التحقق السريع في فضاء المنخرط:
              </span>
              <div className="mt-1 px-4 py-1.5 bg-slate-900 text-white font-mono-num font-bold text-2xl tracking-widest rounded-xl shadow-xs">
                {currentAct.attendancePin}
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              النشاط: <strong className="text-slate-800">{currentAct.title}</strong>
            </div>
          </div>

          {/* Real-time Attendance Stats & Roll */}
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold">لوحة المتابعة اللحظية للقاعة</span>
              <h3 className="text-lg font-bold text-slate-900">إحصائيات المشاركة والحضور</h3>
            </div>

            {/* 4 Metrics Box */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs text-slate-500">إجمالي المسجلين</div>
                <div className="text-2xl font-bold font-mono-num text-slate-900">
                  {totalRegistered}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-800 font-semibold">الحاضرين الفعليين</div>
                <div className="text-2xl font-bold font-mono-num text-emerald-700">
                  {attendedCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <div className="text-xs text-rose-700">الغائبين</div>
                <div className="text-2xl font-bold font-mono-num text-rose-600">
                  {absentCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-white">
                <div className="text-xs text-slate-300">نسبة الحضور</div>
                <div className="text-2xl font-bold font-mono-num text-emerald-400">
                  {attendanceRate}%
                </div>
              </div>
            </div>

            {/* Attendance percentage bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-num text-slate-600">
                <span>نسبة الامتلاء والحضور</span>
                <span>{attendedCount} / {currentAct.maxSeats} مقعداً</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>

            {/* Real-time Attendees List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>سجل الوافدين والمؤكدين (آخر المنضمين):</span>
                <span className="font-mono-num text-slate-500 text-[11px]">
                  {attendedCount} حاضر
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white text-xs">
                {currentAct.participants
                  .filter((p) => p.attended)
                  .map((p) => (
                    <div
                      key={p.memberId}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{p.memberName}</span>
                        <span className="text-[11px] font-mono-num text-slate-400">({p.memberCode})</span>
                      </div>
                      <div className="text-[11px] font-mono-num text-slate-500">
                        {p.checkInTime || 'مؤكد'}
                      </div>
                    </div>
                  ))}

                {attendedCount === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    في انتظار مسح المنخرطين للكود عند مدخل القاعة...
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test / Scan Simulation */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                تجربة مسح الحضور الفوري (للتجربة والعرض):
              </span>
              <div className="flex gap-2">
                <select
                  value={selectedSimMemberId}
                  onChange={(e) => setSelectedSimMemberId(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.memberType})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSimulateScan}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                >
                  محاكاة مسح QR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-3xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام تسجيل الحضور الآلي المؤمن · جمعية + 2026</span>
          </div>
          <button
            onClick={closeQRAttendanceModal}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors"
          >
            إغلاق الشاشة
          </button>
        </div>
      </div>
    </div>
  );
};
