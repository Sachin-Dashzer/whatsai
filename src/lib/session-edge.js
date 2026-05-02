import { jwtVerify } from 'jose';

export async function decryptEdge(session) {
  try {
    const secretKey = process.env.SESSION_SECRET;
    const encodedKey = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(session || '', encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}
