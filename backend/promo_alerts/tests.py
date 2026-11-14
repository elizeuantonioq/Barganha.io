from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse


class OffersApiTests(TestCase):
    def setUp(self):
        call_command("load_demo_products", stdout=StringIO())

    def search(self, query):
        response = self.client.get(reverse("search_offers"), {"q": query})
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_search_returns_products_with_multiple_store_offers(self):
        data = self.search("monitor")

        self.assertEqual(data["count"], 1)
        self.assertEqual(data["products"][0]["product"], "Monitor LG UltraGear 24")
        self.assertEqual(len(data["products"][0]["offers"]), 3)

    def test_search_by_store_returns_every_product_sold_there(self):
        data = self.search("magalu")

        names = {product["product"] for product in data["products"]}
        self.assertEqual(names, {"Monitor LG UltraGear 24", "Air Fryer Mondial Family 4L"})

    def test_search_by_category(self):
        data = self.search("dia a dia")

        self.assertEqual(data["count"], 1)
        self.assertEqual(data["products"][0]["product"], "Air Fryer Mondial Family 4L")

    def test_empty_search_returns_all_products(self):
        self.assertEqual(self.search("")["count"], 3)

    def test_offers_come_from_cheapest_to_most_expensive(self):
        offers = self.search("monitor")["products"][0]["offers"]

        self.assertEqual([offer["price"] for offer in offers], [799.90, 849.90, 879.90])

    def test_search_with_no_matches_returns_empty_list(self):
        self.assertEqual(self.search("produto inexistente")["products"], [])

    def test_health_check(self):
        response = self.client.get(reverse("health_check"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")