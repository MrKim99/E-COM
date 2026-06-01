export interface Product {
  id: string;
  name: string;
  category: string;
  original_price: number;
  discount_percent: number;
  discounted_price: number; // calculated
  description: string;
  image_url: string;
  video_url?: string;
  is_featured: boolean;
  is_on_sale: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_notes?: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface AdminConfig {
  supabaseConnected: boolean;
  resendConnected: boolean;
  sellerEmail: string;
}

export interface StoreSettings {
  logo_url: string;
  store_name: string;
  store_slogan: string;
  corporate_name: string;
  tax_code: string;
  business_address: string;
  hotline: string;
  email: string;
  order_email?: string;
  shopee_url: string;
  tiktok_url: string;
  facebook_url: string;
  zalo_url: string;
}
