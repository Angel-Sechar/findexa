const peruCurrencyFormatter = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return `S/. ${peruCurrencyFormatter.format(value)}`;
}
