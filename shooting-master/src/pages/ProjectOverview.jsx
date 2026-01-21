import { Link } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useProjects } from '../context/ProjectContext';

const ProjectOverview = () => {
    const { projects, getProjectProgress } = useProjects();

    const statusColors = {
        draft: 'bg-gray-500',
        in_progress: 'bg-blue-500',
        completed: 'bg-green-500',
    };

    const statusLabels = {
        draft: '下書き',
        in_progress: '進行中',
        completed: '完了',
    };

    return (
        <div className="max-w-md mx-auto min-h-screen pb-32">
            <Header title="撮影プロジェクト" showBack={false} rightIcon="search" />

            <main className="p-4 space-y-6">
                {/* Stats */}
                <section className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl font-bold text-primary">{projects.length}</p>
                        <p className="text-[10px] text-gray-500 uppercase">全体</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl font-bold text-blue-500">
                            {projects.filter(p => p.status === 'in_progress').length}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase">進行中</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl font-bold text-green-500">
                            {projects.filter(p => p.status === 'completed').length}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase">完了</p>
                    </div>
                </section>

                {/* Project List */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">プロジェクト一覧</h2>
                        <span className="text-xs text-gray-500">{projects.length}件</span>
                    </div>

                    {projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.map(project => {
                                const progress = getProjectProgress(project.id);
                                return (
                                    <Link
                                        key={project.id}
                                        to={`/project-detail/${project.id}`}
                                        className="block bg-surface-dark rounded-2xl overflow-hidden text-white hover:ring-2 hover:ring-primary/50 transition-all"
                                    >
                                        {/* Image */}
                                        {project.productImage && (
                                            <div
                                                className="h-32 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${project.productImage})` }}
                                            />
                                        )}

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
                                                <span className="text-[10px] text-slate-400">
                                                    {statusLabels[project.status]}
                                                </span>
                                                {project.shootingDate && (
                                                    <>
                                                        <span className="text-slate-600">•</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {project.shootingDate}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold mb-1">{project.name}</h3>

                                            {project.description && (
                                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                                    {project.description}
                                                </p>
                                            )}

                                            {/* Progress */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-primary">{progress}%</span>
                                            </div>

                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {project.cuts.length}カット
                                                {project.cuts.length > 0 && (
                                                    <> • {project.cuts.filter(c => c.status === 'completed').length}完了</>
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">folder_open</span>
                            <p className="text-gray-500 mb-4">プロジェクトがまだありません</p>
                            <Link
                                to="/project-register"
                                className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                            >
                                <span className="material-symbols-outlined">add</span>
                                最初のプロジェクトを作成
                            </Link>
                        </div>
                    )}
                </section>
            </main>

            {/* FAB */}
            <Link
                to="/project-register"
                className="fixed bottom-24 right-6 flex items-center justify-center gap-2 bg-primary text-white h-14 px-6 rounded-full shadow-lg z-40 hover:bg-primary/90 transition-colors"
            >
                <span className="material-symbols-outlined">add</span>
                <span className="text-sm font-bold">新規作成</span>
            </Link>

            <BottomNav active="project" />
        </div>
    );
};

export default ProjectOverview;
