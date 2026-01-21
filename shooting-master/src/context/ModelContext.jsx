import { createContext, useContext, useState, useEffect } from 'react';

const ModelContext = createContext();

// 初期サンプルデータ
const initialModels = [
    {
        id: 1,
        name: 'エレナ・ロドリゲス',
        gender: '女性',
        age: 24,
        topSize: 'M',
        bottomSize: 'S',
        shoeSize: '24.5',
        modelType: 'agency',
        agencyName: 'Elite Model Management',
        portfolioUrl: 'https://elite.com/elena',
        instagramUrl: 'https://instagram.com/elena_model',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb5MoeAC10Rqu72eWAiVXabbfEXHPiq-mAuBFrYNPsExAiIWQNF-NS-8DNZXUu41QMrMcFKHY7MGwGPAOb_HygjK703QP_gMYMa6woZE8pig01KWOoBnoZyprelDluD5osNxt51ARHep9PEkqvTEem6n2t_haDQD9M7FdoRPzhWETfXP8XiwQ4QKWntfxki-MhskK1cNlC4KzHY6zn_aoA_NT5PRYZR1J9y_GiKESlggI7X9JuyUCQa2G2jFsNYfjES2Dv8QKtxWtP',
        createdAt: '2024-01-15',
    },
    {
        id: 2,
        name: '田中 美咲',
        gender: '女性',
        age: 22,
        topSize: 'S',
        bottomSize: 'S',
        shoeSize: '23.5',
        modelType: 'agency',
        agencyName: 'Tokyo Models',
        portfolioUrl: '',
        instagramUrl: 'https://instagram.com/misaki_tnk',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb5MoeAC10Rqu72eWAiVXabbfEXHPiq-mAuBFrYNPsExAiIWQNF-NS-8DNZXUu41QMrMcFKHY7MGwGPAOb_HygjK703QP_gMYMa6woZE8pig01KWOoBnoZyprelDluD5osNxt51ARHep9PEkqvTEem6n2t_haDQD9M7FdoRPzhWETfXP8XiwQ4QKWntfxki-MhskK1cNlC4KzHY6zn_aoA_NT5PRYZR1J9y_GiKESlggI7X9JuyUCQa2G2jFsNYfjES2Dv8QKtxWtP',
        createdAt: '2024-02-20',
    },
    {
        id: 3,
        name: 'ソフィア・チェン',
        gender: '女性',
        age: 26,
        topSize: 'M',
        bottomSize: 'M',
        shoeSize: '25.0',
        modelType: 'freelance',
        agencyName: '',
        portfolioUrl: 'https://sophia-chen.com',
        instagramUrl: 'https://instagram.com/sophia.chen',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb5MoeAC10Rqu72eWAiVXabbfEXHPiq-mAuBFrYNPsExAiIWQNF-NS-8DNZXUu41QMrMcFKHY7MGwGPAOb_HygjK703QP_gMYMa6woZE8pig01KWOoBnoZyprelDluD5osNxt51ARHep9PEkqvTEem6n2t_haDQD9M7FdoRPzhWETfXP8XiwQ4QKWntfxki-MhskK1cNlC4KzHY6zn_aoA_NT5PRYZR1J9y_GiKESlggI7X9JuyUCQa2G2jFsNYfjES2Dv8QKtxWtP',
        createdAt: '2024-03-10',
    },
    {
        id: 4,
        name: '山田 健太',
        gender: '男性',
        age: 28,
        topSize: 'L',
        bottomSize: 'M',
        shoeSize: '27.0',
        modelType: 'agency',
        agencyName: 'Bark in Style',
        portfolioUrl: '',
        instagramUrl: 'https://instagram.com/kenta_yamada',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb5MoeAC10Rqu72eWAiVXabbfEXHPiq-mAuBFrYNPsExAiIWQNF-NS-8DNZXUu41QMrMcFKHY7MGwGPAOb_HygjK703QP_gMYMa6woZE8pig01KWOoBnoZyprelDluD5osNxt51ARHep9PEkqvTEem6n2t_haDQD9M7FdoRPzhWETfXP8XiwQ4QKWntfxki-MhskK1cNlC4KzHY6zn_aoA_NT5PRYZR1J9y_GiKESlggI7X9JuyUCQa2G2jFsNYfjES2Dv8QKtxWtP',
        createdAt: '2024-03-25',
    },
];

export const ModelProvider = ({ children }) => {
    const [models, setModels] = useState(() => {
        // localStorageから読み込み
        const saved = localStorage.getItem('shooting-master-models');
        return saved ? JSON.parse(saved) : initialModels;
    });

    // localStorageに保存
    useEffect(() => {
        localStorage.setItem('shooting-master-models', JSON.stringify(models));
    }, [models]);

    const addModel = (modelData) => {
        const newModel = {
            ...modelData,
            id: Date.now(),
            createdAt: new Date().toISOString().split('T')[0],
        };
        setModels(prev => [newModel, ...prev]);
        return newModel;
    };

    const updateModel = (id, modelData) => {
        setModels(prev => prev.map(model =>
            model.id === id ? { ...model, ...modelData } : model
        ));
    };

    const deleteModel = (id) => {
        setModels(prev => prev.filter(model => model.id !== id));
    };

    const getModelById = (id) => {
        return models.find(model => model.id === Number(id));
    };

    return (
        <ModelContext.Provider value={{
            models,
            addModel,
            updateModel,
            deleteModel,
            getModelById,
        }}>
            {children}
        </ModelContext.Provider>
    );
};

export const useModels = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModels must be used within a ModelProvider');
    }
    return context;
};
