// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PartnerJoinPage } from './PartnerJoinPage';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('partner onboarding pages', () => {
  it('shows only film retail fields and preview as the shop types', () => {
    render(<PartnerJoinPage kind="lab" />);
    expect(screen.getByRole('heading', { name: /Đưa Shop Bán Film/i })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Tên shop bán film *'), { target: { value: 'Film Mùa Thu' } });
    expect(screen.getByTestId('partner-preview').textContent).toContain('Film Mùa Thu');
    expect(screen.queryByText(/tráng|scan|ECN-2|C-41/i)).toBeNull();
    expect(screen.getByTestId('partner-preview').textContent).toContain('Shop bán film');
    expect(screen.getByLabelText('Quận / Huyện *')).toBeTruthy();
  });

  it('shows a selectable address suggestion for the shop while preserving manual entry', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ label: 'Ngọc Thụy, Long Biên, Hà Nội' }] });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="lab" />);
    fireEvent.focus(screen.getByLabelText('Địa chỉ chính xác *'));
    fireEvent.change(screen.getByLabelText('Địa chỉ chính xác *'), { target: { value: 'Ngọc Thụy' } });
    fireEvent.click(await screen.findByRole('option', { name: 'Ngọc Thụy, Long Biên, Hà Nội' }));
    expect((screen.getByLabelText('Địa chỉ chính xác *') as HTMLInputElement).value).toBe('Ngọc Thụy, Long Biên, Hà Nội');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/partner/address-suggestions?q='), expect.anything());
  });

  it('explains when the address provider has no match instead of leaving a silent blank', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    render(<PartnerJoinPage kind="lab" />);
    const address = screen.getByLabelText('Địa chỉ chính xác *');
    fireEvent.focus(address);
    fireEvent.change(address, { target: { value: '264/88 Ngọc Thụy' } });
    expect(screen.getByText(/gõ ít nhất 3 ký tự/i)).toBeTruthy();
    expect(await screen.findByRole('status')).toHaveProperty('textContent', expect.stringMatching(/không tìm thấy.*nhập tay/i));
    expect((address as HTMLInputElement).value).toBe('264/88 Ngọc Thụy');
  });

  it('offers the same address search for photographers without requiring a studio address', () => {
    render(<PartnerJoinPage kind="photographer" />);
    expect(screen.getByLabelText('Địa chỉ studio / nơi nhận khách (tùy chọn)')).toBeTruthy();
    expect((screen.getByLabelText('Địa chỉ studio / nơi nhận khách (tùy chọn)') as HTMLInputElement).required).toBe(false);
  });

  it('submits the photographer portfolio and presents a link returned by the API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'test-id', status: 'published', url: 'https://chupgibaygio.com/?services=photographers&partner=test-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="photographer" />);
    fireEvent.change(screen.getByLabelText('Tên thợ ảnh / Nghệ danh *'), { target: { value: 'Minh Studio' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại / Zalo *'), { target: { value: '0912345678' } });
    fireEvent.change(screen.getByLabelText('Tên gói *'), { target: { value: 'Chụp chân dung' } });
    fireEvent.change(screen.getByLabelText('Giá (VNĐ) *'), { target: { value: '600000' } });
    fireEvent.change(screen.getByLabelText('Thời lượng *'), { target: { value: '1.5 giờ' } });
    fireEvent.change(screen.getByLabelText('Số ảnh trả *'), { target: { value: '15 ảnh chỉnh' } });
    const input = screen.getByLabelText('Tải 3–6 ảnh portfolio *') as HTMLInputElement;
    const file = () => new File(['photo'], 'sample.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file(), file(), file()] } });
    fireEvent.submit(screen.getByRole('button', { name: 'Hoàn tất đăng ký' }).closest('form')!);
    await waitFor(() => expect(screen.getByText('Đã cập nhật thông tin thành công!')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/partner/register-photographer'), expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));
    expect(screen.getByRole('link', { name: /Xem thẻ trên website/i }).getAttribute('href')).toContain('partner=test-id');
  });
});
