
import React, { useState, useEffect } from 'react';
import { HealthRecord } from '../types';
import { X, Calendar, Scale, Droplets, AlignLeft } from 'lucide-react';

interface RecordFormProps {
  initialData?: HealthRecord;
  onSave: (record: HealthRecord) => void;
  onCancel: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ initialData, onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [morningWeight, setMorningWeight] = useState<string>('');
  const [eveningWeight, setEveningWeight] = useState<string>('');
  const [bmCount, setBmCount] = useState<number>(0);
  const [hasBM, setHasBM] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setMorningWeight(initialData.morningWeight.toString());
      setEveningWeight(initialData.eveningWeight.toString());
      setBmCount(initialData.bmCount);
      setHasBM(initialData.hasBM);
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mWeight = parseFloat(morningWeight);
    const eWeight = parseFloat(eveningWeight);

    if (isNaN(mWeight) || isNaN(eWeight)) {
      alert('请输入有效的体重数据');
      return;
    }

    onSave({
      id: initialData?.id || Date.now().toString(),
      date,
      morningWeight: mWeight,
      eveningWeight: eWeight,
      bmCount: hasBM ? bmCount || 1 : 0,
      hasBM,
      notes,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">{initialData ? '编辑记录' : '新增记录'}</h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            记录日期
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
          />
        </div>

        {/* Weights */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Scale className="w-4 h-4 text-orange-500" />
              早晨体重 (斤)
            </label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="0.0"
              value={morningWeight}
              onChange={(e) => setMorningWeight(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Scale className="w-4 h-4 text-blue-500" />
              晚上体重 (斤)
            </label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="0.0"
              value={eveningWeight}
              onChange={(e) => setEveningWeight(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
            />
          </div>
        </div>

        {/* BM */}
        <div className="bg-indigo-50 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
              <Droplets className="w-4 h-4 text-indigo-600" />
              今日排便
            </label>
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setHasBM(true)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${hasBM ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                是
              </button>
              <button
                type="button"
                onClick={() => { setHasBM(false); setBmCount(0); }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${!hasBM ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                否
              </button>
            </div>
          </div>

          {hasBM && (
            <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
              <span className="text-sm font-medium text-indigo-700">次数</span>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setBmCount(Math.max(1, bmCount - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-indigo-900">{bmCount || 1}</span>
                <button 
                  type="button"
                  onClick={() => setBmCount((bmCount || 1) + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <AlignLeft className="w-4 h-4 text-slate-500" />
            备注 (可选)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录今日饮食或特殊情况..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition outline-none resize-none"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;
