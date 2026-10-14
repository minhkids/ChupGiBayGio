// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ServicesHubAdminView } from './ServicesHubAdminView';
import { serviceHubApi } from '../../services/serviceHubApi';
const spots = [
  { id: 'a', category: 'spot' as const, name: 'Cafe A', placeCategories: ['CAFE', 'SUNSET'] },
  { id: 'b', category: 'spot' as const, name: 'Cafe B', placeCategories: ['CAFE'] },
  { id: 'c', category: 'spot' as const, name: 'Chưa gán', placeCategories: [] },
];
vi.mock('../../services/serviceHubApi', () => ({ serviceHubApi: {
  adminList: vi.fn(), listPlaceCategories: vi.fn(), update: vi.fn(), create: vi.fn(), logout: vi.fn(),
  createPlaceCategory: vi.fn(), updatePlaceCategory: vi.fn(), removePlaceCategory: vi.fn(),
} }));
vi.mock('./BulkImportPanel', () => ({ BulkImportPanel: () => null }));
vi.mock('./LeafletCoordinatePicker', () => ({ LeafletCoordinatePicker: () => null }));
afterEach(() => { cleanup(); vi.resetAllMocks(); sessionStorage.clear(); });
const setup = async () => {
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/spots');
  vi.mocked(serviceHubApi.adminList).mockResolvedValue(spots);
  vi.mocked(serviceHubApi.listPlaceCategories).mockResolvedValue([
    { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }, { id: 'SUNSET', label: 'Hoàng hôn', sortOrder: 2 },
  ]);
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  await screen.findByRole('button', { name: 'Sửa Cafe A' });
};
it('manages categories inline without hiding assigned spots or the spot editor', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Quản lý nhóm địa điểm' }));
  expect(screen.getByRole('button', { name: 'Sửa Cafe A' })).toBeTruthy();
  vi.mocked(serviceHubApi.createPlaceCategory).mockResolvedValue({ id: 'NEW', label: 'Nhóm mới', sortOrder: 3 });
  fireEvent.change(screen.getByLabelText('Tên nhóm mới'), { target: { value: 'Nhóm mới' } });
  fireEvent.click(screen.getByRole('button', { name: 'Thêm nhóm' }));
  await screen.findByRole('button', { name: 'Nhóm mới (0)' });
  fireEvent.click(screen.getByRole('button', { name: 'Nhóm mới (0)' }));
  vi.mocked(serviceHubApi.updatePlaceCategory).mockResolvedValue({ id: 'NEW', label: 'Đã đổi tên', sortOrder: 3 });
  fireEvent.change(screen.getByLabelText('Tên nhóm Nhóm mới'), { target: { value: 'Đã đổi tên' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu Nhóm mới' }));
  expect((await screen.findByRole('button', { name: 'Đã đổi tên (0)' })).getAttribute('aria-pressed')).toBe('true');
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.mocked(serviceHubApi.removePlaceCategory).mockResolvedValue({ success: true });
  fireEvent.click(screen.getByRole('button', { name: 'Xóa Đã đổi tên' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Đã đổi tên (0)' })).toBeNull());
  expect(screen.getByRole('button', { name: 'Tất cả (3)' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button', { name: 'Sửa Cafe A' })).toBeTruthy();
  confirm.mockRestore();
});

it('filters canonical spots with unique All, category and Unassigned counts and opens the existing multi-category editor', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Hoàng hôn (1)' }));
  expect(screen.queryByRole('button', { name: 'Sửa Cafe B' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Sửa Cafe A' }));
  expect((screen.getByLabelText('Tên hiển thị *') as HTMLInputElement).value).toBe('Cafe A');
  expect((screen.getByLabelText('Nhóm địa điểm: Quán cà phê') as HTMLInputElement).checked).toBe(true);
  expect((screen.getByLabelText('Nhóm địa điểm: Hoàng hôn') as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Chưa phân nhóm (1)' }));
  expect(screen.getByRole('button', { name: 'Sửa Chưa gán' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Sửa Cafe A' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Tất cả (3)' }));
  expect(screen.getAllByRole('button', { name: /^Sửa / })).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Quán cà phê (2)' }));
  fireEvent.click(screen.getByLabelText('Nhóm địa điểm: Quán cà phê'));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
  await waitFor(() => expect(serviceHubApi.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'a', placeCategories: ['SUNSET'] })));
});
