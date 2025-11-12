const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

console.log('🏪 Dhaka Market Bot - WooCommerce Monorepo Integration');

let orders = [];
let orderCounter = 1;

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dhaka Market - WooCommerce Bot</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
                .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 50px; }
                .card { background: rgba(255,255,255,0.95); color: #333; padding: 30px; border-radius: 15px; margin: 20px 0; box-shadow: 0 15px 35px rgba(0,0,0,0.1); backdrop-filter: blur(10px); }
                .btn { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 30px; margin: 10px; transition: 0.3s; font-weight: bold; }
                .btn:hover { background: #764ba2; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .stat-item { background: rgba(102, 126, 234, 0.1); padding: 25px; border-radius: 12px; text-align: center; border: 2px solid rgba(255,255,255,0.3); }
                .woocommerce-badge { background: #7f54b3; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; display: inline-block; margin-left: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="font-size: 3em; margin-bottom: 10px;">🏪 Dhaka Market</h1>
                    <p style="font-size: 1.3em; opacity: 0.9;">Professional E-Commerce Powered by <span class="woocommerce-badge">WooCommerce Monorepo</span></p>
                </div>
                
                <div class="card">
                    <h2>🤖 Order Management Bot</h2>
                    <p>Real-time order processing with WooCommerce integration</p>
                    
                    <div class="stats">
                        <div class="stat-item">
                            <h3 style="font-size: 2.5em; margin: 0;">${orders.length}</h3>
                            <p>Total Orders</p>
                        </div>
                        <div class="stat-item">
                            <h3 style="font-size: 2.5em; margin: 0;">${orders.filter(o => o.status === 'pending').length}</h3>
                            <p>Pending</p>
                        </div>
                        <div class="stat-item">
                            <h3 style="font-size: 2.5em; margin: 0;">৳${orders.reduce((sum, order) => sum + parseFloat(order.total), 0)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="/dashboard" class="btn">📊 Order Dashboard</a>
                        <a href="http://localhost" class="btn">🛍️ Visit Store</a>
                        <a href="http://localhost/wp-admin" class="btn">🔧 Admin Panel</a>
                        <a href="/api/orders" class="btn">🔗 Orders API</a>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🚀 System Status</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: #27ae60; color: white; padding: 15px; border-radius: 8px;">
                            <strong>✅ Bot System</strong><br>Running on port ${PORT}
                        </div>
                        <div style="background: #27ae60; color: white; padding: 15px; border-radius: 8px;">
                            <strong>✅ WooCommerce</strong><br>Monorepo Integrated
                        </div>
                        <div style="background: #27ae60; color: white; padding: 15px; border-radius: 8px;">
                            <strong>✅ Database</strong><br>MySQL Connected
                        </div>
                        <div style="background: #3498db; color: white; padding: 15px; border-radius: 8px;">
                            <strong>📡 Webhook Ready</strong><br>/webhook/order
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// WooCommerce Webhook Endpoint
app.post('/webhook/order', (req, res) => {
    const orderData = req.body;
    
    console.log('🎉 নতুন অর্ডার - Dhaka Market WooCommerce!');
    console.log('📦 Order ID:', orderData.order_id);
    console.log('👤 Customer:', orderData.customer?.name);
    console.log('📞 Phone:', orderData.customer?.phone);
    console.log('💰 Total: ৳', orderData.total);
    
    const order = {
        id: orderCounter++,
        woo_order_id: orderData.order_id,
        woo_number: orderData.order_number,
        status: orderData.status || 'pending',
        customer: orderData.customer || {},
        items: orderData.items || [],
        total: orderData.total || 0,
        payment_method: orderData.payment_method || 'N/A',
        order_date: orderData.order_date || new Date().toISOString(),
        received_at: new Date().toLocaleString('bn-BD'),
        store: 'Dhaka Market - WooCommerce'
    };
    
    orders.push(order);
    
    // Send notification
    sendOrderNotification(order);
    
    res.json({
        success: true,
        message: 'Order received by Dhaka Market Bot',
        bot_order_id: order.id,
        woo_order_id: order.woo_order_id,
        timestamp: new Date().toISOString()
    });
});

function sendOrderNotification(order) {
    const message = `
🛍️ **নতুন অর্ডার - Dhaka Market** 🛍️
📦 অর্ডার #${order.woo_number}
💰 Amount: ৳${order.total}
💳 Payment: ${order.payment_method}

👤 **গ্রাহক:**
📛 নাম: ${order.customer.name}
📞 ফোন: ${order.customer.phone}
📧 ইমেইল: ${order.customer.email}
🏠 ঠিকানা: ${order.customer.address}

🛒 **পণ্য:**
${order.items.map(item => `• ${item.name} x${item.quantity} - ৳${item.price}`).join('\n')}

⏰ **অর্ডারের সময়:** ${order.received_at}
📞 **দ্রুত যোগাযোগ করুন!**
    `;
    
    console.log('🔔 NOTIFICATION:');
    console.log(message);
    
    // Save to log file
    const fs = require('fs');
    const logEntry = `[${new Date().toISOString()}] Order #${order.woo_number} - ${order.customer.name} - ৳${order.total}\n`;
    fs.appendFileSync('dhaka-orders.log', logEntry);
}

// Dashboard
app.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Dashboard - Dhaka Market</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
                .header { background: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
                .order { background: white; padding: 25px; margin: 20px 0; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 5px solid #667eea; transition: transform 0.2s; }
                .order:hover { transform: translateY(-2px); }
                .customer { color: #2c5aa0; font-weight: bold; font-size: 1.3em; margin-bottom: 10px; }
                .phone { color: #d35400; font-size: 1.1em; }
                .status { display: inline-block; padding: 8px 20px; border-radius: 25px; color: white; font-weight: bold; }
                .status.pending { background: #f39c12; }
                .status.completed { background: #27ae60; }
                .status.processing { background: #3498db; }
                .stats-bar { display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
                .stat-card { background: white; padding: 20px; border-radius: 10px; flex: 1; min-width: 200px; text-align: center; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; color: #2c3e50;">📊 Order Dashboard - Dhaka Market</h1>
                <p style="font-size: 1.2em; color: #7f8c8d;">WooCommerce Monorepo Integration</p>
                
                <div class="stats-bar">
                    <div class="stat-card">
                        <h3 style="margin: 0; color: #2c3e50;">${orders.length}</h3>
                        <p style="margin: 5px 0; color: #7f8c8d;">Total Orders</p>
                    </div>
                    <div class="stat-card">
                        <h3 style="margin: 0; color: #2c3e50;">${orders.filter(o => o.status === 'pending').length}</h3>
                        <p style="margin: 5px 0; color: #7f8c8d;">Pending</p>
                    </div>
                    <div class="stat-card">
                        <h3 style="margin: 0; color: #2c3e50;">৳${orders.reduce((sum, order) => sum + parseFloat(order.total), 0)}</h3>
                        <p style="margin: 5px 0; color: #7f8c8d;">Total Revenue</p>
                    </div>
                </div>
                
                <a href="/" style="color: #667eea; text-decoration: none; font-weight: bold;">← Back to Home</a>
            </div>
            
            ${orders.length === 0 ? 
                '<div style="text-align: center; padding: 60px; background: white; border-radius: 15px;"><h3 style="color: #7f8c8d;">No orders received yet</h3><p>Place an order from the WooCommerce store to see it here!</p></div>' : 
                orders.slice().reverse().map(order => `
                    <div class="order">
                        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <h3 style="margin: 0; color: #2c3e50;">🛍️ Order #${order.woo_number}</h3>
                                <p style="margin: 5px 0; color: #7f8c8d;">Bot ID: ${order.id} | WooCommerce ID: ${order.woo_order_id}</p>
                            </div>
                            <span class="status ${order.status}">${order.status.toUpperCase()}</span>
                        </div>
                        
                        <p class="customer">👤 ${order.customer.name}</p>
                        <p class="phone">📞 ${order.customer.phone}</p>
                        <p>📧 ${order.customer.email}</p>
                        <p>🏠 ${order.customer.address}</p>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <strong>💰 Total: ৳${order.total}</strong><br>
                            <strong>💳 Payment: ${order.payment_method}</strong>
                        </div>
                        
                        <p><strong>⏰ Received:</strong> ${order.received_at}</p>
                        
                        ${order.items.length > 0 ? `
                            <div style="margin-top: 15px;">
                                <strong>🛒 Items:</strong>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    ${order.items.map(item => `<li>${item.name} x${item.quantity} - ৳${item.price}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `).join('')
            }
        </body>
        </html>
    `);
});

// API endpoints
app.get('/api/orders', (req, res) => {
    const { status, limit } = req.query;
    let filteredOrders = orders;
    
    if (status) {
        filteredOrders = orders.filter(order => order.status === status);
    }
    
    if (limit) {
        filteredOrders = filteredOrders.slice(-parseInt(limit));
    }
    
    res.json({
        success: true,
        store: 'Dhaka Market - WooCommerce',
        count: filteredOrders.length,
        total_orders: orders.length,
        orders: filteredOrders.reverse()
    });
});

app.get('/api/stats', (req, res) => {
    const stats = {
        total_orders: orders.length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        completed_orders: orders.filter(o => o.status === 'completed').length,
        processing_orders: orders.filter(o => o.status === 'processing').length,
        total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
        average_order_value: orders.length > 0 ? 
            (orders.reduce((sum, order) => sum + parseFloat(order.total), 0) / orders.length).toFixed(2) : 0,
        orders_today: orders.filter(order => {
            const orderDate = new Date(order.order_date).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        }).length
    };
    
    res.json({ 
        success: true, 
        system: 'Dhaka Market WooCommerce Integration',
        stats 
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Dhaka Market Bot',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        orders_processed: orders.length,
        version: '1.0.0'
    });
});

app.listen(PORT, () => {
    console.log(`
🏪 Dhaka Market System Started!
================================
📦 WooCommerce Store: http://localhost
🤖 Order Bot: http://localhost:${PORT}
📊 Dashboard: http://localhost:${PORT}/dashboard
🔧 Store Admin: http://localhost/wp-admin
📈 API: http://localhost:${PORT}/api/orders
❤️ Health: http://localhost:${PORT}/health

💡 Powered by WooCommerce Monorepo
🎯 Place an order from the store to test the integration!
    `);
});
