from django.contrib import admin

from .models import PriceHistory, Product, StoreOffer


class StoreOfferInline(admin.TabularInline):
    model = StoreOffer
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "model", "category"]
    search_fields = ["name", "model", "category"]
    inlines = [StoreOfferInline]


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ["offer", "price", "recorded_at"]
    list_filter = ["offer__store"]
    readonly_fields = ["offer", "price", "recorded_at"]