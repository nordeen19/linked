import { useState, useEffect, useCallback } from 'react';
import StatusBar from './components/StatusBar';
import AppBar from './components/AppBar';
import BottomNav from './components/BottomNav';
import DailyGameScreen from './components/DailyGameScreen';
import TravelerGameScreen from './components/TravelerGameScreen';
import TopicPicker from './components/TopicPicker';
import CompletionScreen from './components/CompletionScreen';
import ResultsScreen from './components/ResultsScreen';
import { useGameState } from './hooks/useGameState';
import { useStreak } from './hooks/useStreak';
import { useHaptics } from './hooks/useHaptics';
import {
  getFeaturedArticle,
  getArticleLinks,
  getLeadSectionLinks,
  getArticleSummary,
  getRandomArticles,
  getArticleSections,
  getSectionWikitext,
  findLinkLocation,
  normalizeTitle,
} from './hooks/useWikipediaApi';
import { getValidCandidates } from './utils/articleFilter';
import { calculateDailyScore } from './utils/scoring';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildDailyCards(featuredArticle) {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `dailyCards-${today}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Re-hydrate firstParaLinks Set
      parsed.firstParaLinks = new Set(parsed.firstParaLinksArr);
      return parsed;
    } catch {}
  }

  const [allLinks, firstParaLinksSet] = await Promise.all([
    getArticleLinks(featuredArticle.title),
    getLeadSectionLinks(featuredArticle.title),
  ]);

  const validLinked = getValidCandidates(allLinks, featuredArticle.title, firstParaLinksSet);
  const linkedSample = shuffle(validLinked).slice(0, 6);

  // Find link locations for "related" cards
  const linkedWithLocation = await Promise.all(
    linkedSample.map(async (link) => {
      const location = await findLinkLocation(featuredArticle.title, link.title);
      return { ...link, linkLocation: location };
    })
  );

  // Random "not related" decoys
  const randoms = await getRandomArticles(15);
  const linkedTitleSet = new Set(allLinks.map(l => normalizeTitle(l.title)));
  const decoys = randoms
    .filter(r => !linkedTitleSet.has(normalizeTitle(r.title)))
    .slice(0, 4);

  // Fetch summaries in parallel
  const allCandidates = [
    ...linkedWithLocation.map(l => ({ ...l, isRelated: true })),
    ...decoys.map(d => ({ ...d, isRelated: false, linkLocation: null })),
  ];

  const withSummaries = await Promise.all(
    allCandidates.map(async (c) => {
      try {
        const s = await getArticleSummary(c.title);
        return { ...c, title: s.title, description: s.description, extract: s.extract, thumbnail: s.thumbnail };
      } catch {
        return c;
      }
    })
  );

  const cards = shuffle(withSummaries);
  const allLinksCache = { [featuredArticle.title]: allLinks };
  const firstParaLinksCache = { [featuredArticle.title]: firstParaLinksSet };

  const result = {
    cards,
    firstParaLinks: firstParaLinksSet,
    firstParaLinksArr: [...firstParaLinksSet],
    allLinksCache,
    firstParaLinksCache,
  };

  try {
    const toCache = { ...result, firstParaLinksCache: { [featuredArticle.title]: [...firstParaLinksSet] } };
    sessionStorage.setItem(cacheKey, JSON.stringify(toCache));
  } catch {}

  return result;
}

async function buildTravelerCards(rootArticle) {
  const [allLinks, firstParaLinksSet] = await Promise.all([
    getArticleLinks(rootArticle.title),
    getLeadSectionLinks(rootArticle.title),
  ]);

  const validLinked = getValidCandidates(allLinks, rootArticle.title, firstParaLinksSet);
  const linkedSample = shuffle(validLinked).slice(0, 8);

  // Get link locations for valid linked cards
  const linkedWithLocation = await Promise.all(
    linkedSample.map(async (link) => {
      const location = await findLinkLocation(rootArticle.title, link.title);
      return { ...link, linkLocation: location, isRelated: true };
    })
  );

  // Decoys: random articles not in link list
  const randoms = await getRandomArticles(10);
  const linkedTitleSet = new Set(allLinks.map(l => normalizeTitle(l.title)));
  const decoys = randoms
    .filter(r => !linkedTitleSet.has(normalizeTitle(r.title)))
    .slice(0, 4)
    .map(d => ({ ...d, isRelated: false, linkLocation: null }));

  const allCandidates = [...linkedWithLocation, ...decoys];

  const withSummaries = await Promise.all(
    allCandidates.map(async (c) => {
      try {
        const s = await getArticleSummary(c.title);
        return { ...c, title: s.title, description: s.description, extract: s.extract, thumbnail: s.thumbnail };
      } catch {
        return c;
      }
    })
  );

  // Filter out cards with no useful content
  const filtered = withSummaries.filter(c => c.description?.length > 10 || c.thumbnail);
  const cards = shuffle(filtered);

  return {
    cards,
    firstParaLinks: firstParaLinksSet,
    allLinksCache: { [rootArticle.title]: allLinks },
    firstParaLinksCache: { [rootArticle.title]: firstParaLinksSet },
  };
}

export default function App() {
  const [tab, setTab] = useState('daily');
  const [showResults, setShowResults] = useState(false);
  const { state, setMode, setPhase, loadDaily, loadTraveler, recordDecision, travelerAdvance, nextCard, setError } = useGameState();
  const { streak, incrementStreak } = useStreak();
  const haptics = useHaptics();

  // Load daily challenge on mount / tab switch
  useEffect(() => {
    if (tab !== 'daily') return;
    if (state.mode === 'daily' && state.phase !== 'loading') return;
    setMode('daily');
    initDaily();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function initDaily() {
    setPhase('loading');
    try {
      const featured = await getFeaturedArticle();
      const { cards, firstParaLinks, allLinksCache, firstParaLinksCache } = await buildDailyCards(featured);
      loadDaily({ featuredArticle: featured, cards, firstParaLinks, allLinksCache, firstParaLinksCache });
    } catch (e) {
      setError(e.message || 'Failed to load today\'s challenge.');
    }
  }


  function handleTabChange(newTab) {
    setTab(newTab);
    setShowResults(false);
    if (newTab === 'daily' && (state.mode !== 'daily' || state.phase === 'loading')) {
      setMode('daily');
      initDaily();
    } else if (newTab === 'traveler' && state.mode !== 'traveler') {
      setMode('traveler');
    }
  }

  async function handleTravelerSelect(article) {
    setPhase('loading');
    try {
      const data = await buildTravelerCards(article);
      loadTraveler({
        rootArticle: article,
        cards: data.cards,
        firstParaLinks: data.firstParaLinks,
        allLinksCache: data.allLinksCache,
        firstParaLinksCache: data.firstParaLinksCache,
      });
    } catch (e) {
      setError(e.message || 'Failed to load article.');
    }
  }

  function handleDailySwipe(dir, card) {
    if (!card) return;
    const userSaysRelated = dir === 'right';
    const correct = userSaysRelated === card.isRelated;

    if (correct) haptics.correctSwipe();
    else haptics.wrongSwipe();

    let pts = 0;
    if (correct) pts = card.isRelated ? 100 : 75;

    const feedbackSnippet = card.isRelated
      ? correct
        ? `"${card.title}" is linked within "${state.featuredArticle?.title}".`
        : `Actually, "${card.title}" is linked within "${state.featuredArticle?.title}".`
      : correct
        ? `"${card.title}" is not directly linked within "${state.featuredArticle?.title}".`
        : `"${card.title}" is not directly linked within "${state.featuredArticle?.title}", but you thought it was.`;

    recordDecision({
      cardTitle: card.title,
      userChoice: userSaysRelated ? 'related' : 'not-related',
      correct,
      isRelated: card.isRelated,
      linkLocation: card.linkLocation,
      feedbackSnippet,
      pointsAwarded: pts,
    });
  }

  function handleDailyNextCard() {
    const nextIdx = state.currentIndex + 1;
    const isComplete = nextIdx >= Math.min(state.cards.length, 10);
    if (isComplete) {
      incrementStreak();
      nextCard();
    } else {
      nextCard();
    }
  }

  async function handleTravelerSwipe(dir, card) {
    if (!card) return;
    const userSaysLinked = dir === 'right';
    const correct = userSaysLinked === card.isRelated;

    let pts = 0;
    let feedbackSnippet = '';

    if (correct && card.isRelated) {
      haptics.pathNodeComplete();
      pts = 100;
      feedbackSnippet = `"${card.title}" is linked within "${state.rootArticle?.title}". You advance!`;
    } else if (correct && !card.isRelated) {
      haptics.correctSwipe();
      pts = 10;
      feedbackSnippet = `Correct — "${card.title}" is not linked within "${state.rootArticle?.title}".`;
    } else {
      haptics.wrongSwipe();
      pts = -5;
      feedbackSnippet = card.isRelated
        ? `"${card.title}" is actually linked in "${state.rootArticle?.title}". Try again on the next card.`
        : `"${card.title}" is not linked within "${state.rootArticle?.title}".`;
    }

    recordDecision({
      cardTitle: card.title,
      userChoice: userSaysLinked ? 'related' : 'not-related',
      correct,
      isRelated: card.isRelated,
      linkLocation: card.linkLocation,
      feedbackSnippet,
      pointsAwarded: pts,
    });
  }

  async function handleTravelerNextCard() {
    const { decisions, cards, currentIndex, path, rootArticle } = state;
    const lastDecision = decisions[decisions.length - 1];

    if (lastDecision?.correct && lastDecision?.isRelated) {
      // Advance to the next article
      const nextRoot = cards.find(c => c.title === lastDecision.cardTitle);
      const newPath = [...path, rootArticle];

      if (newPath.length >= 5) {
        haptics.pathComplete();
        // Mark complete
        nextCard();
        return;
      }

      // Load next article's cards
      try {
        const data = await buildTravelerCards(nextRoot);
        travelerAdvance({
          newCard: nextRoot,
          newCards: data.cards,
          firstParaLinks: data.firstParaLinks,
          allLinksCache: data.allLinksCache,
          firstParaLinksCache: data.firstParaLinksCache,
        });
      } catch {
        nextCard();
      }
    } else {
      nextCard();
    }
  }

  const { mode, phase } = state;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <StatusBar />
      <AppBar streak={streak} title={tab === 'daily' ? 'Daily Challenge' : 'Traveler'} />

      {showResults ? (
        <ResultsScreen state={state} onBack={() => setShowResults(false)} />
      ) : phase === 'complete' ? (
        <CompletionScreen
          mode={mode}
          score={state.score}
          decisions={state.decisions}
          streak={streak}
          featuredArticle={state.featuredArticle}
          path={[...(state.path || []), ...(state.rootArticle ? [state.rootArticle] : [])]}
          onResults={() => setShowResults(true)}
          onReset={() => { setMode('traveler'); }}
          onSwitchMode={() => handleTabChange('traveler')}
        />
      ) : tab === 'daily' ? (
        <DailyGameScreen
          state={{ ...state, mode: 'daily' }}
          onSwipe={handleDailySwipe}
          onNextCard={handleDailyNextCard}
        />
      ) : (
        // Traveler tab
        mode === 'traveler' && (phase === 'playing' || phase === 'feedback' || phase === 'error') ? (
          <TravelerGameScreen
            state={{ ...state, mode: 'traveler' }}
            onSwipe={handleTravelerSwipe}
            onNextCard={handleTravelerNextCard}
          />
        ) : (
          <TopicPicker onSelect={handleTravelerSelect} />
        )
      )}

      <BottomNav activeTab={tab} onTabChange={handleTabChange} />
    </div>
  );
}
