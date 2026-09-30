import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Member,
  Activity,
  ProgramAxis,
  AnnualProgramItem,
  YouthProject,
  ProjectTask,
  KanbanStatus,
  AssociationDocument,
  Announcement,
  Poll,
  AssociationAlert,
  Role,
  LogisticsItem,
  SmartNotification,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_PROGRAM_AXES,
  INITIAL_PROGRAM_ITEMS,
  INITIAL_ACTIVITIES,
  INITIAL_PROJECTS,
  INITIAL_PROJECT_TASKS,
  INITIAL_DOCUMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLLS,
  INITIAL_ALERTS,
} from '../data/initialData';
import { evaluateSmartNotifications } from '../utils/notificationEngine';

export type NavigationTab =
  | 'dashboard'
  | 'members'
  | 'activities'
  | 'program'
  | 'portal'
  | 'projects'
  | 'documents'
  | 'reports'
  | 'communication';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentMember: Member;
  setCurrentMemberId: (id: string) => void;

  // Data
  members: Member[];
  activities: Activity[];
  programAxes: ProgramAxis[];
  programItems: AnnualProgramItem[];
  projects: YouthProject[];
  projectTasks: ProjectTask[];
  documents: AssociationDocument[];
  announcements: Announcement[];
  polls: Poll[];
  alerts: AssociationAlert[];
  smartNotifications: SmartNotification[];
  unreadNotificationsCount: number;
  toasts: Toast[];
  isPermissionsModalOpen: boolean;
  setIsPermissionsModalOpen: (open: boolean) => void;

  // Actions
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  dismissSmartNotification: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Members
  addMember: (member: Omit<Member, 'id' | 'code' | 'attendanceRate' | 'volunteerHours' | 'activitiesCount' | 'tasks' | 'certificates'>) => void;
  updateMember: (member: Member) => void;

  // Activities
  addActivity: (activity: Omit<Activity, 'id' | 'code' | 'participants'>) => void;
  updateActivity: (activity: Activity) => void;
  toggleActivityEnrollment: (activityId: string, memberId: string) => void;
  recordAttendance: (activityId: string, memberId: string, checkInTime?: string) => boolean;
  verifyAttendancePin: (activityId: string, pin: string, memberId: string) => boolean;
  updateLogisticsItem: (activityId: string, item: LogisticsItem) => void;
  addLogisticsItem: (activityId: string, item: Omit<LogisticsItem, 'id'>) => void;
  saveActivityReport: (activityId: string, evaluationScore: number, finalReportSummary: string, results: string[]) => void;

  // Program
  updateProgramItemProgress: (itemId: string, newProgress: number) => void;
  addProgramItem: (item: Omit<AnnualProgramItem, 'id'>) => void;

  // Projects & Tasks
  addProject: (project: Omit<YouthProject, 'id' | 'code' | 'progress'>) => void;
  updateProjectPhase: (projectId: string, phaseId: string, progress: number, status: 'completed' | 'current' | 'upcoming') => void;
  addProjectTask: (task: Omit<ProjectTask, 'id' | 'createdAt'>) => void;
  updateProjectTaskStatus: (taskId: string, newStatus: KanbanStatus) => void;
  updateProjectTask: (task: ProjectTask) => void;
  deleteProjectTask: (taskId: string) => void;

  // Documents
  addDocument: (doc: Omit<AssociationDocument, 'id' | 'code'>) => void;

  // Communication
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  votePoll: (pollId: string, optionId: string) => void;
  addPoll: (poll: Omit<Poll, 'id' | 'totalVotes' | 'isActive'>) => void;

  // Alerts
  dismissAlert: (id: string) => void;

  // Modal handlers
  activeQRActivity: Activity | null;
  openQRAttendanceModal: (activity: Activity) => void;
  closeQRAttendanceModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  ROLE: 'shabansha_role_v1',
  MEMBERS: 'shabansha_members_v1',
  ACTIVITIES: 'shabansha_activities_v1',
  PROGRAM_ITEMS: 'shabansha_prog_items_v1',
  PROJECTS: 'shabansha_projects_v1',
  PROJECT_TASKS: 'shabansha_proj_tasks_v1',
  DOCUMENTS: 'shabansha_documents_v1',
  ANNOUNCEMENTS: 'shabansha_announcements_v1',
  POLLS: 'shabansha_polls_v1',
  CURRENT_MEMBER_ID: 'shabansha_current_mem_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as Role) || 'admin';
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [currentMemberId, setCurrentMemberIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_MEMBER_ID);
    return saved || 'mem-1';
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [programAxes] = useState<ProgramAxis[]>(INITIAL_PROGRAM_AXES);

  const [programItems, setProgramItems] = useState<AnnualProgramItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRAM_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_PROGRAM_ITEMS;
  });

  const [projects, setProjects] = useState<YouthProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECT_TASKS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_TASKS;
  });

  const [documents, setDocuments] = useState<AssociationDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POLLS);
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  const [alerts, setAlerts] = useState<AssociationAlert[]>(INITIAL_ALERTS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [activeQRActivity, setActiveQRActivity] = useState<Activity | null>(null);

  // Smart Notifications State (Read & Dismissed tracking)
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('shabansha_read_notifs_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('shabansha_dismissed_notifs_v1');
    return saved ? JSON.parse(saved) : [];
  });

  // Evaluate smart notifications dynamically based on current data
  const smartNotifications = useMemo(() => {
    const evaluated = evaluateSmartNotifications(activities, projects, documents, '2026-09-26');
    return evaluated
      .filter((n) => !dismissedNotifIds.includes(n.id))
      .map((n) => ({
        ...n,
        isRead: readNotifIds.includes(n.id),
      }));
  }, [activities, projects, documents, dismissedNotifIds, readNotifIds]);

  const unreadNotificationsCount = useMemo(() => {
    return smartNotifications.filter((n) => !n.isRead).length;
  }, [smartNotifications]);

  const markNotificationAsRead = (id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('shabansha_read_notifs_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const dismissSmartNotification = (id: string) => {
    setDismissedNotifIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem('shabansha_dismissed_notifs_v1', JSON.stringify(updated));
      return updated;
    });
    addToast('تم إخفاء التنبيه بنجاح', 'info');
  };

  const markAllNotificationsAsRead = () => {
    const allIds = smartNotifications.map((n) => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('shabansha_read_notifs_v1', JSON.stringify(allIds));
    addToast('تم تحديد جميع التنبيهات كمقروءة', 'success');
  };

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRAM_ITEMS, JSON.stringify(programItems));
  }, [programItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(projectTasks));
  }, [projectTasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MEMBER_ID, currentMemberId);
  }, [currentMemberId]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    // Optionally switch to suitable persona
    if (newRole === 'member') {
      setCurrentMemberIdState('mem-4'); // Sarah (volunteer / member)
      if (activeTab !== 'dashboard') {
        setActiveTab('portal');
      }
    } else if (newRole === 'manager') {
      setCurrentMemberIdState('mem-2'); // Meriem (coordinator)
      if (activeTab !== 'dashboard') {
        setActiveTab('activities');
      }
    } else {
      setCurrentMemberIdState('mem-1'); // Abdelkader (admin)
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
      }
    }
    const roleTitle =
      newRole === 'admin'
        ? 'الإدارة العامة'
        : newRole === 'manager'
        ? 'مسؤول النشاط'
        : 'المنخرط';
    addToast(`تم التبديل إلى مستوى: ${roleTitle}`, 'info');
  };

  const setCurrentMemberId = (id: string) => {
    setCurrentMemberIdState(id);
    const m = members.find((x) => x.id === id);
    if (m) {
      setRoleState(m.role);
      addToast(`تم تحديد المستخدم: ${m.name}`, 'info');
    }
  };

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Member actions
  const addMember = (data: Omit<Member, 'id' | 'code' | 'attendanceRate' | 'volunteerHours' | 'activitiesCount' | 'tasks' | 'certificates'>) => {
    const newCount = members.length + 1;
    const code = `SHB-2026-${String(newCount).padStart(3, '0')}`;
    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}`,
      code,
      attendanceRate: 100,
      volunteerHours: 0,
      activitiesCount: 0,
      tasks: [],
      certificates: [],
    };
    setMembers((prev) => [newMember, ...prev]);
    addToast(`تم تسجيل المنخرط ${newMember.name} بنجاح برقم: ${code}`, 'success');
  };

  const updateMember = (updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    addToast(`تم تحديث بيانات ${updated.name}`, 'success');
  };

  // Activities actions
  const addActivity = (data: Omit<Activity, 'id' | 'code' | 'participants'>) => {
    const code = `ACT-2026-${String(activities.length + 10).padStart(2, '0')}`;
    const newActivity: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      code,
      participants: [],
      logistics: data.logistics || [],
    };
    setActivities((prev) => [newActivity, ...prev]);
    addToast(`تم إنشاء بطاقة النشاط: ${newActivity.title}`, 'success');
  };

  const updateActivity = (updated: Activity) => {
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (activeQRActivity && activeQRActivity.id === updated.id) {
      setActiveQRActivity(updated);
    }
  };

  const toggleActivityEnrollment = (activityId: string, memberId: string) => {
    const act = activities.find((a) => a.id === activityId);
    const mem = members.find((m) => m.id === memberId);
    if (!act || !mem) return;

    const isEnrolled = act.participants.some((p) => p.memberId === memberId);
    let updatedParticipants = [...act.participants];

    if (isEnrolled) {
      updatedParticipants = updatedParticipants.filter((p) => p.memberId !== memberId);
      addToast(`تم إلغاء التسجيل في النشاط: ${act.title}`, 'info');
    } else {
      if (act.participants.length >= act.maxSeats) {
        addToast('عذراً، اكتمل العدد الأقصى للمقاعد المتاحة لهذا النشاط', 'warning');
        return;
      }
      updatedParticipants.push({
        memberId: mem.id,
        memberName: mem.name,
        memberCode: mem.code,
        memberType: mem.memberType,
        registeredAt: new Date().toISOString().split('T')[0],
        attended: false,
      });
      addToast(`تم تسجيلك بنجاح في نشاط "${act.title}"!`, 'success');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {
        // Safe fallback
      }
    }

    const updatedActivity = { ...act, participants: updatedParticipants };
    updateActivity(updatedActivity);
  };

  const recordAttendance = (activityId: string, memberId: string, checkInTime?: string): boolean => {
    const act = activities.find((a) => a.id === activityId);
    const mem = members.find((m) => m.id === memberId);
    if (!act || !mem) return false;

    const now = checkInTime || new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
    let updatedParticipants = [...act.participants];
    const existingIndex = updatedParticipants.findIndex((p) => p.memberId === memberId);

    if (existingIndex >= 0) {
      if (updatedParticipants[existingIndex].attended) {
        addToast(`تم تأكيد حضور ${mem.name} مسبقاً في هذا النشاط`, 'info');
        return true;
      }
      updatedParticipants[existingIndex] = {
        ...updatedParticipants[existingIndex],
        attended: true,
        checkInTime: now,
      };
    } else {
      // Auto-enroll and attend
      updatedParticipants.push({
        memberId: mem.id,
        memberName: mem.name,
        memberCode: mem.code,
        memberType: mem.memberType,
        registeredAt: new Date().toISOString().split('T')[0],
        attended: true,
        checkInTime: now,
      });
    }

    const updatedActivity = { ...act, participants: updatedParticipants };
    updateActivity(updatedActivity);

    // Update member activity count and hours
    const updatedMember = {
      ...mem,
      activitiesCount: mem.activitiesCount + 1,
      volunteerHours: mem.volunteerHours + 4,
    };
    updateMember(updatedMember);

    addToast(`تم تسجيل حضور ${mem.name} بنجاح!`, 'success');
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
    } catch (e) {}

    return true;
  };

  const verifyAttendancePin = (activityId: string, pin: string, memberId: string): boolean => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return false;
    if (act.attendancePin.trim() === pin.trim()) {
      return recordAttendance(activityId, memberId);
    } else {
      addToast('رمز التحقق غير صحيح، يرجى التأكد من الرمز المعروض على شاشة النشاط', 'error');
      return false;
    }
  };

  const updateLogisticsItem = (activityId: string, item: LogisticsItem) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    const updatedLogistics = act.logistics.map((l) => (l.id === item.id ? item : l));
    updateActivity({ ...act, logistics: updatedLogistics });
    addToast('تم تحديث حالة المستلزم اللوجستي', 'info');
  };

  const addLogisticsItem = (activityId: string, item: Omit<LogisticsItem, 'id'>) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    const newItem: LogisticsItem = { ...item, id: `log-${Date.now()}` };
    updateActivity({ ...act, logistics: [...act.logistics, newItem] });
    addToast('تمت إضافة المستلزم إلى قائمة الاحتياجات', 'success');
  };

  const saveActivityReport = (activityId: string, evaluationScore: number, finalReportSummary: string, results: string[]) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    updateActivity({
      ...act,
      status: 'مكتمل',
      evaluationScore,
      finalReportSummary,
      results,
    });
    addToast('تم اعتماد التقرير النهائي وتقييم النشاط بنجاح', 'success');
  };

  // Program actions
  const updateProgramItemProgress = (itemId: string, newProgress: number) => {
    setProgramItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const clamped = Math.max(0, Math.min(100, newProgress));
          const status = clamped === 100 ? 'مكتمل' : clamped > 0 ? 'قيد الإنجاز' : 'لم يبدأ';
          return { ...item, currentProgress: clamped, status };
        }
        return item;
      })
    );
    addToast('تم تحديث نسبة إنجاز النشاط ضمن البرنامج السنوي', 'info');
  };

  const addProgramItem = (item: Omit<AnnualProgramItem, 'id'>) => {
    const newItem: AnnualProgramItem = {
      ...item,
      id: `prog-${Date.now()}`,
    };
    setProgramItems((prev) => [...prev, newItem]);
    addToast('تم إدراج نشاط جديد ضمن البرنامج السنوي', 'success');
  };

  // Projects actions
  const addProject = (project: Omit<YouthProject, 'id' | 'code' | 'progress'>) => {
    const code = `PRJ-2026-${String(projects.length + 1).padStart(2, '0')}`;
    const newProject: YouthProject = {
      ...project,
      id: `proj-${Date.now()}`,
      code,
      progress: 10,
    };
    setProjects((prev) => [newProject, ...prev]);
    addToast(`تم إطلاق المشروع الشبابي: ${newProject.title}`, 'success');
  };

  const updateProjectPhase = (projectId: string, phaseId: string, progress: number, status: 'completed' | 'current' | 'upcoming') => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const updatedPhases = proj.phases.map((ph) =>
            ph.id === phaseId ? { ...ph, progress, status } : ph
          );
          const total = updatedPhases.reduce((acc, curr) => acc + curr.progress, 0);
          const overall = Math.round(total / updatedPhases.length);
          const projectStatus = overall === 100 ? 'منجز بنجاح' : overall >= 85 ? 'مرحلة التقييم' : 'قيد التنفيذ';
          return {
            ...proj,
            phases: updatedPhases,
            progress: overall,
            status: projectStatus,
          };
        }
        return proj;
      })
    );
    addToast('تم تحديث مراحل ومؤشرات تقدم المشروع', 'info');
  };

  const addProjectTask = (task: Omit<ProjectTask, 'id' | 'createdAt'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `ptk-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjectTasks((prev) => [newTask, ...prev]);
    addToast(`تمت إضافة المهمة: ${newTask.title}`, 'success');
  };

  const updateProjectTaskStatus = (taskId: string, newStatus: KanbanStatus) => {
    setProjectTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === 'مكتمل' && t.status !== 'مكتمل') {
            try {
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
            } catch (e) {}
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
    addToast(`تم نقل المهمة إلى: "${newStatus}"`, 'info');
  };

  const updateProjectTask = (task: ProjectTask) => {
    setProjectTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    addToast(`تم تحديث بيانات المهمة: ${task.title}`, 'success');
  };

  const deleteProjectTask = (taskId: string) => {
    setProjectTasks((prev) => prev.filter((t) => t.id !== taskId));
    addToast('تم حذف المهمة من لوحة كانبان', 'info');
  };

  // Documents
  const addDocument = (doc: Omit<AssociationDocument, 'id' | 'code'>) => {
    const code = `DOC-${String(Date.now()).slice(-4)}`;
    const newDoc: AssociationDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      code,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addToast(`تم أرشفة الوثيقة: ${newDoc.title}`, 'success');
  };

  // Communication
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addToast('تم نشر الإعلان لكافة الأعضاء', 'success');
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          if (poll.userVotedOptionId) {
            addToast('لقد قمت بالتصويت مسبقاً في هذا الاستطلاع', 'info');
            return poll;
          }
          const updatedOptions = poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          addToast('شكراً لمشاركتك! تم احتساب صوتك بنجاح', 'success');
          try {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
          } catch (e) {}
          return {
            ...poll,
            options: updatedOptions,
            totalVotes: poll.totalVotes + 1,
            userVotedOptionId: optionId,
          };
        }
        return poll;
      })
    );
  };

  const addPoll = (poll: Omit<Poll, 'id' | 'totalVotes' | 'isActive'>) => {
    const newPoll: Poll = {
      ...poll,
      id: `poll-${Date.now()}`,
      totalVotes: 0,
      isActive: true,
    };
    setPolls((prev) => [newPoll, ...prev]);
    addToast('تم إطلاق استطلاع الرأي للمنخرطين', 'success');
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const openQRAttendanceModal = (activity: Activity) => {
    setActiveQRActivity(activity);
  };

  const closeQRAttendanceModal = () => {
    setActiveQRActivity(null);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        currentMember,
        setCurrentMemberId,
        members,
        activities,
        programAxes,
        programItems,
        projects,
        projectTasks,
        addProjectTask,
        updateProjectTaskStatus,
        updateProjectTask,
        deleteProjectTask,
        documents,
        announcements,
        polls,
        alerts,
        smartNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        dismissSmartNotification,
        markAllNotificationsAsRead,
        toasts,
        isPermissionsModalOpen,
        setIsPermissionsModalOpen,
        addToast,
        dismissToast,
        addMember,
        updateMember,
        addActivity,
        updateActivity,
        toggleActivityEnrollment,
        recordAttendance,
        verifyAttendancePin,
        updateLogisticsItem,
        addLogisticsItem,
        saveActivityReport,
        updateProgramItemProgress,
        addProgramItem,
        addProject,
        updateProjectPhase,
        addDocument,
        addAnnouncement,
        votePoll,
        addPoll,
        dismissAlert,
        activeQRActivity,
        openQRAttendanceModal,
        closeQRAttendanceModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
