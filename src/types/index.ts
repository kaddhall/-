export type Role = 'admin' | 'manager' | 'member';

export type MemberType = 'عضو مكتب' | 'مسؤول نشاط' | 'مؤطر' | 'متطوع' | 'منخرط';

export type ClubDomain = 'الرياضة' | 'الثقافة والفنون' | 'العمل التطوعي والخيري' | 'الابتكار والتقنية' | 'الإعلام والتواصل' | 'البيئة والتنمية المستدامة';

export interface Task {
  id: string;
  title: string;
  activityTitle?: string;
  dueDate: string;
  completed: boolean;
  priority: 'عاجل' | 'متوسط' | 'عادي';
}

export interface Certificate {
  id: string;
  title: string;
  activityName: string;
  issueDate: string;
  code: string;
  type: 'مشاركة' | 'تطوع' | 'تأطير' | 'شرفية';
}

export interface Member {
  id: string;
  code: string; // e.g. SHB-2026-001
  name: string;
  email: string;
  phone: string;
  role: Role;
  memberType: MemberType;
  club: ClubDomain;
  joinDate: string;
  status: 'نشط' | 'قيد المراجعة' | 'غير نشط';
  avatar?: string;
  nationalId: string;
  occupation: string;
  birthDate: string;
  bloodGroup?: string;
  attendanceRate: number; // percentage
  volunteerHours: number;
  activitiesCount: number;
  tasks: Task[];
  certificates: Certificate[];
  bio?: string;
}

export interface LogisticsItem {
  id: string;
  item: string;
  status: 'ready' | 'pending' | 'needed';
  quantity?: string;
  assignedTo?: string;
}

export interface ParticipantRecord {
  memberId: string;
  memberName: string;
  memberCode: string;
  memberType: MemberType;
  registeredAt: string;
  attended: boolean;
  checkInTime?: string;
}

export interface Activity {
  id: string;
  code: string;
  title: string;
  axisId: string;
  projectId?: string;
  goal: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  targetAudience: string;
  maxSeats: number;
  coordinatorId: string;
  coordinatorName: string;
  teamMembers: string[]; // names or ids
  status: 'مبرمج' | 'جاري' | 'مكتمل' | 'مؤجل';
  attendancePin: string; // 4 digits PIN for fast check-in
  logistics: LogisticsItem[];
  participants: ParticipantRecord[];
  image?: string;
  evaluationScore?: number; // out of 10
  results?: string[];
  finalReportSummary?: string;
}

export interface AnnualProgramItem {
  id: string;
  axisId: string;
  axisName: string;
  projectTitle: string;
  activityTitle: string;
  managerName: string;
  startDate: string;
  endDate: string;
  resources: string;
  indicator: string;
  currentProgress: number; // 0-100
  status: 'مكتمل' | 'قيد الإنجاز' | 'لم يبدأ' | 'متأخر';
}

export interface ProgramAxis {
  id: string;
  name: string;
  description: string;
  code: string;
  color: string;
  targetActivities: number;
  completedActivities: number;
  overallProgress: number;
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  progress: number;
  dueDate: string;
}

export interface YouthProject {
  id: string;
  code: string;
  title: string;
  problem: string;
  idea: string;
  objectives: string[];
  targetAudience: string;
  leaderName: string;
  teamMembers: string[];
  budget: {
    allocated: number;
    spent: number;
  };
  progress: number;
  phases: ProjectPhase[];
  keyResults: string[];
  status: 'قيد التخطيط' | 'قيد التنفيذ' | 'مرحلة التقييم' | 'منجز بنجاح';
  startDate: string;
  endDate: string;
}

export interface AssociationDocument {
  id: string;
  title: string;
  code: string;
  category: 'قانون ونظام داخلي' | 'محاضر جلسات' | 'مراسلات إدارية' | 'اتفاقيات وشراكات' | 'تقارير أدبية ومالية' | 'نماذج واستمارات';
  date: string;
  referenceNumber: string;
  author: string;
  fileFormat: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  summary: string;
  tags: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'عاجل' | 'مهم' | 'عادي';
  date: string;
  author: string;
  targetRole: 'الكل' | 'المنخرطين' | 'مسؤولو الأنشطة';
  isPinned?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: string;
  isActive: boolean;
  userVotedOptionId?: string;
}

export interface SmartNotification {
  id: string;
  category: 'upcoming_activity' | 'overdue_project_report' | 'overdue_activity_report' | 'logistics_missing' | 'urgent_task';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  dueDate?: string;
  daysRemaining?: number; // negative = days overdue!
  targetRole: 'all' | 'admin' | 'manager';
  relatedId?: string;
  relatedTitle?: string;
  actionLabel: string;
  actionTab: 'activities' | 'projects' | 'reports' | 'documents' | 'dashboard';
  isRead: boolean;
}

export interface AssociationAlert {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  date: string;
  actionLabel?: string;
  actionTarget?: string;
}
