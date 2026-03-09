import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FeedCard, Affinity } from '../types';
import { AFFINITIES } from '../config';
import { generateCard } from '../api';
import FeedCardComponent from './FeedCard';
import './Feed.css';

interface Props {
  affinities: Affinity[];
  onReset: () => void;
}

interface StreamingState {
  id: string;
  affinity: Affinity;
  text: string;
}

export default function Feed({ affinities, onReset }: Props) {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [streaming, setStreaming] = useState<StreamingState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Affinity | 'all'>('all');
  const [affinityIndex, setAffinityIndex] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const nextAffinity = useCallback((): Affinity => {
    const filtered =
      activeFilter === 'all'
        ? affinities
        : affinities.filter((a) => a === activeFilter);
    const idx = affinityIndex % filtered.length;
    setAffinityIndex((i) => i + 1);
    return filtered[idx];
  }, [affinities, activeFilter, affinityIndex]);

  const loadCard = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    const affinity = nextAffinity();
    const tempId = `streaming-${Date.now()}`;

    setStreaming({ id: tempId, affinity, text: '' });

    try {
      const card = await generateCard(affinity, (partial) => {
        setStreaming((prev) => (prev ? { ...prev, text: partial } : null));
      });

      setCards((prev) => [...prev, card]);
      setStreaming(null);
    } catch (err) {
      console.error('Error generating card:', err);
      setStreaming(null);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [nextAffinity]);

  // Initial load
  useEffect(() => {
    loadCard();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          loadCard();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadCard]);

  const filteredCards =
    activeFilter === 'all'
      ? cards
      : cards.filter((c) => c.affinity === activeFilter);

  return (
    <div className="feed-container">
      <nav className="feed-nav">
        <div className="nav-inner">
          <div className="nav-left">
            <span className="nav-logo">✦ FluxSavoir</span>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Tout
            </button>
            {affinities.map((id) => {
              const cfg = AFFINITIES.find((a) => a.id === id)!;
              return (
                <button
                  key={id}
                  className={`filter-tab ${activeFilter === id ? 'active' : ''}`}
                  style={
                    activeFilter === id
                      ? ({ '--tab-color': cfg.color } as React.CSSProperties)
                      : {}
                  }
                  onClick={() => setActiveFilter(id)}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              );
            })}
          </div>

          <button className="nav-reset" onClick={onReset} title="Changer mes intérêts">
            ⚙
          </button>
        </div>
      </nav>

      <main className="feed-main">
        <div className="cards-stack">
          {filteredCards.map((card) => (
            <FeedCardComponent key={card.id} card={card} />
          ))}

          {streaming && (
            <FeedCardComponent
              key={streaming.id}
              card={{
                id: streaming.id,
                affinity: streaming.affinity,
                title: '',
                content: '',
                keyPoints: [],
                movies: [],
                readTime: 0,
              }}
              isStreaming
              streamingText={streaming.text}
            />
          )}

          <div ref={sentinelRef} className="sentinel" />

          {!streaming && !isLoading && (
            <button className="load-more-btn" onClick={loadCard}>
              Charger plus de contenu
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
