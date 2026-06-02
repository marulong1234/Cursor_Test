import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

/** 解析后端 API 返回的时间字符串（无时区时按 UTC 处理） */
export function parseApiDate(dateString: string): Date {
  const value = dateString.trim();
  if (!value) return new Date();

  // 已含时区信息（Z 或 +08:00 等）
  if (/[Zz]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  // 后端 SQLite 存 UTC 但序列化无时区后缀，补 Z 避免被 JS 当本地时间解析
  return new Date(value.includes("T") ? `${value}Z` : value);
}

export function formatRelativeTime(dateString: string): string {
  const date = parseApiDate(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();

  // 未来时间（时钟偏差）→ 显示「刚刚」
  if (diffMs < 0) return "刚刚";

  // 1 分钟内
  if (diffMs < 60_000) return "刚刚";

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: zhCN,
  });
}

export function formatAbsoluteTime(dateString: string): string {
  const date = parseApiDate(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
