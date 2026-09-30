import React, { useState } from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  MoveLeft,
  MoveRight,
  Calendar,
  User,
  Tag,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  FolderOpen,
  ArrowRightLeft,
  Layers,
  Sparkles,
  X,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectTask, KanbanStatus } from '../types';

interface ProjectKanbanBoardProps {
  initialProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  initialProjectId,
  onSelectProject,
}) => {
  const {
    projectTasks,
    projects,
    members,
    updateProjectTaskStatus,
    addProjectTask,
    updateProjectTask,
    deleteProjectTask,
    role,
  } = useApp();

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || 'all'
  );
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [activeTaskMenuId, setActiveTaskMenuId] = useState<string | null>(null);

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    projectId: projects[0]?.id || '',
    assignedTo: members[0]?.name || '',
    priority: 'متوسط' as 'عاجل' | 'متوسط' | 'عادي',
    status: 'قيد الانتظار' as KanbanStatus,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    tagsText: 'ميداني, شباب',
  });

  const columns: {
    status: KanbanStatus;
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClasses: {
      border: string;
      headerBg: string;
      titleColor: string;
      countBadge: string;
      dropIndicator: string;
    };
  }[] = [
    {
      status: 'قيد الانتظار',
      title: 'قيد الانتظار',
      description: 'مهام مبرمجة ومخططة بانتظار بدء التنفيذ',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      colorClasses: {
        border: 'border-amber-200/80',
        headerBg: 'bg-amber-50/70',
        titleColor: 'text-amber-900',
        countBadge: 'bg-amber-100 text-amber-800',
        dropIndicator: 'border-amber-400 bg-amber-50/50',
      },
    },
    {
      status: 'قيد التنفيذ',
      title: 'قيد التنفيذ',
      description: 'مهام جارية على الميدان قيد العمل والمتابعة',
      icon: <Layers className="w-4 h-4 text-sky-600" />,
      colorClasses: {
        border: 'border-sky-200/80',
        headerBg: 'bg-sky-50/70',
        titleColor: 'text-sky-900',
        countBadge: 'bg-sky-100 text-sky-800',
        dropIndicator: 'border-sky-400 bg-sky-50/50',
      },
    },
    {
      status: 'مكتمل',
      title: 'مكتمل',
      description: 'مهام منجزة وموثقة بنجاح وفق المؤشرات',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      colorClasses: {
        border: 'border-emerald-200/80',
        headerBg: 'bg-emerald-50/70',
        titleColor: 'text-emerald-900',
        countBadge: 'bg-emerald-100 text-emerald-800',
        dropIndicator: 'border-emerald-400 bg-emerald-50/50',
      },
    },
  ];

  // Filter tasks
  const filteredTasks = projectTasks.filter((t) => {
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) {
      return false;
    }
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchAssigned = t.assignedTo.toLowerCase().includes(q);
      const matchProject = t.projectTitle.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssigned && !matchProject) {
        return false;
      }
    }
    return true;
  });

  // Calculate statistics
  const totalTasksCount = filteredTasks.length;
  const pendingTasksCount = filteredTasks.filter(
    (t) => t.status === 'قيد الانتظار'
  ).length;
  const inProgressTasksCount = filteredTasks.filter(
    (t) => t.status === 'قيد التنفيذ'
  ).length;
  const completedTasksCount = filteredTasks.filter(
    (t) => t.status === 'مكتمل'
  ).length;
  const completionPercentage =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: KanbanStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (status: KanbanStatus) => {
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      const task = projectTasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        updateProjectTaskStatus(taskId, targetStatus);
      }
    }
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Move task to adjacent status
  const handleMoveStatus = (
    taskId: string,
    currentStatus: KanbanStatus,
    direction: 'forward' | 'backward'
  ) => {
    let nextStatus: KanbanStatus = currentStatus;
    if (direction === 'forward') {
      if (currentStatus === 'قيد الانتظار') nextStatus = 'قيد التنفيذ';
      else if (currentStatus === 'قيد التنفيذ') nextStatus = 'مكتمل';
    } else {
      if (currentStatus === 'مكتمل') nextStatus = 'قيد التنفيذ';
      else if (currentStatus === 'قيد التنفيذ') nextStatus = 'قيد الانتظار';
    }
    if (nextStatus !== currentStatus) {
      updateProjectTaskStatus(taskId, nextStatus);
    }
  };

  // Add task handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    const proj = projects.find((p) => p.id === newTaskForm.projectId);
    const tags = newTaskForm.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    addProjectTask({
      projectId: newTaskForm.projectId,
      projectTitle: proj ? proj.title : 'مشروع عام',
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim(),
      assignedTo: newTaskForm.assignedTo,
      priority: newTaskForm.priority,
      status: newTaskForm.status,
      dueDate: newTaskForm.dueDate,
      tags,
    });

    setIsNewTaskModalOpen(false);
    setNewTaskForm({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      assignedTo: members[0]?.name || '',
      priority: 'متوسط',
      status: 'قيد الانتظار',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      tagsText: 'ميداني, شباب',
    });
  };

  // Update task handler
  const handleSaveEditedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    updateProjectTask(editingTask);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <ListTodo className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                لوحة كانبان لإدارة مهام المشاريع الشبابية (Kanban Board)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              توزيع ديناميكي للمهام الميدانية ونقلها بالسحب والإفلات بين:
              <strong className="text-slate-700 font-semibold mx-1">قيد الانتظار</strong>·
              <strong className="text-slate-700 font-semibold mx-1">قيد التنفيذ</strong>·
              <strong className="text-slate-700 font-semibold mx-1">مكتمل</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {role !== 'member' && (
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                إضافة مهمة جديدة
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] block">إجمالي المهام</span>
            <span className="font-mono-num font-bold text-base text-slate-800">
              {totalTasksCount}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
            <span className="text-amber-700 text-[11px] block font-medium">قيد الانتظار</span>
            <span className="font-mono-num font-bold text-base text-amber-800">
              {pendingTasksCount}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-100">
            <span className="text-sky-700 text-[11px] block font-medium">قيد التنفيذ</span>
            <span className="font-mono-num font-bold text-base text-sky-800">
              {inProgressTasksCount}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <span className="text-emerald-700 text-[11px] block font-medium">منجزة بنجاح</span>
            <span className="font-mono-num font-bold text-base text-emerald-800">
              {completedTasksCount}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>نسبة الإنجاز</span>
              <span className="font-mono-num font-bold text-emerald-700">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Project */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px]">المشروع:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">كل المشاريع ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Priority */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px]">الأولوية:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">الكل</option>
                <option value="عاجل">عاجل</option>
                <option value="متوسط">متوسط</option>
                <option value="عادي">عادي</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="بحث في المهام أو المكلفين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.status);
          const isOverThisCol = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={() => handleDragLeave(col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`rounded-2xl border transition-all flex flex-col bg-slate-50/60 min-h-[520px] ${
                col.colorClasses.border
              } ${isOverThisCol ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/30' : ''}`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 rounded-t-2xl border-b border-slate-200/80 flex items-center justify-between ${col.colorClasses.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className={`text-sm font-bold ${col.colorClasses.titleColor}`}>
                    {col.title}
                  </h3>
                  <span
                    className={`text-[11px] font-mono-num font-bold px-2 py-0.5 rounded-full ${col.colorClasses.countBadge}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {role !== 'member' && (
                  <button
                    onClick={() => {
                      setNewTaskForm((prev) => ({ ...prev, status: col.status }));
                      setIsNewTaskModalOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
                    title={`إضافة مهمة إلى ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Column Dropzone / Task List */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div
                    className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-colors ${
                      isOverThisCol
                        ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    <ArrowRightLeft className="w-6 h-6 mb-2 opacity-40" />
                    <p className="text-xs font-medium">لا توجد مهام في هذه الحالة</p>
                    <p className="text-[10px] mt-0.5 opacity-70">
                      اسحب مهمة إلى هنا لنقلها لحالة "{col.title}"
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-3 cursor-grab active:cursor-grabbing text-right group ${
                          isBeingDragged ? 'opacity-40 border-dashed border-emerald-500' : ''
                        }`}
                      >
                        {/* Task Top Meta */}
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              task.priority === 'عاجل'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : task.priority === 'متوسط'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority === 'عاجل' && '🚨 '}
                            أولوية: {task.priority}
                          </span>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono-num text-slate-400">
                              {task.dueDate}
                            </span>
                            {role !== 'member' && (
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTaskMenuId(
                                      activeTaskMenuId === task.id ? null : task.id
                                    );
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {activeTaskMenuId === task.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute left-0 top-6 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 text-[11px]"
                                  >
                                    <button
                                      onClick={() => {
                                        setEditingTask(task);
                                        setActiveTaskMenuId(null);
                                      }}
                                      className="w-full text-right px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                    >
                                      <Edit2 className="w-3 h-3 text-slate-400" />
                                      تعديل المهمة
                                    </button>
                                    <button
                                      onClick={() => {
                                        deleteProjectTask(task.id);
                                        setActiveTaskMenuId(null);
                                      }}
                                      className="w-full text-right px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-700"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-500" />
                                      حذف المهمة
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug hover:text-emerald-700 transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Project Name & Tags */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <FolderOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{task.projectTitle}</span>
                          </div>

                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono-num"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Assignee & Move Quick Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {task.assignedTo.charAt(0)}
                            </div>
                            <span className="truncate font-medium">{task.assignedTo}</span>
                          </div>

                          {/* Quick One-Click State Transition Buttons (Essential for Touch/Mobile & Quick Clicks) */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Backward */}
                            {task.status !== 'قيد الانتظار' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, task.status, 'backward')}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                                title={`رجوع إلى: ${
                                  task.status === 'مكتمل' ? 'قيد التنفيذ' : 'قيد الانتظار'
                                }`}
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Dropdown status selector */}
                            <select
                              value={task.status}
                              onChange={(e) =>
                                updateProjectTaskStatus(
                                  task.id,
                                  e.target.value as KanbanStatus
                                )
                              }
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                            >
                              <option value="قيد الانتظار">قيد الانتظار</option>
                              <option value="قيد التنفيذ">قيد التنفيذ</option>
                              <option value="مكتمل">مكتمل</option>
                            </select>

                            {/* Move Forward */}
                            {task.status !== 'مكتمل' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, task.status, 'forward')}
                                className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                title={`تقدم إلى: ${
                                  task.status === 'قيد الانتظار' ? 'قيد التنفيذ' : 'مكتمل'
                                }`}
                              >
                                <MoveLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Project Task */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl text-right animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  إضافة مهمة جديدة للوحة كانبان
                </h3>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  عنوان المهمة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تجهيز استمارات المتابعة والتسجيل"
                  value={newTaskForm.title}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Associated Project */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  المشروع المرتبط <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newTaskForm.projectId}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, projectId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  وصف المهمة والمخرجات المطلوبة
                </label>
                <textarea
                  rows={3}
                  placeholder="تفصيل الخطوات الإجرائية والمطلوب إنجازه..."
                  value={newTaskForm.description}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    المكلف بالمهمة
                  </label>
                  <select
                    value={newTaskForm.assignedTo}
                    onChange={(e) =>
                      setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.memberType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) =>
                      setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    الأولوية
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) =>
                      setNewTaskForm({
                        ...newTaskForm,
                        priority: e.target.value as 'عاجل' | 'متوسط' | 'عادي',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="عاجل">🚨 عاجل</option>
                    <option value="متوسط">⚡ متوسط</option>
                    <option value="عادي">📌 عادي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    حالة البداية في كانبان
                  </label>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) =>
                      setNewTaskForm({
                        ...newTaskForm,
                        status: e.target.value as KanbanStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white font-bold"
                  >
                    <option value="قيد الانتظار">قيد الانتظار</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتمل">مكتمل</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  وسوم وتصنيفات (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  placeholder="مثال: ميداني, لوجستيك, شباب"
                  value={newTaskForm.tagsText}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, tagsText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  حفظ وإدراج في كانبان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Task */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl text-right animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-sky-50 text-sky-700">
                  <Edit2 className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  تعديل بيانات المهمة
                </h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  الوصف
                </label>
                <textarea
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    الحالة الحالية
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as KanbanStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold bg-white"
                  >
                    <option value="قيد الانتظار">قيد الانتظار</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتمل">مكتمل</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    الأولوية
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as 'عاجل' | 'متوسط' | 'عادي',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="عاجل">🚨 عاجل</option>
                    <option value="متوسط">⚡ متوسط</option>
                    <option value="عادي">📌 عادي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    المكلف بالمهمة
                  </label>
                  <input
                    type="text"
                    value={editingTask.assignedTo}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, assignedTo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    deleteProjectTask(editingTask.id);
                    setEditingTask(null);
                  }}
                  className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف المهمة
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
