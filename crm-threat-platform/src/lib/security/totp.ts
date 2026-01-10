const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const decodeBase32 = (input: string) => {
  const normalized = input.toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  let bits = '';

  for (const char of normalized) {
    const value = base32Alphabet.indexOf(char);
    if (value === -1) {
      continue;
    }
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return new Uint8Array(bytes);
};

const generateTotp = async (secret: string, counter: number, digits = 6) => {
  const key = decodeBase32(secret);
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(counter));

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );

  const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, buffer);
  const hmac = new Uint8Array(signature);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    | (hmac[offset + 3] & 0xff);

  return (code % 10 ** digits).toString().padStart(digits, '0');
};

export const verifyTotp = async ({
  secret,
  token,
  window = 1,
  step = 30,
}: {
  secret: string;
  token: string;
  window?: number;
  step?: number;
}) => {
  const timeCounter = Math.floor(Date.now() / 1000 / step);
  const normalizedToken = token.replace(/\s+/g, '');

  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = await generateTotp(secret, timeCounter + offset);
    if (candidate === normalizedToken) {
      return true;
    }
  }

  return false;
};
