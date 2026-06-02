// Types for our E-commerce MVP

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  original_price: number;
  discount_percent: number;
  price_after_discount: number;
  description_short: string;
  description_detail: string;
  image_url: string;
  video_url?: string;
  is_featured: boolean;
  is_hot_deal: boolean;
  is_flash_sale: boolean;
  created_at?: string;
}

export interface StoreSettings {
  logo_url: string;
  store_name: string;
  slogan: string;
  business_name: string;
  tax_code: string;
  tax_address: string;
  phone: string;
  email: string;
  shopee_url: string;
  tiktok_url: string;
  facebook_url: string;
  zalo_url: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  items: OrderItem[];
}
