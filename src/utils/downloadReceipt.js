function formatLKR(n) {
  return "Rs. " + (n || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

export function generateReceiptHTML(data) {
  const {
    txnId = "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    receiptNo = "REC-2026-" + Math.floor(1000 + Math.random() * 9000),
    date = new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" }),
    time = new Date().toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" }),
    vendorName = "Equipment Vendor",
    eventName = "SoundScout Booking",
    organizerName = "SoundScout Organizer",
    organizerEmail = "organizer@example.com",
    paymentType = "Booking Deposit (50% Advance + 6% Fee)",
    quotePrice = 0,
    commission = 0,
    advancePrice = 0,
    remainingPrice = 0,
    amountPaid = 0,
    status = "PAID (HELD IN ESCROW)"
  } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${receiptNo} - SoundScout AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0B0F13;
      color: #0F172A;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .receipt-card {
      background: #FFFFFF;
      width: 100%;
      max-width: 680px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      padding: 48px;
      box-sizing: border-box;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .logo-brand {
      font-size: 22px;
      font-weight: 800;
      color: #0B0F13;
      letter-spacing: -0.5px;
    }
    .logo-brand span {
      color: #0891B2;
    }
    .receipt-title {
      text-align: right;
    }
    .receipt-title h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .receipt-title p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #64748B;
      font-family: monospace;
    }
    .badge-paid {
      display: inline-block;
      background: #DCFCE7;
      color: #15803D;
      border: 1px solid #86EFAC;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-top: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .info-block h3 {
      margin: 0 0 8px 0;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94A3B8;
    }
    .info-block p {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #1E293B;
      line-height: 1.5;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    .table th {
      background: #F8FAFC;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748B;
      padding: 12px 16px;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
    }
    .table td {
      padding: 16px;
      font-size: 14px;
      color: #334155;
      border-bottom: 1px solid #F1F5F9;
    }
    .table tr.total-row td {
      border-top: 2px solid #E2E8F0;
      font-weight: 700;
      font-size: 16px;
      color: #0F172A;
    }
    .footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94A3B8;
    }
    .stamp {
      font-family: monospace;
      border: 2px dashed #0891B2;
      color: #0891B2;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      display: inline-block;
    }
    .no-print {
      margin-top: 24px;
      text-align: center;
    }
    .btn-print {
      background: #0891B2;
      color: #FFFFFF;
      border: none;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
    }
    .btn-print:hover {
      background: #06748F;
    }
    @media print {
      body { background: #FFF; padding: 0; }
      .receipt-card { box-shadow: none; padding: 24px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div>
    <div class="receipt-card">
      <div class="header">
        <div>
          <div class="logo-brand">Sound<span>Scout</span> AI</div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">Audio Logistics & Escrow Payment Services</p>
        </div>
        <div class="receipt-title">
          <h1>Payment Receipt</h1>
          <p>${receiptNo}</p>
          <div class="badge-paid">✓ ${status}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <h3>Billed To (Organizer)</h3>
          <p><strong>${organizerName}</strong></p>
          <p>${organizerEmail}</p>
          <p>Event: ${eventName}</p>
        </div>
        <div class="info-block">
          <h3>Service Provider (Vendor)</h3>
          <p><strong>${vendorName}</strong></p>
          <p>Date: ${date} at ${time}</p>
          <p>Txn ID: <span style="font-family: monospace;">${txnId}</span></p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount (LKR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Vendor Quote / Bid Amount</strong><br>
              <span style="font-size: 12px; color: #64748B;">Agreed equipment & sound logistics pricing</span>
            </td>
            <td style="text-align: right; font-family: monospace;">${formatLKR(quotePrice)}</td>
          </tr>
          <tr>
            <td>
              <strong>Platform Protection Fee (6%)</strong><br>
              <span style="font-size: 12px; color: #64748B;">SoundScout AI escrow & guarantee service</span>
            </td>
            <td style="text-align: right; font-family: monospace;">${formatLKR(commission)}</td>
          </tr>
          <tr>
            <td>
              <strong>50% Booking Advance Deposit (Paid Now)</strong><br>
              <span style="font-size: 12px; color: #16A34A;">Locked safely in escrow until event day</span>
            </td>
            <td style="text-align: right; font-family: monospace;">${formatLKR(advancePrice)}</td>
          </tr>
          <tr>
            <td>
              <strong>Remaining 50% Balance (Due Event Day)</strong><br>
              <span style="font-size: 12px; color: #64748B;">To be released to vendor upon event completion</span>
            </td>
            <td style="text-align: right; font-family: monospace;">${formatLKR(remainingPrice)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Payment Processed (Advance + Fee)</td>
            <td style="text-align: right; font-family: monospace; color: #0891B2;">${formatLKR(amountPaid)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>
          <div class="stamp">OFFICIAL ESCROW RECEIPT</div>
          <p style="margin: 6px 0 0 0;">Thank you for using SoundScout AI logistics.</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0;">Need help? support@soundscout.ai</p>
          <p style="margin: 4px 0 0 0;">www.soundscout.ai</p>
        </div>
      </div>
    </div>

    <div class="no-print">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF Soft Copy</button>
    </div>
  </div>
</body>
</html>
  `
}

export function downloadReceiptPDF(data) {
  const htmlContent = generateReceiptHTML(data)
  const win = window.open("", "_blank")
  if (win) {
    win.document.write(htmlContent)
    win.document.close()
  } else {
    // Fallback: download as HTML receipt file
    const blob = new Blob([htmlContent], { type: "text/html" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `SoundScout_Receipt_${data.receiptNo || 'REC-2026'}.html`
    link.click()
  }
}

export function generateRentalReceiptHTML(data) {
  const {
    receiptNo = "RENT-2026-" + Math.floor(1000 + Math.random() * 9000),
    txnId = "TXN_RENT_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date = new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" }),
    vendorName = "SoundScout Rental Shop",
    renterName = "SoundScout Customer",
    equipmentName = "Instant Rental Gear",
    qty = 1,
    days = 1,
    pricePerDay = 0,
    subtotal = 0,
    insuranceFee = 0,
    paymentMode = "50% Advance Escrow Deposit",
    depositPaid = 0,
    balanceDue = 0,
    totalPrice = 0,
    status = "PAID & RESERVED (IN ESCROW)"
  } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rental Receipt ${receiptNo} - SoundScout AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0B0F13; color: #0F172A; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
    .receipt-card { background: #FFFFFF; width: 100%; max-width: 680px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); padding: 48px; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E2E8F0; padding-bottom: 24px; margin-bottom: 32px; }
    .logo-brand { font-size: 22px; font-weight: 800; color: #0B0F13; letter-spacing: -0.5px; }
    .logo-brand span { color: #0891B2; }
    .receipt-title { text-align: right; }
    .receipt-title h1 { margin: 0; font-size: 18px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 1px; }
    .badge-paid { display: inline-block; background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-block h3 { margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94A3B8; }
    .info-block p { margin: 0; font-size: 14px; font-weight: 500; color: #1E293B; line-height: 1.5; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    .table th { background: #F8FAFC; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B; padding: 12px 16px; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; }
    .table td { padding: 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #F1F5F9; }
    .table tr.total-row td { border-top: 2px solid #E2E8F0; font-weight: 700; font-size: 16px; color: #0F172A; }
    .footer { border-top: 1px solid #E2E8F0; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #94A3B8; }
    .stamp { font-family: monospace; border: 2px dashed #059669; color: #059669; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; }
    .no-print { margin-top: 24px; text-align: center; }
    .btn-print { background: #059669; color: #FFFFFF; border: none; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
    @media print { body { background: #FFF; padding: 0; } .receipt-card { box-shadow: none; padding: 24px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div>
    <div class="receipt-card">
      <div class="header">
        <div>
          <div class="logo-brand">Sound<span>Scout</span> AI</div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">Instant Rental Escrow & Gear Booking</p>
        </div>
        <div class="receipt-title">
          <h1>Rental Receipt</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B; font-family: monospace;">${receiptNo}</p>
          <div class="badge-paid">✓ ${status}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <h3>Customer / Renter</h3>
          <p><strong>${renterName}</strong></p>
          <p>Booking Date: ${date}</p>
        </div>
        <div class="info-block">
          <h3>Rental Shop Vendor</h3>
          <p><strong>${vendorName}</strong></p>
          <p>Txn ID: <span style="font-family: monospace;">${txnId}</span></p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Rental Description</th>
            <th style="text-align: right;">Amount (LKR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${equipmentName}</strong><br>
              <span style="font-size: 12px; color: #64748B;">Quantity: ${qty} units · Duration: ${days} day(s) @ ${formatLKR(pricePerDay)}/day</span>
            </td>
            <td style="text-align: right; font-family: monospace;">${formatLKR(subtotal)}</td>
          </tr>
          <tr>
            <td>
              <strong>Equipment Protection & Escrow Fee (5%)</strong><br>
              <span style="font-size: 12px; color: #64748B;">SoundScout gear insurance & money-back escrow protection</span>
            </td>
            <td style="text-align: right; font-family: monospace;">${formatLKR(insuranceFee)}</td>
          </tr>
          <tr>
            <td>
              <strong>Total Booking Valuation</strong>
            </td>
            <td style="text-align: right; font-family: monospace; font-weight: 700;">${formatLKR(totalPrice)}</td>
          </tr>
          <tr>
            <td>
              <strong>${paymentMode}</strong><br>
              <span style="font-size: 12px; color: #16A34A;">Processed via SoundScout Secure Payment Gateway</span>
            </td>
            <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">${formatLKR(depositPaid)}</td>
          </tr>
          ${balanceDue > 0 ? `
          <tr>
            <td>
              <strong>Remaining Balance Due at Pickup</strong>
            </td>
            <td style="text-align: right; font-family: monospace; color: #DC2626;">${formatLKR(balanceDue)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div class="footer">
        <div>
          <div class="stamp">OFFICIAL RENTAL RECEIPT</div>
          <p style="margin: 6px 0 0 0;">SoundScout Instant Gear Rental System</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0;">Need support? help@soundscout.ai</p>
        </div>
      </div>
    </div>

    <div class="no-print">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Download Soft Copy PDF Receipt</button>
    </div>
  </div>
</body>
</html>
  `
}

export function downloadRentalReceiptPDF(data) {
  const htmlContent = generateRentalReceiptHTML(data)
  const win = window.open("", "_blank")
  if (win) {
    win.document.write(htmlContent)
    win.document.close()
  } else {
    const blob = new Blob([htmlContent], { type: "text/html" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `SoundScout_Rental_Receipt_${data.receiptNo || 'RENT-2026'}.html`
    link.click()
  }
}
