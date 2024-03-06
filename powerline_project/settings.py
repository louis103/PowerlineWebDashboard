"""
Django settings for powerline_project project.

Generated by 'django-admin startproject' using Django 4.2.9.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# configuring GDAL path
# GDAL_LIBRARY_PATH = r"env\Lib\site-packages\osgeo\gdal304.dll"
# GEOS_LIBRARY_PATH = r"env\Lib\site-packages\osgeo\geos_c.dll"

# configure GDAL for heroku in production
GDAL_LIBRARY_PATH = os.environ.get("GDAL_LIBRARY_PATH")
GEOS_LIBRARY_PATH = os.environ.get("GEOS_LIBRARY_PATH")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")
# SECRET_KEY = "This_is_my_secret_key_but_it_is_unsecure"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "127.0.0.1:8000",
    "*",
    "powerline-monitoring-dashboard-ba1f4f6d707e.herokuapp.com/",
    "powerline-monitoring-dashboard-ba1f4f6d707e.herokuapp.com",
]


# Application definition

INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "geo_api",
    "geo_dashboard",
    "rest_framework",
    "rest_framework_gis",
    "leaflet",
    "django.contrib.gis",
    "corsheaders",
    "crispy_forms",
    # "mapwidgets",
]

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1",
    "https://powerline-monitoring-dashboard-ba1f4f6d707e.herokuapp.com",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # whitenoise middleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "powerline_project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "django.template.context_processors.media",
            ],
        },
    },
]

WSGI_APPLICATION = "powerline_project.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# DATABASES = {
#     "default": {
#         "ENGINE": "django.contrib.gis.db.backends.postgis",
#         "NAME": "powerlines_db",
#         "USER": "postgres",
#         "PASSWORD": "1965",
#         "HOST": "localhost",
#         "PORT": "5435",
#     }
# }

# new database from Digital Ocean Cloud
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASS"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT"),
    }
}

# Configure your DRF settings in settings.py
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_PARSER_CLASSES": ("rest_framework.parsers.JSONParser",),
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Africa/Nairobi"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# STATIC_URL = "static/"
STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
# Define the location for static files collected using 'python manage.py collectstatic'
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Media files (uploaded by users)
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "mediafiles")

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# disable the forward slash in url
APPEND_SLASH = False

# import os
# STATIC_URL = '/static/'
# STATIC_ROOT= os.path.join(BASE_DIR, 'staticfiles')
# STATICFILES_DIR = {
#     os.path.join(BASE_DIR, 'public/static')
# }
# MEDIA_ROOT = os.path.join(BASE_DIR, 'public/static')
# MEDIA_URL = '/media/'

CRISPY_TEMPLATE_PACK = "bootstrap5"

LEAFLET_CONFIG = {
    # you can use your own
    "DEFAULT_CENTER": (38.2084547, -1.846384),
    "DEFAULT_ZOOM": 5,
    "MAX_ZOOM": 20,
    "MIN_ZOOM": 11,
    "SCALE": "both",
    "ATTRIBUTION_PREFIX": "My Custom Leaflet map",
}
