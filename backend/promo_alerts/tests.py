from django.test import SimpleTestCase
from django.urls import reverse


class OffersApiTests(SimpleTestCase):
    def test_search_returns_products_with_multiple_store_offers(self):
        response = self.client.get(reverse('search_offers'), {'q': 'monitor'})

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['products'][0]['product'], 'Monitor LG UltraGear 24')
        self.assertEqual(len(data['products'][0]['offers']), 3)

    def test_search_with_no_matches_returns_empty_list(self):
        response = self.client.get(reverse('search_offers'), {'q': 'produto inexistente'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['products'], [])

    def test_health_check(self):
        response = self.client.get(reverse('health_check'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'ok')
