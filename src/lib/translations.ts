'use client';

type TranslationKeys = 
  | 'high_score'
  | 'score'
  | 'reset'
  | 'tactical_guide'
  | 'guide_move'
  | 'guide_cycle'
  | 'guide_match'
  | 'gem_rarity'
  | 'next'
  | 'ai_advisor'
  | 'get_hint'
  | 'analyzing'
  | 'strategy_identified'
  | 'wait_ai'
  | 'strategy_pro_tip'
  | 'pro_tip_content'
  | 'game_over_title'
  | 'game_over_desc'
  | 'ai_failed_title'
  | 'ai_failed_desc';

const translations: Record<string, Record<TranslationKeys, string>> = {
  en: {
    high_score: 'High',
    score: 'Score',
    reset: 'Reset',
    tactical_guide: 'TACTICAL GUIDE',
    guide_move: 'Use Arrow Keys or On-Screen buttons to move.',
    guide_cycle: 'Press Up or Space (or the Center button) to cycle gems.',
    guide_match: 'Match 3+ gems horizontally, vertically, or diagonally.',
    gem_rarity: 'Gem Rarity',
    next: 'Next',
    ai_advisor: 'AI ADVISOR',
    get_hint: 'GET HINT',
    analyzing: 'ANALYZING',
    strategy_identified: 'STRATEGY IDENTIFIED',
    wait_ai: 'Wait for a tricky pattern to engage the Strategic Lens.',
    strategy_pro_tip: 'Strategy Pro-Tip',
    pro_tip_content: 'Diagonals are often overlooked. Try to stack gems to create multi-directional cascades for massive score multipliers.',
    game_over_title: 'Grid Overflow!',
    game_over_desc: 'The columns have reached the ceiling.',
    ai_failed_title: 'Strategic Uplink Failed',
    ai_failed_desc: 'The AI strategist is currently recalibrating.',
  },
  ru: {
    high_score: 'Рекорд',
    score: 'Счет',
    reset: 'Сброс',
    tactical_guide: 'РУКОВОДСТВО',
    guide_move: 'Используйте стрелки или экранные кнопки для движения.',
    guide_cycle: 'Нажмите Вверх или Пробел для вращения камней.',
    guide_match: 'Собирайте 3+ камня в ряд, по вертикали или диагонали.',
    gem_rarity: 'Редкость камней',
    next: 'След.',
    ai_advisor: 'ИИ СОВЕТНИК',
    get_hint: 'ПОДСКАЗКА',
    analyzing: 'АНАЛИЗ...',
    strategy_identified: 'СТРАТЕГИЯ НАЙДЕНА',
    wait_ai: 'Подождите сложную ситуацию для активации ИИ.',
    strategy_pro_tip: 'Совет стратега',
    pro_tip_content: 'Дигонали часто упускают из виду. Складывайте камни для создания каскадов в разных направлениях.',
    game_over_title: 'Переполнение!',
    game_over_desc: 'Столбцы достигли самого верха.',
    ai_failed_title: 'Сбой связи ИИ',
    ai_failed_desc: 'Стратегический ИИ сейчас перекалибруется.',
  }
};

export function t(key: TranslationKeys, lang: string = 'en'): string {
  const language = translations[lang] ? lang : 'en';
  return translations[language][key] || translations['en'][key];
}
