// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MobileViewMenuItems } from './MobileViewMenuItems';

afterEach(cleanup);

it('shows Dịch vụ in the mobile view menu and selects the services view', () => {
  const onChangeView = vi.fn();
  const onClose = vi.fn();

  render(<MobileViewMenuItems activeView="map" onChangeView={onChangeView} onClose={onClose} />);

  expect(screen.getByRole('button', { name: 'Bản đồ' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Tạp chí' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Màu Film' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Dịch vụ' }));

  expect(onChangeView).toHaveBeenCalledWith('services');
  expect(onClose).toHaveBeenCalledOnce();
});
