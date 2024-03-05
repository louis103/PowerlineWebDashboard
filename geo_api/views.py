from django.db.models import Count
from django.contrib.gis.geos import GEOSGeometry
import psycopg2
from rest_framework.views import APIView
from datetime import datetime, timedelta
from osgeo import ogr

# Create your views here.
from rest_framework import generics
from .models import Powerline, PowerlineIncident
from .serializers import PowerlineSerializer, PowerlineIncidentSerializer
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import Point
import geopandas as gpd
import os
from django.conf import settings
import geojson
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from shapely.geometry import shape

# Load the area of study polygon from the shapefile
area_of_study_path = os.path.join(settings.STATIC_ROOT, "gis", "area_of_study.shp")
area_of_study = gpd.read_file(area_of_study_path)


# publishing powerline data
class PowerlineCreateView(generics.CreateAPIView):
    queryset = Powerline.objects.all()
    serializer_class = PowerlineSerializer

    def create(self, request, *args, **kwargs):
        # Extract latitude and longitude from the request data
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        try:
            # Try to convert latitude and longitude to float
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid latitude or longitude format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a Point geometry from the latitude and longitude
        point = Point(longitude, latitude, srid=4326)

        area_of_study_polygon = GEOSGeometry(area_of_study.geometry.unary_union.wkt)

        # Check if the point is inside the area of study polygon
        if point.within(area_of_study_polygon):
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        else:
            return Response(
                {"error": "Point is outside the area of study polygon."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# publishing powerline incident data
class PowerlineIncidentCreateView(generics.CreateAPIView):
    queryset = PowerlineIncident.objects.all()
    serializer_class = PowerlineIncidentSerializer

    def create(self, request, *args, **kwargs):
        # Extract latitude and longitude from the request data
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        try:
            # Try to convert latitude and longitude to float
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid latitude or longitude format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a Point geometry from the latitude and longitude
        point = Point(longitude, latitude, srid=4326)

        area_of_study_polygon = GEOSGeometry(area_of_study.geometry.unary_union.wkt)

        # Check if the point is inside the area of study polygon
        if point.within(area_of_study_polygon):
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        else:
            return Response(
                {"error": "Point is outside the area of study polygon."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# list all powerlines
class PowerlineListView(generics.ListAPIView):
    queryset = Powerline.objects.all()
    serializer_class = PowerlineSerializer


# list all powerline incidents
class PowerlineIncidentListView(generics.ListAPIView):
    queryset = PowerlineIncident.objects.all()
    serializer_class = PowerlineIncidentSerializer


# perform analysis interactively
@method_decorator(csrf_exempt, name="dispatch")
class AnalysisView(APIView):
    def post(self, request, *args, **kwargs):
        # Extract GeoJSON and analysis type from the request data
        geojson_data = request.data.get("geojson")
        analysis_type = request.data.get("analysis_type")
        model_name = request.data.get("model_name")

        print("geojson data: ", geojson_data)
        print("Analysis Type ", analysis_type)
        print("Model name: ", model_name)

        # Map model names to actual model classes
        model_mapping = {
            "powerline": Powerline,
            "powerline_incident": PowerlineIncident,
        }
        model_class = model_mapping.get(model_name)

        if not model_class:
            return Response({"error": "Invalid model name."}, status=400)

        data = geojson.loads(geojson_data)["geometry"]  # Load geojson from frontend
        polygon = shape(data)  # Convert geojson to polygon
        wkt = polygon.wkt  # Get polygon object as well known text
        bounding_area = GEOSGeometry(wkt)  # Initiate geometry from wkt

        # Perform the requested analysis on the specified model
        if analysis_type == "intersection":
            queryset = model_class.objects.filter(geometry__intersects=bounding_area)
        elif analysis_type == "within":
            queryset = model_class.objects.filter(geometry__within=bounding_area)
        elif analysis_type == "completely_within":
            queryset = model_class.objects.filter(
                geometry__completely_within=bounding_area
            )
        else:
            return Response({"error": "Invalid analysis type."}, status=400)

        # Serialize the queryset based on the model
        if model_class == Powerline:
            serializer = PowerlineSerializer(queryset, many=True)
        elif model_class == PowerlineIncident:
            serializer = PowerlineIncidentSerializer(queryset, many=True)

        return Response(serializer.data)


# fetch data using postgresql geopandas integration
def fetch_from_db(request):
    conn = psycopg2.connect(
        database="mydb",
        user="myuser",
        password="mypassword",
        host="localhost",
        port="5432",
    )
    if conn:
        query = "SELECT * FROM mytable"
        gdf = gpd.read_postgis(query, conn)
        print("Geodataframe: ", gdf)
    else:
        print("No geodataframe available")
    # finally close the database
    conn.close()


# Get statistics from the api
class PowerlinesStatisticsView(APIView):
    def get(self, request, *args, **kwargs):
        # 1) Get the total submission/count of powerlines and incidents
        powerline_count = Powerline.objects.count()
        incident_count = PowerlineIncident.objects.count()

        # 2) Get daily aggregates for powerlines and incidents
        today = datetime.now().date()
        powerlines_daily_aggregate = (
            Powerline.objects.filter(datetime__gte=today - timedelta(days=30))
            .values("datetime")
            .annotate(count=Count("id"))
        )
        incidents_daily_aggregate = (
            PowerlineIncident.objects.filter(
                date_of_occurrence__gte=today - timedelta(days=30)
            )
            .values("date_of_occurrence")
            .annotate(count=Count("id"))
        )

        # 3) Get the number of powerlines with transformer and broken power cables
        powerlines_with_transformer = Powerline.objects.filter(
            has_transformer=True
        ).count()
        powerlines_with_broken_cables = Powerline.objects.filter(
            has_broken_powercables=True
        ).count()

        # 4) Get the count of occurrences for powerline states, incident types, and severities
        powerline_states_count = (
            Powerline.objects.values("state")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        incident_types_count = (
            PowerlineIncident.objects.values("incident_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        incident_severities_count = (
            PowerlineIncident.objects.values("severity")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # Construct the response data
        response_data = {
            "total_powerlines": powerline_count,
            "total_incidents": incident_count,
            "powerlines_daily_aggregate": powerlines_daily_aggregate,
            "incidents_daily_aggregate": incidents_daily_aggregate,
            "powerlines_with_transformer": powerlines_with_transformer,
            "powerlines_with_broken_cables": powerlines_with_broken_cables,
            "powerline_states_count": powerline_states_count,
            "incident_types_count": incident_types_count,
            "incident_severities_count": incident_severities_count,
        }

        return Response(response_data)
