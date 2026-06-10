-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog tables (no auth required)
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view brands" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Public can view suppliers" ON public.suppliers
  FOR SELECT USING (true);

CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Public can view product_suppliers" ON public.product_suppliers
  FOR SELECT USING (true);

CREATE POLICY "Public can view stores" ON public.stores
  FOR SELECT USING (true);

CREATE POLICY "Public can view product_stores" ON public.product_stores
  FOR SELECT USING (true);

CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Favorites policies (authenticated users only)
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies (authenticated users only)
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);
