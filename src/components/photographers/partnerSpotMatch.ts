const normalize = (value: string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();

export function matchesPartnerSpot(spotName: string, preferred: string[]) {
  const target = normalize(spotName);
  return preferred.some((spot) => {
    const place = normalize(spot);
    return place.length >= 4 && (target === place || target.includes(place) || place.includes(target));
  });
}
