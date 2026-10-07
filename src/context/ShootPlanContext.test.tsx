// @vitest-environment jsdom

import { afterEach, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { ShootPlanProvider, useShootPlan } from './ShootPlanContext';

const key = 'chupgibaygio_shoot_plan';
afterEach(() => { cleanup(); localStorage.clear(); });
it('migrates old plans and persists, deduplicates, annotates and clears reference photos', () => {
  localStorage.setItem(key, JSON.stringify({ spots: [], items: [], photographer: null }));
  const { result } = renderHook(() => useShootPlan(), { wrapper: ShootPlanProvider });
  expect(result.current.referencePhotos).toEqual([]);
  act(() => result.current.addReferencePhoto({ imageUrl: 'https://example.com/a.jpg', label: 'Góc chụp' }));
  act(() => result.current.addReferencePhoto({ imageUrl: 'https://example.com/a.jpg', label: 'Góc chụp' }));
  expect(result.current.referencePhotos).toHaveLength(1);
  const id = result.current.referencePhotos[0].id;
  act(() => result.current.updateReferencePhotoNote(id, 'Ngược sáng'));
  expect(JSON.parse(localStorage.getItem(key)!).referencePhotos[0].note).toBe('Ngược sáng');
  expect(result.current.totalCount).toBe(1);
  expect(result.current.generateBriefText()).toContain('Ngược sáng');
  act(() => result.current.removeReferencePhoto(id));
  expect(result.current.referencePhotos).toEqual([]);
  act(() => result.current.addReferencePhoto({ imageUrl: 'data:image/png;base64,YQ==', label: 'Tải lên' }));
  act(() => result.current.clearPlan());
  expect(result.current.referencePhotos).toEqual([]);
});
