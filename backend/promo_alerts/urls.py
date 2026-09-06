from django.urls import path

from .views import health_check, search_offers


urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("offers/search/", search_offers, name="search_offers"),
]