from django.conf import settings
from rest_framework.pagination import PageNumberPagination


class PrescriptionPagination(PageNumberPagination):
    """Pagination for prescription list: 10 items per page by default, max from settings."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = getattr(settings, "MAX_PAGE_SIZE", 100)
