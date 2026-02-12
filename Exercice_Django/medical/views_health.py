from django.http import JsonResponse


def health(request):
    """Health check endpoint for monitoring / load balancers. GET only."""
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed"}, status=405)
    return JsonResponse(
        {
            "status": "ok",
            "version": "1.0",
        },
        status=200,
    )
