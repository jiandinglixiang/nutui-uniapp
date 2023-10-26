<script setup lang="ts"></script>

<template>
  <view class="demo">
    <h2 class="title">
      基础用法
    </h2>
    <nut-cell>
      <nut-space>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
      </nut-space>
    </nut-cell>
    <h2 class="title">
      垂直排列
    </h2>
    <nut-cell>
      <nut-space direction="vertical" fill>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
      </nut-space>
    </nut-cell>
    <h2 class="title">
      自定义间距
    </h2>
    <nut-cell>
      <nut-space :gutter="20">
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
      </nut-space>
    </nut-cell>
    <nut-cell :custom-style="{ '--nut-space-gap': '30px' }">
      <nut-space>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
        <nut-button type="primary">
          按钮
        </nut-button>
      </nut-space>
    </nut-cell>
    <h2 class="title">
      自动换行
    </h2>
    <nut-cell>
      <nut-space wrap>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
        <nut-button type="primary" block>
          按钮
        </nut-button>
      </nut-space>
    </nut-cell>
  </view>
</template>

<route lang="json">
{
  "style": {
    "navigationBarTitleText": "Space"
  }
}
</route>
