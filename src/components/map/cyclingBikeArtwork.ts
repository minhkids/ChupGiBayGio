import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimatedVintageBikeSVG } from './AnimatedVintageBikeSVG';

let iconSequence = 0;
export function cyclingBikeArtwork(): string {
  const svg = renderToStaticMarkup(createElement(AnimatedVintageBikeSVG), { identifierPrefix: `story-bike-${++iconSequence}-` });
  return `<div data-cycling-bike data-riding="false" data-motion="launch" class="cycling-story-bike">
    <span data-cycling-bike-shadow class="cycling-story-bike-shadow"></span>
    <div data-cycling-bike-rotate class="cycling-story-bike-tilt">
      <span data-dust class="cycling-story-dust"></span><span data-dust class="cycling-story-dust"></span><span data-dust class="cycling-story-dust"></span>
      ${svg}
    </div>
  </div>`;
}
