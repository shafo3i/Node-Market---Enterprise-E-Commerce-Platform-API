# Invoice System Documentation

## Overview
Professional PDF invoice system with security-first architecture.

## Security Features

### User Routes
- **Authentication Required**: All routes require valid JWT authentication
- **Ownership Verification**: Users can only access their own invoices
- **Download Protection**: PDF downloads verify ownership before serving files
- **View Tracking**: Automatically marks invoices as "viewed" when accessed by customers

### Admin Routes
- **Role-Based Access**: Admin routes check for `ADMIN` role
- **Full Management**: Admins can view all invoices, update statuses, and regenerate PDFs
- **Audit Trail**: All admin actions should be logged (ready for audit integration)

## API Endpoints

### User Endpoints (Authenticated)

#### Get My Invoices
```http
GET /api/invoices/my-invoices
Authorization: Bearer <token>
```
Returns all invoices for the authenticated user.

#### Get Invoice by ID
```http
GET /api/invoices/:id
Authorization: Bearer <token>
```
Returns specific invoice (ownership verified).

#### Get Invoice by Order
```http
GET /api/invoices/order/:orderId
Authorization: Bearer <token>
```
Returns invoice for a specific order (ownership verified).

#### Download Invoice PDF
```http
GET /api/invoices/:id/download
Authorization: Bearer <token>
```
Downloads PDF file (ownership verified, marks as viewed).

#### Generate Invoice
```http
POST /api/invoices/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "cuid-here"
}
```
Manually generate invoice for an order (auto-generated on payment).

### Admin Endpoints (Admin Only)

#### Get All Invoices
```http
GET /api/invoices/admin/all?page=1&limit=20
Authorization: Bearer <admin-token>
```
Returns paginated list of all invoices.

#### Update Invoice Status
```http
PATCH /api/invoices/admin/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "PAID"
}
```
Status options: `DRAFT`, `SENT`, `VIEWED`, `PAID`, `CANCELLED`, `REFUNDED`

#### Regenerate Invoice PDF
```http
POST /api/invoices/admin/:id/regenerate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "notes": "Optional notes"
}
```
Deletes old PDF and generates a new one.

## Invoice Lifecycle

### 1. Auto-Generation
- Invoices are automatically generated when payment succeeds (Stripe webhook)
- Status starts as `DRAFT`
- PDF is generated asynchronously

### 2. Invoice Number Format
```
INV-YYYYMMDD-XXXXX
```
Example: `INV-20260108-00001`

- Sequential numbering per day
- Unique constraint in database
- Cannot be modified after creation

### 3. Status Flow
```
DRAFT → SENT → VIEWED → PAID
              ↓
         CANCELLED / REFUNDED
```

- **DRAFT**: Just created, not sent to customer
- **SENT**: Marked as sent (manual admin action)
- **VIEWED**: Customer viewed/downloaded the invoice
- **PAID**: Payment confirmed
- **CANCELLED**: Order cancelled
- **REFUNDED**: Order refunded

## Database Schema

### Invoice Model
```prisma
model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // Financial snapshot (immutable)
  subtotal        Float
  taxRate         Float
  taxAmount       Float
  total           Float
  currency        String        @default("USD")
  
  // Customer snapshot
  customerName    String
  customerEmail   String
  billingAddress  Json?
  
  // PDF storage
  pdfPath         String?
  
  // Status tracking
  status          InvoiceStatus @default(DRAFT)
  generatedAt     DateTime      @default(now())
  sentAt          DateTime?
  viewedAt        DateTime?
  paidAt          DateTime?
  
  // Metadata
  notes           String?       @db.Text
  dueDate         DateTime?
  
  @@index([invoiceNumber])
  @@index([orderId])
  @@index([status])
}
```

## File Storage

### PDF Location
```
/invoices/INV-20260108-00001.pdf
```

### Security
- PDFs are stored outside the web root
- Access only through authenticated API endpoints
- Ownership verification before serving files
- Files are in `.gitignore` to prevent commits

## PDF Template

### Features
- Professional responsive HTML design
- Company branding (customizable)
- Itemized order details with SKUs
- Tax and shipping breakdown
- Customer billing address
- Payment information
- Status badge
- Footer with contact info

### Customization
Edit `invoice-pdf.service.ts` to update:
- Company name and logo
- Address and contact details
- Colors and styling
- Additional fields

## Integration Examples

### Frontend - Download Button
```typescript
const downloadInvoice = async (invoiceId: string) => {
  const response = await fetch(`/api/invoices/${invoiceId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
};
```

### Backend - Manual Generation
```typescript
import { generateInvoice } from './modules/invoices/invoice.service';

// After order is paid
const invoice = await generateInvoice(orderId);
console.log('Invoice generated:', invoice.invoiceNumber);
```

## Error Handling

### Common Errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't own the invoice or lacks admin role
- `404 Not Found`: Invoice or PDF file not found
- `400 Bad Request`: Invalid input data

### Security Errors
All unauthorized access attempts are logged to console and should trigger alerts in production.

## Best Practices

### Security
1. ✅ Always verify ownership in service layer
2. ✅ Use role-based access control for admin routes
3. ✅ Never expose PDF paths directly to users
4. ✅ Validate all input with Zod schemas
5. ✅ Log all admin actions for audit trail

### Performance
1. Generate PDFs asynchronously to avoid blocking
2. Consider caching PDF generation for large orders
3. Use pagination for admin invoice lists
4. Index frequently queried fields (invoiceNumber, status)

### Compliance
1. Store immutable financial snapshots
2. Include all required invoice fields (check local laws)
3. Maintain audit trail of all changes
4. Secure storage of customer billing data

## Future Enhancements

### Planned Features
- [ ] Email invoices to customers automatically
- [ ] Support for multiple currencies
- [ ] Tax calculation based on location
- [ ] Invoice templates selection
- [ ] Bulk invoice generation for admin
- [ ] Invoice analytics dashboard
- [ ] Export to accounting software (QuickBooks, Xero)

### Email Integration
Update `notification.service.ts` to send invoices:
```typescript
export async function sendInvoiceEmail(invoiceId: string) {
  const invoice = await getInvoiceById(invoiceId);
  // Attach PDF to email
  // Send to customer
}
```

## Testing

### Security Tests
```bash
# Test ownership verification
curl -H "Authorization: Bearer <user-token>" \
  http://localhost:3003/api/invoices/<other-user-invoice-id>
# Expected: 403 Forbidden

# Test admin access
curl -H "Authorization: Bearer <user-token>" \
  http://localhost:3003/api/invoices/admin/all
# Expected: 403 Forbidden
```

### Functional Tests
```bash
# Generate invoice
curl -X POST http://localhost:3003/api/invoices/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "cm5abc123"}'

# Download invoice
curl -H "Authorization: Bearer <token>" \
  http://localhost:3003/api/invoices/<invoice-id>/download \
  --output invoice.pdf
```

## Troubleshooting

### PDF Generation Issues
- Ensure puppeteer is installed: `npm install puppeteer`
- Check `/invoices` directory permissions
- Verify Chrome/Chromium installation for puppeteer

### Permission Errors
- Verify JWT token is valid
- Check user role in database
- Ensure userId matches invoice owner

### File Not Found
- Check if PDF was generated (async process)
- Verify file path in database matches disk
- Ensure invoices directory exists

## Support
For questions or issues, contact the development team or open an issue.
