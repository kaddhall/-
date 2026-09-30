import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  CheckCircle2,
  Clock,
  Target,
  Users,
  Coins,
  TrendingUp,
  X,
  ChevronLeft,
  Calendar,
  AlertCircle,
  FileWarning,
  ListTodo,
  Layers,
  ArrowRightLeft,
  MoveLeft,
  MoveRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { YouthProject, ProjectPhase, KanbanStatus } from '../types';
import { ProjectKanbanBoard } from './ProjectKanbanBoard';

interface ProjectsViewProps {
  onOpenNewProjectModal: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenNewProjectModal }) => {
  const {
    projects,
    updateProjectPhase,
    projectTasks,
    updateProjectTaskStatus,
    role,
  } = useApp();

  const [viewMode, setViewMode] = useState<'cards' | 'kanban'>('kanban');
  const [selectedProject, setSelectedProject] = useState<YouthProject | null>(null);
  const [activeKanbanProjectId, setActiveKanbanProjectId] = useState<string>('all');

  const handlePhaseProgressChange = (
    projectId: string,
    phaseId: string,
    newProgress: number
  ) => {
    const clamped = Math.max(0, Math.min(100, newProgress));
    const status: 'completed' | 'current' | 'upcoming' =
      clamped === 100 ? 'completed' : clamped > 0 ? 'current' : 'upcoming';
    updateProjectPhase(projectId, phaseId, clamped, status);

    if (selectedProject?.id === projectId) {
      const updated = projects.find((p) => p.id === projectId);
      if (updated) setSelectedProject(updated);
    }
  };

  const pendingTasksTotal = projectTasks.filter((t) => t.status === 'قيد الانتظار').length;
  const inProgressTasksTotal = projectTasks.filter((t) => t.status === 'قيد التنفيذ').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            حاضنة ومتابعة المشاريع الشبابية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            تخطيط، مراحل تنفيذ، ميزانية، ولوحة كانبان التفاعلية لمهام مبادرات جمعية +
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Segmented Controls */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>لوحة كانبان المهام</span>
              <span className="text-[10px] font-mono-num px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                {projectTasks.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>بطاقات المشاريع والمراحل</span>
              <span className="text-[10px] font-mono-num px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                {projects.length}
              </span>
            </button>
          </div>

          {role === 'admin' && (
            <button
              onClick={onOpenNewProjectModal}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إطلاق مشروع جديد
            </button>
          )}
        </div>
      </div>

      {/* Main View Area: Either Kanban Board or Project Cards */}
      {viewMode === 'kanban' ? (
        <ProjectKanbanBoard
          initialProjectId={activeKanbanProjectId}
          onSelectProject={(id) => {
            const p = projects.find((proj) => proj.id === id);
            if (p) setSelectedProject(p);
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const budgetPercent = Math.round(
                (project.budget.spent / project.budget.allocated) * 100
              );
              const projectTaskList = projectTasks.filter(
                (t) => t.projectId === project.id
              );
              const projectCompletedTasks = projectTaskList.filter(
                (t) => t.status === 'مكتمل'
              ).length;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs overflow-hidden flex flex-col justify-between text-right"
                >
                  <div className="p-6 space-y-4">
                    {/* Meta header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-num text-slate-400">
                        {project.code}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          project.status === 'منجز بنجاح'
                            ? 'bg-emerald-50 text-emerald-700'
                            : project.status === 'مرحلة التقييم'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Title & Idea */}
                    <div className="space-y-1">
                      <h3
                        onClick={() => setSelectedProject(project)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {project.idea}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">معدل الإنجاز التراكمي:</span>
                        <span className="font-mono-num font-bold text-emerald-700">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Kanban Tasks Quick Status */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مهام كانبان:</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono-num text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {projectCompletedTasks}/{projectTaskList.length} منجزة
                        </span>
                        <button
                          onClick={() => {
                            setActiveKanbanProjectId(project.id);
                            setViewMode('kanban');
                          }}
                          className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold underline mr-1 cursor-pointer"
                        >
                          فتح اللوحة
                        </button>
                      </div>
                    </div>

                    {/* Smart Overdue Report / Milestone Alert */}
                    {(() => {
                      const cur = new Date('2026-09-26');
                      const overduePhases = project.phases.filter((ph) => {
                        const diff = Math.ceil(
                          (new Date(ph.dueDate).getTime() - cur.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return diff < 0 && ph.progress < 100;
                      });

                      if (overduePhases.length > 0 || project.progress >= 85) {
                        return (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <FileWarning className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>تنبيه آلي: مطلوب إيداع التقرير النهائي والتقييم</span>
                            </div>
                            <p className="text-[10px] text-rose-700 leading-tight">
                              {overduePhases.length > 0
                                ? `المرحلة "${overduePhases[0].name}" متأخرة عن موعدها المحدد.`
                                : `المشروع بلغ ${project.progress}% ويتطلب إيداع التقرير للاعتماد.`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Key indicators */}
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">قائد المشروع:</span>
                        <span className="font-semibold text-slate-800">
                          {project.leaderName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">الميزانية المصروفة:</span>
                        <span className="font-mono-num font-bold text-slate-800">
                          {project.budget.spent.toLocaleString()} /{' '}
                          {project.budget.allocated.toLocaleString()} دج ({budgetPercent}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">مراحل التنفيذ:</span>
                        <span className="font-mono-num text-slate-700">
                          {project.phases.filter((p) => p.status === 'completed').length} /{' '}
                          {project.phases.length} منجزة
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono-num text-slate-400">
                      المدة: {project.startDate} إلى {project.endDate}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActiveKanbanProjectId(project.id);
                          setViewMode('kanban');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                        مهام كانبان
                      </button>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        التفاصيل
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl text-right animate-in fade-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono-num text-slate-500">
                  <span>{selectedProject.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">{selectedProject.status}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedProject.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Problem & Solution / Idea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 space-y-1">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-rose-600" />
                    المشكلة والتحدي الميداني:
                  </div>
                  <p className="text-slate-700 leading-relaxed">{selectedProject.problem}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    فكرة المشروع والحل المقترح:
                  </div>
                  <p className="text-slate-700 leading-relaxed">{selectedProject.idea}</p>
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">الأهداف الإجرائية للمشروع:</h3>
                <div className="space-y-1.5">
                  {selectedProject.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kanban Tasks for this Project */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-600" />
                    مهام لوحة كانبان المرتبطة بهذا المشروع:
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setActiveKanbanProjectId(selectedProject.id);
                      setViewMode('kanban');
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                  >
                    <span>فتح اللوحة الكاملة</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {projectTasks
                    .filter((t) => t.projectId === selectedProject.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                task.priority === 'عاجل'
                                  ? 'bg-rose-100 text-rose-800'
                                  : task.priority === 'متوسط'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="font-bold text-slate-900">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>المكلف: {task.assignedTo}</span>
                            <span>الاستحقاق: {task.dueDate}</span>
                          </div>
                        </div>

                        {/* Status switcher */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500 font-medium">الحالة:</span>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateProjectTaskStatus(
                                task.id,
                                e.target.value as KanbanStatus
                              )
                            }
                            className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                              task.status === 'مكتمل'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : task.status === 'قيد التنفيذ'
                                ? 'bg-sky-50 border-sky-300 text-sky-800'
                                : 'bg-amber-50 border-amber-300 text-amber-800'
                            }`}
                          >
                            <option value="قيد الانتظار">قيد الانتظار</option>
                            <option value="قيد التنفيذ">قيد التنفيذ</option>
                            <option value="مكتمل">مكتمل</option>
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Execution Phases (مراحل التنفيذ ومؤشرات التقدم) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    مراحل التنفيذ والجدول الزمني:
                  </h3>
                  <span className="text-slate-500 font-mono-num">
                    متوسط الإنجاز: {selectedProject.progress}%
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedProject.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              phase.status === 'completed'
                                ? 'bg-emerald-500'
                                : phase.status === 'current'
                                ? 'bg-sky-500 animate-pulse'
                                : 'bg-slate-300'
                            }`}
                          />
                          <span className="font-bold text-slate-800">{phase.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono-num text-[11px] text-slate-500">
                          <span>الآجال: {phase.dueDate}</span>
                          <span className="font-bold text-emerald-700">{phase.progress}%</span>
                        </div>
                      </div>

                      {role !== 'member' && (
                        <div className="pt-1 flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={phase.progress}
                            onChange={(e) =>
                              handlePhaseProgressChange(
                                selectedProject.id,
                                phase.id,
                                Number(e.target.value)
                              )
                            }
                            className="flex-1 accent-emerald-600 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Results Achieved */}
              {selectedProject.keyResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">النتائج المحققة حتى الآن:</h3>
                  <div className="space-y-1.5">
                    {selectedProject.keyResults.map((res, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700"
                      >
                        • {res}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

