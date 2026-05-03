export type ListingStatus = 'active' | 'sold' | 'closed' | 'deleted';
export type ListingType = 'sale' | 'exchange' | 'service' | 'gig' | 'internship';

export interface User {
  uid: string;
  email: string;
  name: string;
  college: string;
  collegeId: string;
  course?: string;
  year?: string;
  rating: number;
  ratingsCount: number;
  transactionsCount: number;
  isVerified: boolean;
  role: 'student' | 'admin';
  isAdmin?: boolean; // Legacy support
  createdAt: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  collegeId: string;
  title: string;
  description: string;
  price?: number;
  category: Category;
  images: string[];
  type: ListingType;
  status: ListingStatus;
  isUrgent?: boolean;
  paymentStatus?: 'pending' | 'completed' | 'escrow';
  createdAt: number;
  updatedAt: number;
}

export type AcademicCategory = 'Notes' | 'Lab Manual' | 'Question Paper' | 'Short Notes';

export interface AcademicMaterial {
  id: string;
  authorId: string;
  authorName: string;
  collegeId: string;
  title: string;
  description: string;
  category: AcademicCategory;
  fileUrl?: string; // Optional for now, could be a real link or dummy
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'listing' | 'user' | 'academic';
  reason: string;
  collegeId: string;
  createdAt: number;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface UrgentRequest {
  id: string;
  userId: string;
  userName: string;
  collegeId: string;
  title: string;
  description: string;
  createdAt: number;
  expiresAt: number;
}

export interface ChatThread {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: number;
  listingId?: string;
  listingTitle?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Review {
  id: string;
  targetUserId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}

export interface Opportunity {
  id: string;
  posterId: string;
  posterName: string;
  collegeId: string;
  title: string;
  description: string;
  type: 'internship' | 'gig' | 'opportunity';
  reward?: string;
  deadline?: number;
  createdAt: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  collegeId: string;
  date: number;
  location: string;
  organizer: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'chat' | 'listing' | 'system' | 'opportunity';
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'listing' | 'academic' | 'opportunity';
  createdAt: number;
}

export type Category = 'Books & Notes' | 'Hostel Essentials' | 'Electronics' | 'Furniture' | 'Services' | 'Gigs' | 'Internships' | 'Miscellaneous';
