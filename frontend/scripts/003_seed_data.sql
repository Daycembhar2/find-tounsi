-- Insert sample categories
INSERT INTO public.categories (name, name_ar, slug, description, icon) VALUES
  ('Alimentation', 'المواد الغذائية', 'alimentation', 'Produits alimentaires tunisiens', '🍽️'),
  ('Boissons', 'المشروبات', 'boissons', 'Boissons locales', '🥤'),
  ('Cosmétiques', 'مستحضرات التجميل', 'cosmetiques', 'Produits de beauté tunisiens', '💄'),
  ('Textile', 'المنسوجات', 'textile', 'Vêtements et tissus tunisiens', '👕'),
  ('Artisanat', 'الحرف اليدوية', 'artisanat', 'Produits artisanaux', '🏺'),
  ('Électronique', 'الإلكترونيات', 'electronique', 'Produits électroniques tunisiens', '📱')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample brands
INSERT INTO public.brands (name, name_ar, logo_url, description, is_verified, founded_year) VALUES
  ('Délice', 'دليس', '/placeholder.svg?height=100&width=100', 'Leader des produits laitiers en Tunisie', true, 1985),
  ('Alyssa', 'أليسا', '/placeholder.svg?height=100&width=100', 'Produits de boulangerie et pâtisserie', true, 2003),
  ('Sicam', 'سيكام', '/placeholder.svg?height=100&width=100', 'Conserves alimentaires tunisiennes', true, 1947),
  ('Carthage', 'قرطاج', '/placeholder.svg?height=100&width=100', 'Boissons gazeuses et jus', true, 1950),
  ('Zina', 'زينة', '/placeholder.svg?height=100&width=100', 'Cosmétiques naturels tunisiens', true, 2010)
ON CONFLICT DO NOTHING;

-- Insert sample suppliers
INSERT INTO public.suppliers (name, name_ar, city, address, phone, latitude, longitude) VALUES
  ('Délice Danone Tunisie', 'دليس دانون تونس', 'Tunis', 'Zone Industrielle La Charguia', '+216 71 123 456', 36.8419, 10.2714),
  ('SICAM', 'سيكام', 'Bizerte', 'Route de Tunis Km 5', '+216 72 456 789', 37.2744, 9.8739),
  ('Les Boissons de Carthage', 'مشروبات قرطاج', 'Tunis', 'Avenue Habib Bourguiba', '+216 71 789 012', 36.8065, 10.1815)
ON CONFLICT DO NOTHING;

-- Get category and brand IDs for products
DO $$
DECLARE
  cat_alimentation UUID;
  cat_boissons UUID;
  cat_cosmetiques UUID;
  brand_delice UUID;
  brand_carthage UUID;
  brand_zina UUID;
  brand_alyssa UUID;
BEGIN
  SELECT id INTO cat_alimentation FROM public.categories WHERE slug = 'alimentation';
  SELECT id INTO cat_boissons FROM public.categories WHERE slug = 'boissons';
  SELECT id INTO cat_cosmetiques FROM public.categories WHERE slug = 'cosmetiques';
  
  SELECT id INTO brand_delice FROM public.brands WHERE name = 'Délice';
  SELECT id INTO brand_carthage FROM public.brands WHERE name = 'Carthage';
  SELECT id INTO brand_zina FROM public.brands WHERE name = 'Zina';
  SELECT id INTO brand_alyssa FROM public.brands WHERE name = 'Alyssa';

  -- Insert sample products
  INSERT INTO public.products (name, name_ar, description, barcode, category_id, brand_id, price, image_url) VALUES
    ('Lait Délice Demi-écrémé 1L', 'حليب دليس نصف دسم 1 لتر', 'Lait UHT demi-écrémé de qualité supérieure', '6191505100123', cat_alimentation, brand_delice, 2.500, '/placeholder.svg?height=400&width=400'),
    ('Yaourt Délice Nature 4x125g', 'ياغورت دليس طبيعي', 'Yaourt nature crémeux', '6191505200456', cat_alimentation, brand_delice, 3.200, '/placeholder.svg?height=400&width=400'),
    ('Jus Carthage Orange 1L', 'عصير قرطاج برتقال', 'Jus d''orange 100% naturel', '6111234567890', cat_boissons, brand_carthage, 4.500, '/placeholder.svg?height=400&width=400'),
    ('Eau minérale Carthage 1.5L', 'ماء معدني قرطاج', 'Eau minérale naturelle', '6111234500001', cat_boissons, brand_carthage, 0.800, '/placeholder.svg?height=400&width=400'),
    ('Crème Hydratante Zina', 'كريم مرطب زينة', 'Crème à base d''huile d''olive tunisienne', '6151234567891', cat_cosmetiques, brand_zina, 15.000, '/placeholder.svg?height=400&width=400'),
    ('Pain de Mie Alyssa 500g', 'خبز التوست أليسا', 'Pain de mie moelleux', '6171234567892', cat_alimentation, brand_alyssa, 2.800, '/placeholder.svg?height=400&width=400')
  ON CONFLICT (barcode) DO NOTHING;
END $$;

-- Insert sample stores
INSERT INTO public.stores (name, name_ar, city, address, phone, latitude, longitude, store_type) VALUES
  ('Carrefour Lac 2', 'كارفور البحيرة 2', 'Tunis', 'Les Berges du Lac', '+216 71 123 000', 36.8419, 10.2714, 'Hypermarché'),
  ('Monoprix Centre Ville', 'مونوبري وسط المدينة', 'Tunis', 'Avenue Habib Bourguiba', '+216 71 234 000', 36.8008, 10.1815, 'Supermarché'),
  ('Géant Sousse', 'جيون سوسة', 'Sousse', 'Route de la Corniche', '+216 73 345 000', 35.8256, 10.6369, 'Hypermarché'),
  ('Aziza Sfax', 'عزيزة صفاقس', 'Sfax', 'Avenue Majida Boulila', '+216 74 456 000', 34.7406, 10.7603, 'Supermarché')
ON CONFLICT DO NOTHING;
