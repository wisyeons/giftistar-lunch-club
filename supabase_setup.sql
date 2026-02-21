-- Giftistar Lunch Club Schema
-- Run this entire script in your Supabase SQL Editor

-- 1. Create Users Table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  wallet_balance INTEGER DEFAULT 50000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger to automatically create a public.user when a new auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, wallet_balance)
  VALUES (new.id, new.email, 'user', 50000);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create Restaurants Table
CREATE TABLE public.restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  open_time TEXT,
  discount_rate INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Only admins can insert restaurants" ON public.restaurants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update restaurants" ON public.restaurants FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Create Menus Table
CREATE TABLE public.menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  original_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menus are viewable by everyone" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Only admins can insert menus" ON public.menus FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update menus" ON public.menus FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Create Menu Options Table
CREATE TABLE public.menu_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  choices JSONB NOT NULL, -- Array of {name: text, price: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.menu_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menu options are viewable by everyone" ON public.menu_options FOR SELECT USING (true);
CREATE POLICY "Only admins can manage menu options" ON public.menu_options FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Create Coupons Table
CREATE TABLE public.coupons (
  id TEXT PRIMARY KEY, -- Using custom string IDs like CUP-XYZ
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  restaurant_name TEXT NOT NULL,
  status TEXT DEFAULT 'Unused' CHECK (status IN ('Unused', 'Used')),
  total_price INTEGER NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own coupons" ON public.coupons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own coupons" ON public.coupons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coupons (to set used)" ON public.coupons FOR UPDATE USING (auth.uid() = user_id);

-- 6. Create Coupon Items Table
CREATE TABLE public.coupon_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id TEXT REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  menu_id UUID REFERENCES public.menus(id) NOT NULL,
  menu_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  options JSONB, -- Stored selected options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.coupon_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own coupon items" ON public.coupon_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.coupons WHERE id = coupon_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create own coupon items" ON public.coupon_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.coupons WHERE id = coupon_id AND user_id = auth.uid())
);


-- INSERT INITIAL MOCK DATA
-- For this to work without violating RLS, we'll insert them via a temporary bypass or assume it's run by a superuser in Editor.

INSERT INTO public.restaurants (id, name, description, address, open_time, discount_rate, image) VALUES
('b0d5c805-728b-4a55-89b3-1e5f8b9e6e8e', '바삭 수제버거 존 역삼점', '육즙 가득한 최고의 스매시 버거.', '서울시 강남구 테헤란로 123 1층', '매일 11:00 ~ 21:00 (라스트 오더 20:30)', 15, '🍔'),
('11b7bd06-ea60-47b2-9be7-b3f27b59b13c', '서울 매운짬뽕 본점', '스트레스가 확 풀리는 진짜 매운맛.', '서울시 강남구 역삼로 456 2층', '화-일 11:30 ~ 22:00 (월 휴무)', 20, '🍜'),
('f5ec1c1f-2e38-4e3a-96a9-8260d5bfa7e5', '그린 보울 샐러드', '가볍고 건강한 유기농 샐러드.', '서울시 강남구 논현로 789 1층', '매일 08:00 ~ 20:00', 10, '🥗');

INSERT INTO public.menus (id, restaurant_id, name, original_price, discounted_price, image, description) VALUES
('6b240ff5-f09c-4ec7-bed4-7defce61db53', 'b0d5c805-728b-4a55-89b3-1e5f8b9e6e8e', '클래식 스매시 버거', 10000, 8500, '🍔', '100% 소고기 패티 페이퍼처럼 얇게 누른 대표 메뉴'),
('e31a0e71-4cc1-4131-89d2-51c3ce38f635', 'b0d5c805-728b-4a55-89b3-1e5f8b9e6e8e', '더블 치즈 스매시 버거', 14000, 11900, '🍔', '소고기 패티 2장, 체다 치즈 2장의 진한 풍미'),
('e3daee2c-aba3-42e1-a2cc-dc74c2dce6df', '11b7bd06-ea60-47b2-9be7-b3f27b59b13c', '얼큰 소고기 짬뽕', 12000, 9600, '🍜', '불맛 입힌 차돌박이가 듬뿍');

INSERT INTO public.menu_options (menu_id, group_name, is_required, choices) VALUES
('6b240ff5-f09c-4ec7-bed4-7defce61db53', '빵 변경', true, '[{"id":"bun_1","name":"참깨 브리오슈 번","price":0},{"id":"bun_2","name":"글루텐프리 번","price":1000}]'::jsonb),
('6b240ff5-f09c-4ec7-bed4-7defce61db53', '토핑 추가', false, '[{"id":"top_1","name":"체다 치즈 추가","price":1000},{"id":"top_2","name":"베이컨 추가","price":1500}]'::jsonb);
