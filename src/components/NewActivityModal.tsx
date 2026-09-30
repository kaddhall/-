import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, MapPin, Users, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogisticsItem } from '../types';
import { INITIAL_TECH_IMAGE, INITIAL_ACTION_IMAGE } from '../data/initialData';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({ isOpen, onClose }) => {
  const { addActivity, programAxes, members } = useApp();

  const [title, setTitle] = useState('');
  const [axisId, setAxisId] = useState(programAxes[0]?.id || 'axis-1');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-20');
  const [time, setTime] = useState('14:30 - 17:00');
  const [venue, setVenue] = useState('قاعة المحاضرات - دار الشباب (مقر الجمعية)');
  const [targetAudience, setTargetAudience] = useState('منخرطو الجمعية وشباب البلدية');
  const [maxSeats, setMaxSeats] = useState<number>(40);
  const [coordinatorName, setCoordinatorName] = useState(members[1]?.name || 'مريم بن زيان');
  const [selectedImage, setSelectedImage] = useState<string>(INITIAL_TECH_IMAGE);

  // Logistics builder
  const [logistics, setLogistics] = useState<Omit<LogisticsItem, 'id'>[]>([
    { item: 'جهاز عرض ذكي ومكبر صوت', quantity: '1 طقم', status: 'ready', assignedTo: coordinatorName },
    { item: 'كراس الورشة وحقائب المشاركين', quantity: '40 نسخة', status: 'pending', assignedTo: coordinatorName },
    { item: 'استراحة شاي وقهوة للمشاركين', quantity: '45 وجبة', status: 'needed', assignedTo: coordinatorName },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  if (!isOpen) return null;

  const handleAddLogItem = () => {
    if (!newItemName.trim()) return;
    setLogistics([
      ...logistics,
      {
        item: newItemName.trim(),
        quantity: newItemQty.trim() || '1',
        status: 'pending',
        assignedTo: coordinatorName,
      },
    ]);
    setNewItemName('');
    setNewItemQty('');
  };

  const handleRemoveLogItem = (index: number) => {
    setLogistics(logistics.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goal.trim()) return;

    // Generate random 4-digit PIN for dynamic attendance
    const pin = String(Math.floor(1000 + Math.random() * 9000));

    const finalLogistics: LogisticsItem[] = logistics.map((l, idx) => ({
      ...l,
      id: `log-init-${Date.now()}-${idx}`,
    }));

    addActivity({
      title: title.trim(),
      axisId,
      goal: goal.trim(),
      description: description.trim() || goal.trim(),
      date,
      time,
      venue,
      targetAudience,
      maxSeats,
      coordinatorId: members.find((m) => m.name === coordinatorName)?.id || 'mem-1',
      coordinatorName,
      teamMembers: ['سارة بوحفص', 'أمين دحماني'],
      status: 'مبرمج',
      attendancePin: pin,
      image: selectedImage,
      logistics: finalLogistics,
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
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              إنشاء وبرمجة بطاقة نشاط جمعوي جديد
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              عنوان النشاط أو الدورة: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ورشة التصميم وصناعة الهوية البصرية للجمعيات"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:border-emerald-500"
            />
          </div>

          {/* Axis & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">المحور التابع له:</label>
              <select
                value={axisId}
                onChange={(e) => setAxisId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
              >
                {programAxes.map((ax) => (
                  <option key={ax.id} value={ax.id}>
                    {ax.name} ({ax.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">الفئة المستهدفة:</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="مثال: منخرطو نوادي الإعلام والابتكار"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Goal & Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              الهدف العام من النشاط: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="مثال: تزويد 30 عضواً بمهارات إنتاج تصاميم رقمية احترافية"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">التفاصيل وخطة التنفيذ:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة عن محتوى النشاط والمحاور والمدربين..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          {/* Timing, Venue & Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">تاريخ النشاط:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">التوقيت:</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="مثال: 14:00 - 17:30"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-mono-num"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">المقاعد المتاحة:</label>
              <input
                type="number"
                min={5}
                max={300}
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num text-xs"
              />
            </div>
          </div>

          {/* Venue & Coordinator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">المكان والمرفق:</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="مثال: قاعة المحاضرات - دار الشباب"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">المسؤول عن النشاط:</label>
              <select
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.memberType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logistics & Equipment Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold">
              الوسائل والاحتياجات اللوجستية للنشاط:
            </label>

            <div className="space-y-1.5">
              {logistics.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">• {item.item}</span>
                    <span className="text-[11px] text-slate-500 font-mono-num">({item.quantity})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLogItem(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="إضافة مستلزم (مثال: منصة تكريم، لافتة...)"
                className="flex-1 p-2 rounded-lg border border-slate-200 text-xs"
              />
              <input
                type="text"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                placeholder="الكمية"
                className="w-20 p-2 rounded-lg border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={handleAddLogItem}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold whitespace-nowrap"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Actions */}
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
              اعتماد وبرمجة النشاط
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
