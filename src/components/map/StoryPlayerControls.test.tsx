// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StoryPlayerControls } from './StoryPlayerControls';

afterEach(cleanup);

it('exposes replay, vertical-frame, export and close actions', () => {
  const onReplay = vi.fn();
  const onToggleVertical = vi.fn();
  const onExport = vi.fn();
  const onClose = vi.fn();
  render(<StoryPlayerControls status="arrived" progress={1} isVertical={false} onReplay={onReplay} onToggleVertical={onToggleVertical} onExport={onExport} onClose={onClose} exporting={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Phát lại' }));
  fireEvent.click(screen.getByRole('button', { name: 'Tỷ lệ: Dọc 9:16' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xuất Video Story' }));
  fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
  expect(onReplay).toHaveBeenCalledOnce();
  expect(onToggleVertical).toHaveBeenCalledOnce();
  expect(onExport).toHaveBeenCalledOnce();
  expect(onClose).toHaveBeenCalledOnce();
});

it('prevents duplicate exports and reports the current route progress', () => {
  render(<StoryPlayerControls status="playing" progress={0.45} isVertical exporting onReplay={vi.fn()} onToggleVertical={vi.fn()} onExport={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByText('45%')).toBeTruthy();
  expect(screen.getByTestId('player-bike-motion')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Đang xuất video…' }) as HTMLButtonElement).disabled).toBe(true);
});