// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { cyclingBikeArtwork } from './cyclingBikeArtwork';

it('renders independent vintage vector layers and unique paint IDs across icons', () => {
  const host = document.createElement('div');
  host.innerHTML = cyclingBikeArtwork() + cyclingBikeArtwork();
  const ids = [...host.querySelectorAll('[id]')].map(node => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const bike of host.querySelectorAll('[data-cycling-bike]')) {
    for (const name of ['wheel-front', 'wheel-back', 'pedal-crank', 'bike-frame']) expect(bike.querySelectorAll(`g[data-part="${name}"]`)).toHaveLength(1);
    expect(bike.querySelectorAll('circle[stroke="#FAF8F4"]')).toHaveLength(2);
    expect(bike.querySelectorAll('g[stroke="#8C4A1F"]')).toHaveLength(2);
    expect(bike.querySelector('[data-part="bike-frame"] [data-part="wheel-front"]')).toBeNull();
    expect(bike.querySelectorAll('[data-dust]')).toHaveLength(3);
    const pose = bike.querySelector('[data-part="frame-pose"]');
    expect(pose?.querySelector('[data-part="bike-frame"]')).not.toBeNull();
    expect(pose?.querySelector('[data-part="wheel-front"]')).toBeNull();
    expect(bike.querySelector('[data-part="basket-sway"] .cycling-story-flower')).not.toBeNull();
    expect(bike.querySelector('[data-cycling-bike]')).toBeNull();
    expect(bike.getAttribute('data-motion')).toBe('launch');
    for (const paint of bike.querySelectorAll('[stroke^="url"], [fill^="url"]')) {
      const value = paint.getAttribute('fill')?.startsWith('url') ? paint.getAttribute('fill')! : paint.getAttribute('stroke')!;
      expect(ids).toContain(value.slice(5, -1));
    }
  }
});