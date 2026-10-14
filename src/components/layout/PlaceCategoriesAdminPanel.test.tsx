// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { serviceHubApi } from '../../services/serviceHubApi';
import { PlaceCategoriesAdminPanel } from './PlaceCategoriesAdminPanel';

vi.mock('../../services/serviceHubApi', () => ({ serviceHubApi: {
  createPlaceCategory: vi.fn(), updatePlaceCategory: vi.fn(), removePlaceCategory: vi.fn(),
} }));
const initial = [{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }];

describe('PlaceCategoriesAdminPanel', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('creates a category and keeps its server-generated stable id', async () => {
    const onCategoriesChange = vi.fn();
    vi.mocked(serviceHubApi.createPlaceCategory).mockResolvedValueOnce({ id: 'TIEM_SACH', label: 'Tiệm sách', sortOrder: 2 });
    render(<PlaceCategoriesAdminPanel categories={initial} onCategoriesChange={onCategoriesChange} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Tên nhóm mới'), { target: { value: 'Tiệm sách' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm nhóm' }));
    await waitFor(() => expect(serviceHubApi.createPlaceCategory).toHaveBeenCalledWith('Tiệm sách'));
    expect(onCategoriesChange).toHaveBeenCalledWith([...initial, { id: 'TIEM_SACH', label: 'Tiệm sách', sortOrder: 2 }]);
  });

  it('renames a category without changing its id', async () => {
    const onCategoriesChange = vi.fn();
    vi.mocked(serviceHubApi.updatePlaceCategory).mockResolvedValueOnce({ id: 'CAFE', label: 'Cà phê chill', sortOrder: 1 });
    render(<PlaceCategoriesAdminPanel categories={initial} onCategoriesChange={onCategoriesChange} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Tên nhóm Quán cà phê'), { target: { value: 'Cà phê chill' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu Quán cà phê' }));
    await waitFor(() => expect(serviceHubApi.updatePlaceCategory).toHaveBeenCalledWith('CAFE', 'Cà phê chill'));
    expect(onCategoriesChange).toHaveBeenCalledWith([{ id: 'CAFE', label: 'Cà phê chill', sortOrder: 1 }]);
  });

  it('deletes a category after confirmation', async () => {
    const onCategoriesChange = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(serviceHubApi.removePlaceCategory).mockResolvedValueOnce({ success: true });
    render(<PlaceCategoriesAdminPanel categories={initial} onCategoriesChange={onCategoriesChange} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa Quán cà phê' }));
    await waitFor(() => expect(serviceHubApi.removePlaceCategory).toHaveBeenCalledWith('CAFE'));
    expect(onCategoriesChange).toHaveBeenCalledWith([]);
  });
});
