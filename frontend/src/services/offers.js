const API_URL = "http://127.0.0.1:8000";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export async function searchOffers(query) {
  const response = await fetch(
    `${API_URL}/api/offers/search/?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("Não foi possível buscar as ofertas.");
  }

  const data = await response.json();

  return data.offers.map((offer) => {
    const saving = offer.old_price - offer.price;
    const percentage = offer.old_price
      ? (saving / offer.old_price) * 100
      : 0;

    return {
      id: offer.id,
      category: offer.category,
      product: offer.product,
      model: "Oferta encontrada pela API",
      bestStore: offer.store,
      bestPrice: priceFormatter.format(offer.price),
      previousPrice: priceFormatter.format(offer.old_price),
      saving: priceFormatter.format(saving),
      change: `-${percentage.toFixed(1).replace(".", ",")}%`,
      stores: 1,
      signal: "ENCONTRADO",
    };
  });
}