"""Management command to seed demo data for development."""
import random
from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from market.models import Region, Vessel, MarketRate


class Command(BaseCommand):
    help = 'Seeds demo vessels, regions, and market rate data'

    def handle(self, *args, **options):
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@princepharma.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user: admin / admin123'))

        # Create office user
        if not User.objects.filter(username='user').exists():
            User.objects.create_user('user', 'user@princepharma.com', 'user123')
            self.stdout.write(self.style.SUCCESS('Created office user: user / user123'))

        admin = User.objects.get(username='admin')

        # Regions
        regions_data = [
            ('East Asia', 'EA', 'Eastern Asian shipping lanes'),
            ('Southeast Asia', 'SEA', 'Southeast Asian ports'),
            ('Middle East', 'ME', 'Middle East Gulf routes'),
            ('Europe', 'EU', 'European trade routes'),
            ('Americas', 'AM', 'North and South American routes'),
        ]
        regions = {}
        for name, code, desc in regions_data:
            r, _ = Region.objects.get_or_create(code=code, defaults={'name': name, 'description': desc})
            regions[code] = r

        # Vessels
        vessels_data = [
            ('East Bangkok', 'IMO1001', 'Bulk Carrier', 'EA'),
            ('Pacific Star', 'IMO1002', 'Tanker', 'SEA'),
            ('Gulf Trader', 'IMO1003', 'Container', 'ME'),
            ('Atlantic Crown', 'IMO1004', 'Bulk Carrier', 'EU'),
            ('Americas Pride', 'IMO1005', 'Tanker', 'AM'),
        ]
        vessels = []
        for name, imo, vtype, region_code in vessels_data:
            v, _ = Vessel.objects.get_or_create(
                imo_number=imo,
                defaults={'name': name, 'vessel_type': vtype, 'region': regions[region_code]}
            )
            vessels.append(v)

        # Generate 5 months of daily data
        start_date = date(2025, 5, 1)
        end_date = date(2025, 9, 30)
        hs_codes = ['HS1_38', 'HS2_71', 'HS3_15', 'HS4_89', 'HS5_27']

        created = 0
        current = start_date
        while current <= end_date:
            for i, vessel in enumerate(vessels):
                base_hire = Decimal(str(random.uniform(95, 125)))
                base_market = Decimal(str(random.uniform(100, 130)))
                _, was_created = MarketRate.objects.get_or_create(
                    vessel=vessel,
                    region=vessel.region,
                    date=current,
                    defaults={
                        'hire_rate': round(base_hire, 2),
                        'market_rate': round(base_market, 2),
                        'hs_code': hs_codes[i],
                        'entered_by': admin,
                    }
                )
                if was_created:
                    created += 1
            current += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} market rate entries across {len(vessels)} vessels.'))
