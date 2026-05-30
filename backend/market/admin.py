from django.contrib import admin
from .models import Region, Vessel, MarketRate


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'description', 'created_at']
    search_fields = ['name', 'code']


@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ['name', 'imo_number', 'vessel_type', 'region', 'is_active', 'created_at']
    list_filter = ['region', 'is_active']
    search_fields = ['name', 'imo_number']


@admin.register(MarketRate)
class MarketRateAdmin(admin.ModelAdmin):
    list_display = ['vessel', 'region', 'date', 'hire_rate', 'market_rate', 'hs_code', 'entered_by']
    list_filter = ['region', 'vessel', 'date']
    search_fields = ['vessel__name', 'hs_code']
    date_hierarchy = 'date'
