// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlaceCategoryFilterControl } from './PlaceCategoryFilterControl';

describe('PlaceCategoryFilterControl', () => {
  afterEach(cleanup);

  it('offers each requested group and emits the selected category', () => {
    const onChange = vi.fn();
    render(<PlaceCategoryFilterControl value="ALL" onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: 'Nhóm địa điểm' });
    expect(Array.from(select.querySelectorAll('option')).map(option => option.text)).toEqual([
      'Tất cả', 'Quán cà phê', 'Vintage', 'Trung tâm thương mại', 'Gần sông Hồng', 'Chụp hoàng hôn',
    ]);
    fireEvent.change(select, { target: { value: 'RED_RIVER' } });
    expect(onChange).toHaveBeenCalledWith('RED_RIVER');
  });

  it('uses admin-defined categories rather than requiring a code change', () => {
    render(<PlaceCategoryFilterControl value="ALL" onChange={vi.fn()} categories={[{ id: 'TIEM_SACH', label: 'Tiệm sách', sortOrder: 6 }]} />);
    const select = screen.getByRole('combobox', { name: 'Nhóm địa điểm' });
    expect(Array.from(select.querySelectorAll('option')).map(option => [option.value, option.text])).toEqual([
      ['ALL', 'Tất cả'], ['TIEM_SACH', 'Tiệm sách'],
    ]);
  });
});
