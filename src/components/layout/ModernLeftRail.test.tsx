// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModernLeftRail } from './ModernLeftRail';
import { ShootPlanProvider } from '../../context/ShootPlanContext';
import type { WeatherData } from '../../hooks/useWeather';

describe('ModernLeftRail', () => {
  const dummyWeather: WeatherData = {
    temperature: 24,
    humidity: 65,
    windSpeed: 5,
    weatherCode: 0,
    isDay: true,
    sunrise: '06:00',
    sunset: '18:00',
    effect: 'clear',
    season: 'autumn',
    timeOfDay: 'golden_hour',
    overlayOpacity: 0.2,
    particleDensity: 0.1,
    colorTemperature: 'warm',
    fetchedAt: new Date(),
    isLoading: false,
    error: null
  };

  it('renders the 3 main navigation items: Bản đồ, Dịch vụ, Kế hoạch', () => {
    const onMap = vi.fn();
    const onServices = vi.fn();
    const onPlanner = vi.fn();
    const onAddSpot = vi.fn();

    render(
      <ShootPlanProvider>
        <ModernLeftRail
          onMap={onMap}
          onServices={onServices}
          onPlanner={onPlanner}
          onAddSpot={onAddSpot}
          weather={dummyWeather}
        />
      </ShootPlanProvider>
    );

    // Map button
    const mapButtons = screen.getAllByRole('button', { name: /bản đồ/i });
    expect(mapButtons.length).toBeGreaterThan(0);
    fireEvent.click(mapButtons[0]);
    expect(onMap).toHaveBeenCalled();

    // Services (🎒 Dịch vụ) button
    const servicesButton = screen.getByRole('button', { name: /dịch vụ/i });
    expect(servicesButton).toBeDefined();
    fireEvent.click(servicesButton);
    expect(onServices).toHaveBeenCalled();

    // Planner (📋 Kế hoạch) button
    const plannerButton = screen.getByRole('button', { name: /kế hoạch/i });
    expect(plannerButton).toBeDefined();
    fireEvent.click(plannerButton);
    expect(onPlanner).toHaveBeenCalled();
  });
});
