// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ShootPlanProvider, useShootPlan } from '../../context/ShootPlanContext';
import { FILM_LABS } from '../../data/filmLabsData';
import { SingleFilmLabCard } from './SingleFilmLabCard';

function PlanItemsProbe() {
  const plan = useShootPlan();
  return <output data-testid="planned-items">{plan?.items.map((item) => item.name).join(', ')}</output>;
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
});
