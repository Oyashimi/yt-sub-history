<script setup lang="ts">
import LegalLayout from '@/components/LegalLayout.vue'
</script>

<template>
  <LegalLayout title="利用規約" updated-at="2026年8月21日">
    <p>
      本規約は、チャンネル登録日チェッカー（以下「本サービス」）の利用条件を定めるものです。利用者は本サービスを利用することで、本規約に同意したものとみなされます。
    </p>

    <h2>1. サービス内容</h2>
    <p>
      本サービスは、利用者の Google アカウントに紐づく YouTube
      のチャンネル登録情報を、利用者自身のブラウザ上で取得・可視化する無料のツールです。
    </p>

    <h2>2. YouTube API Services 利用規約への同意</h2>
    <p>
      本サービスは YouTube API Services を利用しています。利用者は本サービスを利用することにより、
      <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube 利用規約</a>
      に同意するものとします。また、Google によるデータの取り扱いについては
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a>
      が適用されます。
    </p>

    <h2>3. 禁止事項</h2>
    <ul>
      <li>本サービスまたは YouTube API に対する過度な自動アクセス・スクレイピング</li>
      <li>本サービスの解析・改変・リバースエンジニアリングによる不正利用</li>
      <li>他人の Google アカウントを権限なく使用する行為</li>
      <li>法令または公序良俗に反する行為</li>
    </ul>

    <h2>4. 免責事項</h2>
    <ul>
      <li>
        表示される登録日時は YouTube API
        が返す値をそのまま用いています。実際の登録日時と一致しない場合があり、正確性を保証しません。
      </li>
      <li>
        本サービスは Google の定める API
        利用上限（クォータ）の範囲内で提供されます。上限到達時や仕様変更時には予告なく利用できなくなる場合があります。
      </li>
      <li>
        本サービスの利用により利用者に生じた損害について、運営者は法令上免責が認められない場合を除き責任を負いません。
      </li>
    </ul>

    <h2>5. サービスの変更・停止</h2>
    <p>運営者は、利用者への事前通知なく本サービスの内容変更または提供停止を行うことがあります。</p>

    <h2>6. 提携関係の否認</h2>
    <p>
      本サービスは個人が開発・運営する非公式のツールであり、Google LLC、YouTube
      およびその関連会社とは一切の提携関係にありません。
    </p>

    <h2>7. 準拠法・管轄</h2>
    <p>
      本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
    </p>
  </LegalLayout>
</template>
