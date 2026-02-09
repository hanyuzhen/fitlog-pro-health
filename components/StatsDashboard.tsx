
import React, { useMemo } from 'react';
import { HealthRecord } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, Info } from 'lucide-react';

interface StatsDashboardProps {
  records: HealthRecord[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ records }) => {
  const last7Days = useMemo(() => {
    return records.slice(0, 7).reverse();
  }, [records]);

  const stats = useMemo(() => {
    if (last7Days.length === 0) return { avgM: 0, avgE: 0, diff: 0, bmRate: 0 };
    
    const sumM = last7Days.reduce((acc, curr) => acc + curr.morningWeight, 0);
    const sumE = last7Days.reduce((acc, curr) => acc + curr.eveningWeight, 0);
    const bmDays = last7Days.filter(r => r.hasBM).length;

    return {
      avgM: (sumM / last7Days.length).toFixed(1),
      avgE: (sumE / last7Days.length).toFixed(1),
      diff: ((sumE - sumM) / last7Days.length).toFixed(1),
      bmRate: Math.round((bmDays / last7Days.length) * 100),
      bmCount: bmDays,
      totalDays: last7Days.length
    };
  }, [last7Days]);

  const pieData = useMemo(() => {
    const has = records.filter(r => r.hasBM).length;
    const hasNot = records.length - has;
    return [
      { name: '有排便', value: has, color: '#6366f1' },
      { name: '无排便', value: hasNot, color: '#e2e8f0' },
    ];
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500 shadow-sm">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">暂无数据</h3>
        <p className="text-indigo-600 max-w-sm mx-auto">
          开始记录您的每日体重和排便情况，我们将为您生成专业的趋势分析报告。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Quick Stats Cards */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <span className="text-sm font-bold text-slate-400 uppercase">7日平均晨重</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800">{stats.avgM}</span>
          <span className="text-sm font-semibold text-slate-400">斤</span>
        </div>
        <div className="mt-4 flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit text-xs font-bold">
          <TrendingDown className="w-3 h-3" />
          <span>较稳定</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <span className="text-sm font-bold text-slate-400 uppercase">7日平均晚重</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800">{stats.avgE}</span>
          <span className="text-sm font-semibold text-slate-400">斤</span>
        </div>
        <div className="mt-4 flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit text-xs font-bold">
          <Minus className="w-3 h-3" />
          <span>差值 {stats.diff} 斤</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <span className="text-sm font-bold text-slate-400 uppercase">7日排便率</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800">{stats.bmRate}%</span>
          <span className="text-sm font-semibold text-slate-400">({stats.bmCount}/{stats.totalDays}天)</span>
        </div>
        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-indigo-500 h-full" style={{ width: `${stats.bmRate}%` }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <span className="text-sm font-bold text-slate-400 uppercase">总计记录</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800">{records.length}</span>
          <span className="text-sm font-semibold text-slate-400">天</span>
        </div>
        <div className="mt-4 text-xs font-medium text-slate-400">
          持续记录是健康管理的基石
        </div>
      </div>

      {/* Main Charts */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          最近7天体重趋势
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelClassName="font-bold text-slate-800 mb-1"
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="morningWeight" 
                name="早晨体重" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{r: 4, strokeWidth: 2}}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="eveningWeight" 
                name="晚上体重" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{r: 4, strokeWidth: 2}}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="font-bold text-slate-800 mb-6 w-full">排便情况统计</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <PieTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full space-y-3 mt-4">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-bold text-slate-800">{item.value} 天</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
