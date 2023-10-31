<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useTouch } from '../_hooks'
import { clamp, easySetFillStyle, isH5, preventDefault } from '../_utils'
import NutButton from '../button/button.vue'
import NutIcon from '../icon/icon.vue'
import { avatarcropperEmits, avatarcropperProps } from './avatarcropper'

const props = defineProps(avatarcropperProps)
const emit = defineEmits(avatarcropperEmits)
const state = reactive({
  visible: false,
  defScale: 1,
  scale: 1,
  angle: 0,
  moveX: 0,
  moveY: 0,
  moving: false,
  zooming: false,
  displayWidth: 0,
  displayHeight: 0,
  cropperWidth: 0,
  cropperHeight: 0,
})
interface DrawImage {
  src: string | HTMLImageElement
  x: number
  y: number
  width: number
  height: number
}
interface CanvasAll {
  canvasId: string
  cropperCanvas: any | null
  cropperCanvasContext: UniApp.CanvasContext | null
}
const canvasAll = reactive<CanvasAll>({
  canvasId: `canvas-${Date.now()}`,
  cropperCanvas: null,
  cropperCanvasContext: null,
})
// 绘制图片
const drawImage = ref<DrawImage>({
  src: '', // 规定要使用的图像
  x: 0, // 在画布上x的坐标位置
  y: 0, // 在画布上y的坐标位置
  width: 0, // 要使用的图像的宽度
  height: 0, // 要使用的图像的高度
})
// 触摸
const touch = useTouch()
// 获取系统信息
const systemInfo: UniApp.GetSystemInfoResult = uni.getSystemInfoSync()
// 支付宝基础库2.7.0以上支持，需要开启支付宝小程序canvas2d
const showAlipayCanvas2D = computed(() => {
  const { SDKVersion, uniPlatform } = uni.getSystemInfoSync()
  return uniPlatform === 'mp-alipay' && Number.parseInt(SDKVersion.replace(/\./g, '')) >= 270
})
const showPixelRatio = isH5 || showAlipayCanvas2D.value
const pixelRatio = showPixelRatio ? systemInfo.pixelRatio : 1
state.displayWidth = systemInfo.windowWidth * pixelRatio
state.displayHeight = systemInfo.windowHeight * pixelRatio
state.cropperWidth = state.cropperHeight = state.displayWidth - props.space * pixelRatio * 2
if (showAlipayCanvas2D.value) {
  const { canvasId } = canvasAll
  uni.createSelectorQuery()
    .select(`#${canvasId}`)
    .node(({ node: canvas }) => {
      canvas.width = state.displayWidth
      canvas.height = state.displayHeight
      canvasAll.cropperCanvas = canvas
    })
    .exec()
}

// 初始化canvas
onMounted(() => {
  const { canvasId } = canvasAll
  canvasAll.cropperCanvasContext = uni.createCanvasContext(canvasId)
})

// 是否是横向
const isAngle = computed(() => {
  return state.angle === 90 || state.angle === 270
})

// 高亮框样式
const highlightStyle = computed(() => {
  const { cropperWidth } = state
  const width = `${cropperWidth / pixelRatio}px`
  const height = width
  return {
    width,
    height,
  }
})

const canvasStyle = computed(() => {
  const { displayWidth, displayHeight } = state
  return {
    width: `${displayWidth / pixelRatio}px`,
    height: `${displayHeight / pixelRatio}px`,
  }
})

const _cutCanvasStyle = computed(() => {
  const { displayWidth, displayHeight, cropperWidth } = state
  return {
    top: `${(displayHeight / pixelRatio - cropperWidth / pixelRatio) / 2}px`,
    left: `${(displayWidth / pixelRatio - cropperWidth / pixelRatio) / 2}px`,
    width: `${cropperWidth / pixelRatio}px`,
    height: `${cropperWidth / pixelRatio}px`,
  }
})

// 最大横向移动距离
const maxMoveX = computed(() => {
  const { displayWidth, scale, cropperWidth } = state
  const { height } = drawImage.value
  if (isAngle.value)
    return Math.max(0, (height * scale - cropperWidth) / 2)

  return Math.max(0, (displayWidth * scale - cropperWidth) / 2)
})

// 最大纵向移动距离
const maxMoveY = computed(() => {
  const { displayWidth, scale, cropperWidth } = state
  const { height } = drawImage.value
  if (isAngle.value)
    return Math.max(0, (displayWidth * scale - cropperWidth) / 2)

  return Math.max(0, (height * scale - cropperWidth) / 2)
})

// base64转图片
function dataURLToImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = dataURL
  })
}

// base64转图片(canvasImage)
function dataURLToCanvasImage(canvas: any, dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    // eslint-disable-next-line new-cap
    const img = new canvas.createImage()
    img.onload = () => resolve(img)
    img.src = dataURL
  })
}

function canvas2dDraw(ctx: CanvasRenderingContext2D) {
  if (!ctx)
    return
  const { src, width, height, x, y } = drawImage.value

  const { moveX, moveY, scale, angle, displayWidth, displayHeight, cropperWidth } = state
  ctx.clearRect(0, 0, displayWidth, displayHeight)
  ctx.fillStyle = '#666'
  ctx.fillRect(0, 0, displayWidth, displayHeight)
  ctx.fillStyle = '#000'
  ctx.fillRect(props.space * pixelRatio, (displayHeight - cropperWidth) / 2, cropperWidth, cropperWidth)

  // 绘制偏移量
  ctx.translate(displayWidth / 2 + moveX, displayHeight / 2 + moveY)
  // 绘制旋转角度
  ctx.rotate((Math.PI / 180) * angle)
  // 绘制缩放
  ctx.scale(scale, scale)
  // 绘制图片
  ctx.drawImage(src as HTMLImageElement, x, y, width, height)
}

// web绘制
function webDraw() {
  const { displayWidth, displayHeight } = state
  const canvasDom: HTMLElement | null = document.getElementById(canvasAll.canvasId)
  let canvas: HTMLCanvasElement = canvasDom as HTMLCanvasElement
  if (canvasDom?.tagName !== 'CANVAS') {
    canvas = canvasDom?.getElementsByTagName('canvas')[0] as HTMLCanvasElement
    canvas.width = displayWidth
    canvas.height = displayHeight
  }

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas2dDraw(ctx)
}

function alipayDraw() {
  const { cropperCanvas } = canvasAll
  const ctx = cropperCanvas.getContext('2d') as CanvasRenderingContext2D
  ctx && ctx.resetTransform()
  canvas2dDraw(ctx)
}

// 绘制显示的canvas内容
function draw() {
  if (isH5) {
    webDraw()
    return
  }
  if (showAlipayCanvas2D.value) {
    alipayDraw()
    return
  }
  const { src, width, height, x, y } = drawImage.value
  const { moveX, moveY, scale, angle, displayWidth, displayHeight, cropperWidth } = state
  const { cropperCanvasContext } = canvasAll
  const ctx = cropperCanvasContext
  if (!ctx)
    return
  // 绘制背景
  ctx.clearRect(0, 0, displayWidth, displayHeight)
  easySetFillStyle(systemInfo, ctx, '#666')
  ctx.fillRect(0, 0, displayWidth, displayHeight)
  ctx.stroke()
  ctx.fill()
  easySetFillStyle(systemInfo, ctx, '#000')
  ctx.fillRect(props.space, (displayHeight - cropperWidth) / 2, cropperWidth, cropperWidth)
  ctx.stroke()
  ctx.fill()

  // 绘制偏移量
  ctx.translate(displayWidth / 2 + moveX, displayHeight / 2 + moveY)
  // 绘制旋转角度
  ctx.rotate((Math.PI / 180) * angle)
  // 绘制缩放
  ctx.scale(scale, scale)
  // 绘制图片
  ctx.drawImage(src as string, x, y, width, height)
  ctx.draw()
}

// 设置绘制图片
async function setDrawImg(image: UniApp.GetImageInfoSuccessData) {
  const { displayWidth, cropperWidth } = state

  const drawImg = { ...drawImage.value }
  const { width: imgWidth, height: imgHeight } = image
  drawImg.src = image.path
  if (isH5)
    drawImg.src = await dataURLToImage(image.path)

  if (showAlipayCanvas2D.value)
    drawImg.src = await dataURLToCanvasImage(canvasAll.cropperCanvas, image.path)

  const isPortrait = imgHeight > imgWidth
  const rate = isPortrait ? imgWidth / imgHeight : imgHeight / imgWidth

  drawImg.width = displayWidth
  drawImg.height = isPortrait ? displayWidth / rate : displayWidth * rate
  drawImg.x = -drawImg.width / 2
  drawImg.y = -drawImg.height / 2

  drawImage.value = drawImg

  state.defScale = cropperWidth / (isPortrait ? drawImg.width : drawImg.height)
  resetScale()
  draw()
}

// 选择图片
function chooseImage() {
  uni.chooseImage({
    count: 1,
    // 可以指定是原图还是压缩图，默认二者都有
    sizeType: props.sizeType,
    sourceType: props.sourceType,
    success: (res: any) => {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      const { tempFiles } = res
      !!tempFiles.length && imageChange(tempFiles[0])
    },
  })
}

interface TFileType {
  size: number
  type?: string
  tempFilePath?: string
  path: string
}

// 选择图片后回调
async function imageChange(file: TFileType) {
  uni.getImageInfo({
    src: file.path,
  }).then((res: UniApp.GetImageInfoSuccessData) => {
    state.visible = true
    setDrawImg(res)
  })
}

// 重设缩放
function resetScale() {
  setScale(state.defScale)
  state.moveX = 0
  state.moveY = 0
  state.angle = 0
}

// 设置缩放
function setScale(scale: number) {
  scale = clamp(scale, +0.3, +props.maxZoom + 1)
  if (scale !== state.scale)
    state.scale = scale
}

// 计算两个点的距离
function getDistance(touches: TouchList) {
  return Math.sqrt((touches[0].clientX - touches[1].clientX) ** 2 + (touches[0].clientY - touches[1].clientY) ** 2)
}

let startMoveX: number
let startMoveY: number
let startScale: number
let startDistance: number
let fingerNum: number

// 触摸开始
function onTouchStart(event: TouchEvent) {
  const { touches } = event
  const { offsetX } = touch

  touch.start(event)

  fingerNum = touches.length
  startMoveX = state.moveX
  startMoveY = state.moveY

  state.moving = fingerNum === 1

  state.zooming = fingerNum === 2 && !offsetX.value
  if (state.zooming) {
    startScale = state.scale
    startDistance = getDistance(event.touches)
  }
}

// 触摸移动
function onTouchMove(event: TouchEvent) {
  const { touches } = event

  touch.move(event)

  if (state.moving || state.zooming)
    preventDefault(event, true)

  if (state.moving) {
    const { deltaX, deltaY } = touch
    const moveX = deltaX.value * state.scale + startMoveX
    const moveY = deltaY.value * state.scale + startMoveY

    state.moveX = clamp(moveX, -maxMoveX.value, maxMoveX.value)
    state.moveY = clamp(moveY, -maxMoveY.value, maxMoveY.value)
  }

  if (state.zooming && touches.length === 2) {
    const distance = getDistance(touches)
    const scale = (startScale * distance) / startDistance

    setScale(scale)
  }
}

// 触摸结束
function onTouchEnd(event: TouchEvent) {
  let stopPropagation = false

  if (state.moving || state.zooming) {
    stopPropagation = !(state.moving && startMoveX === state.moveX && startMoveY === state.moveY)

    if (!event.touches.length) {
      if (state.zooming) {
        state.moveX = clamp(state.moveX, -maxMoveX.value, maxMoveX.value)
        state.moveY = clamp(state.moveY, -maxMoveY.value, maxMoveY.value)
        state.zooming = false
      }

      state.moving = false
      startMoveX = 0
      startMoveY = 0
      startScale = state.defScale

      if (state.scale < state.defScale)
        resetScale()

      if (state.scale > props.maxZoom)
        state.scale = +props.maxZoom
    }
  }

  preventDefault(event, stopPropagation)

  touch.reset()
}

// 重置角度
function reset() {
  state.angle = 0
}

// 设置角度
function rotate() {
  if (state.angle === 270) {
    state.angle = 0
    return
  }
  state.angle += 90
}

// 关闭
function cancel(isEmit: boolean = true) {
  state.visible = false
  resetScale()
  isEmit && emit('cancel')
}

// web裁剪图片
function confirmWEB() {
  const { cropperWidth, displayHeight } = state
  const canvasDom: HTMLElement | null = document.getElementById(canvasAll.canvasId)
  let canvas: HTMLCanvasElement = canvasDom as HTMLCanvasElement
  if (canvasDom?.tagName !== 'CANVAS')
    canvas = canvasDom?.getElementsByTagName('canvas')[0] as HTMLCanvasElement

  const width = cropperWidth
  const height = cropperWidth
  // 创建一个新的canvas元素，用于裁剪后的内容
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d') as CanvasRenderingContext2D

  // 设置新canvas的大小与裁剪区域相同
  croppedCanvas.width = width
  croppedCanvas.height = height
  // 使用drawImage方法将原canvas中指定区域的内容绘制到新canvas上
  canvas
    && croppedCtx.drawImage(
      canvas,
      props.space * pixelRatio,
      (displayHeight - cropperWidth) / 2,
      width,
      height,
      0,
      0,
      width,
      height,
    )

  // 将裁剪后的内容转换为图片格式
  const imageDataURL = croppedCanvas.toDataURL('image/png')
  emit('confirm', imageDataURL)
  cancel(false)
}

// 支付宝基础库2.7.0以上支持，需要开启支付宝小程序canvas2d
function confirmALIPAY() {
  const { cropperWidth, displayHeight } = state
  const { cropperCanvas } = canvasAll
  uni.canvasToTempFilePath({
    canvasId: canvasAll.canvasId,
    canvas: cropperCanvas,
    x: props.space,
    y: (displayHeight - cropperWidth) / 2,
    width: cropperWidth,
    height: cropperWidth,
    destWidth: cropperWidth,
    destHeight: cropperWidth,
    success: async (res) => {
      const filePath = res.tempFilePath
      emit('confirm', filePath)
      cancel(false)
    },
  })
}

// 裁剪图片
function confirm() {
  if (isH5) {
    confirmWEB()
    return
  }
  if (showAlipayCanvas2D.value) {
    confirmALIPAY()
    return
  }
  const { cropperWidth, displayHeight } = state
  const { canvasId } = canvasAll
  // 将编辑后的canvas内容转成图片
  uni.canvasToTempFilePath({
    canvasId,
    x: props.space,
    y: (displayHeight - cropperWidth) / 2,
    width: cropperWidth,
    height: cropperWidth,
    destWidth: cropperWidth * systemInfo.pixelRatio,
    destHeight: cropperWidth * systemInfo.pixelRatio,
    success: async (res) => {
      const filePath = res.tempFilePath

      emit('confirm', filePath)
      cancel(false)
    },
  })
}

watch(
  () => state.scale,
  () => {
    draw()
  },
)

watch(
  () => state.angle,
  () => {
    if (Math.abs(state.moveX) > maxMoveX.value)
      state.moveX = maxMoveX.value

    if (Math.abs(state.moveY) > maxMoveY.value)
      state.moveY = maxMoveY.value

    draw()
  },
)

watch(
  () => state.moveX,
  () => {
    draw()
  },
)

watch(
  () => state.moveY,
  () => {
    draw()
  },
)

defineExpose({
  cancel,
  reset,
  rotate,
  confirm,
})
</script>

<template>
  <view class="nut-avatar-cropper taro">
    <slot />
    <view class="nut-avatar-cropper__edit-text" @click.stop="chooseImage">
      {{ editText }}
    </view>
  </view>
  <view v-show="state.visible" class="nut-cropper-popup">
    <canvas
      :id="canvasAll.canvasId" :canvas-id="canvasAll.canvasId" :type="showAlipayCanvas2D ? '2d' : undefined" :style="canvasStyle"
      class="nut-cropper-popup__canvas"
    />
    <view
      class="nut-cropper-popup__highlight" @touchstart="(onTouchStart as any)" @touchmove="(onTouchMove as any)" @touchend="(onTouchEnd as any)"
      @touchcancel="(onTouchEnd as any)"
    >
      <view class="highlight" :style="highlightStyle" />
    </view>
    <view class="nut-cropper-popup__toolbar" :class="[toolbarPosition]">
      <slot v-if="$slots.toolbar" name="toolbar" />
      <view v-else class="flex-sb">
        <view class="nut-cropper-popup__toolbar-item" @click="cancel()">
          <NutButton type="danger">
            {{ cancelText }}
          </NutButton>
        </view>
        <view class="nut-cropper-popup__toolbar-item" @click="reset">
          <NutIcon name="refresh2" color="#fff" />
        </view>
        <view class="nut-cropper-popup__toolbar-item" @click="rotate">
          <NutIcon name="retweet" color="#fff" />
        </view>
        <view class="nut-cropper-popup__toolbar-item" @click="confirm">
          <NutButton type="success">
            {{ confirmText }}
          </NutButton>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@import './index';
</style>
