// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { FilmGalleryView } from './FilmGalleryView';
import { serviceHubApi } from '../../services/serviceHubApi';

vi.mock('../../services/serviceHubApi', () => ({ serviceHubApi: { list: vi.fn().mockResolvedValue([]) } }));
vi.mock('../planner/PinReferenceButton', () => ({ PinReferenceButton: () => null }));

afterEach(cleanup);

describe('FilmGalleryView', () => {
  it('does not show built-in film stocks when there are no admin-managed entries', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([]);
    render(<FilmGalleryView />);
    expect(await screen.findByText(/Chưa có dữ liệu màu film/i)).toBeDefined();
    expect(screen.queryByText('Kodak Gold 200')).toBeNull();
    expect(screen.queryByText('CineStill 800T')).toBeNull();
  });

  it('renders film color entries supplied by the shared service API', async () => {
    vi.mocked(serviceHubApi.list).mockResolvedValueOnce([{
      id: 'recipe-1', category: 'filmColor', name: 'Film do admin thêm', iso: '200', format: '35mm',
      description: 'Màu ấm', paletteHex: ['#AABBCC'], imageUrl: '', tags: [],
    }]);
    render(<FilmGalleryView />);
    expect(await screen.findByText('Film do admin thêm')).toBeDefined();
    expect(screen.getByText('ISO 200')).toBeDefined();
    expect(screen.getByText(/Màu ấm/)).toBeDefined();
    expect(screen.queryByText('Kodak Gold 200')).toBeNull();
  });
});
