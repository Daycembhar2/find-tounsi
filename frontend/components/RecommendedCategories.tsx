// components/RecommendedCategories.tsx
"use client"

import Link from 'next/link';
import { useRecommendedCategories } from '@/hooks/useRecommendedCategories';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface RecommendedCategoriesProps {
  currentCategory?: string;
  title?: string;
}

const categoryLabels: Record<string, string> = {
  'cosmetiques': 'Cosmétiques',
  'vetements': 'Vêtements',
  'artisanat': 'Artisanat',
  'alimentation': 'Alimentation',
  'electronique': 'Électronique',
  'bijoux-tunisiennes': 'Bijoux Tunisiens'
};

export function RecommendedCategories({ 
  currentCategory, 
  title = "Recommandé pour vous" 
}: RecommendedCategoriesProps) {
  const { categories, isLoading } = useRecommendedCategories(currentCategory);

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {title}
        </h3>
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Link key={category} href={`/categories/${category}`}>
            <Button 
              variant="outline"
              size="sm"
              className="text-sm"
            >
              {categoryLabels[category] || category}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}