import React, { useState } from 'react';
import { X, FolderPlus, Target, Coins, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectPhase } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, members } = useApp();

  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [idea, setIdea] = useState('');
  const [targetAudience, setTargetAudience] = useState('شباب وسكان بلدية شبانشة');
  const [leaderName, setLeaderName] = useState(members[0]?.name || 'عبد القادر حليمي');
  const [allocatedBudget, setAllocatedBudget] = useState<number>(300000);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // Objectives
  const [objectives, setObjectives] = useState<string[]>([
    'تأطير 40 شاباً في آليات العمل الميداني',
    'بناء شراكات مستدامة مع الهيئات المحلية',
  ]);
  const [newObj, setNewObj] = useState('');

  if (!isOpen) return null;

  const handleAddObj = () => {
    if (!newObj.trim()) return;
    setObjectives([...objectives, newObj.trim()]);
    setNewObj('');
  };

  const handleRemoveObj = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim() || !idea.trim()) return;

    const initialPhases: ProjectPhase[] = [
      { id: 'ph-init-1', name: 'الدراسة التحضيرية والتشخيص الميداني', status: 'completed', progress: 100, dueDate: startDate },
      { id: 'ph-init-2', name: 'انطلاق الحملة والورشات التدريبية الميدانية', status: 'current', progress: 30, dueDate: '2026-11-15' },
      { id: 'ph-init-3', name: 'المتابعة وتقييم الأثر وتسليم المخرجات', status: 'upcoming', progress: 0, dueDate: endDate },
    ];

    addProject({
      title: title.trim(),
      problem: problem.trim(),
      idea: idea.trim(),
      objectives: objectives.length > 0 ? objectives : ['تحقيق الأثر المجتمعي المنشود'],
      targetAudience,
      leaderName,
      teamMembers: ['سارة بوحفص', 'أمين دحماني', 'مريم بن زيان'],
      budget: {
        allocated: allocatedBudget,
        spent: 0,
      },
      phases: initialPhases,
      keyResults: ['انطلاق المشروع بنجاح واعتماده في المخطط الجمعوي'],
      status: 'قيد التنفيذ',
      startDate,
      endDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl text-right animate-in fade-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              إطلاق مشروع شبابي جديد ضمن حاضنة شبانشة
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              اسم المشروع الشبابي: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مشروع مسار المستقبل للتوجيه المهني"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              المشكلة أو الاحتياج الميداني: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="صف التحدي أو المشكلة التي يعالجها المشروع..."
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              فكرة المشروع والحل المبتكر: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="كيف ستقوم الجمعية بتنفيذ هذا الحل..."
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">الفئة المستهدفة:</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">قائد المشروع:</label>
              <select
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.memberType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">الميزانية المرصودة (دج):</label>
              <input
                type="number"
                step="10000"
                value={allocatedBudget}
                onChange={(e) => setAllocatedBudget(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">تاريخ الانطلاق:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">تاريخ الاختتام المتوقع:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
              />
            </div>
          </div>

          {/* Objectives builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold">أهداف المشروع:</label>
            <div className="space-y-1.5">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span>• {obj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObj(i)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newObj}
                onChange={(e) => setNewObj(e.target.value)}
                placeholder="أضف هدفاً إجرائياً..."
                className="flex-1 p-2 rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={handleAddObj}
                className="px-3 py-2 rounded-lg bg-slate-800 text-white font-semibold"
              >
                إضافة هدف
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
            >
              اعتماد وإطلاق المشروع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
