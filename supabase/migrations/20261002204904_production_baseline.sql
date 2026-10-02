-- FeminTravel Supabase Schema
-- Apply through the versioned migration workflow documented in the launch checklist.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destination briefs cache
CREATE TABLE IF NOT EXISTS destination_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  place_name VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  brief_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100),
  image TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events tracking table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destination_briefs_cache_key ON destination_briefs(cache_key);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Seed featured destinations
INSERT INTO destinations (name, country, lat, lng, slug, image, description) VALUES
  ('Tokyo', 'Japan', 35.6762, 139.6503, 'tokyo', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', 'Ancient temples meet neon-lit streets'),
  ('Paris', 'France', 48.8566, 2.3522, 'paris', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', 'Romance, art, and world-class cuisine'),
  ('Rome', 'Italy', 41.9028, 12.4964, 'rome', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', 'Eternal city of history and pasta'),
  ('Bali', 'Indonesia', -8.4095, 115.1889, 'bali', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', 'Tropical paradise and spiritual haven'),
  ('Lisbon', 'Portugal', 38.7223, -9.1393, 'lisbon', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600', 'Coastal charm and pastel de nata'),
  ('New York', 'USA', 40.7128, -74.0060, 'new-york', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600', 'The city that never sleeps'),
  ('Barcelona', 'Spain', 41.3851, 2.1734, 'barcelona', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600', 'Gaudí, beaches, and tapas'),
  ('Sydney', 'Australia', -33.8688, 151.2093, 'sydney', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600', 'Harbor views and coastal vibes'),
  ('Cape Town', 'South Africa', -33.9249, 18.4241, 'cape-town', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600', 'Mountains meet ocean paradise'),
  ('Reykjavik', 'Iceland', 64.1466, -21.9426, 'reykjavik', 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600', 'Northern lights and geothermal wonders')
ON CONFLICT (slug) DO NOTHING;

