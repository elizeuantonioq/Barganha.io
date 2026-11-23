from decimal import Decimal
from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse

from .models import PriceHistory, Product, StoreOffer


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


class PriceHistoryTests(TestCase):
    def setUp(self):
        product = Product.objects.create(name="Teclado", category="Eletrônicos")
        self.offer = StoreOffer.objects.create(
            product=product,
            store="KaBuM!",
            price=Decimal("200.00"),
            old_price=Decimal("250.00"),
        )

    def recorded_prices(self):
        history = PriceHistory.objects.filter(offer=self.offer)
        return [entry.price for entry in history]

    def test_new_offer_records_first_price(self):
        self.assertEqual(self.recorded_prices(), [Decimal("200.00")])

    def test_price_change_records_new_entry(self):
        self.offer.price = Decimal("180.00")
        self.offer.save()

        self.assertEqual(self.recorded_prices(), [Decimal("200.00"), Decimal("180.00")])

    def test_saving_without_price_change_does_not_record(self):
        self.offer.store = "KaBuM"
        self.offer.save()

        self.assertEqual(self.recorded_prices(), [Decimal("200.00")])
        
class PriceHistoryApiTests(TestCase):
    def setUp(self):
        call_command("load_demo_products", stdout=StringIO())
        self.monitor = Product.objects.get(name="Monitor LG UltraGear 24")

    def get_history(self, product_id):
        return self.client.get(reverse("price_history", args=[product_id]))

    def test_returns_history_grouped_by_store(self):
        data = self.get_history(self.monitor.pk).json()

        self.assertEqual(data["product"], "Monitor LG UltraGear 24")
        stores = {item["store"] for item in data["stores"]}
        self.assertEqual(stores, {"KaBuM!", "Amazon", "Magalu"})

    def test_price_change_appears_in_history(self):
        offer = StoreOffer.objects.get(product=self.monitor, store="KaBuM!")
        offer.price = Decimal("749.90")
        offer.save()

        data = self.get_history(self.monitor.pk).json()
        kabum = next(item for item in data["stores"] if item["store"] == "KaBuM!")
        self.assertEqual([entry["price"] for entry in kabum["history"]], [799.90, 749.90])

    def test_running_demo_command_again_keeps_history(self):
        call_command("load_demo_products", stdout=StringIO())

        self.assertEqual(PriceHistory.objects.filter(offer__product=self.monitor).count(), 3)

    def test_unknown_product_returns_404(self):
        self.assertEqual(self.get_history(9999).status_code, 404)