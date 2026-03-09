import Anthropic from '@anthropic-ai/sdk';
import type { Affinity, FeedCard, Movie } from './types';
import { TOPICS } from './config';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const usedTopics: Record<Affinity, Set<number>> = {
  code: new Set(),
  musculation: new Set(),
  psychologie: new Set(),
  finances: new Set(),
};

function pickTopic(affinity: Affinity): string {
  const topics = TOPICS[affinity];
  const used = usedTopics[affinity];

  if (used.size >= topics.length) {
    used.clear();
  }

  let idx: number;
  do {
    idx = Math.floor(Math.random() * topics.length);
  } while (used.has(idx));

  used.add(idx);
  return topics[idx];
}

export async function generateCard(
  affinity: Affinity,
  onStream: (partial: string) => void,
): Promise<FeedCard> {
  const topic = pickTopic(affinity);

  const systemPrompt = `Tu es un expert en synthèse de contenu de haute qualité.
Tu dois produire des synthèses profondes, riches et détaillées sur des sujets spécialisés.
Ton style est clair, engageant, précis et dense en informations.
Tu évites les généralités superficielles et vas toujours dans la profondeur.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, juste du JSON pur.`;

  const userPrompt = `Génère une synthèse complète et approfondie sur : "${topic}"

Domaine : ${affinity}

Retourne un JSON avec exactement cette structure (SANS backticks, SANS markdown, juste du JSON) :
{
  "title": "Titre accrocheur et précis (max 80 chars)",
  "content": "Synthèse détaillée de 600 à 900 mots minimum. Couvre les mécanismes profonds, les études scientifiques ou données concrètes, les nuances importantes, les applications pratiques, et les perspectives moins connues. Évite les clichés. Sois dense et informatif. Utilise des paragraphes structurés avec des transitions.",
  "keyPoints": [
    "Point clé 1 : explication concise mais complète",
    "Point clé 2 : explication concise mais complète",
    "Point clé 3 : explication concise mais complète",
    "Point clé 4 : explication concise mais complète",
    "Point clé 5 : explication concise mais complète"
  ],
  "movies": [
    {
      "title": "Titre du film",
      "year": 2020,
      "why": "Explication précise du lien thématique avec le sujet (2-3 phrases)"
    },
    {
      "title": "Titre du film 2",
      "year": 2015,
      "why": "Explication précise du lien thématique (2-3 phrases)"
    },
    {
      "title": "Titre du film 3",
      "year": 2010,
      "why": "Explication précise du lien thématique (2-3 phrases)"
    }
  ],
  "readTime": 8
}`;

  let fullText = '';

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullText += event.delta.text;
      onStream(fullText);
    }
  }

  const parsed = JSON.parse(fullText.trim()) as {
    title: string;
    content: string;
    keyPoints: string[];
    movies: Movie[];
    readTime: number;
  };

  return {
    id: `${affinity}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    affinity,
    title: parsed.title,
    content: parsed.content,
    keyPoints: parsed.keyPoints,
    movies: parsed.movies,
    readTime: parsed.readTime,
  };
}
