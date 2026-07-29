export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/checkin/index',
    'pages/progress/index',
    'pages/tips/index',
  ],
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#16A34A',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '食谱',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度',
        iconPath: 'assets/icons/progress.png',
        selectedIconPath: 'assets/icons/progress-active.png',
      },
      {
        pagePath: 'pages/tips/index',
        text: '贴士',
        iconPath: 'assets/icons/tips.png',
        selectedIconPath: 'assets/icons/tips-active.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '21天减脂食谱',
    navigationBarTextStyle: 'black'
  }
})
