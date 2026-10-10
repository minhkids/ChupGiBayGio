// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddSpotModal } from './AddSpotModal';

describe('AddSpotModal', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  const selectedLocation = { lat: 21.04, lng: 105.84, address: 'Hà Nội', placeName: 'Tên do bản đồ gợi ý' };

  const renderModal = (onSubmitNewSpot = vi.fn()) => {
    render(
      <AddSpotModal
        isOpen
        onClose={vi.fn()}
        onSubmitNewSpot={onSubmitNewSpot}
        isPickingLocation={false}
        selectedLocation={selectedLocation}
        onStartMapPick={vi.fn()}
        onCancelMapPick={vi.fn()}
        onClearLocation={vi.fn()}
      />
    );
    return onSubmitNewSpot;
  };

  it('keeps form text legible on the warm input background', () => {
    render(
      <AddSpotModal
        isOpen
        onClose={vi.fn()}
        onSubmitNewSpot={vi.fn()}
        isPickingLocation={false}
        selectedLocation={null}
        onStartMapPick={vi.fn()}
        onCancelMapPick={vi.fn()}
        onClearLocation={vi.fn()}
      />
    );

    const nameInput = screen.getByPlaceholderText('VD: Cánh Đồng Hoa Tam Giác Mạch');
    const regionSelect = screen.getByLabelText('KHU VỰC: *');
    expect(nameInput.classList.contains('text-slateInk')).toBe(true);
    expect(regionSelect.classList.contains('text-slateInk')).toBe(true);
  });

  it('leaves the spot name empty after choosing coordinates and offers all three season tags', () => {
    renderModal();
    expect((screen.getByPlaceholderText('VD: Cánh Đồng Hoa Tam Giác Mạch') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('NHÃN ĐỊA ĐIỂM: *') as unknown as HTMLSelectElement).value).toBe('ACTIVE');
    expect(screen.getByRole('option', { name: 'Đang Rộ (Peak)' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Sắp Hết Mùa' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Quanh Năm' })).toBeTruthy();
  });

  it('uploads the selected illustration and includes its URL and chosen season status', async () => {
    const submit = renderModal();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ url: 'https://images.test/spot.jpg' }) }));
    fireEvent.change(screen.getByPlaceholderText('VD: Cánh Đồng Hoa Tam Giác Mạch'), { target: { value: 'Vườn hoa' } });
    fireEvent.change(screen.getByLabelText('MÔ TẢ ĐỊA ĐIỂM'), { target: { value: 'Vườn hoa ven hồ, mở cửa tự do.' } });
    fireEvent.change(screen.getByLabelText('NHÃN ĐỊA ĐIỂM: *'), { target: { value: 'ENDING_SOON' } });
    fireEvent.change(screen.getByLabelText('HẠN NHÃN MÙA: *'), { target: { value: '2026-12-31' } });
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], 'spot.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('ẢNH MINH HỌA'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'THÊM ĐỊA ĐIỂM' }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      coverImageUrl: 'https://images.test/spot.jpg',
      galleryUrls: ['https://images.test/spot.jpg'],
      description: 'Vườn hoa ven hồ, mở cửa tự do.',
      seasonalTrend: expect.objectContaining({ status: 'ENDING_SOON', statusValidUntil: '2026-12-31' })
    })));
    vi.unstubAllGlobals();
  });
});
