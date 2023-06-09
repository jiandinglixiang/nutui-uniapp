import type { ExtractPropTypes } from 'vue'

export const countdownProps = {
  modelValue: {
    type: Object,
    default: () => {
      return {}
    },
  },
  paused: {
    default: false,
    type: Boolean,
  },

  startTime: {
    // 可以是服务器当前时间
    type: [Number, String],
    validator(v: Date) {
      const dateStr = new Date(v).toString().toLowerCase()
      return dateStr !== 'invalid date'
    },
  },
  endTime: {
    type: [Number, String],
    validator(v: Date) {
      const dateStr = new Date(v).toString().toLowerCase()
      return dateStr !== 'invalid date'
    },
  },
  // 是否开启毫秒
  millisecond: {
    default: false,
    type: Boolean,
  },
  // 时间格式化
  format: {
    type: String,
    default: 'HH:mm:ss',
  },
  autoStart: {
    type: Boolean,
    default: true,
  },

  // 倒计时时长，单位毫秒
  time: {
    type: [Number, String],
    default: 0,
  },
}

export const countdownEmits = {
  input: (val: string | {
    d: number
    h: number
    m: number
    s: number
    ms: number
  }) => val,
  updateModelValue: (val: string | {
    d: number
    h: number
    m: number
    s: number
    ms: number
  }) => val,
  onEnd: () => {},
  onRestart: (val: number) => val,
  onPaused: (val: number) => val,
}

export type CountDownPropsProps = ExtractPropTypes<typeof countdownProps>
