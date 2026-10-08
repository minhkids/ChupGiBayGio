// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import { ServicesHubView } from './ServicesHubView';
import { serviceHubApi } from '../../services/serviceHubApi';

vi.mock('../../services/serviceHubApi', () => ({
  serviceHubApi: {
    list: vi.fn().mockResolvedValue([]), adminList: vi.fn().mockResolvedValue([]),
    login: vi.fn().mockResolvedValue(undefined), logout: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn()
  }
}));

afterEach(() => { cleanup(); sessionStorage.clear(); });
const renderView = () => render(<ShootPlanProvider><ServicesHubView onClose={() => undefined} /></ShootPlanProvider>);

describe('ServicesHubView', () => {
  it('starts the directories empty and uses equal-width navigation tabs', async () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'Chuẩn bị cho buổi chụp' })).toBeDefined();
    expect(await screen.findByText('Chưa có tiệm thuê nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.getByText('Chưa có trang phục nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.queryByText('Tiệm Áo Dài Thơ')).toBeNull();
    const nav = screen.getByRole('navigation', { name: 'Danh mục dịch vụ' });
    expect(nav.firstElementChild?.className).toContain('grid-cols-3');
    expect(nav.querySelectorAll('button')).toHaveLength(3);
    expect(nav.querySelector('button')?.className).toContain('w-full');
    expect(nav.querySelector('button span')?.className).toContain('whitespace-nowrap');

    fireEvent.click(screen.getByRole('button', { name: /Nhiếp ảnh gia/i }));
    expect(await screen.findByText('Chưa có nhiếp ảnh gia nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.queryByText('Dương Tuấn Anh')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Mua film & Lab/i }));
    expect(await screen.findByText('Chưa có film lab nào. Quản trị viên có thể thêm thông tin.')).toBeDefined();
    expect(screen.queryByText('Nadar Club')).toBeNull();
  });

  it('opens the admin screen and prompts for the admin password', async () => {
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Quản lý dịch vụ' }));
    expect(await screen.findByRole('heading', { name: 'Quản lý thông tin dịch vụ' })).toBeDefined();
    expect(screen.getByLabelText('Mật khẩu')).toBeDefined();
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('heading', { name: 'Thêm thông tin mới' })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiệm thuê trang phục/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /Màu Film/ })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Màu Film/ }));
    expect(screen.getByLabelText('ISO')).toBeDefined();
    expect(screen.getByLabelText('Mã màu palette (HEX)')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Tiệm thuê trang phục/ }));
    fireEvent.change(screen.getByLabelText(/Tên hiển thị/), { target: { value: 'Tiệm mới' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm mục' }));
    expect(serviceHubApi.create).toHaveBeenCalledWith(expect.objectContaining({ category: 'rental', name: 'Tiệm mới' }));
  });
});
