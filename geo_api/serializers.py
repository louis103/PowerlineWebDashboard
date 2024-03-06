from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Powerline, PowerlineIncident


class PowerlineSerializer(GeoFeatureModelSerializer):

    class Meta:
        model = Powerline
        geo_field = "geometry"
        fields = "__all__"


class PowerlineIncidentSerializer(GeoFeatureModelSerializer):

    class Meta:
        model = PowerlineIncident
        geo_field = "geometry"
        fields = "__all__"
