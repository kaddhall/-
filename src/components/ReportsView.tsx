import React, { useState } from 'react';
import {
  Award,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const {
    activities,
    members,
    programAxes,
    programItems,
    projects,
    addToast,
    role,
  } = useApp();

  const [reportType, setReportType] = useState<'activity' | 'semester' | 'program' | 'members'>('semester');
  const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?.id || '');

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'نشط').length;
  const completedActivities = activities.filter((a) => a.status === 'مكتمل').length;
  const totalTargetActivities = programAxes.reduce((acc, ax) => acc + ax.targetActivities, 0);
  const totalCompletedActivities = programAxes.reduce((acc, ax) => acc + ax.completedActivities, 0);
  const programExecutionRate = Math.round((totalCompletedActivities / totalTargetActivities) * 100);

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];

  const handleExportCSV = () => {
    addToast('تم تصدير ملف الإحصائيات بصيغة CSV جاهزة للفتح ببرنامج Excel', 'success');
    let csvRows: string[][] = [];
    let filename = `shabansha_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'members') {
      csvRows.push(['الرمز', 'الاسم', 'نوع العضوية', 'النادي', 'نسبة الحضور', 'ساعات التطوع']);
      members.forEach((m) => {
        csvRows.push([m.code, m.name, m.memberType, m.club, `${m.attendanceRate}%`, `${m.volunteerHours}`]);
      });
    } else {
      csvRows.push(['الرمز', 'عنوان النشاط', 'المسؤول', 'التاريخ', 'المكان', 'المسجلين', 'الحاضرين', 'الحالة']);
      activities.forEach((a) => {
        const attended = a.participants.filter((p) => p.attended).length;
        csvRows.push([a.code, a.title, a.coordinatorName, a.date, a.venue, `${a.participants.length}`, `${attended}`, a.status]);
      });
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      csvRows.map((e) => `"${e.join('","')}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            مركز التقارير وتوليد الحصائل الرسمية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            توليد تقارير النشاطات، الحصائل الفصليّة والأدبية، وإحصائيات المنخرطين للطباعة والتصدير
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            تصدير Excel (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            طباعة التقرير الرسمي (PDF)
          </button>
        </div>
      </div>

      {/* Role permissions badge in ReportsView */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 no-print">
        <div className="flex items-center gap-2">
          <span className="font-bold">مستوى الصلاحية الحالي:</span>
          <span className="px-2 py-0.5 rounded font-bold bg-white text-emerald-800 shadow-2xs border border-slate-200">
            {role === 'admin' ? 'الإدارة العامة (كامل الصلاحيات)' : role === 'manager' ? 'مسؤول نشاط (تقارير النشاطات واللوجستيك)' : 'منخرط (معاينة التقرير الأدبي)'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          {role === 'admin' ? 'يحق لك المصادقة وتوليد التقارير الرسمية بختم وإمضاء الرئيس' : role === 'manager' ? 'يمكنك استخراج تقارير الفعاليات وإحصائيات الحضور' : 'يقتصر دورك على الاطلاع على الحصائل العامة للجمعية'}
        </span>
      </div>

      {/* Report Selection Tabs */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 no-print">
        <div className="text-xs font-bold text-slate-700">اختر نوع التقرير المطلوب توليده:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'semester', label: 'التقرير الأدبي السداسي', icon: <FileSpreadsheet className="w-4 h-4" /> },
            { id: 'activity', label: 'تقرير نشاط تفصيلي', icon: <Calendar className="w-4 h-4" /> },
            { id: 'program', label: 'تقرير تنفيذ البرنامج السنوي', icon: <PieChart className="w-4 h-4" /> },
            { id: 'members', label: 'إحصائيات المنخرطين والحضور', icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-3 rounded-lg border text-right transition-colors flex items-center gap-2 text-xs font-semibold ${
                reportType === tab.id
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {reportType === 'activity' && (
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-slate-600 font-semibold shrink-0">حدد النشاط:</span>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="p-2 text-xs rounded-lg border border-slate-200 bg-white flex-1"
            >
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.code} · {a.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Official Formatted Document View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-right space-y-8 max-w-4xl mx-auto">
        {/* Official Letterhead (ترويسة الجمهورية والجمعية) */}
        <div className="border-b-2 border-slate-800 pb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-serif">
            <div>
              الجمهورية الجزائرية الديمقراطية الشعبية
              <br />
              وزارة الشباب والرياضة
              <br />
              مديرية الشباب والرياضة لولاية معسكر
            </div>
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              ج+
            </div>
            <div className="text-left font-mono-num">
              الرقم المرجعي: JAM/REP/2026/08
              <br />
              التاريخ: {new Date().toISOString().split('T')[0]}
              <br />
              الموسم الجمعوي: 2026
            </div>
          </div>

          <div className="text-center pt-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-wide font-serif">
              جمعية + للتنمية والشباب
            </h2>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              معتمدة تحت رقم 14/2022 طبقا للقانون رقم 12-06 المتعلق بالجمعيات
            </div>
          </div>
        </div>

        {/* Report Content according to Type */}
        {reportType === 'semester' && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                التقرير الأدبي والتقني الدوري - الموسم 2026
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                حصيلة متابعة وتنفيذ برامج التكوين، العمل التضامني، البيئة، والمشاريع الشبابية
              </p>
            </div>

            {/* Macro Statistics Summary Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">أولاً: المؤشرات الرقمية العامة</h4>
              <table className="w-full border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                    <th className="p-2.5">المؤشر</th>
                    <th className="p-2.5 text-center">الرقم المحقق</th>
                    <th className="p-2.5 text-center">المستهدف السنوي</th>
                    <th className="p-2.5 text-center">نسبة الإنجاز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-num">
                  <tr>
                    <td className="p-2.5 font-sans font-medium">عدد المنخرطين المسجلين</td>
                    <td className="p-2.5 text-center font-bold">{totalMembers}</td>
                    <td className="p-2.5 text-center">150</td>
                    <td className="p-2.5 text-center text-emerald-700 font-bold">122%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium">النشاطات الميدانية المنجزة</td>
                    <td className="p-2.5 text-center font-bold">{completedActivities}</td>
                    <td className="p-2.5 text-center">{totalTargetActivities}</td>
                    <td className="p-2.5 text-center text-emerald-700 font-bold">{programExecutionRate}%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium">المشاريع الشبابية قيد الحضانة</td>
                    <td className="p-2.5 text-center font-bold">{projects.length}</td>
                    <td className="p-2.5 text-center">4</td>
                    <td className="p-2.5 text-center text-emerald-700 font-bold">100%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium">إجمالي ساعات التطوع للشباب</td>
                    <td className="p-2.5 text-center font-bold">
                      {members.reduce((acc, m) => acc + m.volunteerHours, 0)} ساعة
                    </td>
                    <td className="p-2.5 text-center">500 ساعة</td>
                    <td className="p-2.5 text-center text-emerald-700 font-bold">108%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Program Axes Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">ثانياً: حصيلة محاور البرنامج السنوي</h4>
              <div className="space-y-2">
                {programAxes.map((axis) => (
                  <div key={axis.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{axis.name}</div>
                      <div className="text-[11px] text-slate-500">{axis.description}</div>
                    </div>
                    <div className="text-left font-mono-num">
                      <span className="font-bold text-emerald-700">{axis.overallProgress}%</span>
                      <div className="text-[10px] text-slate-400">
                        {axis.completedActivities}/{axis.targetActivities} نشاطاً
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Projects Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">ثالثاً: المشاريع الشبابية الرائدة</h4>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-slate-200 text-slate-700">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>• {p.title}</span>
                      <span className="font-mono-num text-emerald-700">{p.progress}% إنجاز</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">{p.idea}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reportType === 'activity' && selectedActivity && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-mono-num text-slate-500">
                الرمز: {selectedActivity.code} · الحالة: {selectedActivity.status}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                تقرير النشاط: {selectedActivity.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500">التاريخ والتوقيت:</span>{' '}
                <span className="font-mono-num font-semibold">{selectedActivity.date} ({selectedActivity.time})</span>
              </div>
              <div>
                <span className="text-slate-500">المكان:</span>{' '}
                <span className="font-semibold">{selectedActivity.venue}</span>
              </div>
              <div>
                <span className="text-slate-500">المسؤول عن النشاط:</span>{' '}
                <span className="font-semibold text-emerald-800">{selectedActivity.coordinatorName}</span>
              </div>
              <div>
                <span className="text-slate-500">نسبة الحضور الفعلي:</span>{' '}
                <span className="font-mono-num font-bold text-emerald-700">
                  {selectedActivity.participants.filter((p) => p.attended).length} / {selectedActivity.participants.length}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">أهداف النشاط:</h4>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedActivity.goal}</p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">المخرجات والنتائج المحققة:</h4>
              <div className="space-y-1">
                {(selectedActivity.results || []).map((res, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                    • {res}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">خلاصة تقييم النشاط:</h4>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedActivity.finalReportSummary || 'تم تنفيذ النشاط وفق الأهداف المرسومة بنجاح وتجاوب كبير من الشباب المشارك.'}
              </p>
            </div>
          </div>
        )}

        {reportType === 'program' && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                تقرير تنفيذ البرنامج السنوي 2026
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                المحور ← المشروع ← النشاط ← المسؤول ← الموارد ← المؤشر ← نسبة الإنجاز
              </p>
            </div>

            <table className="w-full border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                  <th className="p-2">المحور</th>
                  <th className="p-2">النشاط المستهدف</th>
                  <th className="p-2">المسؤول</th>
                  <th className="p-2">المؤشر</th>
                  <th className="p-2 text-center">الإنجاز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 font-medium text-slate-700">{item.axisName}</td>
                    <td className="p-2 font-bold text-slate-900">{item.activityTitle}</td>
                    <td className="p-2">{item.managerName}</td>
                    <td className="p-2 text-[11px] text-slate-500">{item.indicator}</td>
                    <td className="p-2 text-center font-mono-num font-bold text-emerald-700">
                      {item.currentProgress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'members' && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                سجل وإحصائيات المنخرطين ومؤشرات المشاركة
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                توزيع المنخرطين، معدلات الحضور وساعات العمل التطوعي المنجزة
              </p>
            </div>

            <table className="w-full border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                  <th className="p-2">الرمز والاسم</th>
                  <th className="p-2">العضوية</th>
                  <th className="p-2">النادي</th>
                  <th className="p-2 text-center">نسبة الحضور</th>
                  <th className="p-2 text-center">ساعات التطوع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-num">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="p-2 font-sans font-bold text-slate-900">
                      {m.name} <span className="text-[11px] text-slate-400">({m.code})</span>
                    </td>
                    <td className="p-2 font-sans">{m.memberType}</td>
                    <td className="p-2 font-sans text-slate-600">{m.club}</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">{m.attendanceRate}%</td>
                    <td className="p-2 text-center">{m.volunteerHours} س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures & Seal Section */}
        <div className="pt-8 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="text-center space-y-2">
            <div className="font-bold">الكاتب العام للجمعية</div>
            <div className="text-slate-400 font-serif pt-6">(توقيع الكاتب العام)</div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-serif rotate-12">
              خاتم الجمعية الرسمي
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="font-bold">رئيس جمعية +</div>
            <div className="text-slate-400 font-serif pt-6">(توقيع وخاتم الرئيس)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
