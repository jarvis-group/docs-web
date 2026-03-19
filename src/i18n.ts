export type Lang = 'ru' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  ru: {
    'docs.title': 'Документация',
    'docs.subtitle': 'Всё, что нужно знать для работы с платформой Jarvis',
    'docs.search': 'Поиск...',
    'nav.getting-started': 'Начало работы',
    'nav.staff': 'Управление сотрудниками',
    'nav.ai': 'AI-ассистент',
    'nav.modules': 'Модули',
    'nav.limits': 'Лимиты и квоты',
    'nav.plans': 'Тарифы',
    'nav.api': 'API',
    'nav.faq': 'FAQ',
    'home.card.getting-started': 'Регистрация, первый вход и обзор интерфейса',
    'home.card.staff': 'Добавление, роли, права и редактирование',
    'home.card.ai': 'Как работает чат, доступ к данным по должности',
    'home.card.modules': 'Лиды, сделки, финансы, маркетинг и другие',
    'home.card.limits': 'Запросы к AI, хранилище, сотрудники по тарифам',
    'home.card.plans': 'Старт, Бизнес, MAX, Enterprise — сравнение',
    'home.card.api': 'REST API для интеграций (MAX/Enterprise)',
    'home.card.faq': 'Ответы на частые вопросы',
    'lang.switch': 'EN',
    'back': 'На главную',
  },
  en: {
    'docs.title': 'Documentation',
    'docs.subtitle': 'Everything you need to know to work with the Jarvis platform',
    'docs.search': 'Search...',
    'nav.getting-started': 'Getting Started',
    'nav.staff': 'Staff Management',
    'nav.ai': 'AI Assistant',
    'nav.modules': 'Modules',
    'nav.limits': 'Limits & Quotas',
    'nav.plans': 'Plans',
    'nav.api': 'API',
    'nav.faq': 'FAQ',
    'home.card.getting-started': 'Registration, first login and interface overview',
    'home.card.staff': 'Adding users, roles, permissions and editing',
    'home.card.ai': 'How chat works, data access by position',
    'home.card.modules': 'Leads, deals, finance, marketing and more',
    'home.card.limits': 'AI requests, storage, users per plan',
    'home.card.plans': 'Start, Business, MAX, Enterprise — comparison',
    'home.card.api': 'REST API for integrations (MAX/Enterprise)',
    'home.card.faq': 'Answers to common questions',
    'lang.switch': 'RU',
    'back': 'Back to home',
  },
}

export function t(lang: Lang, key: string): string {
  return translations[lang]?.[key] ?? key
}

export function getStoredLang(): Lang {
  return (localStorage.getItem('jarvis_docs_lang') as Lang) || 'ru'
}
export function storeLang(lang: Lang) { localStorage.setItem('jarvis_docs_lang', lang) }
