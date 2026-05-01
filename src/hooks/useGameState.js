import { useReducer, useCallback } from 'react';

const initialState = {
  mode: 'daily',
  phase: 'loading',
  cards: [],
  currentIndex: 0,
  score: 0,
  decisions: [],
  firstParaLinks: new Set(),
  featuredArticle: null,
  path: [],
  rootArticle: null,
  wrongSwipes: 0,
  lastDecisionCorrect: null,
  feedbackSnippet: '',
  pointsAwarded: 0,
  sectionExcerpts: {},
  suggestedConnections: [],
  allLinksCache: {},
  firstParaLinksCache: {},
  startTime: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...initialState, mode: action.mode, phase: 'loading' };

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'LOAD_DAILY': {
      const { featuredArticle, cards, firstParaLinks, allLinksCache, firstParaLinksCache } = action;
      return {
        ...state,
        featuredArticle,
        cards,
        firstParaLinks,
        allLinksCache,
        firstParaLinksCache,
        phase: 'playing',
        currentIndex: 0,
        score: 0,
        decisions: [],
        wrongSwipes: 0,
        startTime: Date.now(),
        error: null,
      };
    }

    case 'LOAD_TRAVELER': {
      const { rootArticle, cards, firstParaLinks, allLinksCache, firstParaLinksCache } = action;
      return {
        ...state,
        rootArticle,
        cards,
        firstParaLinks,
        allLinksCache: { ...state.allLinksCache, ...allLinksCache },
        firstParaLinksCache: { ...state.firstParaLinksCache, ...firstParaLinksCache },
        phase: 'playing',
        currentIndex: 0,
        score: 0,
        decisions: [],
        path: [],
        wrongSwipes: 0,
        startTime: Date.now(),
        error: null,
      };
    }

    case 'RECORD_DECISION': {
      const { decision } = action;
      const newDecisions = [...state.decisions, decision];
      const newScore = state.score + (decision.pointsAwarded || 0);
      const newWrong = state.wrongSwipes + (decision.correct ? 0 : 1);
      return {
        ...state,
        decisions: newDecisions,
        score: newScore,
        wrongSwipes: newWrong,
        lastDecisionCorrect: decision.correct,
        feedbackSnippet: decision.feedbackSnippet || '',
        pointsAwarded: decision.pointsAwarded || 0,
        phase: 'feedback',
      };
    }

    case 'TRAVELER_ADVANCE': {
      const { newCard, newCards, firstParaLinks, allLinksCache, firstParaLinksCache } = action;
      return {
        ...state,
        path: [...state.path, newCard],
        rootArticle: newCard,
        cards: newCards,
        firstParaLinks,
        allLinksCache: { ...state.allLinksCache, ...allLinksCache },
        firstParaLinksCache: { ...state.firstParaLinksCache, ...firstParaLinksCache },
        currentIndex: 0,
        phase: state.path.length + 1 >= 5 ? 'complete' : 'playing',
      };
    }

    case 'NEXT_CARD': {
      const nextIndex = state.currentIndex + 1;
      const isComplete = nextIndex >= state.cards.length || (state.mode === 'daily' && nextIndex >= 10);
      return {
        ...state,
        currentIndex: nextIndex,
        phase: isComplete ? 'complete' : 'playing',
      };
    }

    case 'SET_SECTION_EXCERPTS':
      return { ...state, sectionExcerpts: { ...state.sectionExcerpts, ...action.excerpts } };

    case 'SET_SUGGESTIONS':
      return { ...state, suggestedConnections: action.suggestions };

    case 'SET_ERROR':
      return { ...state, error: action.error, phase: 'error' };

    case 'RESET':
      return { ...initialState, mode: state.mode };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMode = useCallback((mode) => dispatch({ type: 'SET_MODE', mode }), []);
  const setPhase = useCallback((phase) => dispatch({ type: 'SET_PHASE', phase }), []);
  const loadDaily = useCallback((payload) => dispatch({ type: 'LOAD_DAILY', ...payload }), []);
  const loadTraveler = useCallback((payload) => dispatch({ type: 'LOAD_TRAVELER', ...payload }), []);
  const recordDecision = useCallback((decision) => dispatch({ type: 'RECORD_DECISION', decision }), []);
  const travelerAdvance = useCallback((payload) => dispatch({ type: 'TRAVELER_ADVANCE', ...payload }), []);
  const nextCard = useCallback(() => dispatch({ type: 'NEXT_CARD' }), []);
  const setSectionExcerpts = useCallback((excerpts) => dispatch({ type: 'SET_SECTION_EXCERPTS', excerpts }), []);
  const setSuggestions = useCallback((suggestions) => dispatch({ type: 'SET_SUGGESTIONS', suggestions }), []);
  const setError = useCallback((error) => dispatch({ type: 'SET_ERROR', error }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    setMode, setPhase, loadDaily, loadTraveler, recordDecision,
    travelerAdvance, nextCard, setSectionExcerpts, setSuggestions,
    setError, reset,
  };
}
