// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SpotLocationSearch } from './SpotLocationSearch';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const row = { id: 'one', lat: 21.06, lng: 105.86, address: 'Ngọc Thụy', precision: 'area' };
function search(query = 'Ngọc Thụy') {
  fireEvent.change(screen.getByLabelText('Tìm địa chỉ'), { target: { value: query } });
  fireEvent.click(screen.getByRole('button', { name: 'Tìm địa chỉ' }));
}
it.each([
  [[], 'Không có kết quả'],
  [[{ ...row, lat: null }], 'Dữ liệu địa chỉ không hợp lệ'],
  [[{ ...row, lng: '' }], 'Dữ liệu địa chỉ không hợp lệ'],
  [[{ ...row, lat: 0, lng: 0 }], 'Dữ liệu địa chỉ không hợp lệ'],
])('rejects empty or malformed results: %j', async (data, text) => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(data)));
  const select = vi.fn();
  render(<SpotLocationSearch onSelect={select} />);
  search();
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain(text));
  expect(select).not.toHaveBeenCalled();
});
it('shows provider failure and allows retry without selecting anything', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({}, { status: 503 })));
  render(<SpotLocationSearch onSelect={vi.fn()} />);
  search();
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Không tìm được'));
  expect((screen.getByRole('button', { name: 'Tìm địa chỉ' }) as HTMLButtonElement).disabled).toBe(false);
});
it('ignores a stale response after the query changes even if transport ignores abort', async () => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(done => { resolve = done; })));
  const select = vi.fn();
  const view = render(<SpotLocationSearch onSelect={select} />);
  search();
  fireEvent.change(screen.getByLabelText('Tìm địa chỉ'), { target: { value: 'Hồ Tây' } });
  await act(async () => resolve(Response.json([row])));
  expect(screen.queryByRole('button', { name: /Gần đúng/ })).toBeNull();
  search('Hồ Tây');
  view.unmount();
  await act(async () => resolve(Response.json([row])));
  expect(select).not.toHaveBeenCalled();
});
it('labels street results approximate and passes their own address on selection', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json([row])));
  const select = vi.fn();
  render(<SpotLocationSearch onSelect={select} />);
  search();
  fireEvent.click(await screen.findByRole('button', { name: /Gần đúng/ }));
  expect(select).toHaveBeenCalledWith({ ...row, source: 'search' });
  expect(screen.queryByRole('button', { name: /Gần đúng/ })).toBeNull();
});