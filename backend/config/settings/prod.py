from .base import *
import os

DEBUG = False

CDN_URL = os.environ.get('CDN_URL', '')

CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 'https://bridgein.pt'
).split(',')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

if CDN_URL:
    STATIC_URL = f'{CDN_URL}/static/'
else:
    STATIC_URL = '/static/'

WHITENOISE_ROOT = FRONTEND_DIST_DIR
WHITENOISE_MAX_AGE = 31536000  # 1 ano

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
