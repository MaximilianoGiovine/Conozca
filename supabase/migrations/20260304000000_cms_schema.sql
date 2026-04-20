-- 1. Create Users (Public profile for auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Create User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'author', 'user')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Turn on RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Set up policies
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid();
    RETURN user_role IN ('superadmin', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Authors Profile
CREATE TABLE IF NOT EXISTS public.authors (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    social_links JSONB, -- Example: {"twitter": "...", "linkedin": "..."}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors are viewable by everyone" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Admins and authors can manage author profile" ON public.authors FOR ALL USING (public.is_admin() OR auth.uid() = id);

-- 4. Create Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL USING (public.is_admin());

-- 5. Create Category Translations
CREATE TABLE IF NOT EXISTS public.category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL, -- e.g., 'es', 'en', 'fr', 'pt'
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE(category_id, language_code)
);
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Category translations are viewable by everyone" ON public.category_translations FOR SELECT USING (true);
CREATE POLICY "Only admins can modify category translations" ON public.category_translations FOR ALL USING (public.is_admin());

-- 6. Create Articles
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    author_id UUID NOT NULL REFERENCES public.authors(id),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles are viewable by everyone" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Only admins or the author can modify articles" ON public.articles FOR ALL USING (public.is_admin() OR auth.uid() = author_id);

-- 7. Create Article Translations
CREATE TABLE IF NOT EXISTS public.article_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    UNIQUE(article_id, language_code)
);
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Article translations are viewable by everyone" ON public.article_translations FOR SELECT USING (true);
CREATE POLICY "Only admins or author can modify article translations" ON public.article_translations FOR ALL USING (public.is_admin() OR auth.uid() IN (SELECT author_id FROM public.articles WHERE id = article_id));

-- 8. Create Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true, -- For moderation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved comments are viewable by everyone" ON public.comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all comments" ON public.comments FOR ALL USING (public.is_admin());

-- Trigger for updated_at (applies to articles and comments)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_modtime
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_comments_modtime
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Function to handle new user registration from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  -- Default to 'user' role automatically
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user automatically on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
