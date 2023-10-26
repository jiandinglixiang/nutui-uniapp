<script setup lang="ts">
import { type CSSProperties, type ComponentInternalInstance, Fragment, type VNode, defineComponent, getCurrentInstance, ref, useSlots } from 'vue'
import { computed, watch } from 'vue'
import { PREFIX } from '../_constants'
import { spaceProps } from './space'
import type { SpaceGutter } from './type'

const props = defineProps(spaceProps)
const slots = useSlots()
const instance = getCurrentInstance() as ComponentInternalInstance

function getMargin(gutter: SpaceGutter) {
  if (typeof gutter === 'number')
    return `${gutter}px`

  return gutter
}

// 计算margin样式
function getMarginStyle(isLast: boolean): CSSProperties {
  const style: CSSProperties = {}

  if (!props.gutter)
    return style

  const marginRight = `${getMargin(Array.isArray(props.gutter) ? props.gutter[0] : props.gutter)}`
  const marginBottom = `${getMargin(Array.isArray(props.gutter) ? props.gutter[1] : props.gutter)}`

  if (isLast)
    return props.wrap ? { marginBottom } : {}

  if (props.direction === 'horizontal')
    style.marginRight = marginRight

  if (props.direction === 'vertical' || props.wrap)
    style.marginBottom = marginBottom

  return style
}

// 过滤空节点
function filterEmpty(children: VNode[] = []) {
  const nodes: VNode[] = []
  children.forEach((child) => {
    if (Array.isArray(child))
      nodes.push(...child)
    else if (child.type === Fragment)
      nodes.push(...filterEmpty(child.children as VNode[]))
    else
      nodes.push(child)
  })
  return nodes.filter(
    c =>
      !(
        c
        && (c.type === Comment
          || (c.type === Fragment && c.children?.length === 0)
          || (c.type === Text && (c.children as string).trim() === ''))
      ),
  )
}

const { direction, wrap, fill, justify, align } = props
const classes = computed(() => {
  const prefixCls = componentName
  return {
    [prefixCls]: true,
    [`${componentName}-${direction}`]: direction,
    [`${componentName}-align-${align}`]: align,
    [`${componentName}-justify-${justify}`]: justify,
    [`${componentName}-wrap`]: wrap,
    [`${componentName}-fill`]: fill,

  }
})

const children = ref((instance as any).proxy.$children)
watch(() => (instance as any).proxy.$children, () => {
  // #ifdef MP
  children.value = ((instance as any).proxy.$children)
  // #endif

  // #ifndef MP
  children.value = filterEmpty(slots.default?.())
  // #endif
}, {
  immediate: true,
  deep: true,
})
</script>

<script lang="ts">
const componentName = `${PREFIX}-space`

export default defineComponent({
  name: componentName,
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: 'shared',
  },
})
</script>

<template>
  <view :class="classes">
    <view
      v-for="item, index in children" :id="`${componentName}-item`" :key="index"
      :style="getMarginStyle(index === children.length - 1)" :class="`${componentName}-item`"
    >
      <slot />
    </view>
  </view>
</template>

<style lang="scss">
@import './index';
</style>
