import dayjs from 'dayjs'

export function formatDateByLanguage(date: string, format: string) {
  return dayjs(date).format(format)
}
