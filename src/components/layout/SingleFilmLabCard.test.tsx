// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider, useShootPlan } from '../../context/ShootPlanContext';
import { FILM_LABS } from '../../data/filmLabsData';
import { SingleFilmLabCard } from './SingleFilmLabCard';

afterEach(cleanup);

function PlanItemsProbe() {
  const plan = useShootPlan();
  return <output data-testid="planned-items">{plan?.items.map((item) => item.name).join(', ')}</output>;
}

function PlanStopsProbe() {
  const plan = useShootPlan();
  return <output data-testid="cycling-stops">{plan.cyclingStops.map(stop => stop.name).join(', ')}</output>;
}

describe('SingleFilmLabCard', () => {
  it('shows one lab and adds the chosen film stock to the shoot plan', () => {
    const lab = FILM_LABS[0];
    render(
      <ShootPlanProvider>
        <SingleFilmLabCard lab={lab} userCoords={{ lat: 21.0285, lng: 105.8542 }} onClose={() => undefined} />
        <PlanItemsProbe />
      </ShootPlanProvider>
    );

    expect(screen.getByRole('heading', { name: lab.name })).toBeDefined();
    expect(screen.getByText(lab.address)).toBeDefined();
    expect(screen.getByText(/từ vị trí của bạn/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /thêm cuộn film vào kế hoạch chụp/i }));
    expect(screen.getByTestId('planned-items').textContent).toContain(lab.availableFilms[0]);
  });

  it('shows the compact express-delivery badge when a shop offers two-hour delivery', () => {
    const lab = { ...FILM_LABS[0], expressDelivery2h: true };
    render(<ShootPlanProvider><SingleFilmLabCard lab={lab} userCoords={{ lat: 21.0285, lng: 105.8542 }} onClose={() => undefined} /></ShootPlanProvider>);
    expect(screen.getByRole('img', { name: 'Giao hỏa tốc trong 2 giờ' }).textContent).toBe('2h');
  });

  it('adds a film lab with verified coordinates as an ordered cycling waypoint', () => {
    const lab = FILM_LABS[0];
    render(<ShootPlanProvider><SingleFilmLabCard lab={lab} onClose={() => undefined} /><PlanStopsProbe /></ShootPlanProvider>);
    fireEvent.click(screen.getByRole('button', { name: `Thêm ${lab.name} vào hành trình xe đạp` }));
    expect(screen.getByTestId('cycling-stops').textContent).toBe(lab.name);
  });
});
