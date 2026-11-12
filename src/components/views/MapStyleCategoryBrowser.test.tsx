// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MapStyleCategoryBrowser } from './MapStyleCategoryBrowser';

const { addItemMock, isItemInPlanMock } = vi.hoisted(() => ({ addItemMock: vi.fn(), isItemInPlanMock: vi.fn(() => false) }));
vi.mock('../../context/ShootPlanContext', () => ({ useShootPlan: () => ({ addItem: addItemMock, isItemInPlan: isItemInPlanMock }) }));

describe('MapStyleCategoryBrowser', () => {
  afterEach(() => {
    cleanup();
    addItemMock.mockClear();
    window.history.replaceState({}, '', '/');
  });

  it('decorates only the Halloween map category with a witch hat and no sparkles', () => {
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'HALLOWEEN', label: 'Halloween', sortOrder: 9 }, { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]}
      selectedCategory="ALL"
      onSelectCategory={vi.fn()}
    />);

    const tag = screen.getByRole('button', { name: 'Halloween' });
    expect(tag.querySelector('svg[data-icon="witch-hat"]')).toBeTruthy();
    expect(tag.querySelector('.lucide-ghost, .lucide-sparkles')).toBeNull();
    expect(screen.getByRole('button', { name: 'Quán cà phê' }).querySelector('svg[data-icon="witch-hat"]')).toBeNull();
  });

  it('shows the supplied áo dài illustration above the AO_DAI category and keeps it selectable', () => {
    const onSelectCategory = vi.fn();
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'AO_DAI', label: 'Áo dài', sortOrder: 8 }, { id: 'HALLOWEEN', label: 'Halloween', sortOrder: 9 }, { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]}
      selectedCategory="ALL"
      onSelectCategory={onSelectCategory}
    />);

    const aoDaiCategory = screen.getByRole('button', { name: 'Áo dài' });
    expect(aoDaiCategory.querySelector('img[data-icon="ao-dai"]')?.getAttribute('src')).toBe('/icons/ao-dai-category.webp');
    expect(screen.getByRole('button', { name: 'Halloween' }).querySelector('svg[data-icon="witch-hat"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Quán cà phê' }).querySelector('img[data-icon="ao-dai"]')).toBeNull();
    fireEvent.click(aoDaiCategory);
    expect(onSelectCategory).toHaveBeenCalledWith('AO_DAI');
  });

  it('shows the Christmas tree before the Giáng Sinh label and selects CHRISTMAS', () => {
    const onSelectCategory = vi.fn();
    const categories = [{ id: 'CHRISTMAS', label: 'Giáng Sinh', sortOrder: 9 }, { id: 'AO_DAI', label: 'Áo dài', sortOrder: 8 }, { id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }];
    const { rerender } = render(<MapStyleCategoryBrowser categories={categories} selectedCategory="ALL" onSelectCategory={onSelectCategory} />);

    const chip = screen.getByRole('button', { name: 'Giáng Sinh' });
    const icon = chip.querySelector('img[data-icon="christmas-tree"]');
    const label = within(chip).getByText('Giáng Sinh');
    expect(icon?.getAttribute('src')).toBe('/icons/christmas-tree-category.png');
    expect(icon?.className).toContain('object-contain');
    expect(icon?.className).toContain('bg-transparent');
    expect(Boolean(icon && (icon.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    expect(chip.className).toContain('bg-[#FAF8F4]');
    expect(chip.className).not.toContain('bg-[#12303D]');
    expect(screen.getByRole('button', { name: 'Quán cà phê' }).querySelector('img[data-icon="christmas-tree"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Áo dài' }).querySelector('img[data-icon="ao-dai"]')).toBeTruthy();
    fireEvent.click(chip);
    expect(onSelectCategory).toHaveBeenCalledWith('CHRISTMAS');

    rerender(<MapStyleCategoryBrowser categories={categories} selectedCategory="CHRISTMAS" onSelectCategory={onSelectCategory} />);
    expect(screen.getByRole('button', { name: 'Giáng Sinh' }).className).toContain('bg-[#2C2621]');
  });

  it('shows three accessories instead of a shot board while preserving the filter and guide', () => {
    const onSelectCategory = vi.fn();
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }, { id: 'SUNSET', label: 'Hoàng hôn', sortOrder: 2 }]}
      selectedCategory="CAFE"
      onSelectCategory={onSelectCategory}
    />);

    expect(screen.getByRole('heading', { name: 'Bạn định chụp style gì?' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Quán cà phê' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hoàng hôn' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Phụ kiện bạn có thể thích' })).toBeTruthy();
    expect(screen.getByText('Túi vải nhỏ')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Xem bộ ảnh & cách phối/ })).toBeTruthy();
    expect(screen.getByText('Màu kem hoặc nâu nhạt, vừa đủ đựng sách và đồ cá nhân.')).toBeTruthy();
    expect(screen.queryByText(/Moodboard|Bảng màu|khung hình|Chọn một món làm điểm nhấn/i)).toBeNull();
    const guideLink = screen.getByRole('link', { name: /Chưa biết chụp gì hôm nay/ });
    const moodCycleButton = screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' });
    expect(moodCycleButton.querySelector('.lucide-sparkles')).toBeNull();
    expect(moodCycleButton.querySelector('.lucide-refresh-cw')).toBeTruthy();
    expect(guideLink.getAttribute('href')).toBe('/chup-gi/');
    expect(Boolean(moodCycleButton.compareDocumentPosition(guideLink) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(screen.queryByText(/Xem trên bản đồ|Chưa có địa điểm trong nhóm/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hoàng hôn' }));
    expect(onSelectCategory).toHaveBeenCalledWith('SUNSET');
    expect(screen.queryByText(/hot trend|có thể hot|sắp tới/i)).toBeNull();
  });

  it('opens the editorial post, reveals a product detail and saves without inventing a price or Shopee link', () => {
    render(<MapStyleCategoryBrowser categories={[{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]} selectedCategory="CAFE" onSelectCategory={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Xem bộ ảnh & cách phối/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Bài viết minh họa · nội dung mẫu/)).toBeTruthy();
    expect(within(dialog).getByRole('region', { name: 'Bộ ảnh minh họa' })).toBeTruthy();
    expect(within(dialog).getByText(/Ảnh, tác giả, quyền sử dụng và link sản phẩm: chờ cung cấp/)).toBeTruthy();
    expect(within(dialog).getAllByText('Ảnh sản phẩm chờ bổ sung')).toHaveLength(3);

    fireEvent.click(within(dialog).getByRole('button', { name: /Túi vải nhỏ/ }));
    expect(within(dialog).getByRole('heading', { name: 'Túi vải nhỏ' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Link Shopee sẽ bổ sung sau/ })).toHaveProperty('disabled', true);
    fireEvent.click(within(dialog).getByRole('button', { name: /Lưu vào kế hoạch/ }));
    expect(addItemMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Túi vải nhỏ',
      category: 'accessory',
      priceText: '',
    }));
    expect(within(dialog).getByRole('button', { name: /Đã lưu vào kế hoạch/ })).toBeTruthy();
  });

  it('opens the sample editorial post from a shareable query URL and removes it when closed', () => {
    window.history.replaceState({}, '', '/?accessory-story=demo');
    render(<MapStyleCategoryBrowser categories={[]} selectedCategory="ALL" autoOpenSharedPost onSelectCategory={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng bài viết' }));
    expect(new URLSearchParams(window.location.search).has('accessory-story')).toBe(false);
  });

  it('cycles accessories without changing locations or losing button focus', () => {
    const onSelectCategory = vi.fn();
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]}
      selectedCategory="CAFE"
      onSelectCategory={onSelectCategory}
    />);
    const button = screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' });
    button.focus();
    fireEvent.click(button);
    expect(screen.getByText('Kẹp tóc tối giản')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' })).toBe(button);
    expect(document.activeElement).toBe(button);
    expect(onSelectCategory).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(screen.getByText('Túi vải nhỏ')).toBeTruthy();
  });

  it('resets suggestions on category changes, including a return to the previous category', () => {
    const props = { categories: [], onSelectCategory: vi.fn() };
    const { rerender } = render(<MapStyleCategoryBrowser {...props} selectedCategory="CAFE" />);
    fireEvent.click(screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' }));
    expect(screen.getByText('Kẹp tóc tối giản')).toBeTruthy();
    rerender(<MapStyleCategoryBrowser {...props} selectedCategory="SUNSET" />);
    expect(screen.getByText('Khăn choàng mỏng')).toBeTruthy();
    rerender(<MapStyleCategoryBrowser {...props} selectedCategory="CAFE" />);
    expect(screen.getByText('Túi vải nhỏ')).toBeTruthy();
  });

  it.each([
    ['VINTAGE', 'Khăn họa tiết nhỏ', 'Mũ beret mềm'],
    ['SUNSET', 'Khăn choàng mỏng', 'Kẹp tóc màu hổ phách'],
    ['RED_RIVER', 'Mũ rộng vành có dây', 'Mũ bucket gấp gọn'],
  ])('offers three items and cycles for %s', (category, first, next) => {
    render(<MapStyleCategoryBrowser categories={[]} selectedCategory={category} onSelectCategory={vi.fn()} />);
    expect(screen.getByText(first)).toBeTruthy();
    expect(screen.queryAllByRole('link', { name: /Xem trên Shopee/ })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' }));
    expect(screen.getByText(next)).toBeTruthy();
    expect(screen.queryAllByRole('link', { name: /Xem trên Shopee/ })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' }));
    expect(screen.getByText(first)).toBeTruthy();
  });

  it.each(['ALL', 'SHOPPING_MALL', 'CUSTOM_STYLE'])('shows featured accessories with Shopee links for %s', category => {
    render(<MapStyleCategoryBrowser categories={[]} selectedCategory={category} onSelectCategory={vi.fn()} />);
    expect(screen.getByText('Túi đeo chéo gọn')).toBeTruthy();
    expect(screen.getByText('Mũ bucket nhung (vàng mù tạt)')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Xem trên Shopee/ })).toHaveLength(4);
    expect(screen.getByRole('img', { name: 'Ảnh sản phẩm: Túi đeo chéo gọn' }).getAttribute('src')).toBe('/accessories/tui-deo-cheo-gon.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Đổi gợi ý phụ kiện' }));
    expect(screen.getByText('Kẹp tóc nhỏ')).toBeTruthy();
    expect(screen.queryAllByRole('link', { name: /Xem trên Shopee/ })).toHaveLength(0);
  });

  it('toggles film lab markers independently from the selected place style', () => {
    const onToggleFilmLabs = vi.fn();
    render(<MapStyleCategoryBrowser
      categories={[{ id: 'CAFE', label: 'Quán cà phê', sortOrder: 1 }]}
      selectedCategory="CAFE"
      onSelectCategory={vi.fn()}
      showFilmLabs
      onToggleFilmLabs={onToggleFilmLabs}
    />);
    const toggle = screen.getByRole('button', { name: 'Lab film' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggle);
    expect(onToggleFilmLabs).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Quán cà phê' }).getAttribute('aria-pressed')).toBe('true');
  });
});
