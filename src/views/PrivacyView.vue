<script setup lang="ts">
import LegalLayout from '@/components/LegalLayout.vue'
</script>

<template>
  <LegalLayout title="プライバシーポリシー" updated-at="2026年8月21日">
    <p>
      古参チェッカー（以下「本サービス」）は、利用者のプライバシーを最大限尊重して設計されています。本ポリシーは、本サービスにおける情報の取り扱いを説明するものです。
    </p>

    <h2>1. 収集する情報 — 本サービスは利用者データを収集しません</h2>
    <p>
      本サービスはサーバーサイドの処理基盤を持たない静的サイトであり、利用者のチャンネル登録データを
      <strong>一切収集・送信・保存しません</strong>。
    </p>
    <ul>
      <li>
        チャンネル登録情報は、利用者のブラウザから Google（YouTube Data API v3）へ直接リクエストされ、
        その応答も利用者のブラウザ内でのみ処理されます。運営者のサーバーを経由しません。
      </li>
      <li>
        取得したデータはブラウザのメモリ上にのみ保持され、localStorage・sessionStorage・Cookie
        などへの保存は行いません。タブを閉じる、またはページを再読み込みした時点で消去されます。
      </li>
    </ul>

    <h2>2. アクセス権限（OAuth スコープ）</h2>
    <p>本サービスは、Google アカウントに対して以下の読み取り専用スコープのみを要求します。</p>
    <ul>
      <li>
        <code>https://www.googleapis.com/auth/youtube.readonly</code> —
        チャンネル登録の一覧と登録日時を取得するために使用します。
      </li>
    </ul>
    <p>
      このスコープで取得した情報は、画面表示およびシェアカード画像の生成という
      <strong>利用者自身に結果を提示する目的にのみ</strong>
      使用し、それ以外の目的で利用・第三者へ提供することはありません。
    </p>

    <h2>3. アクセストークンの取り扱い</h2>
    <p>
      Google Identity Services により発行されるアクセストークンは、ブラウザのメモリ上（JavaScript
      変数）でのみ保持されます。永続的な保存は行わず、有効期限は約 1
      時間です。画面上の「ログアウト」操作により、トークンは即座に破棄・失効（revoke）されます。
    </p>

    <h2>4. Google ユーザーデータの取り扱いに関する方針</h2>
    <p>
      本サービスによる Google ユーザーデータの取得および利用は、
      <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>
      （Limited Use requirements を含む）に準拠します。取得したデータの保存・第三者提供・広告目的での利用・人間による閲覧はいずれも行いません。
    </p>

    <h2>5. YouTube API Services について</h2>
    <p>
      本サービスは YouTube API Services を利用しています。利用者は本サービスの利用をもって
      <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube 利用規約</a>
      に同意したものとみなされます。Google によるデータの取り扱いについては
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a>
      をご確認ください。
    </p>
    <p>
      本サービスに付与したアクセス権限は、
      <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google アカウントのセキュリティ設定</a>
      からいつでも取り消すことができます。
    </p>

    <h2>6. アクセス解析</h2>
    <p>
      本サービスはアクセス状況の把握に Cookie を使用しないアクセス解析（Cloudflare Web
      Analytics）を利用する場合があります。個人を識別する情報の取得や、利用者の追跡は行いません。
    </p>

    <h2>7. 本ポリシーの変更</h2>
    <p>
      内容を変更する場合は、本ページの最終更新日を改めた上で掲載します。
    </p>

    <h2>8. お問い合わせ</h2>
    <p>本ポリシーに関するお問い合わせは、本サービスの公開元までご連絡ください。</p>
  </LegalLayout>
</template>
