from django.urls import path
from . import views

urlpatterns = [
    path('<str:company_name>', views.getData)
]