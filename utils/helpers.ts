
import { HealthRecord } from '../types';

export const saveToLocalStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocalStorage = <T,>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const exportToCSV = (records: HealthRecord[]): void => {
  if (records.length === 0) {
    alert('暂无数据可供导出');
    return;
  }

  const headers = ['日期', '早起体重(斤)', '晚间体重(斤)', '排便次数', '是否排便', '备注'];
  const rows = records.map(r => [
    r.date,
    r.morningWeight,
    r.eveningWeight,
    r.bmCount,
    r.hasBM ? '是' : '否',
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Use UTF-8 BOM to ensure Excel opens Chinese correctly
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `fitlog_records_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
