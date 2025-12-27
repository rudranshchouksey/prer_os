import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudyItem {
  id: string;
  title: string;
  status: 'must-do' | 'nice-to-have' | 'applied';
  category: string;
  notes?: string;
  createdAt: Date;
}

export interface FlashcardProgress {
  questionId: string;
  confidence: 'low' | 'medium' | 'high';
  lastReviewed: Date;
  reviewCount: number;
}

interface PrepOSState {
  // User progress
  dailyStreak: number;
  lastActiveDate: string | null;
  interviewDate: string | null;
  totalQuestionsAnswered: number;
  
  // Study items for roadmap
  studyItems: StudyItem[];
  
  // Flashcard progress
  flashcardProgress: Record<string, FlashcardProgress>;
  
  // Notes
  notes: Record<string, string>;
  
  // Actions
  setInterviewDate: (date: string) => void;
  incrementStreak: () => void;
  addStudyItem: (item: Omit<StudyItem, 'id' | 'createdAt'>) => void;
  updateStudyItemStatus: (id: string, status: StudyItem['status']) => void;
  removeStudyItem: (id: string) => void;
  updateFlashcardProgress: (questionId: string, confidence: 'low' | 'medium' | 'high') => void;
  saveNote: (topicId: string, content: string) => void;
  getNote: (topicId: string) => string;
}

export const useStore = create<PrepOSState>()(
  persist(
    (set, get) => ({
      dailyStreak: 0,
      lastActiveDate: null,
      interviewDate: null,
      totalQuestionsAnswered: 0,
      studyItems: [],
      flashcardProgress: {},
      notes: {},

      setInterviewDate: (date) => set({ interviewDate: date }),

      incrementStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastActiveDate, dailyStreak } = get();
        
        if (lastActiveDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActiveDate === yesterdayStr) {
          set({ dailyStreak: dailyStreak + 1, lastActiveDate: today });
        } else {
          set({ dailyStreak: 1, lastActiveDate: today });
        }
      },

      addStudyItem: (item) => set((state) => ({
        studyItems: [
          ...state.studyItems,
          { ...item, id: crypto.randomUUID(), createdAt: new Date() }
        ]
      })),

      updateStudyItemStatus: (id, status) => set((state) => ({
        studyItems: state.studyItems.map(item =>
          item.id === id ? { ...item, status } : item
        )
      })),

      removeStudyItem: (id) => set((state) => ({
        studyItems: state.studyItems.filter(item => item.id !== id)
      })),

      updateFlashcardProgress: (questionId, confidence) => set((state) => ({
        flashcardProgress: {
          ...state.flashcardProgress,
          [questionId]: {
            questionId,
            confidence,
            lastReviewed: new Date(),
            reviewCount: (state.flashcardProgress[questionId]?.reviewCount || 0) + 1
          }
        },
        totalQuestionsAnswered: state.totalQuestionsAnswered + 1
      })),

      saveNote: (topicId, content) => set((state) => ({
        notes: { ...state.notes, [topicId]: content }
      })),

      getNote: (topicId) => get().notes[topicId] || ''
    }),
    {
      name: 'prepos-storage'
    }
  )
);
