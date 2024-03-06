from django.contrib import admin
from django.contrib.gis.db import models
from .models import PowerlineIncident, Powerline
from leaflet.admin import LeafletGeoAdmin


# Register your models here.
class PowerlineAdmin(LeafletGeoAdmin):
    list_display = (
        "id",
        "state",
        "structural_type",
        "datetime",
        "has_transformer",
        "condition_of_transformer",
        "has_broken_powercables",
        "count_of_broken_cables",
        "latitude",
        "longitude",
        "accuracy",
        "altitude",
    )
    search_fields = (
        "state",
        "structural_type",
        "has_transformer",
        "has_broken_powercables",
    )
    list_filter = ("state", "structural_type", "datetime")


class PowerlineIncidentsAdmin(LeafletGeoAdmin):
    list_display = (
        "incident_type",
        "severity",
        "date_of_occurrence",
        "time_of_occurrence",
        "photo_of_incident",
        "latitude",
        "longitude",
    )
    search_fields = ("incident_type", "severity")
    list_filter = (
        "incident_type",
        "severity",
        "time_of_occurrence",
        "date_of_occurrence",
    )


# Register in the admin dashboard
admin.site.register(Powerline, PowerlineAdmin)
admin.site.register(PowerlineIncident, PowerlineIncidentsAdmin)
