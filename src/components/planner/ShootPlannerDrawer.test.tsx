// @vitest-environment jsdom

import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider, useShootPlan } from '../../context/ShootPlanContext';
import { ShootPlannerDrawer } from './ShootPlannerDrawer';
function Harness() {
  const plan = useShootPlan();
  return <><button onClick={plan.openDrawer}>Open</button><button onClick={() => plan.addReferencePhoto({ imageUrl: 'data:image/png;base64,YQ==', label: 'Test photo', note: 'Góc nắng' })}>Pin</button><ShootPlannerDrawer /></>;
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
