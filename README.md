# OurCalendar - みんなのカレンダー

家族・パートナー・グループ向けのカレンダー共有アプリ。Tinder風スワイプUIでイベントを「共有」「個人」に簡単に仕分けできます。

## 特徴

- Tinder風スワイプUIでイベントを直感的に仕分け
- Googleカレンダーとの連携
- グループ作成・招待機能
- リアルタイムカレンダー同期

## プロジェクト構成

```
OurCalendar/
├── frontend/          # React Native (Expo) アプリ
├── backend/           # Go API サーバー
└── infra/             # GCPインフラ設定
    ├── terraform/     # Terraform設定
    └── scripts/       # デプロイスクリプト
```

## 技術スタック

### Frontend
- React Native (Expo SDK 54)
- TypeScript
- React Navigation
- expo-auth-session (Google OAuth)

### Backend
- Go 1.22
- chi router
- PostgreSQL

### Infrastructure
- Google Cloud Platform
  - Cloud Run
  - Cloud SQL (PostgreSQL)
  - Cloud Build
  - Secret Manager

## 開発環境のセットアップ

### Frontend

```bash
cd frontend
npm install
npx expo start
```

### Backend

```bash
cd backend
go mod download
go run ./cmd/api
```

### Infrastructure

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvarsを編集
terraform init
terraform plan
terraform apply
```

## 環境変数

### Frontend (.env)
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_API_URL=https://your-api-url
```

### Backend
環境変数はCloud Run / Secret Managerで管理

## デプロイ

mainブランチへのpushで自動デプロイ（Cloud Build）

## ライセンス

Private
