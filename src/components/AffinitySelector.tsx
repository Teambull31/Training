import React from 'react';
import type { Affinity } from '../types';
import { AFFINITIES } from '../config';
import './AffinitySelector.css';

interface Props {
  selected: Affinity[];
  onChange: (affinities: Affinity[]) => void;
  onStart: () => void;
}

export default function AffinitySelector({ selected, onChange, onStart }: Props) {
  function toggle(id: Affinity) {
    if (selected.includes(id)) {
      onChange(selected.filter((a) => a !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="affinity-screen">
      <div className="affinity-hero">
        <div className="hero-badge">Personnalisé pour vous</div>
        <h1 className="hero-title">
          Votre flux de<br />
          <span className="hero-accent">connaissances</span>
        </h1>
        <p className="hero-subtitle">
          Choisissez vos domaines d'intérêt pour recevoir des synthèses profondes,
          des insights actionnables et des recommandations de films.
        </p>
      </div>

      <div className="affinity-grid">
        {AFFINITIES.map((a) => {
          const isSelected = selected.includes(a.id);
          return (
            <button
              key={a.id}
              className={`affinity-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggle(a.id)}
              style={{ '--card-gradient': a.gradient, '--card-color': a.color } as React.CSSProperties}
            >
              <div className="affinity-card-inner">
                <div className="affinity-emoji">{a.emoji}</div>
                <div className="affinity-info">
                  <div className="affinity-label">{a.label}</div>
                  <div className="affinity-desc">{a.description}</div>
                </div>
                <div className="affinity-check">
                  {isSelected ? '✓' : '+'}
                </div>
              </div>
              {isSelected && <div className="affinity-glow" />}
            </button>
          );
        })}
      </div>

      <div className="affinity-footer">
        <div className="selected-count">
          {selected.length === 0
            ? 'Sélectionnez au moins un domaine'
            : `${selected.length} domaine${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}`}
        </div>
        <button
          className="start-btn"
          disabled={selected.length === 0}
          onClick={onStart}
        >
          <span>Lancer mon flux</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
