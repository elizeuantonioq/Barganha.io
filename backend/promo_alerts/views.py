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


PRODUCTS = [
    {
        "id": 1,
        "product": "Monitor LG UltraGear 24",
        "model": "180Hz Full HD",
        "category": "Eletrônicos",
        "offers": [
            {
                "store": "KaBuM!",
                "price": 799.90,
                "old_price": 1099.90,
            },
            {
                "store": "Amazon",
                "price": 849.90,
                "old_price": 999.90,
            },
            {
                "store": "Magalu",
                "price": 879.90,
                "old_price": 1049.90,
            },
        ],
    },
    {
        "id": 2,
        "product": "PlayStation 5 Slim Digital",
        "model": "Edição Digital",
        "category": "Eletrônicos",
        "offers": [
            {
                "store": "Amazon",
                "price": 3149.00,
                "old_price": 3599.00,
            },
            {
                "store": "KaBuM!",
                "price": 3199.90,
                "old_price": 3699.90,
            },
            {
                "store": "Mercado Livre",
                "price": 3299.00,
                "old_price": 3799.00,
            },
        ],
    },
    {
        "id": 3,
        "product": "Air Fryer Mondial Family 4L",
        "model": "AFN-40",
        "category": "Dia a dia",
        "offers": [
            {
                "store": "Mercado Livre",
                "price": 329.90,
                "old_price": 429.90,
            },
            {
                "store": "Amazon",
                "price": 349.90,
                "old_price": 449.90,
            },
            {
                "store": "Magalu",
                "price": 369.90,
                "old_price": 459.90,
            },
        ],
    },
]


def product_matches_query(product, query):
    searchable_values = [
        product["product"],
        product["model"],
        product["category"],
    ]

    searchable_values.extend(
        offer["store"] for offer in product["offers"]
    )

    return any(
        query in value.lower()
        for value in searchable_values
    )


@api_view(["GET"])
def search_offers(request):
    query = request.query_params.get("q", "").strip().lower()

    filtered_products = [
        product
        for product in PRODUCTS
        if not query or product_matches_query(product, query)
    ]

    return Response(
        {
            "query": query,
            "count": len(filtered_products),
            "products": filtered_products,
        }
    )