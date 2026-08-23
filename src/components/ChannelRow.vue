<script setup lang="ts">
import { computed } from 'vue'
import UserCircleIcon from './UserCircleIcon.vue'
import { formatDate, formatSpan, formatTime } from '@/lib/format'
import type { SubscribedChannel } from '@/types/youtube'

const props = withDefaults(
  defineProps<{
    channel: SubscribedChannel
    /** ダミーデータを並べる表示例では、飛び先がないので false にする */
    linked?: boolean
    /** 画像に載せるチャンネルを選ぶモード。行の右に選択ボタンを出す */
    selectable?: boolean
    selected?: boolean
    /** 選べる上限に達していて、これ以上増やせない状態 */
    full?: boolean
  }>(),
  { linked: true, selectable: false, selected: false, full: false },
)

defineEmits<{ toggle: [] }>()

/** 開設からどれだけ経ってから登録したか。開設日が未取得なら null */
const sinceOpen = computed(() => {
  const created = props.channel.channelCreatedAt
  if (!created) return null
  return formatSpan(created, props.channel.subscribedAt)
})
</script>

<template>
  <!-- 選択ボタンは行の外側(右端)に置く。中身のレイアウトには手を入れない -->
  <li class="flex items-center gap-3 border-b border-line py-4 last:border-0">
    <!--
      既定は 2 段(名前 / 日付)。
      置かれたカードが十分に広いときだけ、日付を名前の右に寄せて 1 行に収める。
      判定は画面幅ではなくカード幅(@container)で行う。同じ行を、幅いっぱいの
      一覧と、幅が半分しかない表示例の両方で使い回しているため。
    -->
    <div class="min-w-0 flex-1 @2xl:flex @2xl:items-center @2xl:gap-5">
      <!--
        名前の段。
        下線は行間の区切り(border-line)より意図的に弱くしている。
        同じ強さだと「行の区切り」と混ざって、リストが 2 倍の行数に見えるため。
        1 行に収まるときは段を分ける必要がないので消す。
      -->
      <div
        class="flex items-center gap-3.5 border-b border-line/50 pb-3 @2xl:min-w-0 @2xl:flex-1 @2xl:border-0 @2xl:pb-0"
      >
        <img
          v-if="channel.thumbnailUrl"
          :src="channel.thumbnailUrl"
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
          class="size-10 shrink-0 rounded-full bg-base object-cover"
        />
        <UserCircleIcon v-else class="size-10 shrink-0 text-fg-faint" />
        <a
          v-if="linked"
          :href="`https://www.youtube.com/channel/${channel.channelId}`"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 flex-1 truncate text-[14px] hover:underline"
        >
          {{ channel.title }}
        </a>
        <span v-else class="min-w-0 flex-1 truncate text-[14px]">{{ channel.title }}</span>
      </div>

      <!--
        日付の段。pl-13.5(54px) はチャンネル名の左端に合わせた値で、
        内訳は アイコン 40px + gap 14px。
        どちらかを変えたらここも合わせること。
      -->
      <div class="pt-3 pl-13.5 @2xl:shrink-0 @2xl:pt-0 @2xl:pl-0 @2xl:text-right">
        <!--
          1 行に収まる広さがあるときは、何の日付なのかを言葉で添える。
          添え物なので小さく薄くし、主役の日付より前に出ないようにする。
          ラベルは time の外に置く(time の中身は日時そのものであるべき)。
        -->
        <div class="@2xl:flex @2xl:items-baseline @2xl:justify-end @2xl:gap-1.5">
          <span class="hidden text-[10px] text-fg-faint @2xl:inline">登録日</span>
          <time
            :datetime="channel.publishedAt"
            class="block font-mono text-[13px] tabular-nums"
          >
            {{ formatDate(channel.subscribedAt) }}
            {{ formatTime(channel.subscribedAt) }}
          </time>
        </div>

        <!-- 開設日が取れないチャンネル(削除済みなど)ではこの行ごと出さない -->
        <p v-if="sinceOpen" class="mt-1 text-[10px] text-fg-faint">
          <!-- 添えの文は薄いまま。値だけ黒く太くして、そこだけ拾えるようにする -->
          <span class="@2xl:hidden"
            >開設から<span class="font-bold text-fg">{{ sinceOpen }}</span>後に登録</span
          >
          <span class="hidden @2xl:inline"
            >開設から<span class="font-bold text-fg">{{
              sinceOpen
            }}</span
            >後に登録</span
          >
        </p>
      </div>
    </div>

    <!--
      画像に載せる 5 件を選ぶボタン。
      選択中はベタ塗りにして、一覧を流し見しても選んだ行がすぐ拾えるようにする。
      上限に達したあとの未選択行は押せない。押せるように見えて何も起きない、
      という状態を作らないため。
    -->
    <button
      v-if="selectable"
      type="button"
      class="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-fg transition-[transform,background-color] active:translate-y-px disabled:border-line disabled:text-fg-faint"
      :class="selected ? 'bg-fg text-base' : 'bg-surface text-fg-dim disabled:bg-surface'"
      :disabled="full && !selected"
      :aria-pressed="selected"
      :aria-label="`${channel.title} を画像に${selected ? '載せない' : '載せる'}`"
      @click="$emit('toggle')"
    >
      <!-- 選択中はチェック、未選択はプラス。線だけの図形なので currentColor で足りる -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-4">
        <path
          v-if="selected"
          d="M5 13l4 4L19 7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path v-else d="M12 5v14M5 12h14" stroke-linecap="round" />
      </svg>
    </button>
  </li>
</template>
