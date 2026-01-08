import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

/**
 * Generate HTML template for invoice
 */
function generateInvoiceHTML(invoice: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const billingAddress = invoice.billingAddress || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          padding: 40px;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }
        .company-info h1 {
          color: #2563eb;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .company-info p {
          color: #666;
          font-size: 14px;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-meta h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        .invoice-meta p {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .billing-info, .invoice-info {
          flex: 1;
        }
        .billing-info {
          margin-right: 40px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .billing-info p, .invoice-info p {
          font-size: 14px;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        thead {
          background: #f8f9fa;
        }
        th {
          text-align: left;
          padding: 15px;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        td:last-child {
          text-align: right;
          font-weight: 500;
        }
        .product-name {
          font-weight: 500;
          color: #111;
        }
        .product-sku {
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }
        .totals {
          float: right;
          width: 300px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
        }
        .totals-row.subtotal {
          border-bottom: 1px solid #e5e7eb;
        }
        .totals-row.total {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          border-top: 2px solid #2563eb;
          padding-top: 15px;
          margin-top: 10px;
        }
        .footer {
          clear: both;
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .status-sent {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-draft {
          background: #f3f4f6;
          color: #374151;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="company-info">
            <h1>Your Company Name</h1>
            <p>123 Business Street</p>
            <p>City, State 12345</p>
            <p>contact@yourcompany.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Order Reference:</strong> ${invoice.order.orderReference || invoice.order.id}</p>
            <p><strong>Date Issued:</strong> ${formatDate(invoice.generatedAt)}</p>
            ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
            <p style="margin-top: 10px;">
              <span class="status-badge status-${invoice.status.toLowerCase()}">
                ${invoice.status}
              </span>
            </p>
          </div>
        </div>

        <div class="invoice-details">
          <div class="billing-info">
            <div class="section-title">Bill To</div>
            <p><strong>${invoice.customerName}</strong></p>
            <p>${invoice.customerEmail}</p>
            ${billingAddress.street ? `
              <p style="margin-top: 10px;">${billingAddress.street}</p>
              ${billingAddress.street2 ? `<p>${billingAddress.street2}</p>` : ''}
              <p>${billingAddress.city}, ${billingAddress.state} ${billingAddress.postalCode}</p>
              <p>${billingAddress.country}</p>
            ` : ''}
          </div>
          <div class="invoice-info">
            <div class="section-title">Payment Information</div>
            <p><strong>Payment Method:</strong> ${invoice.order.paymentMethod || 'Credit Card'}</p>
            <p><strong>Payment Status:</strong> ${invoice.order.paymentStatus || 'Completed'}</p>
            ${invoice.order.paymentIntentId ? `<p><strong>Transaction ID:</strong> ${invoice.order.paymentIntentId.substring(0, 20)}...</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.order.items.map((item: any) => {
              const price = item.product.salePrice || item.product.price;
              const total = price * item.quantity;
              return `
                <tr>
                  <td>
                    <div class="product-name">${item.product.name}</div>
                    <div class="product-sku">SKU: ${item.product.sku || 'N/A'}</div>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(price)}</td>
                  <td style="text-align: right;">${formatCurrency(total)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row subtotal">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          ${invoice.taxRate > 0 ? `
            <div class="totals-row">
              <span>Tax (${(invoice.taxRate * 100).toFixed(2)}%)</span>
              <span>${formatCurrency(invoice.taxAmount)}</span>
            </div>
          ` : ''}
          ${invoice.order.shippingCost ? `
            <div class="totals-row">
              <span>Shipping</span>
              <span>${formatCurrency(invoice.order.shippingCost)}</span>
            </div>
          ` : ''}
          <div class="totals-row total">
            <span>Total</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
        </div>

        ${invoice.notes ? `
          <div style="clear: both; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <div class="section-title">Notes</div>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p style="margin-top: 10px;">
            This is a computer-generated invoice and is valid without signature.
          </p>
          <p>
            For any questions regarding this invoice, please contact us at support@yourcompany.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF invoice
 * SECURITY: Only called from authenticated invoice service
 */
export async function generateInvoicePDF(invoice: any): Promise<string> {
  const invoicesDir = path.join(process.cwd(), 'invoices');
  
  // Create invoices directory if it doesn't exist
  try {
    await fs.access(invoicesDir);
  } catch {
    await fs.mkdir(invoicesDir, { recursive: true });
  }

  const filename = `${invoice.invoiceNumber}.pdf`;
  const filepath = path.join(invoicesDir, filename);

  // Generate HTML content
  const html = generateInvoiceHTML(invoice);

  // Launch puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      printBackground: true,
    });

    return `invoices/${filename}`;
  } finally {
    await browser.close();
  }
}
