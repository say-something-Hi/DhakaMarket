#!/bin/bash

echo "🚀 WooCommerce Docker Environment Starting..."

# Docker containers start
docker-compose up -d

echo "⏳ Waiting for containers to be ready..."
sleep 30

# WooCommerce activate
docker-compose exec wordpress wp plugin activate woocommerce --allow-root

echo "✅ WooCommerce is running!"
echo "📦 WordPress: http://localhost:8080"
echo "🔧 Admin: http://localhost:8080/wp-admin"
echo "   Username: admin"
echo "   Password: password"
