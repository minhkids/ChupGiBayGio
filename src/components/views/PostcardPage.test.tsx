// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PostcardPage } from './PostcardPage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('shows generate status under the postcard preview, not in the form', () => {
  Object.defineProperty(document, 'fonts', { configurable: true, value: undefined });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  render(<PostcardPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Tạo bưu thiếp' }));

  const status = screen.getByRole('status');
  const preview = screen.getByLabelText('Xem trước bưu thiếp');
  const form = screen.getByRole('heading', { name: 'Ảnh thành bưu thiếp thủy mặc' }).closest('section');

  expect(status.textContent).toBe('Hãy chọn một tấm ảnh trước.');
  expect(preview.nextElementSibling).toBe(status);
  expect(preview.parentElement).toBe(status.parentElement);
  expect(form?.contains(status)).toBe(false);
  expect(screen.getByRole('link', { name: 'Về bản đồ' }).parentElement).toBe(form);
});
