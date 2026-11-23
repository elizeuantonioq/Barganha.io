from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import PriceHistory, Product


@api_view(["GET"])
def health_check(request):
    return Response(
        {
            "status": "ok",
            "service": "Barganha.io API",
        }
    )


def serialize_product(product):
    return {
        "id": product.id,
        "product": product.name,
        "model": product.model,
        "category": product.category,
        "offers": [
            {
                "store": offer.store,
                "price": float(offer.price),
                "old_price": float(offer.old_price),
            }
            for offer in product.offers.all()
        ],
    }


@api_view(["GET"])
def search_offers(request):
    query = request.query_params.get("q", "").strip().lower()

    products = Product.objects.prefetch_related("offers")

    if query:
        products = products.filter(
            Q(name__icontains=query)
            | Q(model__icontains=query)
            | Q(category__icontains=query)
            | Q(offers__store__icontains=query)
        ).distinct()

    data = [serialize_product(product) for product in products]

    return Response(
        {
            "query": query,
            "count": len(data),
            "products": data,
        }
    )
    
@api_view(["GET"])
def price_history(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    entries = PriceHistory.objects.filter(offer__product=product).select_related("offer")

    stores = {}
    for entry in entries:
        stores.setdefault(entry.offer.store, []).append(
            {
                "price": float(entry.price),
                "recorded_at": entry.recorded_at.isoformat(),
            }
        )

    return Response(
        {
            "product": product.name,
            "stores": [
                {"store": store, "history": history} for store, history in stores.items()
            ],
        }
    )