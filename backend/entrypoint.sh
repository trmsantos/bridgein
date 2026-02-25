#!/bin/sh
set -e

echo 'Waiting for database...'
sleep 2

echo 'Running migrations...'
python manage.py migrate --noinput

echo 'Starting Django development server...'
exec python manage.py runserver 0.0.0.0:8000
