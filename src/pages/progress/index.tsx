import { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getCheckins, getWeights, getUserCycle, resetProgress } from '@/db/api'
import { calcCurrentDay, formatDate, dateOfDay } from '@/utils/date'
import type { Checkin, Weight, UserCycle } from '@/db/types'

import './index.scss'

const CANVAS_ID = 'weightChart'

export default function ProgressPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [weights, setWeights] = useState<Weight[]>([])
  const [cycle, setCycle] = useState<UserCycle | null>(null)
  const [currentDay, setCurrentDay] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (weights.length > 0) {
      drawChart()
    }
  }, [weights])

  async function loadData() {
    try {
      setLoading(true)
      const [c, w, checkinsData] = await Promise.all([getUserCycle(), getWeights(), getCheckins()])
      setCycle(c)
      setWeights(w)
      setCheckins(checkinsData)
      if (c) {
        setCurrentDay(calcCurrentDay(c.started_at))
      }
    } catch (err) {
      console.error(err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const checkedDays = checkins.map((c) => c.day).sort((a, b) => a - b)
    let streak = 0
    for (let i = checkedDays.length - 1; i >= 0; i--) {
      if (i === checkedDays.length - 1) {
        streak = 1
      } else if (checkedDays[i] + 1 === checkedDays[i + 1]) {
        streak++
      } else {
        break
      }
    }
    return {
      total: checkedDays.length,
      streak,
      remain: Math.max(0, 21 - currentDay),
      checkedDays,
    }
  }, [checkins, currentDay])

  function isChecked(day: number) {
    return stats.checkedDays.includes(day)
  }

  function dayStatus(day: number) {
    if (day < currentDay) return isChecked(day) ? 'checked' : 'missed'
    if (day === currentDay) return isChecked(day) ? 'checked' : 'today'
    return 'future'
  }

  function handleDayClick(day: number) {
    Taro.navigateTo({ url: `/pages/index/index?day=${day}` })
  }

  async function handleRestart() {
    const res = await Taro.showModal({
      title: '重新开始',
      content: '确定要清空所有打卡和体重记录，重新开始21天计划吗？',
    })
    if (res.confirm) {
      try {
        await resetProgress()
        await loadData()
        Taro.showToast({ title: '已重置', icon: 'success' })
      } catch (err) {
        console.error(err)
        Taro.showToast({ title: '重置失败', icon: 'none' })
      }
    }
  }

  function handleShare() {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage'],
    })
  }

  function drawChart() {
    const query = Taro.createSelectorQuery()
    query
      .select(`#${CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0]?.node
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        const width = res[0].width * dpr
        const height = res[0].height * dpr
        canvas.width = width
        canvas.height = height
        ctx.scale(dpr, dpr)

        ctx.clearRect(0, 0, width, height)

        const list = [...weights].sort((a, b) => a.record_date.localeCompare(b.record_date))
        if (list.length < 2) return

        const values = list.map((w) => w.weight)
        const min = Math.min(...values) - 0.5
        const max = Math.max(...values) + 0.5
        const padding = 32
        const chartW = res[0].width - padding * 2
        const chartH = res[0].height - padding * 2

        // 网格线
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
          const y = padding + (chartH / 4) * i
          ctx.beginPath()
          ctx.moveTo(padding, y)
          ctx.lineTo(padding + chartW, y)
          ctx.stroke()
        }

        // 折线
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 3
        ctx.beginPath()
        list.forEach((item, idx) => {
          const x = padding + (chartW / (list.length - 1)) * idx
          const y = padding + chartH - ((item.weight - min) / (max - min)) * chartH
          if (idx === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // 点
        list.forEach((item, idx) => {
          const x = padding + (chartW / (list.length - 1)) * idx
          const y = padding + chartH - ((item.weight - min) / (max - min)) * chartH
          ctx.fillStyle = '#16a34a'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        })
      })
  }

  const totalLoss = useMemo(() => {
    if (weights.length < 2) return 0
    const sorted = [...weights].sort((a, b) => a.record_date.localeCompare(b.record_date))
    const first = sorted[0].weight
    const last = sorted[sorted.length - 1].weight
    return Number((first - last).toFixed(2))
  }, [weights])

  if (loading) {
    return (
      <View className='progress'>
        <Text className='progress__loading'>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='progress'>
      <View className='progress__header'>
        <Text className='progress__title'>打卡进度</Text>
        <Text className='progress__subtitle'>坚持21天，遇见更好的自己</Text>
      </View>

      <View className='progress__stats'>
        <View className='progress__stat'>
          <Text className='progress__stat-num'>{stats.total}</Text>
          <Text className='progress__stat-label'>已打卡天数</Text>
        </View>
        <View className='progress__stat'>
          <Text className='progress__stat-num'>{stats.streak}</Text>
          <Text className='progress__stat-label'>连续打卡</Text>
        </View>
        <View className='progress__stat'>
          <Text className='progress__stat-num'>{stats.remain}</Text>
          <Text className='progress__stat-label'>剩余天数</Text>
        </View>
      </View>

      <View className='progress__calendar'>
        <Text className='progress__calendar-title'>21天日历</Text>
        <View className='progress__calendar-grid'>
          {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => {
            const status = dayStatus(day)
            return (
              <View
                key={day}
                className={`progress__day progress__day--${status}`}
                onClick={() => handleDayClick(day)}
              >
                <Text className='progress__day-num'>{day}</Text>
                {status === 'checked' && <Text className='progress__day-check'>✓</Text>}
              </View>
            )
          })}
        </View>
      </View>

      {weights.length >= 2 && (
        <View className='progress__chart'>
          <Text className='progress__chart-title'>体重变化曲线</Text>
          <Canvas id={CANVAS_ID} type='2d' className='progress__canvas' />
          {totalLoss !== 0 && (
            <Text className='progress__loss'>
              {totalLoss > 0 ? `已减重 ${totalLoss} kg` : `体重增加 ${Math.abs(totalLoss)} kg`}
            </Text>
          )}
        </View>
      )}

      <View className='progress__actions'>
        {currentDay >= 21 && stats.total >= 21 ? (
          <Button className='progress__btn progress__btn--share' onClick={handleShare} openType='share'>
            分享成果
          </Button>
        ) : null}
        <Button className='progress__btn progress__btn--secondary' onClick={handleRestart}>
          重新开始
        </Button>
      </View>
    </View>
  )
}