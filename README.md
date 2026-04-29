# 石头剪刀布 - 手势识别对战

基于 MediaPipe Hands 的实时手势识别石头剪刀布游戏。

Demo: [hand.leige.site](https://hand.leige.site/)

## 玩法

1. 打开网页，允许摄像头权限
2. 对着摄像头出手势（石头、剪刀、布）
3. 电脑同时出拳，实时判定胜负
4. 手离开画面即可开始下一轮

## 技术栈

- MediaPipe Tasks Vision (HandLandmarker)
- Web Audio API (音效)
- Service Worker (离线缓存)
- Vercel 静态部署
