from decimal import Decimal

from django.core.management.base import BaseCommand

from promo_alerts.models import PriceHistory, Product, StoreOffer

DEMO_PRODUCTS = [
    {
        "name": "Monitor LG UltraGear 24",
        "model": "180Hz Full HD",
        "category": "Eletrônicos",
        "offers": [
            ("KaBuM!", "799.90", "1099.90"),
            ("Amazon", "849.90", "999.90"),
            ("Magalu", "879.90", "1049.90"),
        ],
    },
    {
        "name": "PlayStation 5 Slim Digital",
        "model": "Edição Digital",
        "category": "Eletrônicos",
        "offers": [
            ("Amazon", "3149.00", "3599.00"),
            ("KaBuM!", "3199.90", "3699.90"),
            ("Mercado Livre", "3299.00", "3799.00"),
        ],
    },
    {
        "name": "Air Fryer Mondial Family 4L",
        "model": "AFN-40",
        "category": "Dia a dia",
        "offers": [
            ("Mercado Livre", "329.90", "429.90"),
            ("Amazon", "349.90", "449.90"),
            ("Magalu", "369.90", "459.90"),
        ],
    },
]


class Command(BaseCommand):
    help = "Cadastra no banco os produtos de demonstração do Barganha.io."

    def handle(self, *args, **options):
        for data in DEMO_PRODUCTS:
            product, created = Product.objects.update_or_create(
                name=data["name"],   
                defaults={"model": data["model"], "category": data["category"]},
            )

            stores = []
            for store, price, old_price in data["offers"]:
                offer, _ = StoreOffer.objects.update_or_create(
                    product=product,
                    store=store,
                    defaults={"price": Decimal(price), "old_price": Decimal(old_price)},
                )
                if not PriceHistory.objects.filter(offer=offer).exists():
                    PriceHistory.objects.create(offer=offer, price=offer.price)
                stores.append(store)

            StoreOffer.objects.filter(product=product).exclude(store__in=stores).delete()

            status = "criado" if created else "atualizado"
            self.stdout.write(f"{product.name}: {status}")

        self.stdout.write(self.style.SUCCESS("Produtos de demonstração carregados."))