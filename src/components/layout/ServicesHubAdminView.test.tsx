// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ServicesHubAdminView } from './ServicesHubAdminView';
import { serviceHubApi } from '../../services/serviceHubApi';

vi.mock('../../services/serviceHubApi', () => ({ serviceHubApi: { adminList: vi.fn().mockResolvedValue([]), listPlaceCategories: vi.fn().mockResolvedValue([
  { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 },
  { id: 'VINTAGE', label: 'Vintage', sortOrder: 2 },
  { id: 'SHOPPING_MALL', label: 'Trung tâm thương mại', sortOrder: 3 },
  { id: 'RED_RIVER', label: 'Gần sông Hồng', sortOrder: 4 },
  { id: 'SUNSET', label: 'Chụp hoàng hôn', sortOrder: 5 },
]), createPlaceCategory: vi.fn(), updatePlaceCategory: vi.fn(), removePlaceCategory: vi.fn(), approveCommunitySpot: vi.fn().mockResolvedValue({ success: true }), rejectCommunitySpot: vi.fn().mockResolvedValue({ success: true }), create: vi.fn().mockResolvedValue({}), update: vi.fn(), logout: vi.fn() } }));
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

it('loads, edits, and saves spot flower condition and photography guide details', async () => {
  // Existing detail fields remain independent of seasonal forecasts.
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/spots');
  const spot = {
    id: 'spot-1', category: 'spot', name: 'Hồ Tây', slug: 'ho-tay', address: 'Hà Nội', lat: 21, lng: 105,
    regionId: 'hanoi', bestMonths: [10, 11], spotStatus: 'PEAK', statusValidUntil: '2026-12-31',
    description: 'Hoa đang nở.', bestTimeDescription: 'Chiều muộn.', recommendedLenses: ['35mm'],
    conceptTags: ['HOA_CO'], placeCategories: ['CAFE', 'RED_RIVER'], bloomPercentage: 73,
  };
  vi.mocked(serviceHubApi.adminList).mockResolvedValueOnce([spot] as never);
  vi.mocked(serviceHubApi.update).mockResolvedValueOnce(spot as never);
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  await waitFor(() => expect(serviceHubApi.adminList).toHaveBeenCalled());

  fireEvent.click(screen.getByRole('button', { name: 'Sửa Hồ Tây' }));
  expect((screen.getByLabelText('Mức độ nở / hiện trạng (%)') as HTMLInputElement).value).toBe('73');
  expect((screen.getByLabelText('Mô tả tình trạng hoa / phong cảnh') as HTMLTextAreaElement).value).toBe('Hoa đang nở.');
  expect((screen.getByLabelText('Khung giờ đẹp (mô tả)') as HTMLTextAreaElement).value).toBe('Chiều muộn.');
  expect((screen.getByLabelText('Ống kính khuyên dùng') as HTMLTextAreaElement).value).toBe('35mm');
  expect((screen.getByLabelText('Concept: Hoa Cỏ & Mùa Nở') as HTMLInputElement).checked).toBe(true);
  expect((screen.getByLabelText('Nhóm địa điểm: Quán cà phê') as HTMLInputElement).checked).toBe(true);

  fireEvent.change(screen.getByLabelText('Phí gửi xe'), { target: { value: '10.000đ' } });
  fireEvent.change(screen.getByLabelText('Mức độ nở / hiện trạng (%)'), { target: { value: '61' } });
  fireEvent.change(screen.getByLabelText('Mô tả tình trạng hoa / phong cảnh'), { target: { value: 'Nở rộ trong tháng này.' } });
  fireEvent.change(screen.getByLabelText('Khung giờ đẹp (mô tả)'), { target: { value: 'Sáng sớm.' } });
  fireEvent.change(screen.getByLabelText('Ống kính khuyên dùng'), { target: { value: '50mm, 85mm' } });
  fireEvent.click(screen.getByLabelText('Concept: Hoa Cỏ & Mùa Nở'));
  fireEvent.click(screen.getByLabelText('Concept: Đường Phố Sống Động'));
  fireEvent.click(screen.getByLabelText('Nhóm địa điểm: Quán cà phê'));
  fireEvent.click(screen.getByLabelText('Nhóm địa điểm: Chụp hoàng hôn'));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

  await waitFor(() => expect(serviceHubApi.update).toHaveBeenCalledWith(expect.objectContaining({
    id: 'spot-1', bloomPercentage: 61, parkingFee: '10.000đ', description: 'Nở rộ trong tháng này.',
    bestTimeDescription: 'Sáng sớm.', recommendedLenses: ['50mm', '85mm'], conceptTags: ['STREET'], placeCategories: ['RED_RIVER', 'SUNSET'],
  })));
});

it('hydrates and edits a seasonal candidate without turning it into a verified peak', async () => {
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/spots');
  const spot = { id: 'candidate', category: 'spot' as const, name: 'Mùa tương lai', slug: 'mua-tuong-lai', address: 'Hà Nội', lat: 21, lng: 105, spotStatus: 'ACTIVE' as const, upcoming: true, expectedMonths: [11, 12] };
  vi.mocked(serviceHubApi.adminList).mockResolvedValueOnce([spot]);
  vi.mocked(serviceHubApi.update).mockResolvedValueOnce(spot);
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Sửa Mùa tương lai' }));
  expect((screen.getByLabelText('Có thể hot mùa tới (? pin)') as HTMLInputElement).checked).toBe(true);
  expect((screen.getByLabelText('Tháng dự kiến: 11') as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByLabelText('Tháng dự kiến: 1'));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
  await waitFor(() => expect(serviceHubApi.update).toHaveBeenCalledWith(expect.objectContaining({ upcoming: true, expectedMonths: [11, 12, 1], spotStatus: 'ACTIVE' })));
});

it('opens category configuration from the authenticated admin screen', async () => {
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/spots');
  vi.mocked(serviceHubApi.adminList).mockResolvedValueOnce([]);
  vi.mocked(serviceHubApi.listPlaceCategories).mockResolvedValueOnce([{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]);
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  await waitFor(() => expect(serviceHubApi.adminList).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Quản lý nhóm địa điểm' }));
  expect(await screen.findByRole('heading', { name: 'Quản lý nhóm địa điểm' })).toBeTruthy();
});

it('notifies the admin about community submissions and publishes only after approval', async () => {
  sessionStorage.setItem('service_admin_token', 'test-only');
  window.history.replaceState({}, '', '/admin/spots');
  const pending = { id: '12345678-1234-1234-1234-123456789abc', category: 'spot' as const, name: 'Vườn hoa cộng đồng', slug: 'community-12345678', address: 'Hà Nội', lat: 21, lng: 105, description: 'Hoa đang nở', placeCategories: ['CAFE'], isActive: false };
  vi.mocked(serviceHubApi.adminList).mockResolvedValueOnce([pending]).mockResolvedValueOnce([]);
  render(<ServicesHubAdminView onBack={vi.fn()} />);
  expect(await screen.findByRole('button', { name: '1 địa điểm chờ duyệt' })).toBeTruthy();
  expect(await screen.findByRole('region', { name: 'Địa điểm cộng đồng chờ duyệt' })).toBeTruthy();
  expect(screen.getByText(/1 địa điểm.*chờ bạn duyệt/i)).toBeTruthy();
  expect(screen.getByText('Vườn hoa cộng đồng')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Duyệt và xuất bản Vườn hoa cộng đồng' }));
  await waitFor(() => expect(serviceHubApi.approveCommunitySpot).toHaveBeenCalledWith(pending.id));
  await waitFor(() => expect(screen.queryByRole('region', { name: 'Địa điểm cộng đồng chờ duyệt' })).toBeNull());
});
