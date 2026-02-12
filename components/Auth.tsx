
import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';

// 将用户名转换为 Supabase 兼容的 email 格式
const usernameToEmail = (username: string) => `${username.toLowerCase()}@fitlogpro.app`;

// 校验用户名：仅允许英文字母和数字，10个字符以内
const isValidUsername = (username: string) => /^[a-zA-Z0-9]{1,10}$/.test(username);

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 只允许输入英文和数字，最多10个字符
        if (value === '' || /^[a-zA-Z0-9]{0,10}$/.test(value)) {
            setUsername(value);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!isValidUsername(username)) {
            setMessage({ type: 'error', text: '用户名只能包含英文字母和数字，最多10个字符' });
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: '密码至少需要6个字符' });
            setLoading(false);
            return;
        }

        const email = usernameToEmail(username);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        // 注册后自动确认，无需邮箱验证
                        data: { username: username.toLowerCase() }
                    }
                });
                if (error) {
                    if (error.message.includes('already registered')) {
                        throw new Error('该用户名已被注册');
                    }
                    throw error;
                }
                // 注册成功后自动登录
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) {
                    // 如果自动登录失败（可能需要确认），提示成功
                    setMessage({ type: 'success', text: '注册成功！请直接登录。' });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error('用户名或密码错误');
                    }
                    throw error;
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '发生错误，请重试' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">FitLog Pro</h1>
                        <p className="text-slate-500">您的私人健康监测管家</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                                    placeholder="英文+数字，最多10位"
                                    maxLength={10}
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">仅支持英文字母和数字，{username.length}/10</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">登录密码</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                                    placeholder="至少6位密码"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? '立即注册' : '登录'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
                        >
                            {isSignUp ? '已有账号？去登录' : '没有账号？创建新账号'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
