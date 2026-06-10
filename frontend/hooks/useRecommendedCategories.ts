// hooks/useRecommendedCategories.ts
import { useState, useEffect } from 'react';
// hooks/useRecommendedCategories.ts
import { RecommendationService } from '../services/recommendationService';

export function useRecommendedCategories(currentCategory?: string) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const service = new RecommendationService();
    
    const recommendations = service.getRecommendedCategories(4);
    
    if (currentCategory) {
      const filtered = recommendations.filter(cat => cat !== currentCategory);
      setCategories(filtered);
    } else {
      setCategories(recommendations);
    }
    
    setIsLoading(false);
  }, [currentCategory]);

  return { categories, isLoading };
}