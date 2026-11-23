from django.urls import path

from .views import health_check, price_history, search_offers


urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("offers/search/", search_offers, name="search_offers"),
    path("offers/<int:product_id>/history/", price_history, name="price_history"),
]