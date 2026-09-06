from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request):
    return Response(
        {
            "status": "ok",
            "service": "Barganha.io API",
        }
    )
OFFERS = [
    {
        "id": 1,
        "product": "Monitor LG UltraGear 24",
        "category": "Eletrônicos",
        "store": "KaBuM!",
        "price": 799.90,
        "old_price": 1099.90,
    },
    {
        "id": 2,
        "product": "PlayStation 5 Slim Digital",
        "category": "Eletrônicos",
        "store": "Amazon",
        "price": 3149.00,
        "old_price": 3599.00,
    },
    {
        "id": 3,
        "product": "Air Fryer Mondial Family 4L",
        "category": "Dia a dia",
        "store": "Mercado Livre",
        "price": 329.90,
        "old_price": 429.90,
    },
]


@api_view(["GET"])
def search_offers(request):
    query = request.query_params.get("q", "").strip().lower()

    filtered_offers = [
        offer
        for offer in OFFERS
        if not query
        or query in offer["product"].lower()
        or query in offer["store"].lower()
        or query in offer["category"].lower()
    ]

    return Response(
        {
            "query": query,
            "count": len(filtered_offers),
            "offers": filtered_offers,
        }
    )