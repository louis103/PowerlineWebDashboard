from django.contrib import admin
from .models import TaskAssignment


# Register your models here.
@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "powerline", "incident", "assigned_date", "completed")
    list_filter = ("completed",)
    search_fields = ("user__username", "powerline__id", "incident__id")
