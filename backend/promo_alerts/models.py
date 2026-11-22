from django.db import models


class Product(models.Model):
    name = models.CharField("produto", max_length=200)
    model = models.CharField("modelo", max_length=200, blank=True)
    category = models.CharField("categoria", max_length=100)

    class Meta:
        verbose_name = "produto"
        verbose_name_plural = "produtos"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StoreOffer(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="offers",
        verbose_name="produto",
    )
    store = models.CharField("loja", max_length=100)
    price = models.DecimalField("preço", max_digits=10, decimal_places=2)
    old_price = models.DecimalField("preço anterior", max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "oferta"
        verbose_name_plural = "ofertas"
        ordering = ["price"]

    def __str__(self):
        return f"{self.product} na {self.store}"

    def save(self, *args, **kwargs):
        price_changed = True
        if self.pk:
            previous_price = (
                StoreOffer.objects.filter(pk=self.pk)
                .values_list("price", flat=True)
                .first()
            )
            price_changed = previous_price != self.price

        super().save(*args, **kwargs)

        if price_changed:
            PriceHistory.objects.create(offer=self, price=self.price)


class PriceHistory(models.Model):
    offer = models.ForeignKey(
        StoreOffer,
        on_delete=models.CASCADE,
        related_name="history",
        verbose_name="oferta",
    )
    price = models.DecimalField("preço", max_digits=10, decimal_places=2)
    recorded_at = models.DateTimeField("registrado em", auto_now_add=True)

    class Meta:
        verbose_name = "registro de preço"
        verbose_name_plural = "histórico de preços"
        ordering = ["recorded_at"]

    def __str__(self):
        return f"{self.offer}: R$ {self.price}"