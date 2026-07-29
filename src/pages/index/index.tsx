import { useState, useEffect } from 'react'
import { View, Text, Button, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import RecipeCard from '@/components/RecipeCard'
import { getAllRecipes, getUserCycle, upsertUserCycle, getCheckins } from '@/db/api'
import { calcCurrentDay, formatDate } from '@/utils/date'
import type { Recipe, Checkin } from '@/db/types'

import './index.scss'

export default function Index() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [currentDay, setCurrentDay] = useState(1)
  const [selectedDay, setSelectedDay] = useState(1)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [recipesData, cycle, checkinsData] = await Promise.all([
        getAllRecipes(),
        getUserCycle(),
        getCheckins(),
      ])
      setRecipes(recipesData)
      setCheckins(checkinsData)

      let cycleStart = cycle?.started_at
      if (!cycleStart) {
        cycleStart = formatDate()
        await upsertUserCycle(cycleStart)
      }
      const day = calcCurrentDay(cycleStart)
      setCurrentDay(day)
      setSelectedDay(day)
    } catch (err) {
      console.error('loadData error', err)
      Taro.showToast({ title: '数据加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const recipe = recipes.find((r) => r.day === selectedDay) || null
  const isToday = selectedDay === currentDay
  const isChecked = checkins.some((c) => c.day === selectedDay)

  function goCheckin() {
    Taro.navigateTo({ url: `/pages/checkin/index?day=${selectedDay}` })
  }

  function onSwiperChange(e: any) {
    const idx = e.detail.current
    const day = idx + 1
    setSelectedDay(day)
  }

  if (loading) {
    return (
      <View className='index'>
        <Text className='index__loading'>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='index'>
      <View className='index__header'>
        <Text className='index__title'>21天减脂食谱</Text>
        <Text className='index__subtitle'>
          {isToday ? '今日计划' : `第 ${selectedDay} 天`} · 第 {Math.ceil(selectedDay / 7)} 周
        </Text>
      </View>

      <Swiper
        className='index__swiper'
        current={selectedDay - 1}
        onChange={onSwiperChange}
        circular={false}
        previousMargin='40rpx'
        nextMargin='40rpx'
      >
        {recipes.map((r) => (
          <SwiperItem key={r.day} className='index__swiper-item'>
            <View className='index__card-wrap'>
              <RecipeCard recipe={r} />
            </View>
          </SwiperItem>
        ))}
      </Swiper>

      <View className='index__action'>
        {isChecked ? (
          <View className='index__checked'>
            <Text className='index__checked-icon'>✓</Text>
            <Text className='index__checked-text'>今日已打卡</Text>
          </View>
        ) : isToday ? (
          <Button className='index__btn index__btn--primary' onClick={goCheckin}>
            去打卡
          </Button>
        ) : (
          <Button className='index__btn index__btn--disabled' disabled>
            {selectedDay < currentDay ? '该日未打卡' : '还未到这一天'}
          </Button>
        )}
      </View>
    </View>
  )
}