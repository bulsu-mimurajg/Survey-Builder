from django import template

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """Get item from dictionary by key"""
    if dictionary is None:
        return None
    return dictionary.get(key)

@register.filter
def make_range(value):
    """Create a range from 1 to value (inclusive)"""
    try:
        return range(1, int(value) + 1)
    except (ValueError, TypeError):
        return range(1, 6)  # default to 5
