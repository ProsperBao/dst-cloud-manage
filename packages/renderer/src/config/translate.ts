export enum TranslateBaidu {
  '中文' = 'zh',
  'English' = 'en',
  '日本語' = 'jp',
  '한국어' = 'kor',
  '繁體中文' = 'cht',
}

export const translateBaiduOptions = Object.entries(TranslateBaidu).map(([key, value]) => ({
  label: key,
  value,
}))
