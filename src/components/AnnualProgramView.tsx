import React, { useState } from 'react';
import {
  PieChart,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Printer,
  ChevronLeft,
  X,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnnualProgramItem } from '../types';

export const AnnualProgramView: React.FC = () => {
  const {
    programAxes,
    programItems,
    updateProgramItemProgress,
    addProgramItem,
    members,
    role,
  } = useApp();

  const [selectedAxisId, setSelectedAxisId] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<AnnualProgramItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New program item form state
  const [formAxisId, setFormAxisId] = useState(programAxes[0]?.id || 'axis-1');
  const [formProjectTitle, setFormProjectTitle] = useState('');
  const [formActivityTitle, setFormActivityTitle] = useState('');
  const [formManagerName, setFormManagerName] = useState(members[0]?.name || 'عبد القادر حليمي');
  const [formStartDate, setFormStartDate] = useState('2026-10-01');
  const [formEndDate, setFormEndDate] = useState('2026-11-15');
  const [formResources, setFormResources] = useState('');
  const [formIndicator, setFormIndicator] = useState('');

  const filteredItems = programItems.filter((item) => {
    if (selectedAxisId === 'all') return true;
    return item.axisId === selectedAxisId;
  });

  const totalItems = programItems.length;
  const completedItems = programItems.filter((i) => i.currentProgress === 100).length;
  const overallAvgProgress = Math.round(
    programItems.reduce((acc, curr) => acc + curr.currentProgress, 0) / (totalItems || 1)
  );

  const handleCreateProgramItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActivityTitle.trim() || !formProjectTitle.trim()) return;

    const targetAxis = programAxes.find((a) => a.id === formAxisId);

    addProgramItem({
      axisId: formAxisId,
      axisName: targetAxis?.name || 'محور عام',
      projectTitle: formProjectTitle.trim(),
      activityTitle: formActivityTitle.trim(),
      managerName: formManagerName,
      startDate: formStartDate,
      endDate: formEndDate,
      resources: formResources.trim() || 'تجهيزات الجمعية وقاعات دار الشباب',
      indicator: formIndicator.trim() || 'إنجاز النشاط وفق المعايير المعتمدة',
      currentProgress: 0,
      status: 'لم يبدأ',
    });

    setFormActivityTitle('');
    setFormProjectTitle('');
    setFormResources('');
    setFormIndicator('');
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['المحور', 'المشروع', 'النشاط', 'المسؤول', 'البداية', 'النهاية', 'الموارد', 'المؤشر', 'نسبة الإنجاز', 'الحالة'];
    const rows = filteredItems.map((item) => [
      item.axisName,
      item.projectTitle,
      item.activityTitle,
      item.managerName,
      item.startDate,
      item.endDate,
      item.resources,
      item.indicator,
      `${item.currentProgress}%`,
      item.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => `"${e.join('","')}"`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shabansha_annual_program_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            البرنامج السنوي ومخطط العمل (Plan d'action)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            الهيكلة التنفيذية: المحور ← المشروع ← النشاط ← المسؤول ← الموارد ← المؤشر ← نسبة الإنجاز
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            تصدير المخطط (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap no-print"
          >
            <Printer className="w-4 h-4" />
            طباعة البرنامج
          </button>
          {role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              إدراج بند في البرنامج السنوي
            </button>
          )}
        </div>
      </div>

      {/* Program Macro Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">متوسط الإنجاز الكلي للبرنامج</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-num text-emerald-700">
              {overallAvgProgress}%
            </span>
            <span className="text-xs text-slate-400 font-mono-num">
              ({completedItems}/{totalItems} بنداً مكتملاً)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${overallAvgProgress}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">الأنشطة المبرمجة والمحققة</div>
          <div className="text-3xl font-bold font-mono-num text-slate-900">
            {totalItems}
          </div>
          <div className="text-xs text-slate-500 font-mono-num">
            موزعة على {programAxes.length} محاور استراتيجية كبرى
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">مؤشر الانضباط والالتزام بالآجال</div>
          <div className="text-3xl font-bold font-mono-num text-emerald-700">
            92%
          </div>
          <div className="text-xs text-slate-500">
            المشاريع تسير وفق المخطط الزمني للموسم 2026
          </div>
        </div>
      </div>

      {/* Axes Filter Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            المحاور الاستراتيجية المعتمدة في الجمعية العامة
          </h2>
          <span className="text-xs text-slate-500">تصفية حسب المحور</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedAxisId('all')}
            className={`p-3 rounded-xl border text-right transition-colors ${
              selectedAxisId === 'all'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono-num text-slate-500">الكل</div>
            <div className="text-xs font-bold mt-1">كافة المحاور ({programItems.length})</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono-num">
              متوسط: {overallAvgProgress}%
            </div>
          </button>

          {programAxes.map((axis) => (
            <button
              key={axis.id}
              onClick={() => setSelectedAxisId(axis.id)}
              className={`p-3 rounded-xl border text-right transition-colors ${
                selectedAxisId === axis.id
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono-num">
                <span className="text-slate-400">{axis.code}</span>
                <span className="font-bold text-slate-800">{axis.overallProgress}%</span>
              </div>
              <div className="text-xs font-semibold mt-1 truncate">{axis.name}</div>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${axis.overallProgress}%`,
                    backgroundColor: axis.color,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Program Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">المحور والمشروع</th>
                <th className="py-3 px-4">النشاط المستهدف</th>
                <th className="py-3 px-4">المسؤول</th>
                <th className="py-3 px-4">الفترة والآجال</th>
                <th className="py-3 px-4">الموارد المرصودة</th>
                <th className="py-3 px-4">المؤشر المعتمد</th>
                <th className="py-3 px-4 text-center">نسبة الإنجاز</th>
                <th className="py-3 px-4 text-center">الحالة والتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.projectTitle}</div>
                    <div className="text-[11px] text-slate-500">{item.axisName}</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {item.activityTitle}
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    {item.managerName}
                  </td>

                  <td className="py-3 px-4 font-mono-num text-[11px] text-slate-600 whitespace-nowrap">
                    <div>من: {item.startDate}</div>
                    <div>إلى: {item.endDate}</div>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                    {item.resources}
                  </td>

                  <td className="py-3 px-4 text-[11px] text-slate-700 font-medium max-w-xs">
                    {item.indicator}
                  </td>

                  <td className="py-3 px-4 text-center min-w-[120px]">
                    <div className="space-y-1">
                      <span className="font-mono-num font-bold text-slate-900">
                        {item.currentProgress}%
                      </span>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.currentProgress === 100
                              ? 'bg-emerald-600'
                              : item.currentProgress >= 50
                              ? 'bg-sky-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.currentProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.currentProgress === 100
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.currentProgress > 0
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                      {role !== 'member' && (
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="تعديل نسبة الإنجاز والمؤشر"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    لا توجد بنود مبرمجة في هذا المحور حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Progress Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                تحديث نسبة إنجاز النشاط
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500">{editingItem.projectTitle}</div>
              <div className="text-sm font-bold text-slate-800">{editingItem.activityTitle}</div>
              <div className="text-xs text-slate-600 font-mono-num">
                المسؤول: {editingItem.managerName}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">نسبة التقدم الحالية:</span>
                <span className="font-mono-num font-bold text-emerald-700 text-base">
                  {editingItem.currentProgress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={editingItem.currentProgress}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    currentProgress: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono-num">
                <span>0% (لم يبدأ)</span>
                <span>50% (نصف الإنجاز)</span>
                <span>100% (مكتمل)</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  updateProgramItemProgress(editingItem.id, editingItem.currentProgress);
                  setEditingItem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                حفظ التحديث
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Program Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                إدراج نشاط جديد ضمن البرنامج السنوي
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgramItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">المحور الاستراتيجي:</label>
                <select
                  value={formAxisId}
                  onChange={(e) => setFormAxisId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  {programAxes.map((ax) => (
                    <option key={ax.id} value={ax.id}>
                      {ax.code} - {ax.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">المشروع التابع له:</label>
                <input
                  type="text"
                  required
                  value={formProjectTitle}
                  onChange={(e) => setFormProjectTitle(e.target.value)}
                  placeholder="مثال: حاضنة مبتكرو شبانشة"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">عنوان النشاط:</label>
                <input
                  type="text"
                  required
                  value={formActivityTitle}
                  onChange={(e) => setFormActivityTitle(e.target.value)}
                  placeholder="مثال: ملتقى التوجيه المهني الجامعي"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">المسؤول عن النشاط:</label>
                  <select
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.memberType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تاريخ البدء:</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">تاريخ الانتهاء المتوقع:</label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الموارد المادية واللوجستية:</label>
                <input
                  type="text"
                  value={formResources}
                  onChange={(e) => setFormResources(e.target.value)}
                  placeholder="مثال: قاعة دار الشباب، أجهزة العرض، مطبوعات..."
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">مؤشر الإنجاز (KPI):</label>
                <input
                  type="text"
                  value={formIndicator}
                  onChange={(e) => setFormIndicator(e.target.value)}
                  placeholder="مثال: استفادة 50 شاباً وتقييم إيجابي أعلى من 8/10"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  إدراج النشاط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
