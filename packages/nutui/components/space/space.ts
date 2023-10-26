import type { ExtractPropTypes, PropType } from 'vue'
import type { SpaceAlign, SpaceGutter, SpaceJustify } from './type'

export const SPACE_KEY = Symbol('space')

export const spaceProps = {
  align: String as PropType<SpaceAlign>,
  direction: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'horizontal',
  },
  justify: String as PropType<SpaceJustify>,
  wrap: Boolean,
  gutter: [Number, String, Array] as PropType<number | string | [SpaceGutter, SpaceGutter]>,
  fill: Boolean,
}

export type SPaceProps = ExtractPropTypes<typeof spaceProps>
