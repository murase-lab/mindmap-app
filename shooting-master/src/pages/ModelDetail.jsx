import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useModels } from '../context/ModelContext';

const ModelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getModelById, deleteModel } = useModels();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const model = getModelById(id);

    if (!model) {
        return (
            <div className="max-w-md mx-auto min-h-screen pb-32">
                <Header title="モデル詳細" />
                <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">person_off</span>
                    <p className="text-gray-500 mb-4">モデルが見つかりません</p>
                    <Link to="/model-list" className="text-primary font-bold hover:underline">
                        モデル一覧に戻る
                    </Link>
                </div>
                <BottomNav active="models" />
            </div>
        );
    }

    const handleDelete = () => {
        deleteModel(model.id);
        navigate('/model-list');
    };

    return (
        <div className="max-w-md mx-auto min-h-screen pb-32">
            <Header title="モデル詳細" rightIcon="more_horiz" />
            <main>
                {/* Profile Header */}
                <div className="p-6 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-gray-200 mb-4">
                        {model.image ? (
                            <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{model.name}</h1>
                    <p className="text-gray-500 font-medium text-sm">
                        {model.modelType === 'agency' ? model.agencyName : 'フリーランス'}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-gray-400">{model.gender}</span>
                        <span className="text-sm text-gray-400">{model.age}歳</span>
                    </div>
                </div>

                <div className="px-6 space-y-6">
                    {/* Size Info */}
                    <section>
                        <h3 className="text-lg font-bold mb-4">サイズ詳細</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">トップス</p>
                                <p className="text-lg font-bold text-primary">{model.topSize || '-'}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ボトムス</p>
                                <p className="text-lg font-bold text-primary">{model.bottomSize || '-'}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">靴</p>
                                <p className="text-lg font-bold text-primary">{model.shoeSize ? `${model.shoeSize}cm` : '-'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Links */}
                    <section>
                        <h3 className="text-lg font-bold mb-4">リンク</h3>
                        <div className="space-y-3">
                            {model.instagramUrl && (
                                <a
                                    href={model.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-pink-500">photo_camera</span>
                                    <span className="flex-1 text-sm font-medium">Instagram</span>
                                    <span className="material-symbols-outlined text-gray-400 text-xl">open_in_new</span>
                                </a>
                            )}
                            {model.portfolioUrl && (
                                <a
                                    href={model.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-primary">language</span>
                                    <span className="flex-1 text-sm font-medium">ポートフォリオ</span>
                                    <span className="material-symbols-outlined text-gray-400 text-xl">open_in_new</span>
                                </a>
                            )}
                            {!model.instagramUrl && !model.portfolioUrl && (
                                <p className="text-sm text-gray-400 text-center py-4">リンクは登録されていません</p>
                            )}
                        </div>
                    </section>

                    {/* Info */}
                    <section>
                        <h3 className="text-lg font-bold mb-4">登録情報</h3>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">登録日</span>
                                <span className="text-sm font-medium">{model.createdAt}</span>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="pt-4">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                            このモデルを削除
                        </button>
                    </section>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
                        <h3 className="text-lg font-bold mb-2">モデルを削除しますか？</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            「{model.name}」を削除します。この操作は取り消せません。
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav active="models" />
        </div>
    );
};

export default ModelDetail;
