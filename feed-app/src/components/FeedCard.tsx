import React, { useState } from 'react';
import type { FeedCard as FeedCardType } from '../types';
import { AFFINITIES } from '../config';
import './FeedCard.css';

interface Props {
  card: FeedCardType;
  isStreaming?: boolean;
  streamingText?: string;
}

export default function FeedCard({ card, isStreaming, streamingText }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showMovies, setShowMovies] = useState(false);

  const config = AFFINITIES.find((a) => a.id === card.affinity)!;
  const displayContent = isStreaming ? (streamingText ?? '') : card.content;
  const isReady = !isStreaming;

  if (isStreaming && !streamingText) {
    return (
      <div className="feed-card skeleton">
        <div className="card-skeleton-bar w-20" />
        <div className="card-skeleton-bar w-60" />
        <div className="card-skeleton-bar w-80" />
        <div className="card-skeleton-bar w-40" />
        <div className="skeleton-pulse">Génération en cours…</div>
      </div>
    );
  }

  return (
    <article
      className={`feed-card ${isStreaming ? 'streaming' : 'ready'}`}
      style={{ '--accent': config.color, '--gradient': config.gradient } as React.CSSProperties}
    >
      <header className="card-header">
        <div className="card-meta">
          <span className="card-badge" style={{ background: config.gradient }}>
            {config.emoji} {config.label}
          </span>
          {isReady && (
            <span className="card-readtime">
              ⏱ {card.readTime} min de lecture
            </span>
          )}
        </div>
        <h2 className="card-title">{card.title || 'Chargement…'}</h2>
      </header>

      {isStreaming ? (
        <div className="card-streaming">
          <div className="streaming-indicator">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
          <p className="card-preview">{displayContent.slice(0, 400)}{displayContent.length > 0 && '…'}</p>
        </div>
      ) : (
        <>
          <div className={`card-content-wrap ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="card-content">
              {card.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            {!expanded && <div className="content-fade" />}
          </div>

          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲ Réduire' : '▼ Lire la synthèse complète'}
          </button>

          {card.keyPoints.length > 0 && (
            <section className="key-points">
              <h3 className="section-title">
                <span className="section-icon">🎯</span>
                Points clés
              </h3>
              <ul className="points-list">
                {card.keyPoints.map((point, i) => (
                  <li key={i} className="point-item">
                    <span className="point-num">{i + 1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {card.movies.length > 0 && (
            <section className="movies-section">
              <button
                className="movies-toggle"
                onClick={() => setShowMovies(!showMovies)}
              >
                <span>
                  <span className="section-icon">🎬</span>
                  Films sur ce sujet ({card.movies.length})
                </span>
                <span className="toggle-arrow">{showMovies ? '▲' : '▼'}</span>
              </button>

              {showMovies && (
                <div className="movies-grid">
                  {card.movies.map((movie, i) => (
                    <div key={i} className="movie-card">
                      <div className="movie-header">
                        <span className="movie-title">{movie.title}</span>
                        <span className="movie-year">{movie.year}</span>
                      </div>
                      <p className="movie-why">{movie.why}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </article>
  );
}
