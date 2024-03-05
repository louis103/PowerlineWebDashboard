from django.db import models
from django.contrib.auth.models import User
from geo_api.models import Powerline, PowerlineIncident


class TaskAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    powerline = models.ForeignKey(
        Powerline, on_delete=models.CASCADE, null=True, blank=True
    )
    incident = models.ForeignKey(
        PowerlineIncident, on_delete=models.CASCADE, null=True, blank=True
    )
    assigned_date = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Task Assignment #{self.id} to: {self.user.username}"
