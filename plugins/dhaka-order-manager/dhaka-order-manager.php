<?php
/**
 * Plugin Name: Dhaka Market Order Manager
 * Description: Automatically send orders to bot system
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class DhakaMarketOrderManager {
    
    private $bot_url = 'http://localhost:3000'; // আপনার bot server address
    
    public function __construct() {
        // Order creation hook
        add_action('woocommerce_new_order', array($this, 'handle_new_order'), 10, 1);
        
        // Order status change hook
        add_action('woocommerce_order_status_changed', array($this, 'handle_status_change'), 10, 3);
        
        // Admin page
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Test connection
        add_action('wp_ajax_test_bot_connection', array($this, 'test_bot_connection'));
    }
    
    public function handle_new_order($order_id) {
        $order = wc_get_order($order_id);
        $this->send_to_bot($order, 'new_order');
        
        error_log("🛍️ New order #{$order_id} sent to bot");
    }
    
    public function handle_status_change($order_id, $old_status, $new_status) {
        $order = wc_get_order($order_id);
        $this->send_to_bot($order, 'status_update');
        
        error_log("📊 Order #{$order_id} status changed: {$old_status} → {$new_status}");
    }
    
    private function send_to_bot($order, $action) {
        $order_data = array(
            'action' => $action,
            'order_id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'customer' => array(
                'name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
                'phone' => $order->get_billing_phone(),
                'email' => $order->get_billing_email(),
                'address' => $order->get_billing_address_1() . ', ' . $order->get_billing_city()
            ),
            'items' => $this->get_order_items($order),
            'total' => $order->get_total(),
            'payment_method' => $order->get_payment_method_title(),
            'order_date' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'store' => 'Dhaka Market Trimmer'
        );
        
        $response = wp_remote_post($this->bot_url . '/webhook/order', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($order_data),
            'timeout' => 10,
            'blocking' => false // Don't wait for response
        ));
        
        if (is_wp_error($response)) {
            error_log('❌ Bot connection failed: ' . $response->get_error_message());
        } else {
            error_log('✅ Order data sent to bot successfully');
        }
    }
    
    private function get_order_items($order) {
        $items = array();
        foreach ($order->get_items() as $item) {
            $items[] = array(
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'price' => $item->get_total()
            );
        }
        return $items;
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Order Bot Settings',
            'Order Bot',
            'manage_options',
            'dhaka-bot-settings',
            array($this, 'admin_settings_page'),
            'dashicons-robot',
            56
        );
    }
    
    public function admin_settings_page() {
        ?>
        <div class="wrap">
            <h1>Dhaka Market Bot Settings</h1>
            
            <div class="card">
                <h2>Bot Connection Status</h2>
                <button id="testConnection" class="button button-primary">Test Bot Connection</button>
                <div id="testResult" style="margin-top: 10px;"></div>
            </div>
            
            <div class="card">
                <h2>Recent Orders Sync</h2>
                <p>All new orders will automatically sync with the bot system.</p>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Sync Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $this->display_recent_orders(); ?>
                    </tbody>
                </table>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#testConnection').click(function() {
                $.post(ajaxurl, {action: 'test_bot_connection'}, function(response) {
                    $('#testResult').html('<div class="notice notice-' + (response.success ? 'success' : 'error') + '"><p>' + response.data + '</p></div>');
                });
            });
        });
        </script>
        <?php
    }
    
    public function test_bot_connection() {
        $test_data = array(
            'action' => 'test',
            'message' => 'Connection test from WordPress',
            'timestamp' => current_time('mysql')
        );
        
        $response = wp_remote_post($this->bot_url . '/webhook/test', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($test_data),
            'timeout' => 5
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('❌ Bot connection failed: ' . $response->get_error_message());
        } else {
            wp_send_json_success('✅ Bot connection successful!');
        }
    }
    
    private function display_recent_orders() {
        $orders = wc_get_orders(array('limit' => 10));
        
        if (empty($orders)) {
            echo '<tr><td colspan="5">No orders found</td></tr>';
            return;
        }
        
        foreach ($orders as $order) {
            echo '<tr>';
            echo '<td>#' . $order->get_order_number() . '</td>';
            echo '<td>' . $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() . '</td>';
            echo '<td>৳' . $order->get_total() . '</td>';
            echo '<td>' . ucfirst($order->get_status()) . '</td>';
            echo '<td><span style="color: green;">✅ Synced</span></td>';
            echo '</tr>';
        }
    }
}

new DhakaMarketOrderManager();

// Create sample trimmer product on activation
register_activation_hook(__FILE__, 'dhaka_market_create_sample_product');

function dhaka_market_create_sample_product() {
    if (!class_exists('WC_Product_Simple')) {
        return;
    }
    
    $product = new WC_Product_Simple();
    $product->set_name('3 IN 1 Hair Trimmer Machine for Men & Women');
    $product->set_regular_price('880');
    $product->set_sale_price('580');
    $product->set_description('Professional 3 IN 1 Hair Trimmer Machine for Men & Women. Perfect for hair cutting, trimming, and styling.');
    $product->set_short_description('Premium Quality Hair Trimmer with 1 Year Warranty');
    $product->set_sku('TRIM-3IN1-001');
    $product->set_stock_status('instock');
    $product->set_stock_quantity(45);
    $product->set_manage_stock(true);
    $product->save();
}
?>
