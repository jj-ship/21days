import { View, Text, Image } from '@tarojs/components'
import type { Recipe } from '@/db/types'

interface RecipeCardProps {
  recipe: Recipe | null
}

const mealMap = [
  { key: 'breakfast', label: '早餐 Breakfast', color: '#FEF3C7' },
  { key: 'lunch', label: '午餐 Lunch', color: '#DCFCE7' },
  { key: 'dinner', label: '晚餐 Dinner', color: '#E0E7FF' },
]

export default function RecipeCard({ recipe }: RecipeCardProps) {
  if (!recipe) {
    return (
      <View className='recipe-card recipe-card--empty'>
        <Text className='recipe-card__empty'>暂无食谱数据</Text>
      </View>
    )
  }

  const imagePath = recipe.image_url || ''
  // 小程序内使用相对路径引用本地图片资源
  const imageSrc = imagePath.replace('recipes/', '../../assets/recipes/')

  return (
    <View className='recipe-card'>
      <Image className='recipe-card__cover' src={imageSrc} mode='aspectFill' />
      <View className='recipe-card__body'>
        {mealMap.map((meal) => {
          const content = (recipe as Record<string, string>)[meal.key]
          if (!content) return null
          return (
            <View key={meal.key} className='recipe-card__meal' style={{ backgroundColor: meal.color }}>
              <Text className='recipe-card__meal-label'>{meal.label}</Text>
              <Text className='recipe-card__meal-content'>{content}</Text>
            </View>
          )
        })}
        {recipe.tips ? (
          <View className='recipe-card__tips'>
            <Text className='recipe-card__tips-title'>吃法提示</Text>
            <Text className='recipe-card__tips-content'>{recipe.tips}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}