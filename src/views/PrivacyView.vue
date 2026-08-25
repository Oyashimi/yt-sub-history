<script setup lang="ts">
import LegalLayout from '@/components/LegalLayout.vue'
</script>

<template>
  <LegalLayout title="プライバシーポリシー" updated-at="2026年8月25日">
    <p>
      チャンネル登録日チェッカー（以下「本サービス」）は、利用者のプライバシーを最大限尊重して設計されています。本ポリシーは、本サービスにおける情報の取り扱いを説明するものです。
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

    <h2>5. センシティブデータの保護のための措置</h2>
    <p>
      本サービスが取り扱う Google ユーザーデータ（<code>youtube.readonly</code>
      スコープで取得するチャンネル登録情報、およびアクセストークン）は、Google
      がセンシティブデータと位置づける情報です。本サービスはこれらを保護するために、以下の技術的・組織的措置を講じています。
    </p>

    <h3>通信の暗号化</h3>
    <p>
      本サービスは全ページを HTTPS で配信し、通信はすべて TLS
      で暗号化されます。Google の認証基盤および YouTube Data API
      との通信も、ブラウザから Google のエンドポイントへ TLS
      で直接行われます。暗号化されていない経路でユーザーデータが送受信されることはありません。
    </p>

    <h3>保存領域を持たない設計（データ最小化）</h3>
    <p>
      本サービスは静的サイトであり、データベース・オブジェクトストレージ・ログ基盤などの
      <strong>永続的な保存領域を一切持ちません</strong>。取得したチャンネル登録情報とアクセストークンは、利用者のブラウザのメモリ上（JavaScript
      変数）にのみ保持され、localStorage・sessionStorage・Cookie・IndexedDB
      などへの書き込みは行いません。保存しないことにより、保存データの漏えいという事象そのものが発生しません。
    </p>

    <h3>アクセス制御</h3>
    <p>
      ユーザーデータは利用者のブラウザと Google
      の間でのみやり取りされ、運営者のサーバーを経由しません。したがって運営者および運営者以外の第三者が、利用者のチャンネル登録情報やアクセストークンを閲覧・取得できる経路は技術的に存在しません。運営者による人手での閲覧、機械学習モデルの学習への利用、広告目的での利用、第三者への販売・提供はいずれも行いません。
    </p>

    <h3>アクセストークンの限定的な取り扱い</h3>
    <p>
      アクセストークンは Google Identity Services が発行するものを直接受け取り、YouTube Data
      API への認証ヘッダーとしてのみ使用します。第三者のスクリプトや外部サービスへ受け渡すことはありません。有効期限は Google
      の定めるとおり約 1 時間です。
    </p>

    <h3>保持期間と削除</h3>
    <p>
      取得したデータの保持期間は、利用者がページを開いている間に限られます。タブを閉じる、ページを再読み込みする、または「ログアウト」を操作した時点で、データはメモリから消去されます。ログアウト時にはアクセストークンの失効（revoke）を Google
      に対して要求します。付与済みの権限は
      <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google アカウントのセキュリティ設定</a>
      からいつでも取り消すことができ、本サービス側に削除すべきデータの残留はありません。
    </p>

    <h3>要求する権限の最小化</h3>
    <p>
      本サービスが要求するスコープは、機能の実現に必要な読み取り専用の
      <code>youtube.readonly</code>
      1 つのみです。書き込み権限や、他の Google
      サービスへのアクセス権限は要求しません。
    </p>

    <h3>外部依存の最小化</h3>
    <p>
      本サービスがユーザーデータの処理に用いる外部コードは、Google
      が提供する Google Identity Services のみです。シェアカードの画像はブラウザ内で生成され、利用者の端末に保存されます。画像や登録情報が外部サーバーへ送信されることはありません。
    </p>

    <h3>問題が確認された場合の対応</h3>
    <p>
      本サービスの実装に情報の取り扱い上の問題が確認された場合、運営者は速やかに該当機能の提供を停止し、修正を行った上で本ページに内容を記載します。影響のある利用者への通知が必要な場合は、法令に従い対応します。問題を発見された場合は
      <a href="mailto:support@oyashimi.com">support@oyashimi.com</a>
      までご連絡ください。
    </p>

    <h2>6. YouTube API Services について</h2>
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

    <h2>7. アクセス解析</h2>
    <p>
      本サービスはアクセス状況の把握に Cookie を使用しないアクセス解析（Cloudflare Web
      Analytics）を利用する場合があります。個人を識別する情報の取得や、利用者の追跡は行いません。
    </p>

    <h2>8. 本ポリシーの変更</h2>
    <p>
      内容を変更する場合は、本ページの最終更新日を改めた上で掲載します。
    </p>

    <h2>9. お問い合わせ</h2>
    <p>
      本ポリシーおよび本サービスにおける情報の取り扱いに関するお問い合わせは、
      <a href="mailto:support@oyashimi.com">support@oyashimi.com</a> までご連絡ください。
    </p>
  </LegalLayout>
</template>
