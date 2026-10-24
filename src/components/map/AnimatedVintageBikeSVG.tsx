import { useId } from 'react';

/** Layered 2.5D side view. Motion is applied to named groups by the story clock. */
export function AnimatedVintageBikeSVG() {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="0 0 112 100" width="112" height="100" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-frame`} x1="30" y1="35" x2="65" y2="76" gradientUnits="userSpaceOnUse"><stop stopColor="#FFCF86"/><stop offset=".38" stopColor="#E99451"/><stop offset=".7" stopColor="#C76B3C"/><stop offset="1" stopColor="#8B402A"/></linearGradient>
      <linearGradient id={`${id}-basket`} x1="76" y1="24" x2="92" y2="45" gradientUnits="userSpaceOnUse"><stop stopColor="#F3D599"/><stop offset="1" stopColor="#B78044"/></linearGradient>
    </defs>
    {([{ name: 'wheel-back', x: 27, y: 66 }, { name: 'wheel-front', x: 85, y: 61 }]).map(({ name, x, y }) => <g key={name} transform={`translate(${x} ${y}) rotate(-12) scale(.82 1)`}>
      <circle cx="5" cy="-2" r="18" fill="#DFD3BB" stroke="#8C4A1F" strokeWidth="5"/>
      <circle r="18" fill="#F5EDD8" stroke="#FAF8F4" strokeWidth="5"/>
      <circle r="14" fill="#ECE5D5" stroke="#8C4A1F" strokeWidth="1.5"/>
      <g data-part={name} className={name} stroke="#8C4A1F" strokeWidth=".8"><path d="M0-13V13M-13 0H13M-9-9 9 9M-9 9 9-9"/></g>
      <circle r="3" fill="#8C4A1F"/>
    </g>)}
    <g data-part="frame-pose"><g data-part="bike-frame" className="bike-frame">
      <path d="M15 53Q23 42 37 50M73 48Q83 36 96 44" stroke="#8A452E" strokeWidth="5"/>
      <path d="M15 51Q23 40 37 48M73 46Q83 34 96 42" stroke="#EFB578" strokeWidth="3"/>
      <path d="M30 65 44 40 57 66 30 65 73 38 57 66M73 33 88 60" stroke="#803E2B" strokeWidth="6"/>
      <path d="M27 64 41 39 54 65 27 64 70 37 54 65M70 32 85 59" stroke={`url(#${id}-frame)`} strokeWidth="5"/>
      <path d="M29 61 41 41M44 42 53 61M47 49 67 39M72 36 82 56" stroke="#FFE0A7" strokeWidth="1.4"/>
      <path d="M41 39 38 31M70 33 68 24 76 21" stroke="#D5D5C6" strokeWidth="3"/>
      <path d="m75 21 6 1" stroke="#4C4035" strokeWidth="4"/>
      <path d="m30 29 16-2 2 4-15 4-5-3Z" fill="#513B2D" stroke="#382C23" strokeWidth="1.5"/>
      <path d="m32 29 12-1" stroke="#A27B51" strokeWidth="2"/>
      <circle cx="54" cy="65" r="5" fill="#E8CF9C" stroke="#8C6944" strokeWidth="2"/>
      <g data-part="pedal-crank" className="pedal-crank"><path d="m50 59 8 12" stroke="#6B6255" strokeWidth="2"/><path d="M46 59h7M55 71h7" stroke="#3F3930" strokeWidth="3"/></g>
      <g data-part="basket-sway"><g className="cycling-story-flower"><path d="m86 29-2-11m1 8 6-5" stroke="#748653" strokeWidth="2"/><path d="M84 22q-9 0-6-6 6 0 6 6" fill="#8FA169"/><path d="M88 16c-4-4-8 1-4 3-4 3 1 7 3 3 4 3 7-2 3-4 3-3-1-6-2-2" fill="#FFF6D7" stroke="#DDA765" strokeWidth=".7"/><circle cx="87" cy="19" r="2" fill="#E5AA46"/></g>
      <g data-cycling-bike-basket="">
        <path d="m77 29 6-5 18 2-6 6Z" fill="#FFF0C9" stroke="#AF7D43" strokeWidth="1"/>
        <path d="m77 29 18 3-2 15-13-3Z" fill={`url(#${id}-basket)`} stroke="#A7753E" strokeWidth="1.2"/>
        <path d="m95 32 6-6-3 16-5 5Z" fill="#9C6939"/>
        <path d="m81 34 12 2m-11 3 10 2m-8-9 1 12m4-11-1 12" stroke="#FFF0BF" strokeWidth="1" opacity=".7"/>
        <path d="m77 29 18 3 6-6" stroke="#EED4A0" strokeWidth="2.5"/>
      </g>
    </g></g></g>
  </svg>;
}