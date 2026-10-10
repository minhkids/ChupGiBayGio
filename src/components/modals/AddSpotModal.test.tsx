// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddSpotModal } from './AddSpotModal';

describe('AddSpotModal', () => {
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
    const regionSelect = screen.getByRole('combobox');
    expect(nameInput.classList.contains('text-slateInk')).toBe(true);
    expect(regionSelect.classList.contains('text-slateInk')).toBe(true);
  });
});
