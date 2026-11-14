from django.contrib import admin

from .models import Product, StoreOffer


class StoreOfferInline(admin.TabularInline):
    model = StoreOffer
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "model", "category"]
    search_fields = ["name", "model", "category"]
    inlines = [StoreOfferInline]