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
  const products = data.products ?? [];

  return products
    .filter(
      (product) =>
        Array.isArray(product.offers) && product.offers.length > 0,
    )
    .map((product) => {
      const sortedOffers = [...product.offers].sort(
        (firstOffer, secondOffer) =>
          firstOffer.price - secondOffer.price,
      );

      const bestOffer = sortedOffers[0];
      const saving = Math.max(
        bestOffer.old_price - bestOffer.price,
        0,
      );

      const percentage = bestOffer.old_price
        ? (saving / bestOffer.old_price) * 100
        : 0;

      return {
        id: product.id,
        category: product.category,
        product: product.product,
        model: product.model,
        bestStore: bestOffer.store,
        bestPrice: priceFormatter.format(bestOffer.price),
        previousPrice: priceFormatter.format(bestOffer.old_price),
        saving: priceFormatter.format(saving),
        change: `-${percentage.toFixed(1).replace(".", ",")}%`,
        stores: sortedOffers.length,
        signal: "ENCONTRADO",
        storeOffers: sortedOffers.map((offer, index) => ({
          store: offer.store,
          price: priceFormatter.format(offer.price),
          previousPrice: priceFormatter.format(offer.old_price),
          difference: priceFormatter.format(
            offer.price - bestOffer.price,
          ),
          isBest: index === 0,
        })),
      };
    });
}