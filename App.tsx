
import React, { useState, useEffect, useMemo } from 'react';
import { HealthRecord } from './types';
import RecordForm from './components/RecordForm';
import HistoryTable from './components/HistoryTable';
import StatsDashboard from './components/StatsDashboard';
import AiInsight from './components/AiInsight';
import Auth from './components/Auth';
import { exportToCSV } from './utils/helpers';
import { supabase } from './utils/supabase';
import { fetchRecords, createRecord, updateRecord, deleteRecord } from './utils/api';
import { LayoutGrid, ClipboardList, Activity, Sparkles, Download, Plus, LogOut } from 'lucide-react';


const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // Initial Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when session exists
  useEffect(() => {
    if (session) {
      loadRecords();
    }
  }, [session]);

  const loadRecords = async () => {
    try {
      const data = await fetchRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
      alert('加载数据失败，请检查网络连接');
    }
  };

  const handleAddOrUpdate = async (record: HealthRecord) => {
    try {
      if (editingRecord) {
        // Update existing
        const updated = await updateRecord(record);
        if (updated) {
          setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        }
      } else {
        // Create new or Upsert
        const { id, ...newRecordData } = record;
        const createdOrUpdated = await createRecord(newRecordData);

        if (createdOrUpdated) {
          setRecords(prev => {
            const exists = prev.find(r => r.id === createdOrUpdated.id);
            if (exists) {
              return prev.map(r => r.id === createdOrUpdated.id ? createdOrUpdated : r);
            }
            return [createdOrUpdated, ...prev];
          });
        }
      }
      setEditingRecord(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Operation failed:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await deleteRecord(id);
        setRecords(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    exportToCSV(records);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col">
      {/* Sidebar / Desktop Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-indigo-900 text-white hidden md:flex flex-col p-6 z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FitLog Pro</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>仪表盘</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'history' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>历史记录</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-indigo-800 space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 transition"
          >
            <Download className="w-5 h-5" />
            <span>导出 CSV</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 transition text-indigo-200 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-indigo-900 text-white p-4 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6" />
          <h1 className="text-lg font-bold">FitLog Pro</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="p-2 bg-indigo-800 rounded-lg">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 bg-indigo-800 rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">欢迎回来</h2>
                <p className="text-slate-500">这是您最近的健康概览</p>
              </div>
              <button
                onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                新增记录
              </button>
            </div>

            <StatsDashboard records={records} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AiInsight records={records} />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center space-y-4">
                <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-slate-800">健康目标</h3>
                <p className="text-sm text-slate-500 italic">"每一天的坚持，都是对身体最长情的告白。"</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[65%]" />
                </div>
                <span className="text-xs font-medium text-slate-400">本月活跃度 65%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">历史记录</h2>
              <button
                onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg transition font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
            <HistoryTable
              records={records}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-around z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-medium">概览</span>
        </button>
        <button
          onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
          className="bg-indigo-600 text-white rounded-full p-3 -mt-8 shadow-xl border-4 border-slate-50"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-[10px] font-medium">记录</span>
        </button>
      </nav>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <RecordForm
              initialData={editingRecord || undefined}
              onSave={handleAddOrUpdate}
              onCancel={() => { setIsFormOpen(false); setEditingRecord(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
