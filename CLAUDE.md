# 財務整聊｜finance-intake 專案說明

這是財務整聊師 **Howard 豪歐**的客戶導流問卷系統。
客戶填完 22 題問卷後，資料存入 Supabase，Howard 依此安排一對一財務整聊通話。

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | React + Vite |
| 部署 | Vercel |
| 後端 API | Vercel Serverless Function (`api/submit.js`) |
| 資料庫 | Supabase |
| PDF 生成 | html2pdf.js（因中文字型支援，未改用 pdfmake） |

---

## 專案檔案結構

```
finance-intake/
├── api/
│   └── submit.js          # POST /api/submit → 寫入 Supabase
├── src/
│   ├── pages/
│   │   ├── IntroPage.jsx  # 歡迎頁（Howard 自我介紹，全置中）
│   │   ├── QuizPage.jsx   # 22 題問卷主體
│   │   └── ReportPage.jsx # 提交成功頁 + PDF 下載
│   ├── components/
│   │   └── ProgressBar.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── index.css          # 全站樣式
│   └── main.jsx
├── supabase/
│   ├── schema.sql         # v1（舊）
│   ├── schema_v2.sql      # v2（舊）
│   └── schema_v3.sql      # v3（最新，需在 Supabase SQL Editor 執行）
├── CLAUDE.md              # 本文件
├── DEVLOG.md              # 每日開發日誌
└── vercel.json
```

---

## 視覺風格

- 背景：深綠 `#2C3E30`
- 主色：金色 `#D4AF37`
- 文字：白色
- 字型：Noto Serif TC（標題）、Noto Sans TC（內文）
- 全螢幕一頁一題，有進度條

---

## 問卷 22 題結構

### 區塊一：個人基本資料（Q1–Q10）
Q1 姓名、Q2 性別、Q3 生日、Q4 縣市、Q5 婚姻狀況、
Q6 子女數、Q7 父母健在、Q8 長照需求、Q9 職業、Q10 月收入

### 區塊二：財務目標與夢想（Q11–Q15）
Q11 財務目標排序（最多選3項，自動標示1/2/3優先）、
Q12 人生願望清單（複選+其他文字）、Q13 願望時間表、
Q14 退休年齡、Q15 退休生活費

### 區塊三：財務現況（Q16–Q21）
Q16 收入分配三角（三個滑桿合計100%）、Q17 資產狀況、
Q18 房產（可多筆）、Q19 負債、Q20 保險配置、Q21 風險偏好

### 區塊四：聯絡資料（Q22）
姓名確認、電話（必填）、LINE ID（選填）

---

## 資料庫

- 最新資料表：`finance_intakes_v3`
- schema 檔案：`supabase/schema_v3.sql`
- 若尚未建立：進 Supabase → SQL Editor → 貼上 schema_v3.sql 全文執行

### 需要的環境變數

**Vercel（後端）：**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

**本機 .env（前端）：**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 報告頁 PDF 規格

- 兩頁 A4
- 第一頁：基本資料、家庭結構、財務目標、人生願望、退休規劃
- 第二頁：收入分配、資產、房產、負債、保險、風險偏好、聯絡資料
- 頁首：深綠底金字標題
- 區塊裝飾：左側 4px 金色邊框
- 頁尾：LINE@ 聯絡資訊

---

## 報告頁主要 CTA

1. 主按鈕（綠色）：加入 LINE@ `https://lin.ee/6PIRaEp`
2. 次按鈕：下載 PDF 前置報告

---

## 注意事項

- `life_coverage`、`accident_coverage` 等保額欄位為 `text` 型別，支援填入「不知道」
- Q11 財務目標資料格式：`[{key: string, rank: number}]`，存入 jsonb
- Q12 願望清單資料格式：`text[]`，另有 `life_wishes_other` 文字欄位
- PDF 使用 html2pdf.js（非 pdfmake），因 pdfmake 不支援中文字型
