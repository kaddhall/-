/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MembersView } from './components/MembersView';
import { ActivitiesView } from './components/ActivitiesView';
import { AnnualProgramView } from './components/AnnualProgramView';
import { MemberPortalView } from './components/MemberPortalView';
import { ProjectsView } from './components/ProjectsView';
import { DocumentsView } from './components/DocumentsView';
import { ReportsView } from './components/ReportsView';
import { CommunicationView } from './components/CommunicationView';
import { QRAttendanceModal } from './components/QRAttendanceModal';
import { NewActivityModal } from './components/NewActivityModal';
import { NewMemberModal } from './components/NewMemberModal';
import { NewProjectModal } from './components/NewProjectModal';
import { PermissionsGuideModal } from './components/PermissionsGuideModal';
import { ToastContainer } from './components/ToastContainer';
import { Menu, Sparkles, Layers, Users, Calendar, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    role,
    isPermissionsModalOpen,
    setIsPermissionsModalOpen,
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global modals
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top 3-Zone Header */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Right Sidebar (for Arabic RTL) */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 lg:pb-8">
          {/* Mobile breadcrumb / quick bar */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <Menu className="w-4 h-4" />
              <span>القائمة الكاملة</span>
            </button>

            <span className="text-xs font-bold text-slate-800">
              {activeTab === 'dashboard' && 'لوحة القيادة'}
              {activeTab === 'members' && 'إدارة المنخرطين'}
              {activeTab === 'activities' && 'إدارة النشاطات'}
              {activeTab === 'program' && 'البرنامج السنوي'}
              {activeTab === 'portal' && 'فضاء المنخرط'}
              {activeTab === 'projects' && 'المشاريع الشبابية'}
              {activeTab === 'documents' && 'إدارة الوثائق'}
              {activeTab === 'reports' && 'مركز التقارير'}
              {activeTab === 'communication' && 'التواصل والاستطلاعات'}
            </span>
          </div>

          {/* Active View Switching */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewActivity={() => setIsNewActivityOpen(true)}
              onOpenNewMember={() => setIsNewMemberOpen(true)}
              onOpenNewProject={() => setIsNewProjectOpen(true)}
            />
          )}

          {activeTab === 'members' && (
            <MembersView onOpenNewMemberModal={() => setIsNewMemberOpen(true)} />
          )}

          {activeTab === 'activities' && (
            <ActivitiesView onOpenNewActivityModal={() => setIsNewActivityOpen(true)} />
          )}

          {activeTab === 'program' && <AnnualProgramView />}

          {activeTab === 'portal' && <MemberPortalView />}

          {activeTab === 'projects' && (
            <ProjectsView onOpenNewProjectModal={() => setIsNewProjectOpen(true)} />
          )}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'communication' && <CommunicationView />}
        </main>
      </div>

      {/* Mobile Sticky Quick Navigation Bar (Caps at <15% viewport height) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around no-print shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'activities' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الأنشطة</span>
        </button>

        <button
          onClick={() => setActiveTab('portal')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'portal' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>فضاء المنخرط</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'members' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>المنخرطين</span>
        </button>
      </div>

      {/* Global Interactive Modals */}
      <QRAttendanceModal />

      <NewActivityModal
        isOpen={isNewActivityOpen}
        onClose={() => setIsNewActivityOpen(false)}
      />

      <NewMemberModal
        isOpen={isNewMemberOpen}
        onClose={() => setIsNewMemberOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <PermissionsGuideModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
