const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Store orders in memory
let orders = [];
let orderCounter = 1;

// Test endpoint
app.post('/webhook/test', (req, res) => {
    console.log('✅ Test connection received from WordPress');
    res.json({ success: true, message: 'Bot is running!' });
});

// Main order webhook
app.post('/webhook/order', (req, res) => {
    const orderData = req.body;
    
    console.log('🛍️ NEW ORDER RECEIVED FROM WOOCOMMERCE:');
    console.log('Order ID:', orderData.order_id);
    console.log('Customer:', orderData.customer.name);
    console.log('Phone:', orderData.customer.phone);
    console.log('Total: ৳', orderData.total);
    
    // Process the order
    processOrder(orderData);
    
    res.json({ 
        success: true, 
        message: 'Order received by bot system',
        order_id: orderData.order_id 
    });
});

function processOrder(orderData) {
    const order = {
        bot_id: orderCounter++,
        woo_order_id: orderData.order_id,
        woo_order_number: orderData.order_number,
        status: orderData.status,
        customer: orderData.customer,
        items: orderData.items,
        total: orderData.total,
        payment_method: orderData.payment_method,
        order_date: orderData.order_date,
        received_at: new Date().toLocaleString('bn-BD'),
        actions: []
    };
    
    orders.push(order);
    
    // Send notifications
    sendNotifications(order);
    
    // Save to file (optional)
    saveOrderToFile(order);
    
    console.log(`✅ Order #${order.woo_order_number} processed successfully`);
}

function sendNotifications(order) {
    const message = `
🎉 **নতুন অর্ডার - ঢাকা মার্কেট** 🎉

📦 **অর্ডার নম্বর:** #${order.woo_order_number}
💰 **মোট金额:** ৳${order.total}
💳 **পেমেন্ট:** ${order.payment_method}

👤 **গ্রাহকের信息:**
📛 নাম: ${order.customer.name}
📞 ফোন: ${order.customer.phone}
📧 ইমেইল: ${order.customer.email}
🏠 ঠিকানা: ${order.customer.address}

🛒 **অর্ডারকৃত商品:**
${order.items.map(item => `• ${item.name} x${item.quantity} - ৳${item.price}`).join('\n')}

⏰ **অর্ডারের সময়:** ${order.order_date}
🕒 **বটে প্রাপ্তির সময়:** ${order.received_at}

📞 **দ্রুত اقدام করুন:** গ্রাহককে ৩০ মিনিটের মধ্যে কন্টাক্ট করুন!
    `;
    
    console.log('🔔 NOTIFICATION:');
    console.log(message);
    
    // Here you can add:
    // - WhatsApp message
    // - Messenger bot
    // - SMS notification
    // - Email alert
}

function saveOrderToFile(order) {
    const fs = require('fs');
    const orderText = `
=================================
অর্ডার প্রাপ্ত - ${new Date().toLocaleString('bn-BD')}
=================================
অর্ডার আইডি: ${order.woo_order_id}
গ্রাহক: ${order.customer.name}
ফোন: ${order.customer.phone}
ইমেইল: ${order.customer.email}
ঠিকানা: ${order.customer.address}
মোট金额: ৳${order.total}
পেমেন্ট: ${order.payment_method}
অর্ডারের সময়: ${order.order_date}
=================================

    `;
    
    fs.appendFile('orders_log.txt', orderText, (err) => {
        if (err) console.error('File save error:', err);
    });
}

// Dashboard to view orders
app.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dhaka Market Bot Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .order { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .customer { color: #2c5aa0; font-weight: bold; }
                .phone { color: #d35400; }
            </style>
        </head>
        <body>
            <h1>Dhaka Market Order Bot</h1>
            <p>Total Orders: ${orders.length}</p>
            
            ${orders.slice().reverse().map(order => `
                <div class="order">
                    <h3>Order #${order.woo_order_number} (Bot ID: ${order.bot_id})</h3>
                    <p class="customer">Customer: ${order.customer.name}</p>
                    <p class="phone">Phone: ${order.customer.phone}</p>
                    <p>Email: ${order.customer.email}</p>
                    <p>Address: ${order.customer.address}</p>
                    <p>Total: ৳${order.total}</p>
                    <p>Payment: ${order.payment_method}</p>
                    <p>Order Date: ${order.order_date}</p>
                    <p>Received: ${order.received_at}</p>
                </div>
            `).join('')}
        </body>
        </html>
    `);
});

// API to get orders
app.get('/api/orders', (req, res) => {
    res.json({
        success: true,
        count: orders.length,
        orders: orders.slice().reverse()
    });
});

app.listen(PORT, () => {
    console.log(`🤖 Dhaka Market Bot running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📦 Webhook URL: http://localhost:${PORT}/webhook/order`);
    console.log(`🔧 API: http://localhost:${PORT}/api/orders`);
    console.log('🛍️ Waiting for WooCommerce orders...');
});
