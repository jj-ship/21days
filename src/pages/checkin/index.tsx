import { useState, useEffect } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import RecipeCard from '@/components/RecipeCard'
import { getRecipeByDay, checkin as doCheckin, getCheckins, recordWeight } from '@/db/api'
import type { Recipe, Checkin } from '@/db/types'

import './index.scss'

export default function CheckinPage() {
  const router = useRouter()
  const dayParam = Number(router.params.day || 1)

  const [day] = useState(dayParam)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [checked, setChecked] = useState(false)
  const [weight, setWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [r, checkins] = await Promise.all([getRecipeByDay(day), getCheckins()])
      setRecipe(r)
      const found = checkins.find((c) => c.day === day)
      setChecked(!!found)
      if (found?.weight) {
        setWeight(String(found.weight))
      }
    } catch (err) {
      console.error(err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  async function handleCheckin() {
    if (checked) {
      Taro.showToast({ title: '今日已打卡', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const w = weight ? Number(weight) : undefined
      await doCheckin(day, w)
      if (w && w > 0) {
        const today = new Date().toISOString().slice(0, 10)
        await recordWeight(today, w)
      }
      Taro.showToast({ title: '打卡成功', icon: 'success' })
      setChecked(true)
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (err) {
      console.error(err)
      Taro.showToast({ title: '打卡失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='checkin'>
      <View className='checkin__header'>
        <Text className='checkin__title'>第 {day} 天打卡</Text>
        <Text className='checkin__subtitle'>按食谱吃完后来打卡吧</Text>
      </View>

      <View className='checkin__card'>
        <RecipeCard recipe={recipe} />
      </View>

      {!checked && (
        <View className='checkin__weight'>
          <Text className='checkin__weight-label'>今日体重（可选，kg）</Text>
          <Input
            className='checkin__weight-input'
            type='digit'
            placeholder='请输入今日体重'
            value={weight}
            onInput={(e) => setWeight(e.detail.value)}
          />
        </View>
      )}

      <View className='checkin__action'>
        {checked ? (
          <View className='checkin__done'>
            <Text className='checkin__done-icon'>✓</Text>
            <Text className='checkin__done-text'>已完成打卡</Text>
          </View>
        ) : (
          <Button
            className='checkin__btn'
            loading={submitting}
            onClick={handleCheckin}
          >
            确认打卡
          </Button>
        )}
      </View>
    </View>
  )
}