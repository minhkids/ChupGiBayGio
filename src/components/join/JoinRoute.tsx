import { lazy, Suspense } from 'react';

const PartnerJoinPage = lazy(() => import('./PartnerJoinPage').then(({ PartnerJoinPage }) => ({ default: PartnerJoinPage })));

export function JoinRoute({ kind }: { kind: 'lab' | 'photographer' }) {
  return <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}><PartnerJoinPage kind={kind} /></Suspense>;
}
