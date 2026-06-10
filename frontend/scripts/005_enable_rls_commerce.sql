-- Enable RLS on new commerce tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sellers policies
CREATE POLICY "Anyone can view verified sellers" ON public.sellers FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Sellers can view their own profile" ON public.sellers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Sellers can update their own profile" ON public.sellers FOR UPDATE
  USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view their orders" ON public.orders FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their orders" ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert payments" ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Delivery tracking policies
CREATE POLICY "Users can view their delivery tracking" ON public.delivery_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = delivery_tracking.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view their chat messages" ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert chat messages" ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seller ratings policies
CREATE POLICY "Anyone can view seller ratings" ON public.seller_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert seller ratings" ON public.seller_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
