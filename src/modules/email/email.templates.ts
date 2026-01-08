interface OrderEmailData {
  orderReference: string;
  customerName: string;
  total: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  shippingAddress?: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface ShippingEmailData {
  orderReference: string;
  customerName: string;
  trackingNumber: string;
  carrierName: string;
  trackingUrl?: string;
}

interface LowStockEmailData {
  productName: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
}

export const EmailTemplates = {
  // Order Confirmation Email
  orderConfirmation: (data: OrderEmailData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 24px; font-weight: bold; color: #667eea; margin-top: 20px; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <h2>Hi ${data.customerName},</h2>
          <p>We've received your order and it's being processed. Here are the details:</p>
          
          <div class="order-details">
            <p><strong>Order Reference:</strong> ${data.orderReference}</p>
            
            <h3>Order Items:</h3>
            ${data.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × $${item.price}
              </div>
            `).join('')}
            
            <div class="total">
              Total: $${data.total}
            </div>

            ${data.shippingAddress ? `
              <h3 style="margin-top: 30px;">Shipping Address:</h3>
              <p>
                ${data.shippingAddress.street}<br>
                ${data.shippingAddress.street2 ? `${data.shippingAddress.street2}<br>` : ''}
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                ${data.shippingAddress.country}
              </p>
            ` : ''}
          </div>

          <p>You'll receive another email once your order ships.</p>
          
          <a href="${process.env.FRONTEND_URL}/account/orders" class="button">View Order Status</a>
        </div>
        <div class="footer">
          <p>Node Market © ${new Date().getFullYear()}</p>
          <p>If you have any questions, please contact us at support@nodemarket.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Shipping Notification Email
  orderShipped: (data: ShippingEmailData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 2px; margin: 15px 0; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.customerName},</h2>
          <p>Great news! Your order <strong>${data.orderReference}</strong> is on its way.</p>
          
          <div class="tracking-box">
            <p><strong>Carrier:</strong> ${data.carrierName}</p>
            <p><strong>Tracking Number:</strong></p>
            <div class="tracking-number">${data.trackingNumber}</div>
            
            ${data.trackingUrl ? `
              <a href="${data.trackingUrl}" class="button">Track Your Package</a>
            ` : ''}
          </div>

          <p>You can use this tracking number to monitor your delivery status.</p>
        </div>
        <div class="footer">
          <p>Node Market © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Order Status Update Email
  orderStatusUpdate: (orderReference: string, customerName: string, oldStatus: string, newStatus: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .status { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; text-transform: uppercase; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Order Status Updated</h1>
        </div>
        <div class="content">
          <h2>Hi ${customerName},</h2>
          <p>Your order <strong>${orderReference}</strong> status has been updated.</p>
          
          <div class="status-box">
            <p>Previous Status: <span style="color: #999;">${oldStatus}</span></p>
            <p>Current Status:</p>
            <div class="status">${newStatus}</div>
          </div>

          <a href="${process.env.FRONTEND_URL}/account/orders" class="button">View Order Details</a>
        </div>
        <div class="footer">
          <p>Node Market © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Low Stock Alert Email (for admins)
  lowStockAlert: (data: LowStockEmailData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fee; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
        .stock-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <strong>Attention Required:</strong> The following product is running low on stock.
          </div>
          
          <div class="stock-info">
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>SKU:</strong> ${data.sku}</p>
            <p><strong>Current Stock:</strong> <span style="color: #ef4444; font-weight: bold;">${data.currentStock} units</span></p>
            <p><strong>Low Stock Threshold:</strong> ${data.lowStockThreshold} units</p>
          </div>

          <p>Please consider restocking this product to avoid running out.</p>
          
          <a href="${process.env.FRONTEND_URL}/admincp/inventory" class="button">Manage Inventory</a>
        </div>
        <div class="footer">
          <p>Node Market Admin Panel © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `,
};
