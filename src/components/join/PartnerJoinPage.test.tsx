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

  it('lets photographers register without an address using a starting price and one portfolio image', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'test-id', status: 'published', url: 'https://chupgibaygio.com/?services=photographers&partner=test-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="photographer" />);
    expect(screen.queryByLabelText(/địa chỉ studio|quận \/ huyện \(tùy chọn\)/i)).toBeNull();
    fireEvent.change(screen.getByLabelText('Tên thợ ảnh / Nghệ danh *'), { target: { value: 'Minh Studio' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại / Zalo *'), { target: { value: '0912345678' } });
    fireEvent.change(screen.getByLabelText(/Giá khởi điểm \(VNĐ\)/), { target: { value: '400000' } });
    const input = screen.getByLabelText('Ảnh portfolio (ít nhất 1) *') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['photo'], 'sample.jpg', { type: 'image/jpeg' })] } });
    expect(screen.getByTestId('partner-preview').textContent).toContain('Giá từ 400.000đ');
    expect(screen.getByLabelText('Tên gói (tùy chọn)').hasAttribute('required')).toBe(false);
    expect(screen.getByLabelText('Thời lượng (tùy chọn)').hasAttribute('required')).toBe(false);
    fireEvent.submit(screen.getByRole('button', { name: 'Hoàn tất đăng ký' }).closest('form')!);
    await waitFor(() => expect(screen.getByText('Đã cập nhật thông tin thành công!')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/partner/register-photographer'), expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));
    const form = fetchMock.mock.calls[0][1].body as FormData;
    const payload = JSON.parse(String(form.get('payload')));
    expect(payload).toMatchObject({ name: 'Minh Studio', phone: '0912345678', package: { price: 400000, name: '', duration: '', deliveredPhotos: '' } });
    expect(payload).not.toHaveProperty('address');
    expect(payload).not.toHaveProperty('district');
    expect(screen.getByRole('link', { name: /Xem thẻ trên website/i }).getAttribute('href')).toContain('partner=test-id');
  });

  it('uploads a separate avatar and keeps portfolio photos out of the outer-card preview', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation((file) => `blob:${(file as File).name}`);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'test-id', status: 'published', url: 'https://chupgibaygio.com/?services=photographers&partner=test-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="photographer" />);
    fireEvent.change(screen.getByLabelText('Tên thợ ảnh / Nghệ danh *'), { target: { value: 'Minh Studio' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại / Zalo *'), { target: { value: '0912345678' } });
    fireEvent.change(screen.getByLabelText(/Giá khởi điểm \(VNĐ\)/), { target: { value: '400000' } });
    const avatar = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    const portfolio = new File(['portfolio'], 'portfolio.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Tải ảnh đại diện / Avatar (tùy chọn)'), { target: { files: [avatar] } });
    fireEvent.change(screen.getByLabelText('Ảnh portfolio (ít nhất 1) *'), { target: { files: [portfolio] } });

    expect(screen.getByRole('img', { name: 'Ảnh đại diện Minh Studio' }).getAttribute('src')).toBe('blob:avatar.jpg');
    expect(screen.queryByRole('img', { name: /Ảnh portfolio/ })).toBeNull();
    fireEvent.submit(screen.getByRole('button', { name: 'Hoàn tất đăng ký' }).closest('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const form = fetchMock.mock.calls[0][1].body as FormData;
    expect(form.get('avatarPhoto')).toBe(avatar);
    expect(form.getAll('photos')).toEqual([portfolio]);
  });

  it('submits a clothing rental shop with area, styles, price range and sample photos', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation((file) => `blob:${(file as File).name}`);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'shop-id', status: 'published', url: 'https://chupgibaygio.com/?services=outfit&partner=shop-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PartnerJoinPage kind="shop" />);
    expect(screen.getByRole('heading', { name: 'Thông tin shop cho thuê trang phục' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Tên shop *'), { target: { value: 'Tiệm Áo Dài Hà Nội' } });
    fireEvent.change(screen.getByLabelText('Tên người liên hệ *'), { target: { value: 'Chị Lan' } });
    fireEvent.change(screen.getByLabelText('Quận / Huyện *'), { target: { value: 'Hoàn Kiếm' } });
    fireEvent.change(screen.getByLabelText('Phường / xã *'), { target: { value: 'Hàng Bông' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại / Zalo *'), { target: { value: '0912345678' } });
    fireEvent.change(screen.getByLabelText('Link Instagram'), { target: { value: 'https://instagram.com/tiem' } });
    fireEvent.change(screen.getByLabelText('Link Threads'), { target: { value: 'https://www.threads.net/@tiem' } });
    fireEvent.change(screen.getByLabelText('Link Facebook'), { target: { value: 'https://facebook.com/tiem' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áo dài' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đồ Noel' }));
    fireEvent.change(screen.getByLabelText('Giá thuê từ (VNĐ) *'), { target: { value: '200000' } });
    fireEvent.change(screen.getByLabelText('Giá thuê đến (VNĐ)'), { target: { value: '450000' } });
    fireEvent.change(screen.getByLabelText('Mô tả ngắn'), { target: { value: 'Thuê áo dài chụp phố cổ.' } });
    const photos = [new File(['a'], 'ao-dai.jpg', { type: 'image/jpeg' }), new File(['b'], 'vay.jpg', { type: 'image/jpeg' })];
    fireEvent.change(screen.getByLabelText('Ảnh mẫu trang phục (1–6 ảnh) *'), { target: { files: photos } });
    const preview = screen.getByTestId('partner-preview');
    expect(preview.textContent).toContain('Tiệm Áo Dài Hà Nội');
    expect(preview.textContent).toContain('Shop cho thuê trang phục');
    expect(preview.textContent).toContain('200.000đ – 450.000đ');
    expect(preview.textContent).toContain('Hàng Bông, Hoàn Kiếm, Hà Nội');
    expect(preview.textContent).toContain('Áo dài');
    fireEvent.submit(screen.getByRole('button', { name: 'Hoàn tất đăng ký' }).closest('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/partner/register-outfit-shop'), expect.objectContaining({ method: 'POST' })));
    const form = fetchMock.mock.calls[0][1].body as FormData;
    expect(JSON.parse(String(form.get('payload')))).toMatchObject({
      name: 'Tiệm Áo Dài Hà Nội', contactName: 'Chị Lan', district: 'Hoàn Kiếm', ward: 'Hàng Bông',
      styles: ['Áo dài', 'Đồ Noel'], priceMin: 200000, priceMax: 450000, description: 'Thuê áo dài chụp phố cổ.',
      instagramUrl: 'https://instagram.com/tiem', threadsUrl: 'https://www.threads.net/@tiem', facebookUrl: 'https://facebook.com/tiem',
    });
    expect(form.getAll('photos')).toEqual(photos);
    expect((await screen.findByRole('link', { name: /Xem thẻ trên website/i })).getAttribute('href')).toContain('partner=shop-id');
  });
});
