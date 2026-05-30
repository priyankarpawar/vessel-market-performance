from django.db import models
from django.contrib.auth.models import User


class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Vessel(models.Model):
    name = models.CharField(max_length=100)
    imo_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    vessel_type = models.CharField(max_length=50, blank=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, related_name='vessels')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class MarketRate(models.Model):
    """
    Daily market rate entry per vessel per region.
    Only Admins can create/update these.
    HS Code is stored here — visible only to Admins on per-vessel view.
    """
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='market_rates')
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='market_rates')
    date = models.DateField()
    hire_rate = models.DecimalField(max_digits=12, decimal_places=2, help_text='Daily hire rate in USD')
    market_rate = models.DecimalField(max_digits=12, decimal_places=2, help_text='Market benchmark rate in USD')
    hs_code = models.CharField(max_length=50, blank=True, help_text='HS Commodity Code')
    notes = models.TextField(blank=True)
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='entered_rates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('vessel', 'region', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.vessel.name} | {self.region.name} | {self.date} | Hire:{self.hire_rate} Market:{self.market_rate}"
