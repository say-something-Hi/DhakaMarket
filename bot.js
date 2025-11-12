const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let orders = [];
let orderCounter = 1;

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dhaka Market - Order Bot</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 40px; }
                .card { background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 10px; transition: 0.3s; }
                .btn:hover { background: #764ba2; transform: translateY(-2px); }
                .stats { display: flex; justify-content: space-around; text-align: center; }
                .stat-item { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏪 Dhaka Market</h1>
                    <p>Professional E-Commerce with Smart Order Management</p>
                </div>
                
                <div class="card">
                    <h2>🤖 Order Bot System</h2>
                    <p>Real-time order management and customer notifications</p>
                    
                    <div class="stats">
                        <div class="stat-item">
                            <h3>${orders.length}</h3>
                            <p>Total Orders</p>
                        </div>
                        <div class="stat-item">
                            <h3>${orders.filter(o => o.status === 'pending').length}</h3>
                            <p>Pending</p>
                        </div>
                        <div class="stat-item">
                            <h3>${orders.filter(o => o.status === 'completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="/dashboard" class="btn">📊 View Dashboard</a>
                        <a href="http://localhost" class="btn">🛍️ Visit Store</a>
                        <a href="http://localhost/wp-admin" class="btn">🔧 Store Admin</a>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🚀 Quick Start</h3>
                    <p>1. Visit the store and place an order</p>
                    <p>2. Order automatically appears in bot system</p>
                    <p>3. Manage orders from dashboard</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Webhook for WooCommerce orders
app.post('/webhook/order', (req, res) => {
    const orderData = req.body;
    
    console.log('🎉 নতুন অর্ডার - Dhaka Market!');
    console.log('📦 Order ID:', orderData.order_id);
    console.log('👤 Customer:', orderData.customer?.name);
    console.log('📞 Phone:', orderData.customer?.phone);
    
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
        store: 'Dhaka Market'
    };
    
    orders.push(order);
    
    // Send notification
    sendOrderNotification(order);
    
    res.json({
        success: true,
        message: 'Order received by Dhaka Market Bot',
        bot_order_id: order.id,
        woo_order_id: order.woo_order_id
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
}

// Dashboard
app.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Dashboard - Dhaka Market</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .header { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .order { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #667eea; }
                .customer { color: #2c5aa0; font-weight: bold; font-size: 1.2em; }
                .phone { color: #d35400; font-size: 1.1em; }
                .status { display: inline-block; padding: 5px 15px; border-radius: 20px; background: #e74c3c; color: white; }
                .status.completed { background: #27ae60; }
                .status.pending { background: #f39c12; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Order Dashboard - Dhaka Market</h1>
                <p>মোট অর্ডার: <strong>${orders.length}</strong> টি</p>
                <a href="/" style="color: #667eea;">← Back to Home</a>
            </div>
            
            ${orders.length === 0 ? 
                '<div style="text-align: center; padding: 40px; background: white; border-radius: 10px;"><h3>No orders yet</h3><p>Place an order from the store to see it here!</p></div>' : 
                orders.slice().reverse().map(order => `
                    <div class="order">
                        <h3>🛍️ Order #${order.woo_number} (Bot ID: ${order.id})</h3>
                        <p class="customer">👤 ${order.customer.name}</p>
                        <p class="phone">📞 ${order.customer.phone}</p>
                        <p>📧 ${order.customer.email}</p>
                        <p>🏠 ${order.customer.address}</p>
                        <p>💰 Total: ৳${order.total}</p>
                        <p>💳 Payment: ${order.payment_method}</p>
                        <p>⏰ Received: ${order.received_at}</p>
                        <p>📊 Status: <span class="status ${order.status}">${order.status}</span></p>
                    </div>
                `).join('')
            }
        </body>
        </html>
    `);
});

// API endpoints
app.get('/api/orders', (req, res) => {
    res.json({
        success: true,
        store: 'YOU CAN ORDER MULTYCURT',
        count: orders.length,
        orders: orders.slice().reverse()
    });
});

app.get('/api/stats', (req, res) => {
    const stats = {
        total_orders: orders.length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        completed_orders: orders.filter(o => o.status === 'completed').length,
        total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
        average_order_value: orders.length > 0 ? (orders.reduce((sum, order) => sum + parseFloat(order.total), 0) / orders.length).toFixed(2) : 0
    };
    
    res.json({ success: true, stats });
});

app.listen(PORT, () => {
    console.log(`
🏪 Dhaka Market System Started!
================================
📦 Store: http://localhost
🤖 Bot: http://localhost:${PORT}
📊 Dashboard: http://localhost:${PORT}/dashboard
🔧 Store Admin: http://localhost/wp-admin
📈 API: http://localhost:${PORT}/api/orders

💡 Place an order from the store to test the system!
    `);
});
