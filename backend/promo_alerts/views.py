from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product


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