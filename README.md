<img width="1822" height="1054" alt="image" src="https://github.com/user-attachments/assets/388ac703-8e91-492c-b92c-17a0a680223f" /># 🎵 SoundScout Frontend

The client-side Single Page Application (SPA) providing an ultra-responsive, modern glassmorphic dashboard for Event Organizers and AV Equipment Vendors.

## 🛠️ Tech Stack
* **Framework:** React 18, Vite 8
* **Styling:** Vanilla CSS3 + Custom CSS Tokens (Glassmorphism, Dark/Light Mode)
* **Icons:** Lucide React
* **PDF Generation:** `jspdf` (Client-side escrow receipt generation)
* **Real-Time Data:** EventSource (Server-Sent Events)

## 🚀 Core Features
* **Interactive Event Logistics Wizard:** Multi-step AI requirement generator feeding organizer prompts into the AI microservice.
* **Instant Rental Marketplace:** Real-time equipment catalog with live stock availability badges (AVAILABLE NOW vs BOOKED).
* **Smart Financial Formatting:** Custom input validation for payment cards (4-digit spacing, MM/YY auto-slashing, CVV locks).
* **Vendor Bidding & Escrow:** View accepted bids, track deposit statuses, and download PDF receipts.
* **Direct WhatsApp Integration:** Standardized international phone formatters for direct vendor-organizer communication.

## ⚙️ Setup & Execution

### Prerequisites
* Node.js v18+

### Installation
```bash
git clone [https://github.com/sound-scout-dev/sound-scout-frontend.git](https://github.com/sound-scout-dev/sound-scout-frontend.git)
cd sound-scout-frontend
npm install
```

### Environment Variables (`.env`)
Create a `.env` file in the root directory and add:
```env
VITE_API_URL=http://localhost:5000/api
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
