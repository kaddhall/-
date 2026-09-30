import React, { useState } from 'react';
import {
  MessageSquare,
  Vote,
  Bell,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CommunicationView: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    polls,
    votePoll,
    addPoll,
    role,
  } = useApp();

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  // New announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'عاجل' | 'مهم' | 'عادي'>('مهم');
  const [annTarget, setAnnTarget] = useState<'الكل' | 'المنخرطين' | 'مسؤولو الأنشطة'>('الكل');

  // New poll form
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDesc, setPollDesc] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
      author: 'إدارة جمعية +',
      targetRole: annTarget,
      isPinned: annPriority === 'عاجل',
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAnnModal(false);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !opt1.trim() || !opt2.trim()) return;

    const options = [
      { id: 'opt-' + Date.now() + '-1', text: opt1.trim(), votes: 0 },
      { id: 'opt-' + Date.now() + '-2', text: opt2.trim(), votes: 0 },
    ];
    if (opt3.trim()) {
      options.push({ id: 'opt-' + Date.now() + '-3', text: opt3.trim(), votes: 0 });
    }

    addPoll({
      question: pollQuestion.trim(),
      description: pollDesc.trim(),
      options,
      expiresAt: '2026-11-01',
    });

    setPollQuestion('');
    setPollDesc('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setShowPollModal(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            مركز التواصل، الإعلانات واستطلاعات الرأي
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            حلقة الوصل المباشرة: إعلانات الجمعية، استطلاعات رأي المنخرطين، وتنبيهات المواعيد
          </p>
        </div>

        {role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPollModal(true)}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Vote className="w-4 h-4 text-sky-600" />
              إطلاق استطلاع رأي
            </button>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              نشر إعلان رسمي
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              الإعلانات والبلاغات الرسمية للجمعية
            </h2>
            <span className="text-xs text-slate-500 font-mono-num">
              {announcements.length} إعلانات
            </span>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ann.priority === 'عاجل'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : ann.priority === 'مهم'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-num">{ann.date}</span>
                  </div>

                  <span className="text-[11px] text-slate-500">موجه إلى: {ann.targetRole}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>المصدر: {ann.author}</span>
                  <span className="text-emerald-700 font-medium">معتمد في لوحة الإعلانات ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Polls & Community Voting (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-4 h-4 text-sky-600" />
              استطلاعات الرأي التشاركية
            </h2>
            <span className="text-xs text-slate-500 font-mono-num">{polls.length} استطلاع</span>
          </div>

          <div className="space-y-4">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    استطلاع رأي نشط
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 pt-1 leading-snug">
                    {poll.question}
                  </h3>
                  {poll.description && (
                    <p className="text-xs text-slate-500">{poll.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const isVoted = poll.userVotedOptionId === opt.id;
                    const percent =
                      poll.totalVotes > 0
                        ? Math.round((opt.votes / poll.totalVotes) * 100)
                        : 0;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => votePoll(poll.id, opt.id)}
                        disabled={!!poll.userVotedOptionId}
                        className={`w-full p-2.5 rounded-lg border text-right transition-colors relative overflow-hidden flex items-center justify-between text-xs ${
                          isVoted
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className="relative z-10">{opt.text}</span>
                        <span className="font-mono-num font-bold text-slate-600 relative z-10">
                          {opt.votes} ({percent}%)
                        </span>
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-slate-100 opacity-60 z-0 pointer-events-none"
                          style={{ width: `${percent}%` }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono-num">
                  <span>إجمالي المشاركين: {poll.totalVotes} مصوت</span>
                  <span>الانتهاء: {poll.expiresAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">نشر إعلان رسمي للمنخرطين</h3>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">عنوان الإعلان:</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="مثال: تعديل موعد انطلاق ورشة التكوين البرمجي"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">درجة الأهمية:</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="عاجل">عاجل</option>
                    <option value="مهم">مهم</option>
                    <option value="عادي">عادي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الفئة المستهدفة:</label>
                  <select
                    value={annTarget}
                    onChange={(e) => setAnnTarget(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="الكل">كافة الأعضاء</option>
                    <option value="المنخرطين">المنخرطين فقط</option>
                    <option value="مسؤولو الأنشطة">مسؤولو الأنشطة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">نص الإعلان:</label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="اكتب تفاصيل الإعلان أو التوجيهات الميدانية..."
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  نشر الإعلان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">إنشاء استطلاع رأي جديد</h3>
              <button onClick={() => setShowPollModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">سؤال الاستطلاع:</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="مثال: ما هو التوقيت الأنسب لبرمجة الدورة الرياضية؟"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">وصف مختصر أو سياق:</label>
                <input
                  type="text"
                  value={pollDesc}
                  onChange={(e) => setPollDesc(e.target.value)}
                  placeholder="ملاحظة لمساعدة الأعضاء على الاختيار"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">خيارات التصويت:</label>
                <input
                  type="text"
                  required
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  placeholder="الخيار الأول (مثال: الفترة الصباحية 09:00)"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
                <input
                  type="text"
                  required
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  placeholder="الخيار الثاني (مثال: بعد العصر 16:30)"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
                <input
                  type="text"
                  value={opt3}
                  onChange={(e) => setOpt3(e.target.value)}
                  placeholder="الخيار الثالث (اختياري: عطلة نهاية الأسبوع)"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs"
                >
                  إطلاق الاستطلاع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
