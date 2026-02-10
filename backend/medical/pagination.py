from rest_framework.pagination import PageNumberPagination


class PrescriptionPagination(PageNumberPagination):
    """Pagination for prescription list: 10 items per page by default."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
