import { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useProjects } from '../context/ProjectContext';
import { useModels } from '../context/ModelContext';
import { useAuth, PERMISSION_PAGES } from '../context/AuthContext';

const Settings = () => {
    // ダークモード
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    // 設定値をlocalStorageから読み込み
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('shooting-master-settings');
        return saved ? JSON.parse(saved) : {
            // AI設定
            geminiApiKey: '',
            aiModel: 'gemini-2.0-flash-exp',
            // ユーザー設定
            userRole: 'client', // 'client' or 'photographer'
            userName: '',
            companyName: '',
            // 納品設定
            defaultDriveFolder: '',
            autoNotifyOnUpload: true,
            // 表示設定
            showCompletedProjects: true,
            defaultView: 'grid', // 'grid' or 'list'
        };
    });

    // モーダル状態
    const [showApiModal, setShowApiModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showMemberEditModal, setShowMemberEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // 一時入力値
    const [tempApiKey, setTempApiKey] = useState(settings.geminiApiKey);
    const [tempAiModel, setTempAiModel] = useState(settings.aiModel);
    const [tempUserRole, setTempUserRole] = useState(settings.userRole);
    const [tempUserName, setTempUserName] = useState(settings.userName);
    const [tempCompanyName, setTempCompanyName] = useState(settings.companyName);
    const [tempDriveFolder, setTempDriveFolder] = useState(settings.defaultDriveFolder);
    const [tempAutoNotify, setTempAutoNotify] = useState(settings.autoNotifyOnUpload);

    // 招待用の一時入力値
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [invitePreset, setInvitePreset] = useState('viewer');

    const { projects } = useProjects();
    const { models } = useModels();
    const {
        currentUser,
        members,
        inviteMember,
        removeMember,
        updateMemberPermissions,
        applyPermissionPreset,
        isFirebaseConfigured,
        signInWithGoogle,
        signInWithGithub,
        linkGithubAccount,
        linkGoogleAccount,
        unlinkProvider,
        logout,
        firebaseUser,
    } = useAuth();

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [isLinking, setIsLinking] = useState(false);

    // 設定をlocalStorageに保存
    useEffect(() => {
        localStorage.setItem('shooting-master-settings', JSON.stringify(settings));
    }, [settings]);

    // ダークモード切り替え
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // API設定保存
    const handleSaveApiSettings = () => {
        setSettings(prev => ({
            ...prev,
            geminiApiKey: tempApiKey,
            aiModel: tempAiModel,
        }));
        setShowApiModal(false);
    };

    // ユーザー設定保存
    const handleSaveUserSettings = () => {
        setSettings(prev => ({
            ...prev,
            userRole: tempUserRole,
            userName: tempUserName,
            companyName: tempCompanyName,
        }));
        setShowUserModal(false);
    };

    // 納品設定保存
    const handleSaveDeliverySettings = () => {
        setSettings(prev => ({
            ...prev,
            defaultDriveFolder: tempDriveFolder,
            autoNotifyOnUpload: tempAutoNotify,
        }));
        setShowDeliveryModal(false);
    };

    // データリセット
    const handleResetData = () => {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            localStorage.removeItem('shooting-master-projects');
            localStorage.removeItem('shooting-master-models');
            localStorage.removeItem('shooting-master-settings');
            window.location.reload();
        }
    };

    // データエクスポート
    const handleExportData = () => {
        const data = {
            projects: JSON.parse(localStorage.getItem('shooting-master-projects') || '[]'),
            models: JSON.parse(localStorage.getItem('shooting-master-models') || '[]'),
            settings: JSON.parse(localStorage.getItem('shooting-master-settings') || '{}'),
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shooting-master-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // データインポート
    const handleImportData = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.projects) {
                    localStorage.setItem('shooting-master-projects', JSON.stringify(data.projects));
                }
                if (data.models) {
                    localStorage.setItem('shooting-master-models', JSON.stringify(data.models));
                }
                if (data.settings) {
                    localStorage.setItem('shooting-master-settings', JSON.stringify(data.settings));
                }
                alert('データをインポートしました。ページを再読み込みします。');
                window.location.reload();
            } catch (err) {
                alert('インポートに失敗しました。ファイル形式を確認してください。');
            }
        };
        reader.readAsText(file);
    };

    // APIキーをマスク表示
    const maskApiKey = (key) => {
        if (!key) return '未設定';
        if (key.length <= 8) return '••••••••';
        return key.slice(0, 4) + '••••••••' + key.slice(-4);
    };

    // ユーザーロール表示
    const getRoleLabel = (role) => {
        return role === 'photographer' ? 'カメラマン' : 'クライアント';
    };

    return (
        <div className="max-w-md mx-auto min-h-screen pb-32 bg-background-light dark:bg-background-dark">
            <Header title="設定" showBack={false} rightIcon="help" />

            <main className="p-4 space-y-6">
                {/* AI画像生成設定 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        AI画像生成
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => {
                                setTempApiKey(settings.geminiApiKey);
                                setTempAiModel(settings.aiModel);
                                setShowApiModal(true);
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-500">key</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Gemini API設定</p>
                                    <p className="text-[11px] text-gray-500">
                                        {settings.geminiApiKey ? maskApiKey(settings.geminiApiKey) : 'APIキーを設定してください'}
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                    {!settings.geminiApiKey && (
                        <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            AI画像生成を使用するにはAPIキーが必要です
                        </p>
                    )}
                </section>

                {/* ユーザー設定 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        ユーザー設定
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => {
                                setTempUserRole(settings.userRole);
                                setTempUserName(settings.userName);
                                setTempCompanyName(settings.companyName);
                                setShowUserModal(true);
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-500">badge</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">プロフィール</p>
                                    <p className="text-[11px] text-gray-500">
                                        {settings.userName || '未設定'} / {getRoleLabel(settings.userRole)}
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* 納品設定 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        納品設定
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => {
                                setTempDriveFolder(settings.defaultDriveFolder);
                                setTempAutoNotify(settings.autoNotifyOnUpload);
                                setShowDeliveryModal(true);
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500">folder</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Google Drive連携</p>
                                    <p className="text-[11px] text-gray-500">
                                        {settings.defaultDriveFolder ? '設定済み' : '未設定'}
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* アカウント連携 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">link</span>
                        アカウント連携
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => setShowAccountModal(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">account_circle</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Google / GitHub連携</p>
                                    <p className="text-[11px] text-gray-500">
                                        {firebaseUser ? (
                                            <span className="text-green-600">ログイン中: {firebaseUser.email}</span>
                                        ) : isFirebaseConfigured ? (
                                            '未ログイン'
                                        ) : (
                                            'Firebase未設定'
                                        )}
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                    {!isFirebaseConfigured && (
                        <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">info</span>
                            .envファイルにFirebase設定を追加してください
                        </p>
                    )}
                </section>

                {/* 権限管理 */}
                {currentUser.role === 'owner' && (
                    <section>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                            権限管理
                        </h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {/* メンバー招待ボタン */}
                            <button
                                onClick={() => {
                                    setInviteEmail('');
                                    setInviteName('');
                                    setInvitePreset('viewer');
                                    setShowInviteModal(true);
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">person_add</span>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">メンバーを招待</p>
                                        <p className="text-[11px] text-gray-500">
                                            メールアドレスで共有
                                        </p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">add</span>
                            </button>

                            {/* 権限管理ボタン */}
                            <button
                                onClick={() => setShowPermissionModal(true)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-purple-500">shield_person</span>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">メンバー権限</p>
                                        <p className="text-[11px] text-gray-500">
                                            {members.length}名のメンバー
                                        </p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                            </button>
                        </div>
                        {members.length === 0 && (
                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">info</span>
                                メンバーを招待して共同作業しましょう
                            </p>
                        )}
                    </section>
                )}

                {/* 表示設定 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">palette</span>
                        表示設定
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">dark_mode</span>
                                <div>
                                    <p className="text-sm font-bold">ダークモード</p>
                                    <p className="text-[11px] text-gray-500">目に優しい暗い表示</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative w-12 h-7 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">visibility</span>
                                <div>
                                    <p className="text-sm font-bold">完了済みプロジェクト</p>
                                    <p className="text-[11px] text-gray-500">一覧に表示する</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSettings(prev => ({ ...prev, showCompletedProjects: !prev.showCompletedProjects }))}
                                className={`relative w-12 h-7 rounded-full transition-colors ${settings.showCompletedProjects ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.showCompletedProjects ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* データ管理 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">database</span>
                        データ管理
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                        <button
                            onClick={() => setShowDataModal(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-500">save</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">バックアップ・復元</p>
                                    <p className="text-[11px] text-gray-500">
                                        {projects.length}件のプロジェクト / {models.length}名のモデル
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* その他 */}
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">more_horiz</span>
                        その他
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                        <button
                            onClick={() => setShowAboutModal(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <span className="text-sm font-bold">アプリについて</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </section>

                <p className="text-center text-[10px] text-gray-400 pt-4">
                    Shooting Master v1.0.0
                </p>
            </main>

            <BottomNav active="settings" />

            {/* API設定モーダル */}
            {showApiModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Gemini API設定</h3>
                            <button onClick={() => setShowApiModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">APIキー</label>
                                <input
                                    type="password"
                                    value={tempApiKey}
                                    onChange={(e) => setTempApiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Google AI Studioで取得できます
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">AIモデル</label>
                                <select
                                    value={tempAiModel}
                                    onChange={(e) => setTempAiModel(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                >
                                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (推奨)</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    <span className="font-bold">取得方法:</span><br />
                                    1. Google AI Studio にアクセス<br />
                                    2. 「Get API Key」をクリック<br />
                                    3. 新しいキーを作成してコピー
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowApiModal(false)}
                                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSaveApiSettings}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-medium"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ユーザー設定モーダル */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">プロフィール設定</h3>
                            <button onClick={() => setShowUserModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">役割</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setTempUserRole('client')}
                                        className={`h-12 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all ${
                                            tempUserRole === 'client'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">business</span>
                                        クライアント
                                    </button>
                                    <button
                                        onClick={() => setTempUserRole('photographer')}
                                        className={`h-12 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all ${
                                            tempUserRole === 'photographer'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">photo_camera</span>
                                        カメラマン
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">お名前</label>
                                <input
                                    type="text"
                                    value={tempUserName}
                                    onChange={(e) => setTempUserName(e.target.value)}
                                    placeholder="山田 太郎"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">会社名・屋号</label>
                                <input
                                    type="text"
                                    value={tempCompanyName}
                                    onChange={(e) => setTempCompanyName(e.target.value)}
                                    placeholder="株式会社〇〇"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSaveUserSettings}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-medium"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 納品設定モーダル */}
            {showDeliveryModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">納品設定</h3>
                            <button onClick={() => setShowDeliveryModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">デフォルトのGoogle Driveフォルダ</label>
                                <input
                                    type="url"
                                    value={tempDriveFolder}
                                    onChange={(e) => setTempDriveFolder(e.target.value)}
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    新規プロジェクトの納品先として設定されます
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div>
                                    <p className="text-sm font-medium">アップロード時に通知</p>
                                    <p className="text-[10px] text-gray-500">納品完了をクライアントに通知</p>
                                </div>
                                <button
                                    onClick={() => setTempAutoNotify(!tempAutoNotify)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${tempAutoNotify ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${tempAutoNotify ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDeliveryModal(false)}
                                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSaveDeliverySettings}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-medium"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* アカウント連携モーダル */}
            {showAccountModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">アカウント連携</h3>
                            <button onClick={() => setShowAccountModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {!isFirebaseConfigured ? (
                            <div className="space-y-4">
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined">warning</span>
                                        Firebase設定が必要です
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                        Google/GitHub連携を使用するには、Firebaseプロジェクトを作成し、
                                        .envファイルに設定を追加してください。
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <p className="text-sm font-bold mb-2">設定手順</p>
                                    <ol className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                        <li className="flex gap-2">
                                            <span className="text-primary font-bold">1.</span>
                                            <span>Firebase Consoleでプロジェクトを作成</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary font-bold">2.</span>
                                            <span>Authentication &gt; Sign-in methodでGoogle/GitHubを有効化</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary font-bold">3.</span>
                                            <span>.env.exampleを参考に.envファイルを作成</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary font-bold">4.</span>
                                            <span>アプリを再起動</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        ) : firebaseUser ? (
                            <div className="space-y-4">
                                {/* ログイン中のユーザー情報 */}
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        {firebaseUser.photoURL ? (
                                            <img
                                                src={firebaseUser.photoURL}
                                                alt=""
                                                className="w-12 h-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-green-600">person</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-green-700 dark:text-green-300">
                                                {firebaseUser.displayName || 'ユーザー'}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                {firebaseUser.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 連携済みプロバイダー */}
                                <div>
                                    <p className="text-sm font-medium mb-2">連携済みアカウント</p>
                                    <div className="space-y-2">
                                        {/* Google */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Google</p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {currentUser.linkedProviders?.includes('google.com') ? '連携済み' : '未連携'}
                                                    </p>
                                                </div>
                                            </div>
                                            {currentUser.linkedProviders?.includes('google.com') ? (
                                                <button
                                                    onClick={async () => {
                                                        if (currentUser.linkedProviders?.length <= 1) {
                                                            alert('最後の連携は解除できません');
                                                            return;
                                                        }
                                                        setIsLinking(true);
                                                        const result = await unlinkProvider('google.com');
                                                        setIsLinking(false);
                                                        if (!result.success) alert(result.message);
                                                    }}
                                                    disabled={isLinking}
                                                    className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                    解除
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        setIsLinking(true);
                                                        const result = await linkGoogleAccount();
                                                        setIsLinking(false);
                                                        if (!result.success) alert(result.message);
                                                    }}
                                                    disabled={isLinking}
                                                    className="text-xs text-primary hover:text-primary/80"
                                                >
                                                    連携
                                                </button>
                                            )}
                                        </div>

                                        {/* GitHub */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">GitHub</p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {currentUser.linkedProviders?.includes('github.com') ? '連携済み' : '未連携'}
                                                    </p>
                                                </div>
                                            </div>
                                            {currentUser.linkedProviders?.includes('github.com') ? (
                                                <button
                                                    onClick={async () => {
                                                        if (currentUser.linkedProviders?.length <= 1) {
                                                            alert('最後の連携は解除できません');
                                                            return;
                                                        }
                                                        setIsLinking(true);
                                                        const result = await unlinkProvider('github.com');
                                                        setIsLinking(false);
                                                        if (!result.success) alert(result.message);
                                                    }}
                                                    disabled={isLinking}
                                                    className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                    解除
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        setIsLinking(true);
                                                        const result = await linkGithubAccount();
                                                        setIsLinking(false);
                                                        if (!result.success) alert(result.message);
                                                    }}
                                                    disabled={isLinking}
                                                    className="text-xs text-primary hover:text-primary/80"
                                                >
                                                    連携
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ログアウトボタン */}
                                <button
                                    onClick={async () => {
                                        await logout();
                                        setShowAccountModal(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    <span className="text-sm font-medium">ログアウト</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Google または GitHub アカウントでログインしてください。
                                </p>

                                {/* Googleログイン */}
                                <button
                                    onClick={async () => {
                                        setIsLinking(true);
                                        const result = await signInWithGoogle();
                                        setIsLinking(false);
                                        if (result.success) {
                                            setShowAccountModal(false);
                                        } else {
                                            alert(result.message);
                                        }
                                    }}
                                    disabled={isLinking}
                                    className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Googleでログイン</span>
                                </button>

                                {/* GitHubログイン */}
                                <button
                                    onClick={async () => {
                                        setIsLinking(true);
                                        const result = await signInWithGithub();
                                        setIsLinking(false);
                                        if (result.success) {
                                            setShowAccountModal(false);
                                        } else {
                                            alert(result.message);
                                        }
                                    }}
                                    disabled={isLinking}
                                    className="w-full flex items-center justify-center gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    <span className="text-sm font-medium text-white">GitHubでログイン</span>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowAccountModal(false)}
                            className="w-full h-12 mt-6 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

            {/* データ管理モーダル */}
            {showDataModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">データ管理</h3>
                            <button onClick={() => setShowDataModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* 現在のデータ */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-sm font-medium mb-2">保存されているデータ</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                        <p className="text-lg font-bold text-primary">{projects.length}</p>
                                        <p className="text-[10px] text-gray-500">プロジェクト</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                        <p className="text-lg font-bold text-pink-500">{models.length}</p>
                                        <p className="text-[10px] text-gray-500">モデル</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                        <p className="text-lg font-bold text-amber-500">
                                            {projects.reduce((sum, p) => sum + p.cuts.length, 0)}
                                        </p>
                                        <p className="text-[10px] text-gray-500">カット</p>
                                    </div>
                                </div>
                            </div>

                            {/* エクスポート */}
                            <button
                                onClick={handleExportData}
                                className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-300"
                            >
                                <span className="material-symbols-outlined">download</span>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-bold">バックアップをエクスポート</p>
                                    <p className="text-[10px] opacity-70">JSONファイルとしてダウンロード</p>
                                </div>
                            </button>

                            {/* インポート */}
                            <label className="w-full flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-300 cursor-pointer">
                                <span className="material-symbols-outlined">upload</span>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-bold">バックアップを復元</p>
                                    <p className="text-[10px] opacity-70">JSONファイルからインポート</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    className="hidden"
                                />
                            </label>

                            {/* リセット */}
                            <button
                                onClick={handleResetData}
                                className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400"
                            >
                                <span className="material-symbols-outlined">delete_forever</span>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-bold">すべてのデータを削除</p>
                                    <p className="text-[10px] opacity-70">この操作は取り消せません</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowDataModal(false)}
                            className="w-full h-12 mt-6 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

            {/* メンバー招待モーダル */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">メンバーを招待</h3>
                            <button onClick={() => setShowInviteModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">メールアドレス</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">表示名（任意）</label>
                                <input
                                    type="text"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="山田 太郎"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">権限プリセット</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'viewer', label: '閲覧のみ', icon: 'visibility', desc: '閲覧権限のみ' },
                                        { id: 'editor', label: '編集者', icon: 'edit', desc: '編集可能（設定以外）' },
                                        { id: 'photographer', label: 'カメラマン', icon: 'photo_camera', desc: '撮影・納品管理' },
                                        { id: 'client', label: 'クライアント', icon: 'business', desc: '納品確認のみ' },
                                    ].map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setInvitePreset(preset.id)}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                                invitePreset === preset.id
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-lg ${invitePreset === preset.id ? 'text-primary' : 'text-gray-400'}`}>
                                                    {preset.icon}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium">{preset.label}</p>
                                                    <p className="text-[10px] text-gray-500">{preset.desc}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    if (!inviteEmail.trim()) {
                                        alert('メールアドレスを入力してください');
                                        return;
                                    }
                                    const result = inviteMember(inviteEmail, inviteName);
                                    if (result.success) {
                                        applyPermissionPreset(result.member.id, invitePreset);
                                        setShowInviteModal(false);
                                        alert(`${inviteEmail} を招待しました`);
                                    } else {
                                        alert(result.message);
                                    }
                                }}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-medium"
                            >
                                招待
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 権限管理モーダル */}
            {showPermissionModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">メンバー権限</h3>
                            <button onClick={() => setShowPermissionModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {members.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">group_off</span>
                                <p className="text-sm text-gray-500">まだメンバーがいません</p>
                                <button
                                    onClick={() => {
                                        setShowPermissionModal(false);
                                        setShowInviteModal(true);
                                    }}
                                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
                                >
                                    メンバーを招待
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map(member => (
                                    <div
                                        key={member.id}
                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary">person</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.name}</p>
                                                    <p className="text-[10px] text-gray-500">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                    member.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                    {member.status === 'active' ? 'アクティブ' : '招待中'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowMemberEditModal(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`${member.name} を削除しますか？`)) {
                                                            removeMember(member.id);
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* 権限サマリー */}
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(PERMISSION_PAGES).map(([key, page]) => {
                                                const perm = member.permissions?.[key];
                                                const canView = perm?.view;
                                                const canEdit = perm?.edit;
                                                if (!canView && !canEdit) return null;
                                                return (
                                                    <span
                                                        key={key}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                                            canEdit
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[10px]">
                                                            {canEdit ? 'edit' : 'visibility'}
                                                        </span>
                                                        {page.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowPermissionModal(false)}
                            className="w-full h-12 mt-6 rounded-xl border border-gray-200 dark:border-gray-700 font-medium"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

            {/* メンバー権限編集モーダル */}
            {showMemberEditModal && selectedMember && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold">{selectedMember.name}</h3>
                                <p className="text-xs text-gray-500">{selectedMember.email}</p>
                            </div>
                            <button onClick={() => setShowMemberEditModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* プリセット適用 */}
                        <div className="mb-6">
                            <label className="text-sm font-medium mb-2 block">権限プリセット</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'viewer', label: '閲覧のみ' },
                                    { id: 'editor', label: '編集者' },
                                    { id: 'photographer', label: 'カメラマン' },
                                    { id: 'client', label: 'クライアント' },
                                ].map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => applyPermissionPreset(selectedMember.id, preset.id)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 個別権限設定 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">ページ別権限</label>
                            {Object.entries(PERMISSION_PAGES).map(([key, page]) => {
                                const perm = selectedMember.permissions?.[key] || { view: false, edit: false };
                                return (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg text-gray-400">
                                                {page.icon}
                                            </span>
                                            <span className="text-sm font-medium">{page.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    updateMemberPermissions(selectedMember.id, key, 'view', !perm.view);
                                                    if (!perm.view === false) {
                                                        updateMemberPermissions(selectedMember.id, key, 'edit', false);
                                                    }
                                                    // 更新したメンバー情報を再取得
                                                    const updated = members.find(m => m.id === selectedMember.id);
                                                    if (updated) setSelectedMember({ ...updated });
                                                }}
                                                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                                    perm.view
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                閲覧
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newEditValue = !perm.edit;
                                                    updateMemberPermissions(selectedMember.id, key, 'edit', newEditValue);
                                                    if (newEditValue) {
                                                        updateMemberPermissions(selectedMember.id, key, 'view', true);
                                                    }
                                                    // 更新したメンバー情報を再取得
                                                    const updated = members.find(m => m.id === selectedMember.id);
                                                    if (updated) setSelectedMember({ ...updated });
                                                }}
                                                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                                    perm.edit
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                編集
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setShowMemberEditModal(false)}
                            className="w-full h-12 mt-6 rounded-xl bg-primary text-white font-medium"
                        >
                            完了
                        </button>
                    </div>
                </div>
            )}

            {/* アプリについてモーダル */}
            {showAboutModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">アプリについて</h3>
                            <button onClick={() => setShowAboutModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-white">photo_camera</span>
                            </div>
                            <h2 className="text-xl font-bold">Shooting Master</h2>
                            <p className="text-sm text-gray-500">v1.0.0</p>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="font-bold mb-1">主な機能</p>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    <li>• 撮影プロジェクト管理</li>
                                    <li>• AIによる完成予想図生成</li>
                                    <li>• カット指示書作成・印刷</li>
                                    <li>• モデル・小物管理</li>
                                    <li>• 納品管理・修正依頼対応</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="font-bold mb-1">使用技術</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                    React + Vite + Tailwind CSS<br />
                                    Google Gemini API (画像生成)
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAboutModal(false)}
                            className="w-full h-12 mt-6 rounded-xl bg-primary text-white font-medium"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
