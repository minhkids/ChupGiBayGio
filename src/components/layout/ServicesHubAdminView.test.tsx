// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ServicesHubAdminView } from './ServicesHubAdminView';
import { serviceHubApi } from '../../services/serviceHubApi';

vi.mock('../../services/serviceHubApi', () => ({ serviceHubApi: { adminList: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({}), update: vi.fn(), logout: vi.fn() } }));
vi.mock('./BulkImportPanel', () => ({ BulkImportPanel: () => null }));
vi.mock('./LeafletCoordinatePicker', () => ({ LeafletCoordinatePicker: () => null }));
afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); });

it('preserves typed commas and spaces in list fields, saves arrays, and clears the new draft', async () => {
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/labs');
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  await waitFor(() => expect(serviceHubApi.adminList).toHaveBeenCalled());
  fireEvent.change(screen.getByLabelText('Tên hiển thị *'), { target: { value: 'Test lab' } });
  for (const label of ['Film đang có', 'Dịch vụ', 'Hashtag / phong cách']) {
    const field = screen.getByLabelText(label) as HTMLTextAreaElement;
    for (const value of ['C41', 'C41,', 'C41, ', 'C41, Kodak 200, ']) {
      fireEvent.change(field, { target: { value } });
      expect(field.value).toBe(value);
    }
  }
  fireEvent.click(screen.getByRole('button', { name: 'Thêm mục' }));
  await waitFor(() => expect(serviceHubApi.create).toHaveBeenCalledWith(expect.objectContaining({ category: 'filmLab', filmStocks: ['C41', 'Kodak 200'], services: ['C41', 'Kodak 200'], tags: ['C41', 'Kodak 200'] })));
  await waitFor(() => expect((screen.getByLabelText('Film đang có') as HTMLTextAreaElement).value).toBe(''));
});

it('manages film shops separately from processing labs with category-specific fields', async () => {
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/labs');
  vi.mocked(serviceHubApi.adminList).mockResolvedValueOnce([
    { id: 'lab-1', category: 'filmLab', name: 'Crolab', filmStocks: ['Kodak Gold 200'] },
    { id: 'shop-1', category: 'filmShop', name: 'Tiệm Film', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 50000, maxRollPrice: 150000 },
  ]);
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  await waitFor(() => expect(serviceHubApi.adminList).toHaveBeenCalled());

  expect(screen.getByRole('button', { name: 'Lab (1)' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Mua film (1)' }));
  expect(screen.getByText('Tiệm Film')).toBeTruthy();
  expect(screen.getByText(/Kodak Gold 200 · 50\.000–150\.000đ\/cuộn/)).toBeTruthy();
  expect(screen.queryByText('Crolab')).toBeNull();
  expect(screen.getByLabelText('Cuộn film rẻ nhất')).toBeTruthy();
  expect(screen.getByLabelText('Giá cuộn rẻ nhất (VNĐ)')).toBeTruthy();
  expect(screen.queryByLabelText('Dịch vụ')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Lab (1)' }));
  expect(screen.getByText('Crolab')).toBeTruthy();
  expect(screen.queryByText('Tiệm Film')).toBeNull();
  expect(screen.getByLabelText('Dịch vụ')).toBeTruthy();
  expect(screen.queryByLabelText('Giá cuộn rẻ nhất (VNĐ)')).toBeNull();
});
