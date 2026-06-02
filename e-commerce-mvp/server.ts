import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up Paths
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure directories exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initial Database Structure
const initialDb = {
  storeSettings: {
    logo_url: "https://images.unsplash.com/photo-1631217818202-90ef7a0c3d93?auto=format&fit=crop&q=80&w=200",
    store_name: "MediShop MVP",
    slogan: "Thiết Bị Y Tế & Dược Phẩm Chính Hãng",
    business_name: "Công ty Cổ phần Công nghệ Y tế MediShop Việt Nam",
    tax_code: "0109876543",
    tax_address: "123 Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội",
    phone: "0987654321",
    email: "support@medishop.com",
    shopee_url: "https://shopee.vn",
    tiktok_url: "https://tiktok.com",
    facebook_url: "https://facebook.com/medishop",
    zalo_url: "https://zalo.me/0987654321"
  },
  categories: [
    { id: "cat-1", name: "Thiết bị", slug: "thiet-bi" },
    { id: "cat-2", name: "Vật tư", slug: "vat-tu" },
    { id: "cat-3", name: "Dược phẩm", slug: "duoc-pham" }
  ],
  products: [
    {
      id: "prod-1",
      name: "Máy Đo Huyết Áp Omron HEM-7120",
      category_id: "cat-1",
      original_price: 1250000,
      discount_percent: 15,
      price_after_discount: 1062500,
      description_short: "Máy đo huyết áp bắp tay tự động, công nghệ Intellisense hiện đại, đo nhanh và chính xác.",
      description_detail: "Máy Đo Huyết Áp Omron HEM-7120 là dòng máy đo huyết áp bắp tay tự động sử dụng công nghệ mới Intellisense giúp đo nhanh, chính xác và giảm thiểu cảm giác khó chịu khi bắp tay được bơm căng.",
      image_url: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=600",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      is_featured: true,
      is_hot_deal: true,
      is_flash_sale: false
    },
    {
      id: "prod-2",
      name: "Ống Nghe Y Tế Littmann Classic III",
      category_id: "cat-1",
      original_price: 2850000,
      discount_percent: 10,
      price_after_discount: 2565000,
      description_short: "Ống nghe y tế cao cấp, độ nhạy âm cao, lý tưởng cho bác sĩ và sinh viên y khoa.",
      description_detail: "Littmann Classic III là dòng ống nghe chất lượng hàng đầu thế giới của hãng 3M Mỹ. Ống nghe có màng dao động điều hướng thích hợp với cả bệnh nhân người lớn và trẻ em.",
      image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
      is_featured: true,
      is_hot_deal: false,
      is_flash_sale: false
    },
    {
      id: "prod-3",
      name: "Khẩu Trang N95 Kháng Khuẩn 3M",
      category_id: "cat-2",
      original_price: 45000,
      discount_percent: 20,
      price_after_discount: 36000,
      description_short: "Hộp 20 cái khẩu trang N95 chống bụi mịn và vi khuẩn, thiết kế ôm khít gương mặt.",
      description_detail: "Khẩu trang kháng khuẩn N95 3M đạt tiêu chuẩn quốc tế giúp lọc sạch tối thiểu 95% các hạt bụi siêu mịn PM2.5, phấn hoa và giọt bắn chứa virus gây hại.",
      image_url: "https://images.unsplash.com/photo-1586942593568-29361efcd571?auto=format&fit=crop&q=80&w=600",
      is_featured: false,
      is_hot_deal: false,
      is_flash_sale: true
    },
    {
      id: "prod-4",
      name: "Bộ Hộp Bông Băng Gạc Sơ Cứu Vết Thương",
      category_id: "cat-2",
      original_price: 85000,
      discount_percent: 5,
      price_after_discount: 80750,
      description_short: "Dụng cụ sơ cứu bao gồm bông y tế, băng dán cá nhân và gạc vô trùng sơ cứu vết thương.",
      description_detail: "Bộ bông băng gạc vô trùng sơ cứu nhỏ gọn, tiện lợi và an toàn cho tủ thuốc gia đình cũng như các phòng khám chuyên khoa.",
      image_url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=600",
      is_featured: false,
      is_hot_deal: true,
      is_flash_sale: false
    },
    {
      id: "prod-5",
      name: "Viên Uống Bổ Não Ginkgo Biloba 120mg",
      category_id: "cat-3",
      original_price: 350000,
      discount_percent: 12,
      price_after_discount: 308000,
      description_short: "Hộp 100 viên giúp tăng cường tuần hoàn não, giảm đau đầu và cải thiện trí nhớ.",
      description_detail: "Chiết xuất lá bạch quả Ginkgo Biloba thiên nhiên giúp hỗ trợ lưu thông máu lên não, giảm các trạng thái hoa mắt, chóng mặt và sa sút trí tuệ do tuổi tác.",
      image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
      is_featured: true,
      is_hot_deal: false,
      is_flash_sale: true
    }
  ],
  orders: [] as any[],
  emailLogs: [] as any[] // Storage for viewing dummy sent emails in the dashboard
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning default:", err);
    return initialDb;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

// Ensure database file initialization right on start
readDb();

// Middleware security helper for `/api/admin/*`
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization;
  if (token === 'Bearer ecommerce_admin_token_2026') {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access" });
  }
}

// ---------------------- API PATHS ----------------------

// Dynamic Credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ecommerce-mvp.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_secure_password_2026';

// 1. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ token: 'ecommerce_admin_token_2026', email });
  } else {
    res.status(400).json({ error: "Email hoặc mật khẩu không chính xác!" });
  }
});

// Check auth status
app.get('/api/admin/check', (req, res) => {
  const token = req.headers.authorization;
  if (token === 'Bearer ecommerce_admin_token_2026') {
    res.json({ success: true, email: ADMIN_EMAIL });
  } else {
    res.status(401).json({ success: false });
  }
});

// Image Upload Endpoint (preserves original extension via multer config)
app.post('/api/upload', adminAuth, upload.single('image'), (req: any, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Không tìm thấy file tải lên" });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, success: true });
});

// 2. Fetch Store Settings
app.get('/api/store-settings', (req, res) => {
  const db = readDb();
  res.json(db.storeSettings);
});

// Update Store Settings
app.post('/api/store-settings', adminAuth, (req, res) => {
  const db = readDb();
  db.storeSettings = { ...db.storeSettings, ...req.body };
  writeDb(db);
  res.json(db.storeSettings);
});

// 3. Categories Management
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories);
});

app.post('/api/categories', adminAuth, (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    res.status(400).json({ error: "Tên danh mục không được để trống" });
    return;
  }
  
  const db = readDb();
  // Check duplicates
  if (db.categories.some((c: any) => c.name.toLowerCase() === name.trim().toLowerCase())) {
    res.status(400).json({ error: "Danh mục này đã tồn tại!" });
    return;
  }

  // Create slug
  const slug = name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/).join('-');

  const newCategory = {
    id: 'cat-' + Date.now(),
    name: name.trim(),
    slug: slug
  };

  db.categories.push(newCategory);
  writeDb(db);
  res.json(newCategory);
});

app.delete('/api/categories/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.categories = db.categories.filter((c: any) => c.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// 4. Products Management
app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json(db.products);
});

app.post('/api/products', adminAuth, (req, res) => {
  const productData = req.body;
  const db = readDb();

  const original_price = Number(productData.original_price) || 0;
  const discount_percent = Number(productData.discount_percent) || 0;
  const price_after_discount = Math.round(original_price * (1 - discount_percent / 100));

  const parsedProduct = {
    id: productData.id || ('prod-' + Date.now()),
    name: productData.name,
    category_id: productData.category_id,
    original_price,
    discount_percent,
    price_after_discount,
    description_short: productData.description_short || '',
    description_detail: productData.description_detail || '',
    image_url: productData.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    video_url: productData.video_url || '',
    is_featured: !!productData.is_featured,
    is_hot_deal: !!productData.is_hot_deal,
    is_flash_sale: !!productData.is_flash_sale
  };

  if (productData.id) {
    // Edit
    const index = db.products.findIndex((p: any) => p.id === productData.id);
    if (index !== -1) {
      db.products[index] = parsedProduct;
    } else {
      db.products.push(parsedProduct);
    }
  } else {
    // Create new
    db.products.push(parsedProduct);
  }

  writeDb(db);
  res.json(parsedProduct);
});

app.delete('/api/products/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.products = db.products.filter((p: any) => p.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// 5. Orders Management & Checkout Gateway
app.get('/api/orders', adminAuth, (req, res) => {
  const db = readDb();
  res.json(db.orders);
});

// Fetch dummy email HTML blocks logs (to proof integration works easily)
app.get('/api/admin/email-logs', adminAuth, (req, res) => {
  const db = readDb();
  res.json(db.emailLogs || []);
});

// Place order & Save to Database & Fire Resend email
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, customer_address, items } = req.body;

  if (!customer_name || !customer_phone || !customer_address || !items || !items.length) {
    res.status(400).json({ error: "Thông tin khách hàng và danh sách sản phẩm không đầy đủ." });
    return;
  }

  const db = readDb();
  
  // Calculate total price
  let calculated_total = 0;
  const parsedItems = items.map((item: any) => {
    // Find item to enforce Price Correctness
    const originalProd = db.products.find((p: any) => p.id === item.product_id);
    const resolvedPrice = originalProd ? originalProd.price_after_discount : (item.price_at_purchase || 0);
    const itemTotal = resolvedPrice * (item.quantity || 1);
    calculated_total += itemTotal;

    return {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      product_id: item.product_id,
      product_name: originalProd ? originalProd.name : item.product_name,
      quantity: Number(item.quantity) || 1,
      price_at_purchase: resolvedPrice
    };
  });

  const orderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: orderId,
    customer_name,
    customer_phone,
    customer_address,
    total_amount: calculated_total,
    status: 'NEW',
    created_at: new Date().toISOString(),
    items: parsedItems
  };

  db.orders.unshift(newOrder); // Add to beginning of orders list

  // Generate a gorgeous Premium HTML Email Notification matching MediShop layout
  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  const itemsHtml = parsedItems.map((item: any, idx: number) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 6px; color: #1f2937; font-size: 14px;">${idx + 1}</td>
      <td style="padding: 12px 6px; color: #1f2937; font-size: 14px; font-weight: bold;">${item.product_name}</td>
      <td style="padding: 12px 6px; color: #1f2937; font-size: 14px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 6px; color: #1f2937; font-size: 14px; text-align: right;">${formatVND(item.price_at_purchase)}</td>
      <td style="padding: 12px 6px; color: #1f2937; font-size: 14px; text-align: right; font-weight: bold;">${formatVND(item.price_at_purchase * item.quantity)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Đơn hàng mới ${orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #0284c7; padding: 30px 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">🏥 ĐƠN HÀNG MỚI ĐÃ ĐẾN!</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Mã đơn hàng: <strong style="text-decoration: underline;">${orderId}</strong></p>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">Xin chào Admin,</p>
          <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">Hệ thống vừa ghi nhận một đơn đặt hàng mới từ khách hàng trực tuyến thông qua <strong>${db.storeSettings.store_name} MVP</strong>.</p>
          
          <!-- Customer Info Box -->
          <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Thông tin khách hàng:</h3>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>👤 Họ tên:</strong> ${customer_name}</p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>📞 Số điện thoại:</strong> ${customer_phone}</p>
            <p style="margin: 0; font-size: 14px; color: #334155;"><strong>📍 Địa chỉ giao hàng:</strong> ${customer_address}</p>
          </div>

          <!-- Product Table -->
          <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Chi tiết sản phẩm đặt mua:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px 6px; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">STT</th>
                <th style="padding: 10px 6px; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">Sản phẩm</th>
                <th style="padding: 10px 6px; text-align: center; font-size: 12px; color: #475569; text-transform: uppercase;">SL</th>
                <th style="padding: 10px 6px; text-align: right; font-size: 12px; color: #475569; text-transform: uppercase;">Đơn giá</th>
                <th style="padding: 10px 6px; text-align: right; font-size: 12px; color: #475569; text-transform: uppercase;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr style="background-color: #fafafa;">
                <td colspan="3"></td>
                <td style="padding: 16px 6px; text-align: right; font-size: 15px; font-weight: bold; color: #1e293b;">TỔNG TIỀN:</td>
                <td style="padding: 16px 6px; text-align: right; font-size: 18px; font-weight: bold; color: #0284c7;">${formatVND(calculated_total)}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/#admin-dashboard" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">👉 Truy cập trang Quản trị đơn hàng</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0 0 5px 0;">Email gửi tự động từ <strong>${db.storeSettings.store_name} MVP</strong> do Resend.com hỗ trợ.</p>
          <p style="margin: 0;">Trụ sở: ${db.storeSettings.tax_address || 'Địa chỉ công ty'}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Try to fire Resend.com email if key available
  let emailSentStatus = false;
  let emailErrorMsg = '';

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY && RESEND_API_KEY.includes('re_') && RESEND_API_KEY !== 're_your_resend_api_key') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: ADMIN_EMAIL,
          subject: `🏥 Đơn hàng mới ${orderId} - ${customer_name}`,
          html: emailHtml
        })
      });

      if (response.ok) {
        emailSentStatus = true;
        console.log(`[Resend Email] Successfully sent notification email for Order ${orderId} to ${ADMIN_EMAIL}.`);
      } else {
        const errorText = await response.text();
        emailErrorMsg = `Resend Status ${response.status}: ${errorText}`;
        console.error(`[Resend Email Error]`, emailErrorMsg);
      }
    } catch (err: any) {
      emailErrorMsg = err.message || JSON.stringify(err);
      console.error(`[Resend Exception]`, err);
    }
  } else {
    emailErrorMsg = "RESEND_API_KEY chưa được cấu hình hoặc sử dụng giá trị mặc định. Email được mô phỏng hoàn chỉnh.";
    console.log(`[Resend Simulator] API key not loaded. Created rich HTML notification to view in Admin Dashboard.`);
  }

  // Double save mail to local logs directory so user can click to "Preview Order Email" directly in UI! (Spectacular feature)
  db.emailLogs.unshift({
    orderId,
    customer_name,
    html: emailHtml,
    sent_to: ADMIN_EMAIL,
    status: emailSentStatus ? 'SENT' : 'SIMULATED',
    error: emailErrorMsg,
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.json({
    success: true,
    orderId: orderId,
    emailSent: emailSentStatus,
    simulation: !emailSentStatus,
    error: emailErrorMsg
  });
});

app.post('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();
  
  const order = db.orders.find((o: any) => o.id === id);
  if (order) {
    order.status = status;
    writeDb(db);
    res.json(order);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// ---------------------- VITE ASSET MIDDLEWARE & SPA FALLBACK ----------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve React SPA index.html for any other URL to support React routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running robustly on http://0.0.0.0:${PORT}`);
  });
}

startServer();
