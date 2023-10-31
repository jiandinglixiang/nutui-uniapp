import type { ExtractPropTypes, PropType } from 'vue'
import { isString } from '../_utils'
import type { AvatarCropperSizeType, AvatarCropperSourceType, AvatarCropperToolbarPosition } from './types'

export const avatarcropperProps = {
  maxZoom: {
    type: Number,
    default: 3,
  },
  space: {
    type: Number,
    default: 10,
  },
  toolbarPosition: {
    type: String as PropType<AvatarCropperToolbarPosition>,
    default: 'bottom',
  },
  editText: {
    type: String,
    default: '编辑',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmText: {
    type: String,
    default: '确定',
  },
  sizeType: {
    type: Array as PropType<AvatarCropperSizeType[]>,
    default: () => ['original', 'compressed'],
  },
  sourceType: {
    type: Array as PropType<AvatarCropperSourceType[]>,
    default: () => ['album', 'camera'],
  },
}

export type AvatarCropperProps = ExtractPropTypes<typeof avatarcropperProps>

export const avatarcropperEmits = {
  confirm: (url: string) => isString(url),
  cancel: () => true,
}

export type AvatarCropperEmits = typeof avatarcropperEmits
