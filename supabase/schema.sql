-- FeminTravel Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

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

-- Seed demo blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, category, image, published_at) VALUES
  ('solo-female-safety-tips', 'Solo Female Safety Tips: Your Ultimate Guide', 'Essential safety strategies for confident solo travel around the world.', E'# Solo Female Safety Tips: Your Ultimate Guide\n\nTraveling solo as a woman is one of the most empowering experiences you can have. Here are essential tips to stay safe and confident.\n\n## Before You Go\n\n- **Research your destination** - Know the local customs, safe neighborhoods, and areas to avoid\n- **Share your itinerary** - Send your plans to trusted friends or family\n- **Get travel insurance** - Always, without exception\n\n## While Traveling\n\n### Trust Your Instincts\n\nIf something feels off, it probably is. Your gut feeling is your best protection.\n\n### Stay Connected\n\n- Keep your phone charged\n- Get a local SIM or international plan\n- Check in regularly with someone back home\n\n### Accommodation Tips\n\n- Book accommodations with good reviews from solo female travelers\n- Request rooms on higher floors (2nd-6th)\n- Use door wedges and portable locks\n\n## Safety Items to Pack\n\n1. Door wedge alarm\n2. Personal safety alarm\n3. Portable phone charger\n4. Copies of important documents\n\nRemember: Being cautious doesn''t mean being fearful. It means being smart!', 'Safety', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', '2024-01-15'),
  ('pack-light-luxe', 'How to Pack Light & Still Look Luxe', 'Master the art of minimal packing while maintaining your style.', E'# How to Pack Light & Still Look Luxe\n\nPacking light doesn''t mean sacrificing style. Here''s how to travel with just a carry-on and still look fabulous.\n\n## The Capsule Wardrobe Method\n\n### Choose a Color Palette\n\nPick 3-4 colors that mix and match:\n- 1 neutral base (black, navy, or beige)\n- 1-2 accent colors\n- 1 pop color for accessories\n\n### Essential Pieces\n\n- 2-3 versatile tops\n- 2 bottoms (one dressy, one casual)\n- 1 dress that works day-to-night\n- 1 lightweight jacket or cardigan\n- Comfortable walking shoes\n- One pair of dressy flats\n\n## Fabric Matters\n\nChoose fabrics that:\n- Don''t wrinkle easily (merino wool, jersey)\n- Dry quickly\n- Layer well\n\n## Packing Techniques\n\n1. **Roll, don''t fold** - Prevents wrinkles and saves space\n2. **Use packing cubes** - Organization is key\n3. **Wear your bulkiest items** - Jacket and boots on the plane\n\n## Luxury Touches\n\n- A silk scarf transforms any outfit\n- Statement earrings take minimal space\n- A quality bag elevates everything', 'Packing', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', '2024-02-10'),
  ('budget-luxury-travel', 'Budget Luxury Travel: Live Well for Less', 'Experience luxury travel without breaking the bank.', E'# Budget Luxury Travel: Live Well for Less\n\nLuxury travel isn''t just for the wealthy. Here''s how to experience the finer things on a budget.\n\n## Smart Booking Strategies\n\n### Timing is Everything\n\n- Book 6-8 weeks ahead for best prices\n- Travel during shoulder season\n- Use price alerts for flights\n\n### Hotel Hacks\n\n- Join loyalty programs (free to sign up)\n- Book directly for perks\n- Ask for upgrades at check-in (nicely!)\n- Try boutique hotels instead of chains\n\n## Free Luxury Experiences\n\n### Museum Free Days\n\nMany world-class museums offer free entry on certain days:\n- Louvre: First Saturday evening of month\n- MoMA: Friday evenings\n- British Museum: Always free\n\n### Nature''s Luxury\n\n- Sunrise at famous landmarks (free and less crowded)\n- Beach picnics with local produce\n- Self-guided walking tours\n\n## Splurge Strategically\n\nPick one or two experiences to splurge on:\n- A special dinner\n- A spa treatment\n- A unique tour\n\n## Money-Saving Apps\n\n1. Hopper for flight deals\n2. Hotel Tonight for last-minute luxury\n3. Atlas Obscura for unique free activities', 'Budget', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', '2024-03-05')
ON CONFLICT (slug) DO NOTHING;
