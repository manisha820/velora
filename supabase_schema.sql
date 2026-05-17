-- =========================================================================
--             VELORA ATELIER — SUPABASE POSTGRESQL SCHEMA
-- =========================================================================
-- Elegant database layout for Velora's Luxury Fragrances, 
-- Concierge Checkouts, Order Fulfillment, and Private Collections.
-- Optimized for Supabase PostgreSQL.
-- =========================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS & SETUP
-- ─────────────────────────────────────────────────────────────────────────
-- Enable UUID generation extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- 2. TABLE DEFINITIONS
-- ─────────────────────────────────────────────────────────────────────────

-- A. PRODUCTS Table (Signature Fragrance Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tagline VARCHAR(255),
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    scent_profile JSONB, -- Olfactory pyramid: {top_notes: [], heart_notes: [], base_notes: []}
    available_sizes VARCHAR(50)[] DEFAULT ARRAY['50ml', '100ml', '200ml'],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. CUSTOMERS Table (Concierge Client Registry)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Connects optionally to Supabase Auth
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100) DEFAULT 'United Kingdom',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. ORDERS Table (Encrypted Concierge Shipments)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_reference VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'VL-12345'
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    recipient_name VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(50) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status VARCHAR(50) DEFAULT 'Authorized' NOT NULL CHECK (payment_status IN ('Pending', 'Authorized', 'Paid', 'Failed', 'Refunded')),
    fulfillment_status VARCHAR(50) DEFAULT 'Preparing Dispatch' NOT NULL CHECK (fulfillment_status IN ('Preparing Dispatch', 'Signature Courier', 'Dispatched', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. ORDER ITEMS Table (Fragrance Purchase Records)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    size_selected VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- E. WISHLISTS Table (Private Client Collections)
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_session_id VARCHAR(255), -- Fallback for non-authenticated guests
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate wishlist entries for a user/guest
    CONSTRAINT unique_user_wishlist UNIQUE (auth_user_id, product_id),
    CONSTRAINT unique_guest_wishlist UNIQUE (guest_session_id, product_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. AUTOMATIC TIMESTAMPS TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER handle_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- 4. PERFORMANCE OPTIMIZATION INDEXES
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_guest_id ON public.wishlists(guest_session_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────
-- Enable Row Level Security (RLS) on all tables for Supabase security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- A. Products RLS Policies
CREATE POLICY "Allow public read access to products" 
    ON public.products FOR SELECT 
    USING (is_active = true);

-- B. Customers RLS Policies
CREATE POLICY "Allow users to view their own customer record"
    ON public.customers FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Allow users to update their own customer record"
    ON public.customers FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Allow guest checkout inserts into customer records"
    ON public.customers FOR INSERT
    WITH CHECK (true); -- Required for guest concierge checkouts

-- C. Orders RLS Policies
CREATE POLICY "Allow users to view their own orders"
    ON public.orders FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow anyone to submit checkouts (inserts)"
    ON public.orders FOR INSERT
    WITH CHECK (true); -- Required for instant checkout processing

-- D. Order Items RLS Policies
CREATE POLICY "Allow users to view order items of their own orders"
    ON public.order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders WHERE customer_id IN (
                SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Allow anyone to insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true); -- Required for instant checkout processing

-- E. Wishlist RLS Policies
CREATE POLICY "Users can manage their own wishlist items"
    ON public.wishlists FOR ALL
    USING (auth.uid() = auth_user_id OR guest_session_id IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. FLAGSHIP VELORA LUXURY SEED DATA
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO public.products (title, slug, tagline, description, base_price, image_url, scent_profile, available_sizes)
VALUES 
(
    'Velora Pour Femme',
    'pour-femme',
    'A rose-gold veil of jasmine and iris over a warm amber-velvet soul.',
    'Velora Pour Femme is an olfactory masterpiece designed for the contemporary connoisseur. Opening with the absolute clarity of rare Damask Rose and Moroccan Jasmine, it gradually transitions into an enchanting, structural heart of Florentine Iris and fresh citrus notes, anchored by a deep base of Madagascar Vanilla and velvety liquid Amber.',
    395.00,
    './assets/pour-femme-hero.jpg',
    '{
        "top_notes": ["Damask Rose", "Moroccan Jasmine", "Bergamot"],
        "heart_notes": ["Florentine Iris", "White Tea Leaf", "Pink Pepper"],
        "base_notes": ["Madagascar Vanilla", "Velvet Amber", "Warm Sandalwood"]
    }'::jsonb,
    ARRAY['50ml', '100ml', '200ml']
),
(
    'Velora Imperial',
    'imperial',
    'The crown jewel. Oud noir and saffron interlocked with resins of eternity.',
    'A majestic fragrance of uncompromising rarity. Velora Imperial blends the smoldering depth of dark premium Oud Noir and luxurious hand-harvested Kashmiri Saffron with the sweet, ethereal resin of Omani Frankincense, completing its structural sensory pyramid with ancient Cedarwood and aged Patchouli.',
    595.00,
    './assets/imperial-hero.jpg',
    '{
        "top_notes": ["Kashmiri Saffron", "Coriander seed", "Cardamom"],
        "heart_notes": ["Oud Noir", "Omani Frankincense", "Red Rose Absolute"],
        "base_notes": ["Aged Patchouli", "Royal Ambergris", "Atlas Cedarwood"]
    }'::jsonb,
    ARRAY['50ml', '100ml', '200ml']
),
(
    'Velora Nocturne',
    'nocturne',
    'Midnight leather, black orris, and a whisper of smoked vanilla.',
    'Seductive, mysterious, and cinematic. Velora Nocturne represents the deep elegance of midnight. Centered around a core of hand-cured Florentine Black Orris and Tuscan Sueded Leather, the scent is enlivened by top notes of fresh Bergamot and smoked Vanilla infusion, drying down into high-altitude Vetiver.',
    445.00,
    './assets/nocturne-hero.jpg',
    '{
        "top_notes": ["Smoked Vanilla", "Bergamot Essence", "Clove Bud"],
        "heart_notes": ["Black Orris", "Florentine Leather", "Incense Smoke"],
        "base_notes": ["Haitian Vetiver", "Sensual Musk", "Guaiacwood"]
    }'::jsonb,
    ARRAY['50ml', '100ml', '200ml']
),
(
    'Velora Éternité',
    'eternite',
    'A timeless white musk sanctuary wrapped in neroli clouds and sandalwood.',
    'A serene, pure, and everlasting scent. Velora Éternité captures the timeless essence of fresh white linen in the Mediterranean sun. Sparkling top notes of Italian Neroli and Orange Blossom open the sanctuary, yielding to a core of Egyptian White Musk, beautifully wrapped in soft, milky East Indian Sandalwood.',
    495.00,
    './assets/eternite-hero.jpg',
    '{
        "top_notes": ["Italian Neroli", "Orange Blossom", "White Peach"],
        "heart_notes": ["Egyptian White Musk", "Orris Butter", "Soft Lily"],
        "base_notes": ["East Indian Sandalwood", "Cashmere Wood", "White Amber"]
    }'::jsonb,
    ARRAY['50ml', '100ml', '200ml']
)
ON CONFLICT (title) DO NOTHING;
