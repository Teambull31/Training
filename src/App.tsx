import { useState } from 'react';
import type { Affinity } from './types';
import AffinitySelector from './components/AffinitySelector';
import Feed from './components/Feed';

type Screen = 'onboarding' | 'feed';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [affinities, setAffinities] = useState<Affinity[]>([]);

  if (screen === 'onboarding') {
    return (
      <AffinitySelector
        selected={affinities}
        onChange={setAffinities}
        onStart={() => setScreen('feed')}
      />
    );
  }

  return (
    <Feed
      affinities={affinities}
      onReset={() => setScreen('onboarding')}
    />
  );
}
