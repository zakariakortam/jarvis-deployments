import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

      // Progress tracking
      progress: {
        circuitTopology: 0,
        transferFunctions: 0,
        bodePlots: 0,
        secondOrderSystems: 0,
        capacitiveLoad: 0,
        practiceProblems: 0,
      },
      updateProgress: (category, value) =>
        set(state => ({
          progress: { ...state.progress, [category]: value },
        })),

      // Quiz scores
      quizScores: [],
      addQuizScore: score =>
        set(state => ({
          quizScores: [...state.quizScores, { ...score, date: new Date().toISOString() }],
        })),

      // Bookmarks
      bookmarks: [],
      addBookmark: item =>
        set(state => ({
          bookmarks: [...state.bookmarks, { ...item, id: Date.now() }],
        })),
      removeBookmark: id =>
        set(state => ({
          bookmarks: state.bookmarks.filter(b => b.id !== id),
        })),

      // Study session
      studyTime: 0,
      incrementStudyTime: minutes =>
        set(state => ({
          studyTime: state.studyTime + minutes,
        })),

      // Current topic
      currentTopic: null,
      setCurrentTopic: topic => set({ currentTopic: topic }),

      // Practice problem state
      problemsCompleted: [],
      addCompletedProblem: problemId =>
        set(state => ({
          problemsCompleted: [...new Set([...state.problemsCompleted, problemId])],
        })),

      // Reset all data
      resetAll: () =>
        set({
          progress: {
            circuitTopology: 0,
            transferFunctions: 0,
            bodePlots: 0,
            secondOrderSystems: 0,
            capacitiveLoad: 0,
            practiceProblems: 0,
          },
          quizScores: [],
          bookmarks: [],
          studyTime: 0,
          problemsCompleted: [],
        }),
    }),
    {
      name: 'ece-100-study-guide',
      version: 1,
    }
  )
)

export default useStore
