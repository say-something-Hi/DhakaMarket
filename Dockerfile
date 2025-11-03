FROM wordpress:latest

# WooCommerce plugin কপি করা
COPY . /var/www/html/wp-content/plugins/woocommerce

# পারমিশন ঠিক করা
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
