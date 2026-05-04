export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string | null;
  role: 'tenant' | 'seller' | null;
  avatar_url: string | null;
};

export type Property = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  price_per_month: number;
  bedrooms: number | null;
  image_url: string | null;
  is_available: boolean | null;
  created_at: string | null;
  owner_id: string | null;
  bathrooms: number | null;
  surface_area: number | null;
  visit_count: number | null;
  images?: PropertyImage[];
};

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  display_order: number | null;
  created_at: string | null;
};

export type Visit = {
  id: string;
  tenant_id: string;
  property_id: string;
  visit_date: string;
  status: VisitStatus;
  id_scan_url: string | null;
  created_at: string | null;
  properties?: {
    title: string;
    location: string;
  };
};

export type VisitStatus = 'pending' | 'confirmed' | 'cancelled';

export type UserRole = 'tenant' | 'seller';
