import crypto from 'crypto';

function parseHeader(header) {
  if (typeof header !== 'string') {
    return null;
  }

  return header.split(',').reduce(
    (dest, item) => {
      const key = item.trim().split('=');
      if (key[0] === 't') {
        dest.timestamp = parseInt(key[1], 10);
      }
      if (['s0', 's1'].includes(key[0])) {
        (dest.signatures as any).push(key[1]);
      }
      return dest;
    },
    {
      timestamp: -1,
      signatures: []
    }
  );
}

function secureCompare(a, b) {
  a = Buffer.from(a);
  b = Buffer.from(b);

  if (a.length !== b.length) {
    return false;
  }

  if (crypto.timingSafeEqual) {
    return crypto.timingSafeEqual(a, b);
  }

  const len = a.length;
  let result = 0;
  for (let i = 0; i < len; ++i) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

export function isFromBoldSign(signatureHeader, payload, secretKey) {
  const parsed = parseHeader(signatureHeader);

  if (!parsed) {
    throw "BoldSign signatures doesn't exist";
  }

  // Signing secret must be configured in BoldSign console (https://app.boldsign.com/api-management/webhooks/)
  // and supplied here via BOLD_SIGN_WEBHOOK_SECRET_KEY env var.
  const signatureMatched = parsed.signatures
    .map(() =>
      crypto
        .createHmac('sha256', secretKey)
        .update(parsed.timestamp + '.' + payload, 'utf8')
        .digest('hex')
    )
    .some((x) => {
      return parsed.signatures.some((y) => secureCompare(x, y));
    });

  if (signatureMatched === false) {
    throw 'Unable to verify the signatures';
  }

  // 5 mins in seconds is safer choice, you can adjust if you prefer it
  const tolerance = 300;
  const timestampAge = Math.floor(Date.now() / 1000) - parsed.timestamp;

  // check for time tolerance to prevent replay attacks
  if (tolerance > 0 && timestampAge > tolerance) {
    throw 'Exceeded allowed tolerance range';
  }

  return true;
}
