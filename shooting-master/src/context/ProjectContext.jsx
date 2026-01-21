import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

// 初期サンプルデータ
const initialProjects = [
    {
        id: 1,
        name: 'サマー・スキンケア 2024',
        description: '夏向けスキンケア製品のプロモーション撮影',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4tFFNk_65OTac1t7yY84HvVKYVW0OMn70-l8jCnR1DwBej-1ftmBNgJ0tqkKJMpb4t_JmRcEgEIBHtIUFgsOga91oVmp1gFfiwQEuLO_N7K-ZGqD2fIlKpdGfU_V1iidbYGYWa6UsdRUAwGSwh4Zzd-BCThAixfjyniK70lZPoy2vHCzsd7U3Od1GBJ0KGjbUHjfHkXoyNX2PeH1279OiDwYjwaGYsCxKMgSjZcrQMFKJ0oXq7IKzry3VB7cFazd1fWpgBGPNw75J',
        status: 'in_progress', // 'draft', 'in_progress', 'completed'
        shootingDate: '2024-07-15',
        createdAt: '2024-06-01',
        // 小物・備品リスト
        props: [
            {
                id: 201,
                name: 'サマースキンケアセット',
                category: 'product', // 'product'=撮影商品, 'prop'=小物, 'costume'=衣装
                image: '',
                checked: true,
                notes: 'メイン撮影商品3点セット',
                // 納品関連
                driveUrl: '', // Googleドライブフォルダ URL
                delivery: {
                    status: 'pending', // 'pending', 'uploaded', 'approved', 'revision_requested'
                    uploadedAt: null,
                    uploadedFiles: [], // { name, url, thumbnail }
                    clientChecked: false,
                    clientCheckedAt: null,
                    revisions: [], // { id, message, createdAt, resolvedAt }
                },
            },
            {
                id: 202,
                name: '観葉植物（大）',
                category: 'prop',
                image: '',
                checked: true,
                notes: '背景用グリーン',
            },
            {
                id: 203,
                name: '白いリネンシーツ',
                category: 'prop',
                image: '',
                checked: false,
                notes: '敷物として使用',
            },
            {
                id: 204,
                name: 'モデル用サマーワンピース',
                category: 'costume',
                image: '',
                checked: false,
                notes: 'Sサイズ・白',
            },
        ],
        cuts: [
            {
                id: 101,
                title: '俯瞰：泡のディテール',
                scene: 'Scene A',
                description: '製品の泡立ちを強調したマクロ撮影',
                originalImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKzxGK6mAC4yCD8FzDKe4KzNRQelYRS6BYNvaqR9jvdUMSpVHvkzksSXnpMImB32DOyLd0pc9UCDpmpg9MwdGJIb_-ofZvm59NoX041hMIkRDmZ3MuU1aCzNN9aFtXn9KIQed1mQbcraVa6MOqCSlfQmROmeGMLKx50hJBNPvWjhlMfJEFxKz7nnmu610jk__VCnmo_TVrYyawpuD-BhsCHWwoGYthGSQC7VjlxOUo-ncapwK8kBIQpHnONoz_oPDuPGd-hIP0lQyl',
                aiGeneratedImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhhGrvcPXI2Ftery50V8dyGcNp2EEE3Zs2AGthrkK119jAbcMVrtGqGWAAxYKFav_kWbvXBxScgrSSgwGgOXgppKfd8jcfvWfM93hTIJJuCuG5cFvkqdi0pTDZi4VB0r6xfeODRGOesVNr25C8UbWwkUma9COjvUgr3kkM8yvQ_ipim6hQ7hABxUcEAweKUfKPihnYrc-lAarkLuan0Dv67CY90hBxa-Q-J8L1j017LVuuQ3lbC2310B6coM75LXb9EHQJFSlUDCgZ',
                angle: '俯瞰',
                lighting: 'ソフト・ディフューズ',
                comments: '泡の質感を際立たせる。背景は白で統一。',
                status: 'completed',
                createdAt: '2024-06-05',
                propIds: [201, 202, 203], // 使用する小物のID
                modelIds: [1, 2], // 使用するモデルのID
            },
            {
                id: 102,
                title: '正面：パッケージ全体',
                scene: 'Scene A',
                description: 'パッケージデザインを正面から撮影',
                originalImage: '',
                aiGeneratedImage: '',
                angle: '正面',
                lighting: 'スタジオライト',
                comments: 'ロゴがはっきり見えるように',
                status: 'pending',
                createdAt: '2024-06-06',
                propIds: [201, 204], // 使用する小物のID
                modelIds: [], // モデル不要
            },
        ],
    },
];

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('shooting-master-projects');
        return saved ? JSON.parse(saved) : initialProjects;
    });

    useEffect(() => {
        localStorage.setItem('shooting-master-projects', JSON.stringify(projects));
    }, [projects]);

    // プロジェクト操作
    const addProject = (projectData) => {
        const newProject = {
            ...projectData,
            id: Date.now(),
            status: 'draft',
            cuts: [],
            props: [],
            createdAt: new Date().toISOString().split('T')[0],
        };
        setProjects(prev => [newProject, ...prev]);
        return newProject;
    };

    const updateProject = (id, projectData) => {
        setProjects(prev => prev.map(project =>
            project.id === id ? { ...project, ...projectData } : project
        ));
    };

    const deleteProject = (id) => {
        setProjects(prev => prev.filter(project => project.id !== id));
    };

    const getProjectById = (id) => {
        return projects.find(project => project.id === Number(id));
    };

    // カット操作
    const addCut = (projectId, cutData) => {
        const newCut = {
            ...cutData,
            id: Date.now(),
            status: 'pending',
            propIds: cutData.propIds || [],
            modelIds: cutData.modelIds || [],
            createdAt: new Date().toISOString().split('T')[0],
        };
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? { ...project, cuts: [...project.cuts, newCut] }
                : project
        ));
        return newCut;
    };

    const updateCut = (projectId, cutId, cutData) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    cuts: project.cuts.map(cut =>
                        cut.id === cutId ? { ...cut, ...cutData } : cut
                    )
                }
                : project
        ));
    };

    const deleteCut = (projectId, cutId) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? { ...project, cuts: project.cuts.filter(cut => cut.id !== cutId) }
                : project
        ));
    };

    const getCutById = (projectId, cutId) => {
        const project = getProjectById(projectId);
        return project?.cuts.find(cut => cut.id === Number(cutId));
    };

    // 小物・備品操作
    const addProp = (projectId, propData) => {
        const newProp = {
            ...propData,
            id: Date.now(),
            checked: false,
        };
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? { ...project, props: [...(project.props || []), newProp] }
                : project
        ));
        return newProp;
    };

    const updateProp = (projectId, propId, propData) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId ? { ...prop, ...propData } : prop
                    )
                }
                : project
        ));
    };

    const deleteProp = (projectId, propId) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? { ...project, props: (project.props || []).filter(prop => prop.id !== propId) }
                : project
        ));
    };

    const togglePropCheck = (projectId, propId) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId ? { ...prop, checked: !prop.checked } : prop
                    )
                }
                : project
        ));
    };

    // 小物進捗計算
    const getPropsProgress = (projectId) => {
        const project = getProjectById(projectId);
        if (!project || !project.props || project.props.length === 0) return 0;
        const checked = project.props.filter(prop => prop.checked).length;
        return Math.round((checked / project.props.length) * 100);
    };

    // 小物が使用されているカットを取得
    const getCutsUsingProp = (projectId, propId) => {
        const project = getProjectById(projectId);
        if (!project) return [];
        return project.cuts.filter(cut => (cut.propIds || []).includes(propId));
    };

    // カットで使用する小物を取得
    const getPropsForCut = (projectId, cutId) => {
        const project = getProjectById(projectId);
        if (!project) return [];
        const cut = project.cuts.find(c => c.id === Number(cutId));
        if (!cut) return [];
        return (project.props || []).filter(prop => (cut.propIds || []).includes(prop.id));
    };

    // モデルが使用されているカットを取得
    const getCutsUsingModel = (projectId, modelId) => {
        const project = getProjectById(projectId);
        if (!project) return [];
        return project.cuts.filter(cut => (cut.modelIds || []).includes(modelId));
    };

    // プロジェクトで使用されているモデルIDを取得
    const getModelIdsForProject = (projectId) => {
        const project = getProjectById(projectId);
        if (!project) return [];
        const modelIds = new Set();
        project.cuts.forEach(cut => {
            (cut.modelIds || []).forEach(id => modelIds.add(id));
        });
        return Array.from(modelIds);
    };

    // 進捗計算
    const getProjectProgress = (projectId) => {
        const project = getProjectById(projectId);
        if (!project || project.cuts.length === 0) return 0;
        const completed = project.cuts.filter(cut => cut.status === 'completed').length;
        return Math.round((completed / project.cuts.length) * 100);
    };

    // ===== 納品関連 =====

    // 商品のドライブURLを設定
    const setProductDriveUrl = (projectId, propId, driveUrl) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId ? { ...prop, driveUrl } : prop
                    )
                }
                : project
        ));
    };

    // 納品ファイルをアップロード（カメラマン側）
    const uploadDeliveryFiles = (projectId, propId, files) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId
                            ? {
                                ...prop,
                                delivery: {
                                    ...prop.delivery,
                                    status: 'uploaded',
                                    uploadedAt: new Date().toISOString(),
                                    uploadedFiles: [...(prop.delivery?.uploadedFiles || []), ...files],
                                }
                            }
                            : prop
                    )
                }
                : project
        ));
    };

    // 納品をクライアント確認済みにする
    const approveDelivery = (projectId, propId) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId
                            ? {
                                ...prop,
                                delivery: {
                                    ...prop.delivery,
                                    status: 'approved',
                                    clientChecked: true,
                                    clientCheckedAt: new Date().toISOString(),
                                }
                            }
                            : prop
                    )
                }
                : project
        ));
    };

    // 修正指示を追加（クライアント側）
    const addRevisionRequest = (projectId, propId, message) => {
        const revision = {
            id: Date.now(),
            message,
            createdAt: new Date().toISOString(),
            resolvedAt: null,
        };
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId
                            ? {
                                ...prop,
                                delivery: {
                                    ...prop.delivery,
                                    status: 'revision_requested',
                                    clientChecked: false,
                                    revisions: [...(prop.delivery?.revisions || []), revision],
                                }
                            }
                            : prop
                    )
                }
                : project
        ));
    };

    // 修正指示を解決済みにする（カメラマン側）
    const resolveRevision = (projectId, propId, revisionId) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId
                            ? {
                                ...prop,
                                delivery: {
                                    ...prop.delivery,
                                    revisions: (prop.delivery?.revisions || []).map(rev =>
                                        rev.id === revisionId
                                            ? { ...rev, resolvedAt: new Date().toISOString() }
                                            : rev
                                    ),
                                }
                            }
                            : prop
                    )
                }
                : project
        ));
    };

    // 納品ステータスを更新
    const updateDeliveryStatus = (projectId, propId, status) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId
                            ? {
                                ...prop,
                                delivery: {
                                    ...prop.delivery,
                                    status,
                                }
                            }
                            : prop
                    )
                }
                : project
        ));
    };

    // 納品ファイルを削除
    const removeDeliveryFile = (projectId, propId, fileIndex) => {
        setProjects(prev => prev.map(project =>
            project.id === Number(projectId)
                ? {
                    ...project,
                    props: (project.props || []).map(prop =>
                        prop.id === propId
                            ? {
                                ...prop,
                                delivery: {
                                    ...prop.delivery,
                                    uploadedFiles: (prop.delivery?.uploadedFiles || []).filter((_, idx) => idx !== fileIndex),
                                }
                            }
                            : prop
                    )
                }
                : project
        ));
    };

    // プロジェクトの納品進捗を取得
    const getDeliveryProgress = (projectId) => {
        const project = getProjectById(projectId);
        if (!project) return { total: 0, uploaded: 0, approved: 0, pending: 0, revisionRequested: 0 };

        const products = (project.props || []).filter(p => p.category === 'product');
        const total = products.length;
        const uploaded = products.filter(p => p.delivery?.status === 'uploaded').length;
        const approved = products.filter(p => p.delivery?.status === 'approved').length;
        const revisionRequested = products.filter(p => p.delivery?.status === 'revision_requested').length;
        const pending = total - uploaded - approved - revisionRequested;

        return { total, uploaded, approved, pending, revisionRequested };
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            addProject,
            updateProject,
            deleteProject,
            getProjectById,
            addCut,
            updateCut,
            deleteCut,
            getCutById,
            addProp,
            updateProp,
            deleteProp,
            togglePropCheck,
            getPropsProgress,
            getCutsUsingProp,
            getPropsForCut,
            getCutsUsingModel,
            getModelIdsForProject,
            getProjectProgress,
            // 納品関連
            setProductDriveUrl,
            uploadDeliveryFiles,
            approveDelivery,
            addRevisionRequest,
            resolveRevision,
            updateDeliveryStatus,
            removeDeliveryFile,
            getDeliveryProgress,
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};
