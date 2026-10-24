// @vitest-environment jsdom

import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider, useShootPlan } from '../../context/ShootPlanContext';
import { ShootPlannerDrawer } from './ShootPlannerDrawer';
function Harness() {
  const plan = useShootPlan();
  return <><button onClick={plan.openDrawer}>Open</button><button onClick={() => plan.addReferencePhoto({ imageUrl: 'data:image/png;base64,YQ==', label: 'Test photo', note: 'Góc nắng' })}>Pin</button><ShootPlannerDrawer /></>;
}
function CyclingHarness({ onStart }: { onStart: () => void }) {
  const plan = useShootPlan();
  return <><button onClick={plan.openDrawer}>Open plan</button><button onClick={() => { plan.addCyclingStop({ id: 'lab', name: 'Nadar', lat: 21.03, lng: 105.83, kind: 'filmLab' }); plan.addCyclingStop({ id: 'spot', name: 'Phan Đình Phùng', lat: 21.04, lng: 105.83, kind: 'spot' }); }}>Add route stops</button><ShootPlannerDrawer onStartCyclingStory={onStart} /></>;
}
afterEach(() => { cleanup(); localStorage.clear(); });
it('offers uploads in an empty plan and displays editable reference photos and PNG export', () => {
  render(<ShootPlanProvider><Harness /></ShootPlanProvider>);
  fireEvent.click(screen.getByText('Open'));
  expect(screen.getByLabelText('Tải ảnh mẫu lên')).toBeTruthy();
  fireEvent.click(screen.getByText('Pin'));
  expect(screen.getByAltText('Test photo')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Ghi chú ảnh 1'), { target: { value: 'Đứng cạnh xe hoa' } });
  expect(JSON.parse(localStorage.getItem('chupgibaygio_shoot_plan')!).referencePhotos[0].note).toBe('Đứng cạnh xe hoa');
  expect(screen.getByRole('button', { name: 'Xuất Thẻ Lịch Trình (Ảnh)' })).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Xóa ảnh mẫu 1'));
  expect(screen.queryByAltText('Test photo')).toBeNull();
});

it('starts an ordered cycling story from waypoints in the shoot plan', () => {
  const onStart = vi.fn();
  render(<ShootPlanProvider><CyclingHarness onStart={onStart} /></ShootPlanProvider>);
  fireEvent.click(screen.getByText('Add route stops'));
  fireEvent.click(screen.getByText('Open plan'));
  expect(screen.getByText('Nadar')).toBeTruthy();
  expect(screen.getByText('Phan Đình Phùng')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Chạy hành trình đạp xe (Story)' }));
  expect(onStart).toHaveBeenCalledOnce();
});
