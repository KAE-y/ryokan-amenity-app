// Cloudflare Pages Functions: IPアドレスによるアクセス制限ミドルウェア
//
// すべてのリクエストがこのファイルを経由します（静的アセット・SPAルーティング含む）。
// CF-Connecting-IP ヘッダー（Cloudflareがオリジンに付与する接続元IP）を
// 下記の許可リストと照合し、一致しない場合は 403 を返します。

// ▼▼▼ ここを書き換えてください ▼▼▼
// 許可するIPアドレス／CIDR範囲のリスト（IPv4のみ対応）
const ALLOWED_IPV4_CIDRS: string[] = [
  '202.229.31.8/32',
];
// ▲▲▲ ここを書き換えてください ▲▲▲

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    result = (result << 8) | n;
  }
  return result >>> 0;
}

function isIpv4InCidr(ip: string, cidr: string): boolean {
  const [rangeIp, prefixStr] = cidr.split('/');
  const prefix = prefixStr === undefined ? 32 : Number(prefixStr);
  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(rangeIp);
  if (ipInt === null || rangeInt === null) return false;

  if (prefix === 0) return true;
  const mask = (~0 << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

function isAllowedIp(ip: string): boolean {
  return ALLOWED_IPV4_CIDRS.some((cidr) => isIpv4InCidr(ip, cidr));
}

export const onRequest: PagesFunction = async (context) => {
  const clientIp = context.request.headers.get('CF-Connecting-IP');

  if (!clientIp || !isAllowedIp(clientIp)) {
    return new Response('Forbidden', { status: 403 });
  }

  return context.next();
};
