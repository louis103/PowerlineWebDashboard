from django.urls import path
from .views import (
    PowerlineCreateView,
    PowerlineIncidentCreateView,
    PowerlineListView,
    PowerlineIncidentListView,
    AnalysisView,
    PowerlinesStatisticsView,
)
from geo_dashboard.views import update_task_status

# initialize url patterns
urlpatterns = [
    path("powerlines/", PowerlineCreateView.as_view(), name="powerline-url"),
    path("powerlines/list/", PowerlineListView.as_view(), name="powerline-list"),
    path(
        "powerline-incidents/",
        PowerlineIncidentCreateView.as_view(),
        name="powerline-incident-url",
    ),
    path(
        "powerline-incidents/list/",
        PowerlineIncidentListView.as_view(),
        name="powerline-incident-list",
    ),
    path("analyze-powerlines/", AnalysisView.as_view(), name="analyze-powerlines"),
    path(
        "powerlines-statistics/",
        PowerlinesStatisticsView.as_view(),
        name="powerlines-statistics",
    ),
    path(
        "update-task-status/<int:task_id>/complete/",
        update_task_status,
        name="update_task_status",
    ),
]
