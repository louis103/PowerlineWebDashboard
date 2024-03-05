from django.contrib.gis.geos import Point
from django.contrib.gis.db import models


# powerlines model
class Powerline(models.Model):
    state = models.CharField(max_length=45)
    structural_type = models.CharField(
        max_length=45, blank=False, null=False, default="Wooden"
    )
    datetime = models.DateField(auto_now_add=False)
    photo_of_powerline = models.CharField(max_length=1000)
    has_transformer = models.BooleanField(default=False)
    condition_of_transformer = models.CharField(max_length=45, null=True, blank=True)
    photo_of_transformer = models.CharField(max_length=1000, null=True, blank=True)
    has_broken_powercables = models.BooleanField(default=False)
    count_of_broken_cables = models.IntegerField(null=True, blank=True)
    photo_of_powercables = models.CharField(max_length=1000, null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy = models.FloatField(blank=True, null=True)
    altitude = models.FloatField(blank=True, null=True)
    geometry = models.PointField(srid=4326, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Set the geometry field based on latitude and longitude
        self.geometry = Point(self.longitude, self.latitude, srid=4326)
        super(Powerline, self).save(*args, **kwargs)

    def __str__(self):
        return (
            f'A "{self.state}" Powerline located at ({self.latitude}, {self.longitude}'
        )


# powerline incident model
class PowerlineIncident(models.Model):
    incident_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=45)
    date_of_occurrence = models.DateField(auto_now_add=True)
    time_of_occurrence = models.TimeField(auto_now_add=True)
    photo_of_incident = models.CharField(max_length=1000)
    latitude = models.FloatField()
    longitude = models.FloatField()
    geometry = models.PointField(srid=4326, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Set the geometry field based on latitude and longitude
        self.geometry = Point(self.longitude, self.latitude, srid=4326)
        super(PowerlineIncident, self).save(*args, **kwargs)

    def __str__(self):
        return f'"{self.incident_type}" incident located at ({self.latitude}, {self.longitude}'
