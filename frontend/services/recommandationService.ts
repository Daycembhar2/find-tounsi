// services/recommendationService.ts
import { UserPreferences } from '../types/recommendation';

export class RecommendationService {
  private readonly STORAGE_KEY = 'findtounsi_recommendations';

  private getPreferences(): UserPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences();
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading preferences:', error);
    }

    return this.getDefaultPreferences();
  }

  private savePreferences(preferences: UserPreferences): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferred_categories: [],
      viewed_categories: [],
      purchase_history: []
    };
  }

  public trackCategoryView(categorySlug: string): void {
    const preferences = this.getPreferences();
    
    const existing = preferences.viewed_categories.find(cat => cat.category === categorySlug);
    
    if (existing) {
      existing.count += 1;
      existing.timestamp = new Date().toISOString();
    } else {
      preferences.viewed_categories.push({
        category: categorySlug,
        timestamp: new Date().toISOString(),
        count: 1
      });
    }

    preferences.viewed_categories = preferences.viewed_categories
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    this.savePreferences(preferences);
  }

  public trackPurchase(productId: string, categorySlug: string): void {
    const preferences = this.getPreferences();
    
    preferences.purchase_history.push({
      category: categorySlug,
      product_id: productId,
      timestamp: new Date().toISOString()
    });

    preferences.purchase_history = preferences.purchase_history.slice(-20);
    this.savePreferences(preferences);
  }

  public getRecommendedCategories(limit: number = 3): string[] {
    const preferences = this.getPreferences();
    const { viewed_categories, purchase_history } = preferences;

    if (viewed_categories.length === 0 && purchase_history.length === 0) {
      return this.getDefaultCategories();
    }

    const scores: Record<string, number> = {};

    viewed_categories.forEach(view => {
      scores[view.category] = (scores[view.category] || 0) + view.count;
    });

    purchase_history.forEach(purchase => {
      scores[purchase.category] = (scores[purchase.category] || 0) + 3;
    });

    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category)
      .slice(0, limit);

    return sorted.length > 0 ? sorted : this.getDefaultCategories();
  }

  private getDefaultCategories(): string[] {
    return ['cosmetiques', 'alimentation', 'artisanat'];
  }

  public resetData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public getDebugInfo(): UserPreferences {
    return this.getPreferences();
  }
}