//index.js
const app = getApp()

const ALL_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    showForm: false,
    currentYear: 2019,
    currentMonth: 10,
    currentDate: 1,
    firstDayWeek: 0, // 第一天是周几[0,1,2,3,4,5,6]
    monthDayCount: 30, // 当前月有几天
    monthList: [],
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    this.initFirstDate();
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

  toggleAddForm: function() {
    this.setData({
      showForm: !this.data.showForm
    })
  },

  // 根据当前日期获取初始化数据
  initFirstDate: function() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    this.setCalendarData(currentYear, currentMonth, currentDate)
  },

  // 根据日期设置data
  setCalendarData: function(currentYear, currentMonth, currentDate) {
    
    const monthDayCount = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

    if (!currentDate) currentDate = this.data.currentDate || 1;

    if (currentDate > monthDayCount) currentDate = monthDayCount;

    let monthList = [];

    if (currentMonth < 3)
      monthList = ALL_MONTH.slice(13 - currentMonth).concat(ALL_MONTH.slice(0, 5 - ALL_MONTH.slice(13 - currentMonth).length))
    else if (currentMonth > 10)
      monthList = ALL_MONTH.slice(currentMonth - 3).concat(ALL_MONTH.slice(0, 5 - ALL_MONTH.slice(currentMonth - 3).length))
    else
      monthList = ALL_MONTH.slice(currentMonth -3, currentMonth + 2)
    

    this.setData({
      currentYear,
      currentMonth,
      currentDate,
      monthDayCount,
      firstDayWeek,
      monthList
    })
  },

  preMonth: function() {
    let { currentYear, currentMonth } = this.data;
    if (this.data.currentMonth === 1) {
      currentMonth = 12;
      currentYear = currentYear - 1;
    } else {
      currentMonth = currentMonth - 1;
    }
    this.setCalendarData(currentYear, currentMonth);
  },
  nextMonth: function() {
    let { currentYear, currentMonth } = this.data;
    if (this.data.currentMonth === 12) {
      currentMonth = 1;
      currentYear = currentYear + 1;
    } else {
      currentMonth = currentMonth + 1;
    }
    this.setCalendarData(currentYear, currentMonth);
  },
  chooseDate: function(e) {
    this.setData({ currentDate: e.currentTarget.dataset.date })
  }
})
