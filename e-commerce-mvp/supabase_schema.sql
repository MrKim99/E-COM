-- SQL SCHEMA FOR SUPABASE DATABASE

-- 1. Create table `products`
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    original_price NUMERIC NOT NULL CHECK (original_price >= 0),
    discount_percent NUMERIC DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    description TEXT,
    image_url TEXT NOT NULL,
    video_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table `orders`
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_notes TEXT,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    status TEXT DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table `order_items`
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0)
);

-- Enable Row Level Security (RLS) on tables for maximum protection
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- PRODUCTS policies:
-- anyone can read products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- admin of database (authenticated via service role or admin auth) can write
DROP POLICY IF EXISTS "Allow admin write access to products" ON public.products;
CREATE POLICY "Allow admin write access to products" ON public.products
    FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@yourseller.com' OR auth.jwt() ->> 'email' = 'achau.kimduc@gmail.com');


-- ORDERS policies:
-- customers can insert orders, admin can do everything
DROP POLICY IF EXISTS "Allow anyone to create an order" ON public.orders;
CREATE POLICY "Allow anyone to create an order" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to orders" ON public.orders;
CREATE POLICY "Allow admin full access to orders" ON public.orders
    FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@yourseller.com' OR auth.jwt() ->> 'email' = 'achau.kimduc@gmail.com');


-- ORDER ITEMS policies:
-- customers can insert order items
DROP POLICY IF EXISTS "Allow anyone to create order items" ON public.order_items;
CREATE POLICY "Allow anyone to create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admin full access to order_items" ON public.order_items;
CREATE POLICY "Allow admin full access to order_items" ON public.order_items
    FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@yourseller.com' OR auth.jwt() ->> 'email' = 'achau.kimduc@gmail.com');


-- 4. Create table `settings` for store configuration persistence across serverless boots
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'store_settings',
    value JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Select policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings" ON public.settings
    FOR SELECT USING (true);

-- Admin policies
DROP POLICY IF EXISTS "Allow admin full access to settings" ON public.settings;
CREATE POLICY "Allow admin full access to settings" ON public.settings
    FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@yourseller.com' OR auth.jwt() ->> 'email' = 'achau.kimduc@gmail.com');
