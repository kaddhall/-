import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Eye,
  Settings,
  LayoutDashboard,
  Lock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { ROLE_DETAILS, PERMISSIONS_MATRIX } from '../data/permissionsData';

interface PermissionsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsGuideModal: React.FC<PermissionsGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { role, setRole } = useApp();
  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>(role);
  const [activeView, setActiveView] = useState<'details' | 'matrix'>('details');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  if (!isOpen) return null;

  const currentRoleInfo = ROLE_DETAILS[selectedRoleTab];

  const categories = [
    'all',
    'إدارة عامة',
    'أنشطة وميدان',
    'مشاريع وكانبان',
    'منخرطين',
    'تقارير ووثائق',
    'تواصل واستطلاع',
  ];

  const filteredMatrix =
    categoryFilter === 'all'
      ? PERMISSIONS_MATRIX
      : PERMISSIONS_MATRIX.filter((item) => item.category === categoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col text-right">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                دليل ومصفوفة الصلاحيات حسب وظائف الجمعية
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد دقيق لما يستطيع كل مستخدم فعله، معاينته، والتحكم فيه وما يُعرض له في لوحة القيادة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: Role Switcher & View Toggle */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Role selector tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['admin', 'manager', 'member'] as Role[]).map((r) => {
              const info = ROLE_DETAILS[r];
              const isSelected = selectedRoleTab === r;
              const isCurrentActive = role === r;

              return (
                <button
                  key={r}
                  onClick={() => setSelectedRoleTab(r)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  {r === 'manager' && <Calendar className="w-4 h-4 text-sky-600" />}
                  {r === 'member' && <UserCheck className="w-4 h-4 text-amber-600" />}
                  <span>{info.shortTitle}</span>
                  {isCurrentActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="الدور النشط حالياً" />
                  )}
                </button>
              );
            })}
          </div>

          {/* View toggle (تفاصيل الدور / مصفوفة المقارنة) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveView('details')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'details'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بطاقة الصلاحيات والوظائف
              </button>
              <button
                onClick={() => setActiveView('matrix')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'matrix'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جدول المقارنة الشامل
              </button>
            </div>

            {/* Quick Apply Role button */}
            {role !== selectedRoleTab && (
              <button
                onClick={() => {
                  setRole(selectedRoleTab);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <span>تفعيل هذا الدور الآن</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeView === 'details' ? (
            <div className="space-y-6">
              {/* Role Title Banner */}
              <div
                className={`p-4 rounded-xl border ${currentRoleInfo.borderColor} ${currentRoleInfo.bgColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {currentRoleInfo.title}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700">
                      {currentRoleInfo.badgeText}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong>الموقع والوظيفة بالجمعية:</strong> {currentRoleInfo.associationJob}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRole(selectedRoleTab);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 ${
                      role === selectedRoleTab
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {role === selectedRoleTab ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>أنت تتصفح بهذا الدور الآن</span>
                      </>
                    ) : (
                      <>
                        <span>الانتقال وتجربة هذا الدور</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. What they can do (ما يستطيع فعله) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h3 className="text-xs font-bold">ما يستطيع فعله (الصلاحيات والإجراءات)</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                    {currentRoleInfo.canDo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. What they can view (ما يستطيع معاينته) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-sky-800 border-b border-slate-100 pb-2">
                    <Eye className="w-4 h-4 text-sky-600 shrink-0" />
                    <h3 className="text-xs font-bold">ما يستطيع معاينته (نطاق الرؤية والمعلومات)</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                    {currentRoleInfo.canView.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. What they control (ما يتحكم فيه) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-800 border-b border-slate-100 pb-2">
                    <Settings className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h3 className="text-xs font-bold">ما يتحكم فيه (نطاق السلطة والمسؤولية)</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                    {currentRoleInfo.canControl.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Dashboard View (ما يعرض له في لوحة القيادة) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-800 border-b border-slate-100 pb-2">
                    <LayoutDashboard className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="text-xs font-bold">ما يُعرض له في لوحة القيادة (Dashboard)</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                    {currentRoleInfo.dashboardDisplay.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Restrictions & Boundaries (الموانع والحدود الإدارية) */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>القيود والموانع الإدارية والتنظيمية:</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 leading-relaxed pr-6">
                  {currentRoleInfo.restrictions.map((res, idx) => (
                    <li key={idx} className="list-disc">
                      {res}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Matrix View */
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  تصفية البنود:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'كافة الصلاحيات' : cat}
                  </button>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">الصلاحية / العملية</th>
                      <th className="p-3 text-center w-28 bg-emerald-50 text-emerald-950">
                        الإدارة العامة
                      </th>
                      <th className="p-3 text-center w-28 bg-sky-50 text-sky-950">
                        مسؤول النشاط
                      </th>
                      <th className="p-3 text-center w-28 bg-amber-50 text-amber-950">
                        المنخرط
                      </th>
                      <th className="p-3 hidden sm:table-cell">التوضيح والضوابط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatrix.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-medium text-slate-800">
                          <span className="inline-block text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">
                            {item.category}
                          </span>
                          {item.label}
                        </td>
                        <td className="p-3 text-center bg-emerald-50/30">
                          {item.admin ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center bg-sky-50/30">
                          {item.manager ? (
                            <CheckCircle2 className="w-4 h-4 text-sky-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center bg-amber-50/30">
                          {item.member ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-500 hidden sm:table-cell">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>يتم تطبيق الصلاحيات ديناميكياً ولحظياً عبر كافة أقسام منصة جمعية +.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
