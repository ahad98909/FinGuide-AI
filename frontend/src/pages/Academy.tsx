import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, HelpCircle, Check, X, Award, Lightbulb, GraduationCap } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  desc: string;
  detail: string;
  example: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
}

const TOPICS: Topic[] = [
  {
    id: 'budgeting',
    title: 'Budgeting 101',
    desc: 'The art of dividing income into expenses and future savings.',
    detail: 'Budgeting is listing what you earn and allocating it into needs, wants, and savings. A common framework is the 50/30/20 guideline (50% needs, 30% wants, 20% savings), but you can adjust it to fit your actual lifestyle.',
    example: 'If you earn PKR 100,000, you spend PKR 50,000 on essential rent and bills, PKR 30,000 on dining out or hobbies, and put PKR 20,000 straight into savings.',
    quiz: {
      question: 'Which of the following is considered a NEED in budgeting?',
      options: ['Streaming subscription', 'Electricity bill', 'Brand new smartphone', 'Dining at a luxury hotel'],
      answer: 1,
      explanation: 'Electricity is an essential utility needed for survival and basic safety, whereas the others are discretionary wants.'
    }
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest',
    desc: 'Earning interest on top of interest. The snowball effect of wealth.',
    detail: 'Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods. Over time, it causes your wealth to grow exponentially.',
    example: 'If you save PKR 10,000 at 10% annual interest, you earn PKR 1,000 in year 1. In year 2, you earn 10% interest on PKR 11,000, which is PKR 1,100, totaling PKR 12,100.',
    quiz: {
      question: 'What is the key factor that makes compound interest highly powerful?',
      options: ['High initial deposit only', 'Time / starting early', 'Investing in risky loans', 'Frequent bank visits'],
      answer: 1,
      explanation: 'Because compound interest builds on top of itself, the longer you leave the money invested (Time), the larger the exponential growth becomes.'
    }
  },
  {
    id: 'inflation',
    title: 'Inflation',
    desc: 'Why things get expensive over time and your purchasing power drops.',
    detail: 'Inflation is the general increase in prices and fall in the purchasing value of money. If inflation is 8%, a PKR 100 item will cost PKR 108 next year. Your money loses value if it sits idle.',
    example: 'A bag of wheat that cost PKR 1,000 a few years ago now costs PKR 1,500. The purchasing power of PKR 1,000 has declined.',
    quiz: {
      question: 'What happens to cash kept idle under a mattress during inflation?',
      options: ['It increases in purchasing power', 'It maintains exact value', 'It loses purchasing power', 'It earns compound interest'],
      answer: 2,
      explanation: 'As prices go up, the absolute amount of cash remains the same, meaning you can buy fewer things with it. It loses purchasing power.'
    }
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    desc: 'Your financial shield against unexpected medical bills or job loss.',
    detail: 'An emergency fund is a separate cash reserve set aside for unplanned expenses. Financial advisors recommend saving at least 3 to 6 months of living expenses in an accessible place.',
    example: 'If your monthly living costs are PKR 50,000, having an emergency fund of PKR 150,000 to PKR 300,000 protects you from taking high-interest loans if emergencies occur.',
    quiz: {
      question: 'How much emergency coverage is typically recommended by advisors?',
      options: ['1 week of expenses', '3 to 6 months of expenses', 'Exactly PKR 1,000,000', '10 years of salary'],
      answer: 1,
      explanation: '3 to 6 months provides a comfortable buffer to find a new job or pay unexpected costs without incurring credit card debt.'
    }
  }
];

export const Academy: React.FC<{
  onTabChange: (tab: string) => void;
}> = ({ onTabChange }) => {
  const { t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Quiz states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState<boolean | null>(null);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizSuccess(null);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null || !selectedTopic) return;
    setQuizSubmitted(true);
    setQuizSuccess(selectedOption === selectedTopic.quiz.answer);
  };

  const handleExplainInSimpleWords = (topicTitle: string) => {
    // Navigate to assistant with a custom prepopulated message
    localStorage.setItem('prepopulate_chat', `Explain ${topicTitle} in simple words.`);
    onTabChange('ai-assistant');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('academy_title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Master financial concepts through simplified notes and quizzes.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Topic Deck Lists (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Course Deck</span>
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedTopic?.id === topic.id
                  ? 'border-[#2b4d32] bg-[#2b4d32]/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedTopic?.id === topic.id ? 'bg-[#2b4d32] text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-500'
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100">{topic.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{topic.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Viewer (3 cols) */}
        <div className="md:col-span-3">
          {selectedTopic ? (
            <div className="glass-card space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  {selectedTopic.title}
                </h3>
                <button
                  onClick={() => handleExplainInSimpleWords(selectedTopic.title)}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-[#2b4d32] dark:text-emerald-450 hover:bg-[#2b4d32]/5 transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Explain in Simple Words
                </button>
              </div>

              {/* Lesson Text */}
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {selectedTopic.detail}
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-xs">
                   <span className="font-bold text-emerald-700 dark:text-emerald-450 block mb-1">Example scenario</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedTopic.example}</p>
                </div>
              </div>

              {/* Interactive Quiz */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <span className="text-xs font-bold text-slate-505 uppercase tracking-wider flex items-center gap-1.5">
                   <HelpCircle className="w-4 h-4 text-emerald-600" />
                  {t('academy_quiz')}
                </span>
                
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedTopic.quiz.question}
                </p>

                <form onSubmit={handleQuizSubmit} className="space-y-2">
                  {selectedTopic.quiz.options.map((opt, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        selectedOption === index
                          ? 'border-[#2b4d32] bg-[#2b4d32]/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quiz-option"
                        checked={selectedOption === index}
                        onChange={() => !quizSubmitted && setSelectedOption(index)}
                        disabled={quizSubmitted}
                        className="text-emerald-700 focus:ring-emerald-500 w-4 h-4 border-slate-300 bg-transparent cursor-pointer"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}

                  {/* Submission and verification result */}
                  {!quizSubmitted ? (
                    <button
                      type="submit"
                      disabled={selectedOption === null}
                      className="w-full mt-4 bg-[#2b4d32] hover:bg-[#345e3d] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-forest-900/10 text-xs"
                    >
                      {t('academy_quiz_submit')}
                    </button>
                  ) : (
                    <div className={`p-4 rounded-xl border mt-4 space-y-2.5 ${
                      quizSuccess ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600' : 'border-rose-500/20 bg-rose-500/5 text-rose-600'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {quizSuccess ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Correct answer! Excellent job.</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-rose-500" />
                            <span>Oops, that is incorrect.</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {selectedTopic.quiz.explanation}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center py-20 text-center text-slate-400 h-full">
              <Award className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="font-bold text-slate-600 dark:text-slate-400 mb-1">Academy Library</h3>
              <p className="text-xs max-w-[200px] mx-auto leading-relaxed text-slate-400">
                Select a financial course card from the deck on the left to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Academy;
