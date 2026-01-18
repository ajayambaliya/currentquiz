'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus, Upload, Database, ChevronRight,
    CheckCircle2, AlertCircle, Loader2, Trash2,
    Book, Layers, ListTodo, FileJson, Lock, Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    checkAdminCredentials,
    addSubjectAction,
    addMainTopicAction,
    addSubTopicAction,
    importQuizDataAction,
    sendNotificationAction,
    deleteSubjectAction,
    deleteMainTopicAction,
    deleteSubTopicAction
} from './actions';

export default function AdminSubjectQuiz() {
    const router = useRouter();

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authForm, setAuthForm] = useState({ username: '', password: '' });
    const [authError, setAuthError] = useState('');

    const [subjects, setSubjects] = useState<any[]>([]);
    const [mainTopics, setMainTopics] = useState<any[]>([]);
    const [subTopics, setSubTopics] = useState<any[]>([]);
    const [currentQuizzes, setCurrentQuizzes] = useState<any[]>([]);

    // Global counts
    const [totals, setTotals] = useState({ subjects: 0, topics: 0, subTopics: 0 });

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedMainTopic, setSelectedMainTopic] = useState('');
    const [selectedSubTopic, setSelectedSubTopic] = useState('');

    const [newItemName, setNewItemName] = useState('');
    const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial load
    useEffect(() => {
        const savedAuth = sessionStorage.getItem('admin_auth');
        if (savedAuth === 'true') {
            setIsLoggedIn(true);
            fetchSubjects();
            fetchTotals();
            fetchQuizzes(); // Fetch all quizzes initially
        }
    }, []);

    // Dependent Dropdowns Logic
    useEffect(() => {
        if (selectedSubject) {
            fetchMainTopics(selectedSubject);
            setSelectedMainTopic('');
            setSelectedSubTopic('');
        } else {
            setMainTopics([]);
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (selectedMainTopic) {
            fetchSubTopics(selectedMainTopic);
            setSelectedSubTopic('');
        } else {
            setSubTopics([]);
        }
    }, [selectedMainTopic]);

    // Update Quiz List based on selection
    useEffect(() => {
        fetchQuizzes(selectedSubTopic || undefined);
    }, [selectedSubTopic]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        try {
            const isValid = await checkAdminCredentials(authForm.username, authForm.password);
            if (isValid) {
                setIsLoggedIn(true);
                sessionStorage.setItem('admin_auth', 'true');
                fetchSubjects();
                fetchTotals();
                fetchQuizzes();
            } else {
                setAuthError('Invalid credentials');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setAuthError('Server error during login. Please check logs.');
        }
    };

    const fetchTotals = async () => {
        const [subRes, topRes, sTopRes] = await Promise.all([
            supabase.from('subjects').select('*', { count: 'exact', head: true }),
            supabase.from('main_topics').select('*', { count: 'exact', head: true }),
            supabase.from('sub_topics').select('*', { count: 'exact', head: true })
        ]);
        setTotals({
            subjects: subRes.count || 0,
            topics: topRes.count || 0,
            subTopics: sTopRes.count || 0
        });
    };

    const fetchSubjects = async () => {
        const { data } = await supabase.from('subjects').select('*').order('name');
        if (data) setSubjects(data);
    };

    const fetchMainTopics = async (subjectId: string) => {
        const { data } = await supabase.from('main_topics').select('*').eq('subject_id', subjectId).order('name');
        if (data) setMainTopics(data);
    };

    const fetchSubTopics = async (mainTopicId: string) => {
        const { data } = await supabase.from('sub_topics').select('*').eq('main_topic_id', mainTopicId).order('name');
        if (data) setSubTopics(data);
    };

    const fetchQuizzes = async (subTopicId?: string) => {
        let query = supabase.from('subject_quizzes').select('*');
        if (subTopicId) {
            query = query.eq('sub_topic_id', subTopicId);
        }
        const { data } = await query.order('created_at', { ascending: false });
        if (data) setCurrentQuizzes(data);
    };

    const handleSendQuizNotification = async (quiz: any) => {
        setIsProcessing(true);
        setImportStatus({ type: 'info', message: `Sending notification for ${quiz.title}...` });

        try {
            const result = await sendNotificationAction(
                "New Quiz Available! 🎯",
                `A new study set "${quiz.title}" is now available. Start practicing now!`,
                `${window.location.origin}/quiz/${quiz.slug}`
            );

            if (result.error) {
                setImportStatus({ type: 'error', message: result.error });
            } else {
                setImportStatus({ type: 'success', message: 'Notification sent successfully!' });
            }
        } catch (err: any) {
            setImportStatus({ type: 'error', message: 'Failed to call notification service' });
        }
        setIsProcessing(false);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm('Are you sure you want to delete this quiz and all its questions?')) return;
        setIsProcessing(true);
        const { error } = await supabase.from('subject_quizzes').delete().eq('id', quizId);
        if (error) {
            setImportStatus({ type: 'error', message: error.message });
        } else {
            setImportStatus({ type: 'success', message: 'Quiz deleted successfully' });
            fetchQuizzes(selectedSubTopic);
        }
        setIsProcessing(false);
    };

    const createSlug = (text: string) => {
        if (!text) return '';

        // Transliteration mapping for Gujarati to English
        // Ordered by length (longest first) to prevent partial matching
        const gujaratiToEnglish: [string, string][] = [
            ['ક્ષ', 'ksh'], ['જ્ઞ', 'gn'], ['શ્ર', 'shr'],
            ['અઃ', 'ah'], ['અં', 'an'], ['ઔ', 'au'], ['ઓ', 'o'], ['ઐ', 'ai'], ['એ', 'e'], ['ઋ', 'ru'], ['ઊ', 'oo'], ['ઉ', 'u'], ['ઈ', 'ee'], ['ઇ', 'i'], ['આ', 'aa'], ['અ', 'a'],
            ['ખ', 'kh'], ['ઘ', 'gh'], ['ઙ', 'n'], ['છ', 'chh'], ['ઝ', 'jh'], ['ઞ', 'n'], ['ઠ', 'th'], ['ઢ', 'dh'], ['ણ', 'n'], ['થ', 'th'], ['ધ', 'dh'], ['ફ', 'ph'], ['ભ', 'bh'],
            ['ક', 'k'], ['ગ', 'g'], ['ચ', 'ch'], ['જ', 'j'], ['ટ', 't'], ['ડ', 'd'], ['ત', 't'], ['દ', 'd'], ['ન', 'n'], ['પ', 'p'], ['બ', 'b'], ['મ', 'm'], ['ય', 'y'], ['ર', 'r'], ['લ', 'l'], ['વ', 'v'], ['શ', 'sh'], ['ષ', 'sh'], ['સ', 's'], ['હ', 'h'], ['ળ', 'l'],
            ['ા', 'a'], ['િ', 'i'], ['ી', 'ee'], ['ુ', 'u'], ['ૂ', 'oo'], ['ૃ', 'ru'], ['ે', 'e'], ['ૈ', 'ai'], ['ો', 'o'], ['ૌ', 'au'], ['ં', 'n'], ['ઃ', 'h'], ['્', '']
        ];

        let result = text;
        // Apply transliteration
        gujaratiToEnglish.forEach(([gu, en]) => {
            result = result.split(gu).join(en);
        });

        let slug = result
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
            .replace(/[^\w-]+/g, '') // Keep ONLY English letters, numbers and hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with one
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

        return slug;
    };

    const stripHtml = (html: string) => {
        if (!html) return '';
        let text = html;
        // Replace block tags with newlines to maintain some readability
        text = text.replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        // Remove all other tags
        text = text.replace(/<[^>]*>/g, '');
        // Decode entities
        const entities: Record<string, string> = {
            '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
            '&bull;': '•', '&middot;': '·'
        };
        Object.keys(entities).forEach(entity => {
            text = text.split(entity).join(entities[entity]);
        });
        // Clean up: remove multiple newlines and trim
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    };

    const handleDeleteItem = async (level: 'subject' | 'main' | 'sub') => {
        const id = level === 'subject' ? selectedSubject : level === 'main' ? selectedMainTopic : selectedSubTopic;
        if (!id) return;

        const name = level === 'subject' ? subjects.find(s => s.id === id)?.name :
            level === 'main' ? mainTopics.find(t => t.id === id)?.name :
                subTopics.find(t => t.id === id)?.name;

        if (!confirm(`Are you sure you want to delete "${name}"? This will delete all topics and quizzes inside it.`)) return;

        setIsProcessing(true);
        let result: any;

        if (level === 'subject') {
            result = await deleteSubjectAction(id);
            if (!result.error) {
                setSelectedSubject('');
                fetchSubjects();
            }
        } else if (level === 'main') {
            result = await deleteMainTopicAction(id);
            if (!result.error) {
                setSelectedMainTopic('');
                fetchMainTopics(selectedSubject);
            }
        } else {
            result = await deleteSubTopicAction(id);
            if (!result.error) {
                setSelectedSubTopic('');
                fetchSubTopics(selectedMainTopic);
            }
        }

        if (result?.error) setImportStatus({ type: 'error', message: result.error });
        else {
            setImportStatus({ type: 'success', message: 'Deleted successfully' });
            fetchTotals();
        }
        setIsProcessing(false);
    };

    const handleAddItem = async () => {
        if (!newItemName) return;
        setIsProcessing(true);
        setImportStatus(null);

        try {
            let result: any;
            const slug = createSlug(newItemName);

            if (!selectedSubject) {
                // Adding a Subject
                result = await addSubjectAction(newItemName, slug);
                if (!result.error) fetchSubjects();
            } else if (!selectedMainTopic) {
                // Adding a Main Topic
                result = await addMainTopicAction(selectedSubject, newItemName, slug);
                if (!result.error) fetchMainTopics(selectedSubject);
            } else {
                // Adding a Sub Topic
                result = await addSubTopicAction(selectedMainTopic, newItemName, slug);
                if (!result.error) fetchSubTopics(selectedMainTopic);
            }

            if (result?.error) {
                setImportStatus({ type: 'error', message: result.error });
            } else {
                setImportStatus({ type: 'success', message: 'Added successfully!' });
                setNewItemName('');
            }
        } catch (err: any) {
            setImportStatus({ type: 'error', message: 'Connection lost or server error' });
        }
        setIsProcessing(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedSubTopic) {
            setImportStatus({ type: 'error', message: 'Please select a Sub Topic and a JSON file' });
            return;
        }

        setIsProcessing(true);
        setImportStatus({ type: 'info', message: 'Reading and importing file...' });

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                await importData(json, file.name);
            } catch (err) {
                setImportStatus({ type: 'error', message: 'Invalid JSON file' });
                setIsProcessing(false);
            }
        };
        reader.readAsText(file);
    };

    const importData = async (json: any, fileName: string) => {
        try {
            let questionsData = [];
            let quizTitle = fileName.replace('.json', '');

            if (json.data?.sections?.[0]?.questions) {
                questionsData = json.data.sections[0].questions;
                if (json.data.test?.name) quizTitle = json.data.test.name;
            } else if (Array.isArray(json)) {
                questionsData = json;
            } else {
                throw new Error('Unsupported JSON format');
            }

            const baseSlug = createSlug(quizTitle);
            const formattedQuestions = questionsData.map((q: any, index: number) => {
                const options: Record<string, string> = {};
                let correctAnswer = 'A';

                if (q.options) {
                    q.options.forEach((opt: any, i: number) => {
                        const label = String.fromCharCode(65 + i);
                        const rawText = opt.nameText || opt.name || `Option ${label}`;
                        const cleanedText = stripHtml(rawText);
                        options[label] = cleanedText.replace(/^(\([A-D]\)|[A-D]\)|\([A-D]\))\s*/i, '').trim();
                        if (opt.isCorrect) correctAnswer = label;
                    });
                }

                return {
                    text: stripHtml(q.nameText || q.name || 'No text'),
                    options: options,
                    answer: correctAnswer,
                    explanation: stripHtml(q.solution || '')
                };
            });

            const result: any = await importQuizDataAction(
                quizTitle,
                baseSlug,
                selectedSubTopic,
                formattedQuestions
            );

            if (result.error) throw new Error(result.error);
            setImportStatus({
                type: 'success',
                message: `Successfully created ${result.totalSets} Sets with ${result.totalQuestions} questions!`
            });
            fetchQuizzes(selectedSubTopic);
        } catch (err: any) {
            setImportStatus({ type: 'error', message: err.message });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 w-full max-w-md space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg">
                            <Lock className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Admin Login</h1>
                        <p className="text-slate-500 text-sm">Please enter credentials to access management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                                value={authForm.username}
                                onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                                value={authForm.password}
                                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                                required
                            />
                        </div>
                        {authError && <p className="text-rose-500 text-xs font-bold text-center">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-all hover:shadow-2xl active:scale-95"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-10 pb-32">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                            <Database className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Subject Quiz Management</h1>
                            <p className="text-slate-500 font-medium">Add subjects, topics and import data</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin/notifications" className="text-[10px] font-black bg-rose-50 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                            Custom Push
                        </Link>
                        <button onClick={() => { setIsLoggedIn(false); sessionStorage.removeItem('admin_auth'); }} className="text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest">Logout</button>
                    </div>
                </div>

                {importStatus && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        importStatus.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                        {importStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                            importStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                <Loader2 className="w-5 h-5 animate-spin" />}
                        <span className="font-bold text-sm">{importStatus.message}</span>
                        <button onClick={() => setImportStatus(null)} className="ml-auto opacity-50 hover:opacity-100">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Book className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Manage Hierarchy</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Subject Level */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Subject</label>
                                        <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Base Level</span>
                                    </div>
                                    <div className="flex-1 relative group/select">
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold p-4 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors pr-10"
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {selectedSubject && (
                                            <button
                                                onClick={() => handleDeleteItem('subject')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover/select:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="new-subject-input"
                                                className="flex-1 bg-white border border-slate-100 rounded-xl text-xs font-bold p-3 outline-none focus:border-indigo-300 transition-all"
                                                placeholder="Add new subject..."
                                                onChange={(e) => {
                                                    const preview = document.getElementById('subject-slug-preview');
                                                    if (preview) preview.innerText = createSlug(e.target.value);
                                                }}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const input = document.getElementById('new-subject-input') as HTMLInputElement;
                                                    if (!input.value) return;
                                                    setIsProcessing(true);
                                                    const slug = createSlug(input.value) || `subject-${Date.now()}`;
                                                    const res = await addSubjectAction(input.value, slug);
                                                    if (res.error) setImportStatus({ type: 'error', message: res.error });
                                                    else {
                                                        setImportStatus({ type: 'success', message: 'Subject added!' });
                                                        input.value = '';
                                                        const preview = document.getElementById('subject-slug-preview');
                                                        if (preview) preview.innerText = '';
                                                        fetchSubjects();
                                                        fetchTotals();
                                                    }
                                                    setIsProcessing(false);
                                                }}
                                                className="bg-slate-900 text-white px-4 rounded-xl hover:bg-indigo-600 transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest ml-2">Slug: <span id="subject-slug-preview" className="text-indigo-600"></span></p>
                                    </div>
                                </div>

                                {/* Main Topic Level */}
                                <div className={`space-y-2 transition-all ${!selectedSubject ? 'opacity-30' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Main Topic</label>
                                        {selectedSubject && <span className="text-[8px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold">In selected subject</span>}
                                    </div>
                                    <div className="flex-1 relative group/select">
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold p-4 outline-none appearance-none disabled:opacity-30 cursor-pointer pr-10"
                                            disabled={!selectedSubject}
                                            value={selectedMainTopic}
                                            onChange={(e) => setSelectedMainTopic(e.target.value)}
                                        >
                                            <option value="">Select Main Topic</option>
                                            {mainTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        {selectedMainTopic && (
                                            <button
                                                onClick={() => handleDeleteItem('main')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover/select:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="new-main-topic-input"
                                                disabled={!selectedSubject}
                                                className="flex-1 bg-white border border-slate-100 rounded-xl text-xs font-bold p-3 outline-none focus:border-indigo-300 transition-all"
                                                placeholder="Add new main topic..."
                                                onChange={(e) => {
                                                    const preview = document.getElementById('main-slug-preview');
                                                    if (preview) preview.innerText = createSlug(e.target.value);
                                                }}
                                            />
                                            <button
                                                disabled={!selectedSubject || isProcessing}
                                                onClick={async () => {
                                                    const input = document.getElementById('new-main-topic-input') as HTMLInputElement;
                                                    if (!input.value || !selectedSubject) return;
                                                    setIsProcessing(true);
                                                    const slug = createSlug(input.value) || `topic-${Date.now()}`;
                                                    const res = await addMainTopicAction(selectedSubject, input.value, slug);
                                                    if (res.error) setImportStatus({ type: 'error', message: res.error });
                                                    else {
                                                        setImportStatus({ type: 'success', message: 'Main Topic added!' });
                                                        input.value = '';
                                                        const preview = document.getElementById('main-slug-preview');
                                                        if (preview) preview.innerText = '';
                                                        fetchMainTopics(selectedSubject);
                                                        fetchTotals();
                                                    }
                                                    setIsProcessing(false);
                                                }}
                                                className="bg-slate-900 text-white px-4 rounded-xl hover:bg-indigo-600 transition-all disabled:bg-slate-200"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest ml-2">Slug: <span id="main-slug-preview" className="text-indigo-600"></span></p>
                                    </div>
                                </div>

                                {/* Sub Topic Level */}
                                <div className={`space-y-2 transition-all ${!selectedMainTopic ? 'opacity-30' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Sub Topic</label>
                                        {selectedMainTopic && <span className="text-[8px] bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Target for Quiz</span>}
                                    </div>
                                    <div className="flex-1 relative group/select">
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold p-4 outline-none appearance-none disabled:opacity-30 cursor-pointer pr-10"
                                            disabled={!selectedMainTopic}
                                            value={selectedSubTopic}
                                            onChange={(e) => setSelectedSubTopic(e.target.value)}
                                        >
                                            <option value="">Select Sub Topic</option>
                                            {subTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        {selectedSubTopic && (
                                            <button
                                                onClick={() => handleDeleteItem('sub')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover/select:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="new-sub-topic-input"
                                                disabled={!selectedMainTopic}
                                                className="flex-1 bg-white border border-slate-100 rounded-xl text-xs font-bold p-3 outline-none focus:border-indigo-300 transition-all"
                                                placeholder="Add new sub topic..."
                                                onChange={(e) => {
                                                    const preview = document.getElementById('sub-slug-preview');
                                                    if (preview) preview.innerText = createSlug(e.target.value);
                                                }}
                                            />
                                            <button
                                                disabled={!selectedMainTopic || isProcessing}
                                                onClick={async () => {
                                                    const input = document.getElementById('new-sub-topic-input') as HTMLInputElement;
                                                    if (!input.value || !selectedMainTopic) return;
                                                    setIsProcessing(true);
                                                    const slug = createSlug(input.value) || `subtopic-${Date.now()}`;
                                                    const res = await addSubTopicAction(selectedMainTopic, input.value, slug);
                                                    if (res.error) setImportStatus({ type: 'error', message: res.error });
                                                    else {
                                                        setImportStatus({ type: 'success', message: 'Sub Topic added!' });
                                                        input.value = '';
                                                        const preview = document.getElementById('sub-slug-preview');
                                                        if (preview) preview.innerText = '';
                                                        fetchSubTopics(selectedMainTopic);
                                                        fetchTotals();
                                                    }
                                                    setIsProcessing(false);
                                                }}
                                                className="bg-slate-900 text-white px-4 rounded-xl hover:bg-indigo-600 transition-all disabled:bg-slate-200"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest ml-2">Slug: <span id="sub-slug-preview" className="text-indigo-600"></span></p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl text-white space-y-6 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center">
                                    <FileJson className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">Import Data</h2>
                                    <p className="text-white/40 text-sm font-medium">Upload JSON questions to selected Sub Topic</p>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-left transition-all ${!selectedSubTopic ? 'opacity-30' : ''}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-400/30 px-2 py-0.5 rounded-md">Path</span>
                                        </div>
                                        <div className="text-[10px] font-black flex items-center gap-1 opacity-70">
                                            {selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : 'Subject'}
                                            <ChevronRight size={10} />
                                            {selectedMainTopic ? mainTopics.find(t => t.id === selectedMainTopic)?.name : 'Topic'}
                                            <ChevronRight size={10} />
                                            {selectedSubTopic ? subTopics.find(t => t.id === selectedSubTopic)?.name : 'Sub Topic'}
                                        </div>
                                    </div>

                                    <label className={`group w-full flex flex-col items-center gap-2 p-8 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer ${!selectedSubTopic || isProcessing ? 'opacity-20 pointer-events-none' : ''}`}>
                                        <Upload className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-indigo-400">Select JSON</span>
                                        <input
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            </div>
                        </section>

                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <ListTodo className="w-3 h-3 text-indigo-500" />
                                Database Overview
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[20px] font-black text-slate-900">{totals.subjects}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Subjects</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[20px] font-black text-slate-900">{totals.topics}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Topics</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[20px] font-black text-slate-900">{totals.subTopics}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sub-topics</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Database className="w-3 h-3 text-emerald-500" />
                                {selectedSubTopic ? 'Quizzes in Selection' : 'Current Quizzes'} ({currentQuizzes.length})
                            </h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {currentQuizzes.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-4">No quizzes found</p>
                                ) : (
                                    currentQuizzes.map(quiz => (
                                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                                            <div className="min-w-0 pr-2">
                                                <p className="text-xs font-bold text-slate-900 truncate">{quiz.title}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Slug: {quiz.slug}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleSendQuizNotification(quiz)}
                                                    disabled={isProcessing}
                                                    className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                    title="Push Notification"
                                                >
                                                    <Bell size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                                    disabled={isProcessing}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                                                    title="Delete Quiz"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
