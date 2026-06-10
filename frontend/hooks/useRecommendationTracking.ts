// hooks/useRecommendationTracking.ts
// hooks/useRecommendationTracking.ts
import { RecommendationService } from '../services/recommendationService';

export function useRecommendationTracking() {
  const service = new RecommendationService();

  const trackCategoryView = (categorySlug: string) => {
    service.trackCategoryView(categorySlug);
  };

  const trackPurchase = (productId: string, categorySlug: string) => {
    service.trackPurchase(productId, categorySlug);
  };

  return { trackCategoryView, trackPurchase };
}