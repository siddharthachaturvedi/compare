#!/bin/bash
gunicorn --bind=0.0.0.0 --timeout 600 --workers 3 --log-level=info "app:app"
