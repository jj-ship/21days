import { PropsWithChildren } from 'react'
import { useLaunch, useShareAppMessage, useShareTimeline } from '@tarojs/taro'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  useShareAppMessage(() => ({
    title: '21天减脂食谱打卡，一起蜕变',
    path: '/pages/index/index',
  }))

  useShareTimeline(() => ({
    title: '21天减脂食谱打卡，一起蜕变',
  }))

  return children
}

export default App
