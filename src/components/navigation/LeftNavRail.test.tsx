// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LeftNavRail } from './LeftNavRail';
import type { WeatherData } from '../../hooks/useWeather';

const weather: WeatherData = {
  temperature: 24, humidity: 65, windSpeed: 5, weatherCode: 0, isDay: true,
  sunrise: '06:00', sunset: '18:00', effect: 'clear', season: 'autumn',
  timeOfDay: 'golden_hour', overlayOpacity: 0.2, particleDensity: 0.1,
  colorTemperature: 'warm', fetchedAt: new Date(), isLoading: false, error: null,
};

afterEach(cleanup);

it('removes Cảm hứng and Màu Film navigation while keeping the other main destinations', () => {
  render(<LeftNavRail
    activeView="map"
    onChangeView={vi.fn()}
    savedCount={0}
    onOpenSavedModal={vi.fn()}
    onOpenSubmitSpotModal={vi.fn()}
    weather={weather}
    isAtmosphericActive={false}
    onToggleAtmospheric={vi.fn()}
    activeRegionId="hanoi"
    onSelectRegion={vi.fn()}
  />);

  expect(screen.queryAllByText('Cảm hứng', { exact: true })).toHaveLength(0);
  expect(screen.getAllByText('Bản đồ', { exact: true }).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Tạp chí', { exact: true }).length).toBeGreaterThan(0);
  expect(screen.queryAllByText('Màu Film', { exact: true })).toHaveLength(0);
  expect(screen.getAllByText('Dịch vụ', { exact: true }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: 'Chuyển sang giao diện tối' })).toHaveLength(2);
});
