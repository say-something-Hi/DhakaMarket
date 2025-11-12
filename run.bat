@echo off
echo 🚀 WooCommerce Docker Environment Starting...

docker-compose up -d

echo ⏳ Waiting for containers to be ready...
timeout /t 30 /nobreak

docker-compose exec wordpress wp plugin activate woocommerce --allow-root

echo ✅ WooCommerce is running!
echo 📦 WordPress: http://localhost:8080
echo 🔧 Admin: http://localhost:8080/wp-admin
echo    Username: admin
echo    Password: password
