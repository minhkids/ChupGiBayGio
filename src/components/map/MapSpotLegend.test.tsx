// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MapSpotLegend } from './MapSpotLegend';

describe('MapSpotLegend', () => {
  afterEach(() => cleanup());

  it('lets users filter spots by each map-pin category', () => {
    const onSelectStatus = vi.fn();
    render(<MapSpotLegend selectedStatus="ALL" onSelectStatus={onSelectStatus} />);

    fireEvent.click(screen.getByRole('button', { name: 'Đang Rộ (Peak)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sắp Hết Mùa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quanh Năm' }));

    expect(onSelectStatus.mock.calls).toEqual([['PEAK'], ['ENDING_SOON'], ['ACTIVE']]);
    expect(screen.getByRole('button', { name: 'Đang Rộ (Peak)' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('marks the active category for assistive technology and visual feedback', () => {
    const { rerender } = render(<MapSpotLegend selectedStatus="PEAK" onSelectStatus={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Đang Rộ (Peak)' }).getAttribute('aria-pressed')).toBe('true');
    rerender(<MapSpotLegend selectedStatus="ALL" onSelectStatus={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Đang Rộ (Peak)' }).getAttribute('aria-pressed')).toBe('false');
  });
});
