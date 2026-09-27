import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  KeyRound,
  Download,
  Printer,
  Sparkles,
  Vote,
  Save,
  FileCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { QRCodeSVG } from '../utils/qrGenerator';

export const MemberPortalView: React.FC = () => {
  const {
    currentMember,
    updateMember,
    activities,
    toggleActivityEnrollment,
    verifyAttendancePin,
    polls,
    votePoll,
    announcements,
  } = useApp();

  const [enteredPin, setEnteredPin] = useState('');
  const [selectedActivityForPin, setSelectedActivityForPin] = useState(
    activities.find((a) => a.status === 'مبرمج' || a.status === 'جاري')?.id || activities[0]?.id || ''
  );
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(currentMember.phone);
  const [editEmail, setEditEmail] = useState(currentMember.email);
  const [editBio, setEditBio] = useState(currentMember.bio || '');
  const [editOccupation, setEditOccupation] = useState(currentMember.occupation);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin.trim() || !selectedActivityForPin) return;
    const success = verifyAttendancePin(selectedActivityForPin, enteredPin.trim(), currentMember.id);
    if (success) {
      setEnteredPin('');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember({
      ...currentMember,
      phone: editPhone,
      email: editEmail,
      bio: editBio,
      occupation: editOccupation,
    });
    setIsEditingProfile(false);
  };

  const activePoll = polls.find((p) => p.isActive);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-right">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <span>فضاء المنخرط الرقمي</span>
            <span aria-hidden="true">·</span>
            <span>بوابة الخدمات الذاتية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            مرحباً بك، {currentMember.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            متابعة مشاركاتك، بطاقة عضويتك الذكية، تسجيل حضورك في الورشات بالـ QR، واستعراض شهاداتك التقديرية.
          </p>
        </div>

        {/* Member Micro-Stats Card */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 shrink-0">
          <div className="text-center px-3 border-l border-white/20">
            <div className="text-[10px] text-slate-300">نسبة الحضور</div>
            <div className="text-xl font-bold font-mono-num text-emerald-400">
              {currentMember.attendanceRate}%
            </div>
          </div>
          <div className="text-center px-3 border-l border-white/20">
            <div className="text-[10px] text-slate-300">ساعات التطوع</div>
            <div className="text-xl font-bold font-mono-num text-white">
              {currentMember.volunteerHours} س
            </div>
          </div>
          <div className="text-center px-3">
            <div className="text-[10px] text-slate-300">الشهادات</div>
            <div className="text-xl font-bold font-mono-num text-amber-300">
              {currentMember.certificates.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Card & Quick Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Membership Card (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              بطاقة الانخراط الرقمية
            </h2>
            <button
              onClick={() => window.print()}
              className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              طباعة
            </button>
          </div>

          {/* Printable Card */}
          <div
            id="member-portal-card"
            className="w-full rounded-2xl p-5 border border-slate-800 text-white relative overflow-hidden shadow-md text-right space-y-4"
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div>
                <div className="text-[9px] text-emerald-300">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div className="text-xs font-bold text-white tracking-wide">جمعية شبانشة للتنمية والشباب</div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                ش+
              </div>
            </div>

            <div className="py-2 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/30 text-white font-bold flex items-center justify-center text-xl shrink-0">
                {currentMember.name.slice(0, 1)}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-sm font-bold text-white leading-tight">
                  {currentMember.name}
                </div>
                <div className="text-xs text-emerald-300 font-medium">
                  {currentMember.memberType} · نادي {currentMember.club}
                </div>
                <div className="text-[11px] font-mono-num text-slate-300">
                  رقم العضوية: {currentMember.code}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-300">
              <div>
                <div>الموسم: 2026/2027</div>
                <div className="font-mono-num">انضمام: {currentMember.joinDate}</div>
              </div>
              <div className="bg-white p-1 rounded-md">
                <QRCodeSVG
                  value={`SHABANSHA_MEMBER:${currentMember.code}:${currentMember.name}`}
                  size={50}
                  includeBadge={false}
                />
              </div>
            </div>
          </div>

          {/* Quick PIN Attendance Check-In Widget */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 text-right">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                تسجيل الحضور السريع في القاعة
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              إذا كنت متواجداً في مقر النشاط، أدخل الرمز المكون من 4 أرقام المعروض على شاشة القاعة:
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <select
                value={selectedActivityForPin}
                onChange={(e) => setSelectedActivityForPin(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.status})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="رمز PIN (مثال: 4821)"
                  className="flex-1 px-3 py-2 text-center text-sm font-mono-num font-bold tracking-widest rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
                >
                  تأكيد حضوري
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Activities Enrollment & Certificates (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Activities for Enrollment */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  النشاطات المتاحة والمبرمجة
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  انقر على زر "تسجيل المشاركة" لحجز مقعدك فورياً
                </p>
              </div>
              <span className="text-xs font-mono-num text-slate-500">
                {activities.length} نشاطات
              </span>
            </div>

            <div className="space-y-3">
              {activities.map((act) => {
                const isEnrolled = act.participants.some((p) => p.memberId === currentMember.id);
                const hasAttended = act.participants.find((p) => p.memberId === currentMember.id)?.attended;

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-right"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[11px] font-mono-num text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.date} ({act.time})</span>
                        <span aria-hidden="true">·</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.venue}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{act.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-1">{act.goal}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>المسؤول: {act.coordinatorName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">
                          المقاعد المحجوزة: {act.participants.length} / {act.maxSeats}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {hasAttended && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          حاضر ومؤكد
                        </span>
                      )}

                      <button
                        onClick={() => toggleActivityEnrollment(act.id, currentMember.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          isEnrolled
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs'
                        }`}
                      >
                        {isEnrolled ? 'إلغاء التسجيل' : 'تسجيل المشاركة'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Certificates & Badges */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                شهاداتي ومساهماتي المعتمدة
              </h2>
              <span className="text-xs text-slate-500 font-mono-num">
                {currentMember.certificates.length} شهادات
              </span>
            </div>

            {currentMember.certificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMember.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/60 transition-colors space-y-2 text-right"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono-num text-slate-400">{cert.code}</span>
                      <span className="font-bold text-amber-800">{cert.type}</span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{cert.title}</div>
                    <div className="text-xs text-slate-600">{cert.activityName}</div>

                    <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono-num">
                        التاريخ: {cert.issueDate}
                      </span>
                      <button
                        onClick={() => setViewingCertificate(cert)}
                        className="text-xs text-emerald-700 font-bold hover:underline"
                      >
                        معاينة وطباعة الشهادة ←
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Award className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  شارك في الأنشطة التطوعية والتكوينية للحصول على شهادات معتمدة تسجل في رصيدك الرقمي.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Community Poll Widget */}
          {activePoll && (
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4 text-right">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Vote className="w-4 h-4 text-sky-600" />
                  استطلاع الرأي المفتوح للمنخرطين
                </h2>
                <span className="text-xs text-slate-500 font-mono-num">
                  إجمالي الأصوات: {activePoll.totalVotes}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  {activePoll.question}
                </div>
                {activePoll.description && (
                  <div className="text-xs text-slate-500">{activePoll.description}</div>
                )}

                <div className="space-y-2 pt-1">
                  {activePoll.options.map((opt) => {
                    const isVoted = activePoll.userVotedOptionId === opt.id;
                    const percent =
                      activePoll.totalVotes > 0
                        ? Math.round((opt.votes / activePoll.totalVotes) * 100)
                        : 0;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => votePoll(activePoll.id, opt.id)}
                        disabled={!!activePoll.userVotedOptionId}
                        className={`w-full p-3 rounded-lg border text-right transition-colors relative overflow-hidden flex items-center justify-between text-xs ${
                          isVoted
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className="relative z-10">{opt.text}</span>
                        <span className="font-mono-num font-bold text-slate-600 relative z-10">
                          {opt.votes} ({percent}%)
                        </span>
                        {/* Fill meter */}
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-slate-100 opacity-60 z-0 pointer-events-none"
                          style={{ width: `${percent}%` }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Official Preview Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden text-right">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-900">
                شهادة تقديرية رسمية - جمعية شبانشة
              </span>
              <button
                onClick={() => setViewingCertificate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 space-y-6 text-center">
              {/* Official Certificate Layout */}
              <div className="p-8 border-4 border-double border-amber-600/60 rounded-xl bg-amber-50/20 space-y-4 relative">
                <div className="text-xs text-slate-500 font-serif">
                  الجمهورية الجزائرية الديمقراطية الشعبية
                  <br />
                  وزارة الشباب والرياضة · ولاية معسكر · بلدية شبانشة
                </div>

                <div className="text-xl sm:text-2xl font-extrabold text-amber-900 font-serif">
                  شـــهـــادة {viewingCertificate.type} وتـقـديـر
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                  تتشرف جمعية شبانشة للتنمية والشباب بمنح هذه الشهادة لعضو الجمعية:
                </p>

                <div className="text-xl sm:text-2xl font-bold text-slate-900 py-1 border-b border-amber-300 max-w-xs mx-auto">
                  {currentMember.name}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  نظير مشاركته الفعالة ومساهمته المتميزة في إنجاح فعاليات:
                  <br />
                  <strong className="text-slate-900">{viewingCertificate.activityName}</strong>
                </p>

                <div className="pt-6 flex items-center justify-between text-xs text-slate-600 border-t border-amber-200/60">
                  <div className="text-right">
                    <div>رمز الشهادة: <span className="font-mono-num">{viewingCertificate.code}</span></div>
                    <div>حرر بشبانشة في: <span className="font-mono-num">{viewingCertificate.issueDate}</span></div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-slate-800">رئيس الجمعية</div>
                    <div className="text-[11px] text-slate-400 mt-3 font-serif">(ختم وإمضاء الجمعية)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  طباعة الشهادة الرسمية
                </button>
                <button
                  onClick={() => setViewingCertificate(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
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
