#!/bin/bash
cd ~/ml-validator
screen -dmS mlvalidator bash -c "source venv/bin/activate && python3 server.py"
screen -dmS polling bash -c "source venv/bin/activate && python3 photo_processor_polling.py"
screen -dmS webhook bash -c "source venv/bin/activate && python3 supabase_webhook.py"
echo "✅ Servicios iniciados en background"
screen -ls
