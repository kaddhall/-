import React, { useState } from 'react';
import { X, UserPlus, Shield, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MemberType, ClubDomain, Role } from '../types';

interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMemberModal: React.FC<NewMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberType, setMemberType] = useState<MemberType>('منخرط');
  const [club, setClub] = useState<ClubDomain>('الابتكار والتقنية');
  const [role, setRole] = useState<Role>('member');
  const [occupation, setOccupation] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addMember({
      name: name.trim(),
      email: email.trim() || `${name.trim().replace(/\s+/g, '.')}@shabansha.org`,
      phone: phone.trim(),
      memberType,
      club,
      role,
      status: 'نشط',
      occupation: occupation.trim() || 'طالب / ناشط جمعوي',
      nationalId: nationalId.trim() || String(Math.floor(100000000000 + Math.random() * 900000000000)),
      birthDate,
      bloodGroup,
      bio: bio.trim() || `عضو ناشط في جمعية + ضمن نادي ${club}.`,
      joinDate: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl text-right animate-in fade-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              تسجيل ملف منخرط جديد في جمعية +
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
              الاسم واللقب الكامل: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فاروق بوعلام"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                رقم الهاتف: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550 00 00 00"
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">البريد الإلكتروني:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">نوع العضوية:</label>
              <select
                value={memberType}
                onChange={(e) => {
                  const val = e.target.value as MemberType;
                  setMemberType(val);
                  if (val === 'عضو مكتب') setRole('admin');
                  else if (val === 'مسؤول نشاط') setRole('manager');
                  else setRole('member');
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="منخرط">منخرط</option>
                <option value="متطوع">متطوع</option>
                <option value="مؤطر">مؤطر</option>
                <option value="مسؤول نشاط">مسؤول نشاط</option>
                <option value="عضو مكتب">عضو مكتب</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">النادي / مجال النشاط:</label>
              <select
                value={club}
                onChange={(e) => setClub(e.target.value as ClubDomain)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="الابتكار والتقنية">الابتكار والتقنية</option>
                <option value="البيئة والتنمية المستدامة">البيئة والتنمية المستدامة</option>
                <option value="الثقافة والفنون">الثقافة والفنون</option>
                <option value="العمل التطوعي والخيري">العمل التطوعي والخيري</option>
                <option value="الإعلام والتواصل">الإعلام والتواصل</option>
                <option value="الرياضة">الرياضة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">المهنة أو التخصص:</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="مثال: طالب جامعي"
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">تاريخ الميلاد:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">زمرة الدم:</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono-num"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">رقم بطاقة التعريف الوطنية:</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="109823481239"
              className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-num"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">نبذة عن العضو ومساهماته المقترحة:</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="المهارات، الاهتمامات والدافع للانخراط..."
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
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
              حفظ وتوليد البطاقة الذكية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
