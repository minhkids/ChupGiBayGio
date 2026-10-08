// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PartnerPhotographersForSpot } from './PartnerPhotographersForSpot';
import { matchesPartnerSpot } from './partnerSpotMatch';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('partner photographers at a photo spot', () => {
  it('matches accent and street-name variants but not unrelated spots', () => {
    expect(matchesPartnerSpot('Phố Phan Đình Phùng', ['Phan Đình Phùng'])).toBe(true);
    expect(matchesPartnerSpot('Hồ Tây', ['Phố Cổ'])).toBe(false);
  });
  it('shows published partners linked to their chosen photo spot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 'p-1', name: 'Minh Studio', phone: '0912345678', avatar_url: '', preferred_spots: '["Phan Đình Phùng"]', packages: [{ price: 600000 }] }] }));
    render(<PartnerPhotographersForSpot spotName="Phố Phan Đình Phùng" />);
    expect(await screen.findByText('Minh Studio')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Xem Minh Studio' }).getAttribute('href')).toContain('partner=p-1');
  });
});
