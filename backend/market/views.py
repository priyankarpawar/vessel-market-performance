from django.db.models import Sum, Count
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Region, Vessel, MarketRate
from .serializers import (
    UserSerializer, RegionSerializer, VesselSerializer,
    MarketRateSerializer, MarketRateCreateSerializer, AggregatedRateSerializer
)
from .permissions import IsAdminOrReadOnly, IsAdminUser


# ─── Auth / Profile ────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return current user profile with role."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ─── Regions ───────────────────────────────────────────────────────────────────

class RegionListCreateView(generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdminOrReadOnly]


class RegionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdminOrReadOnly]


# ─── Vessels ───────────────────────────────────────────────────────────────────

class VesselListCreateView(generics.ListCreateAPIView):
    serializer_class = VesselSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Vessel.objects.select_related('region').filter(is_active=True)
        region_id = self.request.query_params.get('region')
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs


class VesselDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vessel.objects.select_related('region')
    serializer_class = VesselSerializer
    permission_classes = [IsAdminOrReadOnly]


# ─── Market Rates ──────────────────────────────────────────────────────────────

class MarketRateListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MarketRateCreateSerializer
        return MarketRateSerializer

    def get_queryset(self):
        qs = MarketRate.objects.select_related('vessel', 'region', 'entered_by')
        params = self.request.query_params

        vessel_id = params.get('vessel')
        region_id = params.get('region')
        date_from = params.get('date_from')
        date_to = params.get('date_to')

        if vessel_id:
            qs = qs.filter(vessel_id=vessel_id)
        if region_id:
            qs = qs.filter(region_id=region_id)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs.order_by('date')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MarketRateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MarketRate.objects.select_related('vessel', 'region', 'entered_by')
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return MarketRateCreateSerializer
        return MarketRateSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


# ─── Aggregated Performance ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def aggregated_performance(request):
    """
    Returns daily sum of hire_rate and market_rate across ALL vessels.
    HS Codes are NOT included in this view (per spec).
    Supports optional date_from / date_to filters.
    """
    qs = MarketRate.objects.all()
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')

    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)

    results = (
        qs.values('date')
        .annotate(
            hire_rate_sum=Sum('hire_rate'),
            market_rate_sum=Sum('market_rate'),
            vessel_count=Count('vessel', distinct=True),
        )
        .order_by('date')
    )

    serializer = AggregatedRateSerializer(results, many=True)
    return Response(serializer.data)


# ─── Dashboard Summary ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Quick stats card data for the dashboard."""
    total_vessels = Vessel.objects.filter(is_active=True).count()
    total_regions = Region.objects.count()
    total_entries = MarketRate.objects.count()

    latest = MarketRate.objects.order_by('-date').first()
    latest_date = str(latest.date) if latest else None

    return Response({
        'total_vessels': total_vessels,
        'total_regions': total_regions,
        'total_entries': total_entries,
        'latest_entry_date': latest_date,
    })
