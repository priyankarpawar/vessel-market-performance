from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/me/', views.me, name='me'),

    # Regions
    path('regions/', views.RegionListCreateView.as_view(), name='region-list'),
    path('regions/<int:pk>/', views.RegionDetailView.as_view(), name='region-detail'),

    # Vessels
    path('vessels/', views.VesselListCreateView.as_view(), name='vessel-list'),
    path('vessels/<int:pk>/', views.VesselDetailView.as_view(), name='vessel-detail'),

    # Market Rates (per vessel/region)
    path('market-rates/', views.MarketRateListCreateView.as_view(), name='marketrate-list'),
    path('market-rates/<int:pk>/', views.MarketRateDetailView.as_view(), name='marketrate-detail'),

    # Aggregated across all vessels
    path('performance/aggregated/', views.aggregated_performance, name='aggregated-performance'),

    # Dashboard summary cards
    path('dashboard/summary/', views.dashboard_summary, name='dashboard-summary'),
]
