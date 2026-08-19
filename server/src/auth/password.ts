/**
 * Hachage de mot de passe basé sur scrypt (module `crypto` natif de Node).
 * Aucune dépendance externe n'est nécessaire, et le sel est stocké avec
 * l'empreinte sous la forme : scrypt$<sel hex>$<empreinte hex>.
 */

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const derived = (await scryptAsync(plain, Buffer.from(saltHex, 'hex'), KEY_LENGTH)) as Buffer;

  // Comparaison à temps constant pour éviter les attaques temporelles.
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
