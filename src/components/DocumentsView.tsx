import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Printer,
  Plus,
  FileCheck,
  FolderOpen,
  X,
  File,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssociationDocument } from '../types';

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, addToast, role } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<AssociationDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New doc form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AssociationDocument['category']>('قانون ونظام داخلي');
  const [newRef, setNewRef] = useState('');
  const [newAuthor, setNewAuthor] = useState('الأمانة العامة للجمعية');
  const [newSummary, setNewSummary] = useState('');
  const [newFormat, setNewFormat] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');

  const categories = [
    'قانون ونظام داخلي',
    'محاضر جلسات',
    'مراسلات إدارية',
    'اتفاقيات وشراكات',
    'تقارير أدبية ومالية',
    'نماذج واستمارات',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addDocument({
      title: newTitle.trim(),
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: newRef.trim() || `JAM/DOC/${new Date().getFullYear()}/${documents.length + 1}`,
      author: newAuthor.trim(),
      fileFormat: newFormat,
      fileSize: '1.2 MB',
      summary: newSummary.trim() || 'وثيقة إدارية مؤرشفة في مكتبة جمعية +.',
      tags: [newCategory, 'أرشيف رقمي'],
    });

    setNewTitle('');
    setNewRef('');
    setNewSummary('');
    setShowUploadModal(false);
  };

  const handleSimulateDownload = (doc: AssociationDocument) => {
    addToast(`جاري تحميل ملف "${doc.title}" بصيغة ${doc.fileFormat}...`, 'info');
    // Simulated file download
    const blob = new Blob([`${doc.title}\n\nالمرجع: ${doc.referenceNumber}\nالتاريخ: ${doc.date}\nالجهة المصدرة: ${doc.author}\n\nالملخص:\n${doc.summary}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_${doc.title.slice(0, 20)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            إدارة الوثائق والمكتبة الإلكترونية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            الأرشيف القانوني، محاضر الاجتماعات، الاتفاقيات، التقارير والنماذج الرسمية
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            أرشفة وثيقة جديدة
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في الوثائق، رقم المرجع، المحتوى، أو الكلمات المفتاحية..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-slate-800"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white text-slate-700 shrink-0"
          >
            <option value="all">كافة التصنيفات ({documents.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({documents.filter((d) => d.category === c).length})
              </option>
            ))}
          </select>
        </div>

        {/* Unboxed metadata stats */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>الوثائق المؤرشفة: <strong className="font-mono-num text-slate-800">{filteredDocs.length}</strong> وثيقة</span>
          <span aria-hidden="true">·</span>
          <span>الأرشيف الرقمي المحدث: <strong className="font-mono-num text-emerald-700">الموسم 2026</strong></span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs p-5 flex flex-col justify-between text-right group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-num text-slate-400">{doc.referenceNumber}</span>
                <span className="text-[10px] font-bold font-mono-num px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {doc.fileFormat} · {doc.fileSize}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3
                    onClick={() => setPreviewDoc(doc)}
                    className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                  >
                    {doc.title}
                  </h3>
                  <div className="text-[11px] text-slate-500">{doc.category}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {doc.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {doc.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono-num text-[11px]">{doc.date}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                >
                  معاينة
                </button>
                <button
                  onClick={() => handleSimulateDownload(doc)}
                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  تحميل
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl text-right space-y-5 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono-num text-slate-400">{previewDoc.referenceNumber}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{previewDoc.title}</h2>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">التصنيف:</span>{' '}
                  <span className="font-semibold text-slate-800">{previewDoc.category}</span>
                </div>
                <div>
                  <span className="text-slate-500">تاريخ الإصدار / الاعتماد:</span>{' '}
                  <span className="font-mono-num text-slate-800">{previewDoc.date}</span>
                </div>
                <div>
                  <span className="text-slate-500">الجهة المصدرة:</span>{' '}
                  <span className="font-semibold text-slate-800">{previewDoc.author}</span>
                </div>
                <div>
                  <span className="text-slate-500">الصيغة والحجم:</span>{' '}
                  <span className="font-mono-num text-slate-800">{previewDoc.fileFormat} ({previewDoc.fileSize})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">ملخص محتوى الوثيقة:</span>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {previewDoc.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                طباعة الملخص
              </button>
              <button
                onClick={() => handleSimulateDownload(previewDoc)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                تحميل الوثيقة الرسمية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">أرشفة وثيقة جمعوية جديدة</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">عنوان الوثيقة:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: محضر تنصيب نادي الروبوتيك والابتكار"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">التصنيف الإداري:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الصيغة:</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">Word (DOCX)</option>
                    <option value="XLSX">Excel (XLSX)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الرقم المرجعي:</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  placeholder="SHB/PV/2026/05"
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الجهة المصدرة / المؤطرة:</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ملخص محتوى الوثيقة:</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="اكتب ملخصاً مقتضباً عن موضوع الوثيقة والقرارات المعتمدة..."
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  حفظ في الأرشيف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
