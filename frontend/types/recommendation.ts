// types/recommendation.ts
export interface CategoryView {
  category: string;
  timestamp: string;
  count: number;
}

export interface PurchaseRecord {
  category: string;
  product_id: string;
  timestamp: string;
}

export interface UserPreferences {
  preferred_categories: string[];
  viewed_categories: CategoryView[];
  purchase_history: PurchaseRecord[];
}