from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Region, Vessel, MarketRate


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_admin']

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser


class RegionSerializer(serializers.ModelSerializer):
    vessel_count = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = ['id', 'name', 'code', 'description', 'vessel_count', 'created_at']

    def get_vessel_count(self, obj):
        return obj.vessels.filter(is_active=True).count()


class VesselSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Vessel
        fields = ['id', 'name', 'imo_number', 'vessel_type', 'region', 'region_name', 'is_active', 'created_at']


class MarketRateSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    region_name = serializers.CharField(source='region.name', read_only=True)
    entered_by_username = serializers.CharField(source='entered_by.username', read_only=True)
    # hs_code is excluded by default — exposed only when is_admin=True via the view

    class Meta:
        model = MarketRate
        fields = [
            'id', 'vessel', 'vessel_name', 'region', 'region_name',
            'date', 'hire_rate', 'market_rate', 'hs_code',
            'notes', 'entered_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['entered_by', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # Hide hs_code from non-admin users
        if request and not (request.user.is_staff or request.user.is_superuser):
            data.pop('hs_code', None)
        return data


class MarketRateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketRate
        fields = ['vessel', 'region', 'date', 'hire_rate', 'market_rate', 'hs_code', 'notes']

    def create(self, validated_data):
        validated_data['entered_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['entered_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class AggregatedRateSerializer(serializers.Serializer):
    date = serializers.DateField()
    hire_rate_sum = serializers.DecimalField(max_digits=15, decimal_places=2)
    market_rate_sum = serializers.DecimalField(max_digits=15, decimal_places=2)
    vessel_count = serializers.IntegerField()
