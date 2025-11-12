<?php
/**
 * Plugin Name: Dhaka Market Bot
 * Plugin URI: https://github.com/woocommerce/woocommerce
 * Description: WooCommerce order integration with Dhaka Market Bot
 * Version: 1.0.0
 * Author: Dhaka Market Team
 * Text Domain: dhaka-market-bot
 */

defined( 'ABSPATH' ) || exit;

class DhakaMarketBotIntegration {

    private $bot_url = 'http://bot:3000';

    public function __construct() {
        add_action( 'woocommerce_new_order', array( $this, 'handle_new_order' ), 10, 2 );
        add_action( 'woocommerce_order_status_changed', array( $this, 'handle_status_change' ), 10, 4 );
        
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'add_plugin_links' ) );
    }

    public function handle_new_order( $order_id, $order ) {
        $this->send_to_bot( $order, 'new_order' );
        
        error_log( "Dhaka Market: New order #{$order_id} sent to bot" );
    }

    public function handle_status_change( $order_id, $old_status, $new_status, $order ) {
        $this->send_to_bot( $order, 'status_update' );
        
        error_log( "Dhaka Market: Order #{$order_id} status changed {$old_status} → {$new_status}" );
    }

    private function send_to_bot( $order, $action ) {
        $order_data = array(
            'action'        => $action,
            'order_id'      => $order->get_id(),
            'order_number'  => $order->get_order_number(),
            'status'        => $order->get_status(),
            'customer'      => array(
                'name'    => $order->get_formatted_billing_full_name(),
                'phone'   => $order->get_billing_phone(),
                'email'   => $order->get_billing_email(),
                'address' => $this->get_formatted_address( $order ),
            ),
            'items'         => $this->get_order_items( $order ),
            'total'         => $order->get_total(),
            'payment_method' => $order->get_payment_method_title(),
            'order_date'    => $order->get_date_created()->format( 'c' ),
        );

        wp_remote_post(
            $this->bot_url . '/webhook/order',
            array(
                'headers' => array( 'Content-Type' => 'application/json' ),
                'body'    => wp_json_encode( $order_data ),
                'timeout' => 10,
            )
        );
    }

    private function get_formatted_address( $order ) {
        $address_parts = array(
            $order->get_billing_address_1(),
            $order->get_billing_address_2(),
            $order->get_billing_city(),
            $order->get_billing_state(),
            $order->get_billing_postcode(),
            $order->get_billing_country(),
        );

        return implode( ', ', array_filter( $address_parts ) );
    }

    private function get_order_items( $order ) {
        $items = array();
        
        foreach ( $order->get_items() as $item ) {
            $items[] = array(
                'name'     => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'price'    => $item->get_total(),
            );
        }
        
        return $items;
    }

    public function add_admin_menu() {
        add_menu_page(
            __( 'Dhaka Market', 'dhaka-market-bot' ),
            __( 'Dhaka Market', 'dhaka-market-bot' ),
            'manage_woocommerce',
            'dhaka-market',
            array( $this, 'admin_page' ),
            'dashicons-store',
            56
        );
    }

    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'Dhaka Market Bot Integration', 'dhaka-market-bot' ); ?></h1>
            
            <div class="card">
                <h2><?php esc_html_e( 'Order Management System', 'dhaka-market-bot' ); ?></h2>
                <p><?php esc_html_e( 'All WooCommerce orders are automatically synchronized with the Dhaka Market bot system.', 'dhaka-market-bot' ); ?></p>
                
                <h3><?php esc_html_e( 'Quick Links', 'dhaka-market-bot' ); ?></h3>
                <p>
                    <a href="http://localhost:3000" target="_blank" class="button button-primary">🤖 Bot Dashboard</a>
                    <a href="http://localhost:3000/dashboard" target="_blank" class="button">📊 Order Dashboard</a>
                    <a href="http://localhost:3000/api/orders" target="_blank" class="button">🔗 Orders API</a>
                </p>
            </div>
            
            <div class="card">
                <h3><?php esc_html_e( 'System Information', 'dhaka-market-bot' ); ?></h3>
                <p><strong><?php esc_html_e( 'Bot URL:', 'dhaka-market-bot' ); ?></strong> <?php echo esc_url( $this->bot_url ); ?></p>
                <p><strong><?php esc_html_e( 'Integration:', 'dhaka-market-bot' ); ?></strong> WooCommerce Monorepo</p>
            </div>
        </div>

        <style>
            .card {
                background: #fff;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
        </style>
        <?php
    }

    public function add_plugin_links( $links ) {
        $plugin_links = array(
            '<a href="' . admin_url( 'admin.php?page=dhaka-market' ) . '">' . __( 'Settings', 'dhaka-market-bot' ) . '</a>',
        );
        
        return array_merge( $plugin_links, $links );
    }
}

new DhakaMarketBotIntegration();
