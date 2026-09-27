import { Activity, YouthProject, AssociationDocument, SmartNotification } from '../types';

/**
 * Intelligent Association Notification Engine
 * Automatically scans activities and projects to detect:
 * 1. Approaching activities (within 48h to 10 days) with seat/logistics alerts.
 * 2. Overdue project final reports or missed milestone phases.
 * 3. Completed activities missing final evaluation and documentation.
 */
export function evaluateSmartNotifications(
  activities: Activity[],
  projects: YouthProject[],
  documents: AssociationDocument[],
  currentDateStr: string = '2026-09-26'
): SmartNotification[] {
  const notifications: SmartNotification[] = [];
  const currentDate = new Date(currentDateStr);

  const getDaysDiff = (targetDateStr: string): number => {
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Scan Activities for Upcoming Deadlines & Logistics Gaps
  activities.forEach((act) => {
    if (act.status === 'مبرمج' || act.status === 'جاري') {
      const daysRemaining = getDaysDiff(act.date);
      const neededLogistics = act.logistics.filter((l) => l.status === 'needed' || l.status === 'pending');
      const seatsLeft = act.maxSeats - act.participants.length;

      // Imminent Activity (< 3 days / 72 hours)
      if (daysRemaining >= 0 && daysRemaining <= 3) {
        notifications.push({
          id: `notif-imminent-${act.id}`,
          category: 'upcoming_activity',
          title: `نشاط مبرمج خلال ${daysRemaining === 0 ? 'اليوم' : daysRemaining === 1 ? 'الغد' : `${daysRemaining} أيام`}: ${act.title}`,
          description: `ينطلق النشاط بتاريخ ${act.date} في ${act.venue}. المسؤول: ${act.coordinatorName}. تم حجز ${act.participants.length}/${act.maxSeats} مقعداً (${seatsLeft} مقاعد شاغرة). ${
            neededLogistics.length > 0
              ? `تنبيه: متبقي ${neededLogistics.length} مستلزمات لوجستية بحاجة لتأكيد التوفير!`
              : 'كافة التجهيزات اللوجستية جاهزة.'
          }`,
          severity: 'critical',
          timestamp: 'تنبيه آلي فوري',
          dueDate: act.date,
          daysRemaining,
          targetRole: 'all',
          relatedId: act.id,
          relatedTitle: act.title,
          actionLabel: 'تفقد النشاط واللوجستيك',
          actionTab: 'activities',
          isRead: false,
        });
      }
      // Approaching Activity (4 to 10 days)
      else if (daysRemaining > 3 && daysRemaining <= 10) {
        notifications.push({
          id: `notif-approaching-${act.id}`,
          category: 'upcoming_activity',
          title: `اقتراب موعد نشاط: ${act.title} (متبقي ${daysRemaining} أيام)`,
          description: `مبرمج يوم ${act.date} (${act.time}) بمقر ${act.venue}. المشرف: ${act.coordinatorName}. ${
            neededLogistics.length > 0
              ? `يرجى مراجعة الوسائل اللوجستية (${neededLogistics.length} مستلزمات قيد التوفير).`
              : 'جاهزية لوجستية ممتازة.'
          }`,
          severity: 'warning',
          timestamp: 'منذ ساعتين',
          dueDate: act.date,
          daysRemaining,
          targetRole: 'manager',
          relatedId: act.id,
          relatedTitle: act.title,
          actionLabel: 'فتح بطاقة النشاط',
          actionTab: 'activities',
          isRead: false,
        });
      }
    }

    // 2. Scan Completed Activities for Missing Final Reports
    if (act.status === 'مكتمل' && (!act.finalReportSummary || act.finalReportSummary.trim().length < 10)) {
      notifications.push({
        id: `notif-act-report-missing-${act.id}`,
        category: 'overdue_activity_report',
        title: `تأخر اعتماد التقرير النهائي لنشاط مكتمل: ${act.title}`,
        description: `النشاط أقيم بتاريخ ${act.date} وأنجز ميدانياً، لكن التقرير الأدبي وملخص التقييم لم يتم اعتمادهما بعد من طرف المسؤول (${act.coordinatorName}).`,
        severity: 'warning',
        timestamp: 'مطلوب للمصادقة',
        dueDate: act.date,
        targetRole: 'manager',
        relatedId: act.id,
        relatedTitle: act.title,
        actionLabel: 'تعبئة تقرير النشاط',
        actionTab: 'activities',
        isRead: false,
      });
    }
  });

  // 3. Scan Youth Projects for Overdue Final Reports or Delayed Milestones
  projects.forEach((proj) => {
    // Check if project is nearing completion or in review without a final document
    const hasArchivedReport = documents.some(
      (d) =>
        d.category === 'تقارير أدبية ومالية' &&
        (d.title.includes(proj.title) || d.summary.includes(proj.code))
    );

    // Overdue Project Milestones/Phases
    proj.phases.forEach((phase) => {
      const daysDiff = getDaysDiff(phase.dueDate);
      if (daysDiff < 0 && phase.progress < 100) {
        const daysOverdue = Math.abs(daysDiff);
        notifications.push({
          id: `notif-proj-phase-overdue-${proj.id}-${phase.id}`,
          category: 'overdue_project_report',
          title: `تأخر استحقاق مرحلة في مشروع "${proj.title}"`,
          description: `المرحلة: "${phase.name}" تجاوزت تاريخ الاستحقاق المحدد (${phase.dueDate}) بـ ${daysOverdue} أيام بنسبة إنجاز ${phase.progress}%. قائد المشروع: ${proj.leaderName}.`,
          severity: 'critical',
          timestamp: `متأخر منذ ${daysOverdue} أيام`,
          dueDate: phase.dueDate,
          daysRemaining: -daysOverdue,
          targetRole: 'admin',
          relatedId: proj.id,
          relatedTitle: proj.title,
          actionLabel: 'تحديث مراحل المشروع',
          actionTab: 'projects',
          isRead: false,
        });
      }
    });

    // Overdue Final Project Report (Projects with progress >= 80% or status === 'مرحلة التقييم' without archived report)
    if (
      (proj.progress >= 80 || proj.status === 'مرحلة التقييم') &&
      !hasArchivedReport
    ) {
      const endDaysDiff = getDaysDiff(proj.endDate);
      const isPastEnd = endDaysDiff <= 35; // Nearing close or past
      notifications.push({
        id: `notif-proj-final-report-${proj.id}`,
        category: 'overdue_project_report',
        title: `تنبيه إداري: مطلوب إيداع التقرير النهائي لمشروع "${proj.title}"`,
        description: `المشروع حقق نسبة تقدم بلغت ${proj.progress}% ودخل المراحل الختامية. يتعين على قائد المشروع (${proj.leaderName}) والمكتب التنفيذي إيداع التقرير التقني والمالي النهائي للاعتماد.`,
        severity: proj.progress >= 85 ? 'critical' : 'warning',
        timestamp: 'إشعار إداري عاجل',
        dueDate: proj.endDate,
        daysRemaining: endDaysDiff,
        targetRole: 'admin',
        relatedId: proj.id,
        relatedTitle: proj.title,
        actionLabel: 'توليد تقرير المشروع',
        actionTab: 'reports',
        isRead: false,
      });
    }
  });

  return notifications;
}
