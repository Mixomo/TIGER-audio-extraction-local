"""Expose actionable error categories, never raw server exceptions or HTML."""
from .media import MediaError


def describe_error(exc):
    if isinstance(exc, MediaError):
        return {'error': exc.code}
    return {'error': 'failed'}
