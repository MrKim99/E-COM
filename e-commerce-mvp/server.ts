import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cache-busting middleware for all API routing to prevent severe edge caching on Vercel
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const SETTINGS_FILE_PATH = path.join(process.cwd(), "settings-db.json");

const defaultSettings = {
  logo_url: "",
  store_name: "MEDSTORE",
  store_slogan: "Chất lượng là ưu tiên số 1",
  corporate_name: "Công ty Cổ phần Đầu tư Y tế MedStore Việt Nam",
  tax_code: "0109876543",
  business_address: "Số 45, Đường Giải Phóng, Phường Phương Mai, Quận Đống Đa, Hà Nội",
  hotline: "1900 6000",
  email: "achau.kimduc@gmail.com",
  order_email: "achau.kimduc@gmail.com",
  shopee_url: "https://shopee.vn/medstore",
  tiktok_url: "https://tiktok.com/@medstore",
  facebook_url: "https://facebook.com/medstore",
  zalo_url: "https://zalo.me/0987654321"
};

let currentSettingsCache: any = null;

function readStoreSettings() {
  if (currentSettingsCache) {
    return currentSettingsCache;
  }
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      currentSettingsCache = { ...defaultSettings, ...JSON.parse(content) };
      return currentSettingsCache;
    }
  } catch (err) {
    console.error("Error reading settings-db.json, using defaults:", err);
  }
  currentSettingsCache = { ...defaultSettings };
  return currentSettingsCache;
}

async function readStoreSettingsAsync() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("id", "store_settings")
        .single();
      
      if (!error && data && data.value) {
        console.log("Loaded store settings from Supabase database.");
        currentSettingsCache = { ...defaultSettings, ...data.value };
        return currentSettingsCache;
      } else if (error && error.code === "PGRST116") {
        // Table exists but row not found. Let's auto-seed settings
        console.log("Settings row not found in Supabase. Auto-seeding default store configs...");
        const defaultWithMerged = { ...defaultSettings };
        try {
          if (fs.existsSync(SETTINGS_FILE_PATH)) {
            const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
            Object.assign(defaultWithMerged, JSON.parse(content));
          }
        } catch (e) {}

        await supabase
          .from("settings")
          .upsert({ id: "store_settings", value: defaultWithMerged });
        
        currentSettingsCache = defaultWithMerged;
        return currentSettingsCache;
      }
    } catch (err) {
      console.warn("Unable to query settings table from Supabase (may need SQL schema setup):", err);
    }
  }

  return readStoreSettings();
}

async function writeStoreSettingsAsync(settings: any) {
  currentSettingsCache = { ...defaultSettings, ...settings };
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ id: "store_settings", value: currentSettingsCache });
      if (!error) {
        console.log("Successfully persisted store settings to Supabase.");
      } else {
        console.warn("Supabase settings upsert failed:", error.message);
      }
    } catch (e) {
      console.warn("Could not save settings to Supabase (table may not exist):", e);
    }
  }

  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(currentSettingsCache, null, 2), "utf-8");
    return true;
  } catch (err: any) {
    console.warn("Writing settings-db.json failed - using in-memory settings backup:", err.message);
    return true;
  }
}


// Endpoint to handle Base64 file uploads from client
app.post("/api/upload", async (req, res) => {
  const { name, base64 } = req.body;
  if (!base64 || !name) {
    return res.status(400).json({ error: "No base64 data or filename provided" });
  }

  try {
    // Remove data:image/...;base64, prefix if present
    const matches = base64.match(/^data:(image\/\w+);base64,/);
    const mimeType = matches ? matches[1] : "image/png";
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const ext = path.extname(name) || '.png';
    const timestamp = Date.now();
    const safeName = `${timestamp}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    // Try uploading to Supabase Storage if connection is present
    const supabase = getSupabase();
    if (supabase) {
      try {
        const bucketName = "uploads";
        // Attempt to upload file
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(safeName, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (!error) {
          const publicUrl = supabase.storage.from(bucketName).getPublicUrl(safeName).data.publicUrl;
          console.log(`Successfully uploaded file to Supabase Storage: ${publicUrl}`);
          return res.json({ url: publicUrl });
        } else {
          console.warn("Supabase storage upload failed, trying bucket creation...", error.message);
          // Auto create bucket if not exist (since RLS may allow public read)
          await supabase.storage.createBucket(bucketName, { public: true });
          const { error: retryError } = await supabase.storage
            .from(bucketName)
            .upload(safeName, buffer, {
              contentType: mimeType,
              upsert: true
            });
          
          if (!retryError) {
            const publicUrl = supabase.storage.from(bucketName).getPublicUrl(safeName).data.publicUrl;
            console.log(`Successfully uploaded file to Supabase Storage on retry: ${publicUrl}`);
            return res.json({ url: publicUrl });
          } else {
            console.warn("Supabase storage retry upload failed:", retryError.message);
          }
        }
      } catch (storageErr) {
        console.warn("Supabase storage connection failed during upload:", storageErr);
      }
    }

    // Disk-based fallback for standard local server containers
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);
    console.log(`Successfully saved uploaded file locally to ${filePath}`);
    return res.json({ url: `/uploads/${safeName}` });
  } catch (error: any) {
    console.error("Error during file upload saving:", error);
    return res.status(500).json({ error: "Could not save uploaded file", details: error.message });
  }
});

// In-Memory Database fallback for product/orders to ensure instant out-of-the-box functionality in the AI Studio preview
let localProducts = [
  {
    id: "prod-1",
    name: "Máy Đo Huyết Áp Omron HEM-7120",
    category: "Thiết bị",
    original_price: 1200000,
    discount_percent: 15,
    discounted_price: 1020000,
    description: "Máy đo huyết áp bắp tay tự động Omron HEM-7120 sử dụng công nghệ Intellisense tiên tiến, cho kết quả đo nhanh, chính xác và dễ sử dụng. Có cảnh báo nhịp tim không đều và hiển thị lịch sử đo.",
    image_url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    is_featured: true,
    is_on_sale: true,
  },
  {
    id: "prod-2",
    name: "Khẩu Trang Y Tế 3D Mask Medi (Hộp 50 cái)",
    category: "Vật tư",
    original_price: 65000,
    discount_percent: 20,
    discounted_price: 52000,
    description: "Khẩu trang 3D kháng khuẩn ôm sát khuôn mặt, cấu trúc màng lọc đa lớp mật độ cao giúp ngăn chặn bụi mịn, phấn hoa và vi khuẩn hiệu quả 99%. Chất liệu mềm mại không gây đau tai.",
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    video_url: "",
    is_featured: false,
    is_on_sale: true,
  },
  {
    id: "prod-3",
    name: "Viên Sủi Vitamin C 1000mg MyVita (Tuýp 20 viên)",
    category: "Dược phẩm",
    original_price: 45000,
    discount_percent: 10,
    discounted_price: 40500,
    description: "Bổ sung lượng Vitamin C cần thiết hàng ngày, giúp tăng cường sức đề kháng, giảm căng thẳng mệt mỏi và làm sáng da. Hương cam tự nhiên thơm ngon dễ uống.",
    image_url: "https://images.unsplash.com/photo-1616679911721-fe6eec140453?auto=format&fit=crop&w=800&q=80",
    video_url: "",
    is_featured: true,
    is_on_sale: true,
  },
  {
    id: "prod-4",
    name: "Nhiệt Kế Hồng Ngoại Đo Trán Microlife FR1MF1",
    category: "Thiết bị",
    original_price: 950000,
    discount_percent: 5,
    discounted_price: 902500,
    description: "Đo nhiệt độ trán không tiếp xúc trong 1 giây, cực kỳ an toàn và vệ sinh cho trẻ em. Màn hình LCD có đèn nền thông báo sốt thông minh bằng màu sắc (xanh/đỏ).",
    image_url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
    video_url: "",
    is_featured: true,
    is_on_sale: false,
  },
  {
    id: "prod-5",
    name: "Gel Rửa Tay Khô Sát Khuẩn Green Cross (Chai 250ml)",
    category: "Vật tư",
    original_price: 48000,
    discount_percent: 0,
    discounted_price: 48000,
    description: "Sát khuẩn nhanh 99.9% vi khuẩn có hại bám trên tay chỉ với 1 lượng gel nhỏ. Chứa thành phần dưỡng ẩm giúp dưỡng da tay mềm mại, hương thơm dịu nhẹ, tươi mát.",
    image_url: "https://images.unsplash.com/photo-1584515901387-a5c17926b523?auto=format&fit=crop&w=800&q=80",
    video_url: "",
    is_featured: false,
    is_on_sale: false,
  }
];

let localOrders: any[] = [
  {
    id: "ord-test-1",
    customer_name: "Nguyên Văn A",
    customer_phone: "0987654321",
    customer_address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    customer_notes: "Giao giờ hành chính, gọi trước khi giao",
    total_amount: 1072000,
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

let localOrderItems: any[] = [
  {
    id: "item-1",
    order_id: "ord-test-1",
    product_id: "prod-1",
    product_name: "Máy Đo Huyết Áp Omron HEM-7120",
    quantity: 1,
    unit_price: 1020000
  },
  {
    id: "item-2",
    order_id: "ord-test-1",
    product_id: "prod-3",
    product_name: "Viên Sủi Vitamin C 1000mg MyVita (Tuýp 20 viên)",
    quantity: 1,
    unit_price: 40500
  }
];

// Lazy initialization helpers to prevent startup crashes when keys are missing or changed
let supabaseClient: any = null;
let resendClient: Resend | null = null;

function getSupabase() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceRoleKey)) {
    return null;
  }

  // Clean and sanitize strings by trimming and stripping enclosing single or double quotes
  url = url.trim().replace(/^['"]|['"]$/g, "");
  if (anonKey) anonKey = anonKey.trim().replace(/^['"]|['"]$/g, "");
  if (serviceRoleKey) serviceRoleKey = serviceRoleKey.trim().replace(/^['"]|['"]$/g, "");

  if (!url.startsWith("http")) {
    console.warn("Invalid Supabase URL format after cleaning:", url);
    return null;
  }

  if (!supabaseClient) {
    // Prefer service role key for backend operations if available
    const keyToUse = serviceRoleKey || anonKey;
    supabaseClient = createClient(url, keyToUse!);
  }
  return supabaseClient;
}

function getResend() {
  let apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  apiKey = apiKey.trim().replace(/^['"]|['"]$/g, "");
  if (!apiKey || apiKey === "MY_RESEND_API_KEY" || apiKey === "re_123456789abcdef") {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const getSellerEmail = () => {
  try {
    const currentSettings = readStoreSettings();
    if (currentSettings && currentSettings.order_email) {
      return currentSettings.order_email;
    }
  } catch (err) {
    console.error("Error determining seller order email, using env fallback:", err);
  }
  return process.env.SELLER_EMAIL || process.env.NEXT_PUBLIC_SELLER_EMAIL || "achau.kimduc@gmail.com";
};

// --- API ENDPOINTS ---

// 1. Get system & integration configuration statuses
app.get("/api/config", async (req, res) => {
  const settings = await readStoreSettingsAsync();
  res.json({
    supabaseConnected: !!getSupabase(),
    resendConnected: !!getResend(),
    sellerEmail: settings.order_email || "achau.kimduc@gmail.com",
  });
});

// 1b. Get and Update Store Settings
app.get("/api/settings", async (req, res) => {
  const currentSettings = await readStoreSettingsAsync();
  res.json(currentSettings);
});

app.post("/api/settings", async (req, res) => {
  const settingsData = req.body;
  if (!settingsData) {
    return res.status(400).json({ error: "Dữ liệu cấu hình trống." });
  }

  const current = await readStoreSettingsAsync();
  const merged = { ...current, ...settingsData };
  
  const success = await writeStoreSettingsAsync(merged);
  if (success) {
    res.json({ success: true, settings: merged });
  } else {
    res.status(500).json({ error: "Không thể lưu tệp cấu hình." });
  }
});


// 2. Auth: Admin login handler
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const settings = await readStoreSettingsAsync();
  const targetSellerEmail = settings.order_email || "achau.kimduc@gmail.com";

  // If Supabase is connected, we can try to log in via Supabase Auth
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        // Successful Supabase Authentication
        // Return details
        return res.json({
          success: true,
          user: {
            email: data.user.email,
            id: data.user.id,
            role: "admin",
          },
          token: data.session?.access_token,
        });
      }
    } catch (e) {
      console.warn("Supabase auth attempt failed/unconfigured:", e);
    }
  }

  // Fallback / Stand-alone auth checking matching configured SELLER_EMAIL or simple preview credentials
  const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (
    (email === targetSellerEmail && password === defaultPassword) ||
    (email === "admin" && password === "admin123") ||
    (email === "achau.kimduc@gmail.com" && password === "admin123")
  ) {
    return res.json({
      success: true,
      user: {
        email: email,
        id: "admin-local-id",
        role: "admin",
      },
      token: "local-bypass-jwt-token-key-2026",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Email hoặc mật khẩu không chính xác. Sử dụng mật khẩu mặc định 'admin123' cho tài khoản bán hàng.",
  });
});

// 3. Products: List products
app.get("/api/products", async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // AUTOMATIC SEEDING IF CLOUD DB IS CONNECTED BUT HAS 0 PRODUCTS
        if (data.length === 0) {
          console.log("Supabase products schema exists but has 0 items. Auto-seeding default medicines so shop page has content...");
          try {
            const seedProducts = localProducts.map(p => ({
              name: p.name,
              category: p.category,
              original_price: p.original_price,
              discount_percent: p.discount_percent,
              description: p.description,
              image_url: p.image_url,
              video_url: p.video_url || "",
              is_featured: p.is_featured,
              is_on_sale: p.is_on_sale
            }));
            const { data: inserted, error: insertError } = await supabase
              .from("products")
              .insert(seedProducts)
              .select();
            
            if (!insertError && inserted) {
              console.log(`Auto-seeded ${inserted.length} default products in Supabase.`);
              const formatted = inserted.map((p: any) => ({
                ...p,
                discounted_price: p.original_price - (p.original_price * (p.discount_percent || 0)) / 100,
              }));
              return res.json(formatted);
            } else {
              console.warn("Auto-seeding products into Supabase failed:", insertError);
            }
          } catch (seedErr) {
            console.error("Products seeding exception caught:", seedErr);
          }
        } else {
          // Format products to match interface requirements (ensure discounted_price is computed)
          const formatted = data.map((p: any) => ({
            ...p,
            discounted_price: p.original_price - (p.original_price * (p.discount_percent || 0)) / 100,
          }));
          return res.json(formatted);
        }
      } else {
        console.warn("Supabase products fetch failed, using local memory:", error);
      }
    } catch (err) {
      console.warn("Error calling Supabase products, using local fallback:", err);
    }
  }

  // Fallback to local items
  res.json(localProducts);
});

// 4. Products: Create or Update (Admin)
app.post("/api/products", async (req, res) => {
  const productData = req.body;
  const supabase = getSupabase();

  const originalPrice = Number(productData.original_price || 0);
  const discountPercent = Number(productData.discount_percent || 0);
  const discountedPrice = originalPrice - (originalPrice * discountPercent) / 100;

  const payload = {
    name: productData.name,
    category: productData.category,
    original_price: originalPrice,
    discount_percent: discountPercent,
    description: productData.description,
    image_url: productData.image_url,
    video_url: productData.video_url || "",
    is_featured: !!productData.is_featured,
    is_on_sale: !!productData.is_on_sale,
  };

  if (supabase) {
    try {
      let result;
      if (productData.id && !productData.id.startsWith("prod-")) {
        // Update
        result = await supabase
          .from("products")
          .update(payload)
          .eq("id", productData.id)
          .select();
      } else {
        // Insert
        result = await supabase
          .from("products")
          .insert([payload])
          .select();
      }

      if (!result.error && result.data && result.data.length > 0) {
        const p = result.data[0];
        return res.json({
          ...p,
          discounted_price: p.original_price - (p.original_price * (p.discount_percent || 0)) / 100,
        });
      } else {
        console.warn("Supabase write error, trying local storage fallback", result.error);
      }
    } catch (err) {
      console.warn("Error with Supabase Write, doing local save", err);
    }
  }

  // Local fallback write
  if (productData.id && productData.id.startsWith("prod-")) {
    // edit in-memory
    const idx = localProducts.findIndex(p => p.id === productData.id);
    if (idx !== -1) {
      localProducts[idx] = {
        ...localProducts[idx],
        ...payload,
        discounted_price: discountedPrice,
      };
      return res.json(localProducts[idx]);
    }
  }

  // Create new
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...payload,
    discounted_price: discountedPrice,
  };
  localProducts.unshift(newProduct);
  res.json(newProduct);
});

// 5. Products: Delete Product
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  if (supabase && !id.startsWith("prod-")) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        return res.json({ success: true });
      }
    } catch (e) {
      console.error(e);
    }
  }

  localProducts = localProducts.filter(p => p.id !== id);
  res.json({ success: true });
});

// 6. Orders: Fetch orders (Admin)
app.get("/api/orders", async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: dbOrders, error: err1 } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!err1 && dbOrders) {
        // Pull items
        const { data: dbItems, error: err2 } = await supabase
          .from("order_items")
          .select("*");

        const ordersWithItems = dbOrders.map((ord: any) => ({
          ...ord,
          items: dbItems ? dbItems.filter((it: any) => it.order_id === ord.id) : []
        }));
        return res.json(ordersWithItems);
      }
    } catch (e) {
      console.warn("Supabase fetch orders error, local fallback:", e);
    }
  }

  // Local fallback
  const fallbackOrders = localOrders.map(ord => ({
    ...ord,
    items: localOrderItems.filter(item => item.order_id === ord.id)
  }));
  res.json(fallbackOrders);
});

// 7. Orders: Confirm new order (and send Resend Email!)
app.post("/api/orders", async (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !items || items.length === 0) {
    return res.status(400).json({ error: "Dữ liệu đặt hàng thiếu thông tin." });
  }

  const orderId = `ord-${Date.now()}`;
  const totalAmount = items.reduce((sum: number, it: any) => sum + (it.quantity * it.price), 0);

  let savedOrderObj = null;
  let savedItems: any[] = [];

  const supabase = getSupabase();
  if (supabase) {
    try {
      // 1. Ghi nhận đơn hàng vào bảng `orders`
      const { data: ordRes, error: ordErr } = await supabase
        .from("orders")
        .insert([{
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address,
          customer_notes: customer.notes || "",
          total_amount: totalAmount,
          status: "pending"
        }])
        .select();

      if (!ordErr && ordRes && ordRes.length > 0) {
        const createdOrder = ordRes[0];
        savedOrderObj = createdOrder;

        // 2. Ghi nhận vào bảng `order_items`
        const pgItems = items.map((it: any) => ({
          order_id: createdOrder.id,
          product_id: it.product_id.startsWith("prod-") ? null : it.product_id, // link if it matches database UUID schema
          product_name: it.name,
          quantity: it.quantity,
          unit_price: it.price
        }));

        const { data: itemsRes, error: itemsErr } = await supabase
          .from("order_items")
          .insert(pgItems)
          .select();

        if (!itemsErr && itemsRes) {
          savedItems = itemsRes;
        }
      } else {
        console.warn("Supabase order insert error:", ordErr);
      }
    } catch (e) {
      console.warn("Supabase full transaction error, using local fallback", e);
    }
  }

  // Fallback to memory insert if not written to Supabase
  if (!savedOrderObj) {
    savedOrderObj = {
      id: orderId,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_notes: customer.notes || "",
      total_amount: totalAmount,
      status: "pending",
      created_at: new Date().toISOString()
    };
    localOrders.unshift(savedOrderObj);

    savedItems = items.map((it: any, index: number) => {
      const itemRow = {
        id: `item-${Date.now()}-${index}`,
        order_id: orderId,
        product_id: it.product_id,
        product_name: it.name,
        quantity: it.quantity,
        unit_price: it.price
      };
      localOrderItems.push(itemRow);
      return itemRow;
    });
  }

  // HTML Professional Email Body
  const formattedItemsHtml = items.map((it: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: sans-serif; font-size: 14px; color: #333;">${it.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: sans-serif; font-size: 14px; text-align: center; color: #333;">${it.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: sans-serif; font-size: 14px; text-align: right; color: #333;">${it.price.toLocaleString('vi-VN')} đ</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: sans-serif; font-size: 14px; text-align: right; font-weight: bold; color: #0f172a;">${(it.quantity * it.price).toLocaleString('vi-VN')} đ</td>
    </tr>
  `).join("");

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
      <div style="background-color: #0f172a; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.05em; font-weight: 600;">E-COMMERCE MVP</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; font-family: monospace;">ĐƠN HÀNG MỚI ĐÃ ĐƯỢC XÁC NHẬN</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Xin chào <strong>Chủ Cửa Hàng (Admin)</strong>,</p>
        <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0;">Hệ thống vừa ghi nhận một đơn đặt hàng mới từ khách hàng qua Website của bạn. Dưới đây là thông tin chi tiết:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Thông tin khách đặt hàng</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 120px;">Họ tên:</td>
              <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${customer.name}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Số điện thoại:</td>
              <td style="padding: 4px 0; color: #0f172a; font-weight: 500;">
                <a href="tel:${customer.phone}" style="color: #0284c7; text-decoration: none;">${customer.phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Địa chỉ:</td>
              <td style="padding: 4px 0; color: #0f172a;">${customer.address}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Ghi chú khách:</td>
              <td style="padding: 4px 0; color: #475569; font-style: italic;">${customer.notes || "(Không có ghi chú)"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Mã đơn hàng:</td>
              <td style="padding: 4px 0; color: #475569; font-family: monospace;">${savedOrderObj.id}</td>
            </tr>
          </table>
        </div>

        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase;">Danh sách sản phẩm mua</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0;">Sản phẩm</th>
              <th style="padding: 10px; text-align: center; font-size: 12px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; width: 40px;">SL</th>
              <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; width: 100px;">Đơn giá</th>
              <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; width: 120px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${formattedItemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Tổng cộng thanh toán:</p>
          <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: bold; color: #df1b1b;">${totalAmount.toLocaleString('vi-VN')} đ</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">Đây là email tự động gửi từ website E-Commerce MVP hệ thống.</p>
        </div>
      </div>
    </div>
  `;

  let emailSent = false;
  let emailLogMsg = "Resend API key not configured. Simulated sending to seller's email address in developer mode.";

  const resend = getResend();
  if (resend) {
    try {
      const settings = await readStoreSettingsAsync();
      const sellerEmail = settings.order_email || "achau.kimduc@gmail.com";
      
      const mailResponse = await resend.emails.send({
        from: "E-Commerce MVP <onboarding@resend.dev>", // Default sandboxed domain
        to: [sellerEmail],
        subject: `[ĐƠN HÀNG MỚI] #${savedOrderObj.id} - ${customer.name}`,
        html: emailHtml,
      });

      if (mailResponse && !mailResponse.error) {
        emailSent = true;
        emailLogMsg = `Gửi email thành công tới ${sellerEmail} qua Resend Live. ID: ${mailResponse.data?.id}`;
      } else {
        console.error("Resend sending returned error:", mailResponse.error);
        emailLogMsg = `Lỗi Resend API: [Cần cấu hình API Key Live và đặt email nhận trùng khớp với tài khoản đăng ký Resend] Chi tiết: ${JSON.stringify(mailResponse.error)}`;
      }
    } catch (err: any) {
      console.error("Error invoking Resend Client:", err);
      emailLogMsg = `Lỗi hệ thống khi gọi Resend: ${err?.message || err}`;
    }
  }

  res.json({
    success: true,
    order: savedOrderObj,
    items: savedItems,
    emailSent,
    emailLog: emailLogMsg
  });
});


// Serve static frontend assets and index.html based on Node environment
// Vite handles asset serving dynamically in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML entry in production
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only bind port when not running as a Vercel Serverless Function
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`E-Commerce MVP Full Stack server running at http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
