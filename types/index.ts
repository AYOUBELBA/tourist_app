export interface City {
  id: number;
  name: string;
  description: string;
  image: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface Place {
  id: number;
  cityId: number;
  name: string;
  description: string;
  image: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'guide' | 'car_rental' | 'pool';
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  priceRange: string;
  rating: number;
  openingHours: string;
}

export interface Booking {
  id: number;
  userId: number;
  placeId: number;
  placeName: string;
  placeType: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface VendorBusiness {
  id: number;
  userId: number;
  businessName: string;
  businessType: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}