// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PartnerJoinPage } from './PartnerJoinPage';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('partner onboarding pages', () => {
  it('lets a shop choose an optional 50-character slogan, previews and submits it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'lab-id', url: 'https://chupgibaygio.com/?services=film&partner=lab-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="lab" />);
    const slogan = screen.getByLabelText(/Slogan của shop/) as HTMLInputElement;
    expect(slogan.maxLength).toBe(50);
    expect(slogan.required).toBe(false);
    fireEvent.change(slogan, { target: { value: 'Film đẹp cho mọi khoảnh khắc' } });
    expect(screen.getByTestId('partner-preview').textContent).toContain('Film đẹp cho mọi khoảnh khắc');
    fireEvent.click(screen.getByRole('button', { name: 'Kodak Gold 200' }));
    const cheapestRoll = screen.getByLabelText(/Cuộn film rẻ nhất trong danh sách đang bán/);
    expect(cheapestRoll.hasAttribute('required')).toBe(true);
    expect([...cheapestRoll.querySelectorAll('option')].map((option) => option.value)).toContain('Kodak Gold 200');
    fireEvent.change(cheapestRoll, { target: { value: 'Kodak Gold 200' } });
    fireEvent.change(screen.getByLabelText('Tên shop bán film *'), { target: { value: 'Film Mùa Thu' } });
    fireEvent.change(screen.getByLabelText('Quận / Huyện *'), { target: { value: 'Hoàn Kiếm' } });
    fireEvent.change(screen.getByLabelText('Phường / xã *'), { target: { value: 'Cửa Nam' } });
    fireEvent.change(screen.getByLabelText('Hotline / Số Zalo nhận khách *'), { target: { value: '0912345678' } });
    fireEvent.change(screen.getByLabelText(/Giá cuộn film rẻ nhất/), { target: { value: '120000' } });
    expect(screen.queryByLabelText(/Giá cuộn film đắt nhất/)).toBeNull();
    expect(screen.getByTestId('partner-preview').textContent).toContain('Từ 120.000đ/cuộn');
    expect(screen.getByTestId('partner-preview').textContent).toContain('Rẻ nhất: Kodak Gold 200 · 120.000đ/cuộn');
    const expressDelivery = screen.getByRole('button', { name: /Có ship hỏa tốc trong 2 giờ/ });
    expect(expressDelivery.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(expressDelivery);
    expect(expressDelivery.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' }).textContent).toBe('2h');
    const priceList = new File(['price list'], 'bang-gia.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Ảnh bảng giá'), { target: { files: [priceList] } });
    fireEvent.submit(screen.getByRole('button', { name: 'Hoàn tất đăng ký' }).closest('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const form = fetchMock.mock.calls[0][1].body as FormData;
    const payload = JSON.parse(String(form.get('payload')));
    expect(payload).toMatchObject({ slogan: 'Film đẹp cho mọi khoảnh khắc', district: 'Hoàn Kiếm', ward: 'Cửa Nam', filmStocks: ['Kodak Gold 200'], cheapestRollName: 'Kodak Gold 200', minRollPrice: 120000 });
    expect(payload).not.toHaveProperty('maxRollPrice');
    expect(payload).not.toHaveProperty('address');
    expect(payload.expressDelivery2h).toBe(true);
    expect(form.get('productPhoto')).toBe(priceList);
  });

  it('requires only the cheapest roll price on the film-shop registration form', () => {
    render(<PartnerJoinPage kind="lab" />);
    expect(screen.getByLabelText('Ảnh bảng giá')).toBeTruthy();
    const minPrice = screen.getByLabelText(/Giá cuộn film rẻ nhất/) as HTMLInputElement;
    expect(minPrice.required).toBe(true);
    expect(screen.queryByLabelText(/Giá cuộn film đắt nhất/)).toBeNull();
    fireEvent.change(minPrice, { target: { value: '125000' } });
    expect(screen.getByTestId('partner-preview').textContent).toContain('Từ 125.000đ/cuộn');
  });

  it('shows only film retail fields and preview as the shop types', () => {
    render(<PartnerJoinPage kind="lab" />);
    expect(screen.getByRole('heading', { name: /Giúp khách tìm Shop Bán Film/i })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Tên shop bán film *'), { target: { value: 'Film Mùa Thu' } });
    expect(screen.getByTestId('partner-preview').textContent).toContain('Film Mùa Thu');
    expect(screen.queryByText(/tráng|scan|ECN-2|C-41/i)).toBeNull();
    expect(screen.getByTestId('partner-preview').textContent).toContain('Shop bán film');
    expect(screen.getByLabelText('Quận / Huyện *')).toBeTruthy();
  });

  it('asks film shops for their ward instead of an exact street address', () => {
    render(<PartnerJoinPage kind="lab" />);
    expect(screen.queryByLabelText('Địa chỉ chính xác *')).toBeNull();
    expect((screen.getByLabelText('Phường / xã *') as HTMLInputElement).required).toBe(true);
    expect(screen.getByLabelText('Quận / Huyện *').hasAttribute('required')).toBe(true);
  });

  it('lets a film shop add multiple branches and submits every district and ward', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'lab-id', url: 'https://chupgibaygio.com/?services=film&partner=lab-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="lab" />);
    fireEvent.change(screen.getByLabelText('Tên shop bán film *'), { target: { value: 'Film Mùa Thu' } });
    fireEvent.change(screen.getByLabelText('Quận / Huyện *'), { target: { value: 'Hoàn Kiếm' } });
    fireEvent.change(screen.getByLabelText('Phường / xã *'), { target: { value: 'Cửa Nam' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm địa chỉ' }));
    fireEvent.change(screen.getByLabelText('Quận / Huyện địa chỉ 2 *'), { target: { value: 'Cầu Giấy' } });
    fireEvent.change(screen.getByLabelText('Phường / xã địa chỉ 2 *'), { target: { value: 'Dịch Vọng' } });
    fireEvent.change(screen.getByLabelText('Giờ mở cửa địa chỉ 2'), { target: { value: '10:00–20:00' } });
    fireEvent.change(screen.getByLabelText('Hotline / Số Zalo nhận khách *'), { target: { value: '0912345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kodak Gold 200' }));
    fireEvent.change(screen.getByLabelText(/Cuộn film rẻ nhất trong danh sách đang bán/), { target: { value: 'Kodak Gold 200' } });
    fireEvent.change(screen.getByLabelText(/Giá cuộn film rẻ nhất/), { target: { value: '120000' } });
    expect(screen.getByTestId('partner-preview').textContent).toContain('Cơ sở 1: Cửa Nam, Hoàn Kiếm, Hà Nội');
    expect(screen.getByTestId('partner-preview').textContent).toContain('Cơ sở 2: Dịch Vọng, Cầu Giấy, Hà Nội');
    fireEvent.submit(screen.getByRole('button', { name: 'Hoàn tất đăng ký' }).closest('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const form = fetchMock.mock.calls[0][1].body as FormData;
    const payload = JSON.parse(String(form.get('payload')));
    expect(payload.locations).toEqual([
      { ward: 'Cửa Nam', district: 'Hoàn Kiếm', openingHours: '' },
      { ward: 'Dịch Vọng', district: 'Cầu Giấy', openingHours: '10:00–20:00' },
    ]);
  });

  it('explains when the address provider has no match instead of leaving a silent blank', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    render(<PartnerJoinPage kind="photographer" />);
    const address = screen.getByLabelText('Địa chỉ studio / nơi nhận khách (tùy chọn)');
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
