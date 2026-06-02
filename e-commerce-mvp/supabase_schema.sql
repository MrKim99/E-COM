-- SQL Database Schema for E-commerce MVP
-- This script sets up the following tables: store_settings, categories, products, orders, order_items.
-- Copy and run this script in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create table `categories`
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create table `products`
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    original_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    -- Price after discount can be computed dynamically or persisted. We store it for indexing speed.
    price_after_discount NUMERIC(15, 2) GENERATED ALWAYS AS (original_price * (1 - discount_percent / 100)) STORED,
    description_short TEXT,
    description_detail TEXT,
    image_url TEXT,
    video_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_hot_deal BOOLEAN NOT NULL DEFAULT FALSE,
    is_flash_sale BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create table `store_settings`
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    logo_url TEXT,
    store_name VARCHAR(255) NOT NULL DEFAULT 'Cửa hàng MVP',
    slogan VARCHAR(255) NOT NULL DEFAULT 'Sản phẩm chính hãng - Chăm sóc tận tâm',
    business_name VARCHAR(255),
    tax_code VARCHAR(100),
    tax_address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    shopee_url TEXT,
    tiktok_url TEXT,
    facebook_url TEXT,
    zalo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create table `orders`
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- NEW, CONFIRMED, SHIPPED, COMPLETED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create table `order_items`
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- Keep local snapshot in case product is deleted
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_purchase NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial store_settings row if empty
INSERT INTO store_settings (id, store_name, slogan, business_name, tax_code, tax_address, phone, email)
VALUES (
    'default', 
    'MediShop MVP', 
    'Thiết Bị Y Tế & Dược Phẩm Chính Hãng', 
    'Công ty Cổ phần Công nghệ Y tế MediShop Việt Nam', 
    '0109876543', 
    '123 Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội', 
    '0987654321', 
    'support@medishop.com'
) ON CONFLICT (id) DO NOTHING;

-- Seed initial categories to make development easier
INSERT INTO categories (name, slug) VALUES 
('Thiết bị', 'thiet-bi'),
('Vật tư', 'vat-tu'),
('Dược phẩm', 'duoc-pham')
ON CONFLICT (name) DO NOTHING;
