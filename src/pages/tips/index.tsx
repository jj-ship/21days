import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getTips } from '@/db/api'
import type { Tip } from '@/db/types'

import './index.scss'

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTips()
  }, [])

  async function loadTips() {
    try {
      const data = await getTips()
      setTips(data)
    } catch (err) {
      console.error(err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='tips'>
        <Text className='tips__loading'>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='tips'>
      <View className='tips__header'>
        <Text className='tips__title'>减脂小贴士</Text>
        <Text className='tips__subtitle'>科学饮食，健康减脂</Text>
      </View>

      <View className='tips__list'>
        {tips.map((tip) => (
          <View key={tip.id} className='tips__item'>
            <View className='tips__item-head'>
              <Text className='tips__item-category'>{tip.category}</Text>
            </View>
            <Text className='tips__item-title'>{tip.title}</Text>
            <Text className='tips__item-content'>{tip.content}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}