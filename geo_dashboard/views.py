# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import LoginForm, SignupForm

from django.contrib.auth.decorators import login_required
from .models import TaskAssignment

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
# Home page
def index(request):
    return render(request, "index.html")


# render powerlines
def fetch_powerlines(request):
    return render(request, "maps/powerlines.html")


# show user tasks based on user id
@login_required
def user_tasks(request):
    # Fetch tasks for the logged-in user
    user_tasks = TaskAssignment.objects.filter(user=request.user, completed=False)
    context = {
        "user_tasks": user_tasks,
    }
    return render(request, "tasks/tasks.html", context)


@login_required
def get_analysis(request):
    return render(request, "analysis/analysis.html")


# Update a task completion status
@csrf_exempt  # CSRF exempt for simplicity, use proper CSRF protection in production
def update_task_status(request, task_id):
    if request.method == "POST":
        # Get the task instance
        task = TaskAssignment.objects.get(pk=task_id)

        # Update the task status
        task.completed = request.POST.get("completed".capitalize(), True)
        print(task.completed)
        task.save()

        return JsonResponse({"message": "Task status updated successfully"})
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)


# signup page
def user_signup(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
    else:
        form = SignupForm()
    return render(request, "auth/signup.html", {"form": form})


# login page
def user_login(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                return redirect("home")
    else:
        form = LoginForm()
    return render(request, "auth/login.html", {"form": form})


# logout page
def user_logout(request):
    logout(request)
    return redirect("login")
