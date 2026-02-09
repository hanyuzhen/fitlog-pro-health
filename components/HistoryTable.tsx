
import React, { useState, useMemo } from 'react';
import { HealthRecord } from '../types';
import { Search, Filter, Edit2, Trash2, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

interface HistoryTableProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ records, onEdit, onDelete }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      return true;
    });
  }, [records, startDate, endDate]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">起始日期</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg w-full outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">截止日期</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg w-full outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>
        <button 
          onClick={resetFilters}
          className="px-4 py-2 text-sm text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition"
        >
          重置
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">日期</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">早起体重</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">晚间体重</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">体重差</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">排便</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedRecords.length > 0 ? paginatedRecords.map((record) => {
                const diff = (record.eveningWeight - record.morningWeight).toFixed(1);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{record.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-orange-600 font-medium">{record.morningWeight}</span>
                      <span className="text-[10px] text-slate-400 ml-1">斤</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600 font-medium">{record.eveningWeight}</span>
                      <span className="text-[10px] text-slate-400 ml-1">斤</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${parseFloat(diff) > 1.5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        +{diff} 斤
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.hasBM ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-sm text-slate-600 font-medium">是 ({record.bmCount}次)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          <span className="text-sm text-slate-400">否</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onEdit(record)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(record.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search className="w-12 h-12 stroke-[1.5]" />
                      <p className="font-medium text-lg">未找到匹配的记录</p>
                      <p className="text-sm">尝试更改日期范围或添加新记录</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
