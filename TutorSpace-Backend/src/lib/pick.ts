/**
 * Copy across only the named keys from an untrusted object.
 *
 * Why this exists
 * ---------------
 * Several services passed `req.body` straight into Prisma as `data: payload`.
 * The parameter had a TypeScript type listing the expected fields, but that
 * type is erased at runtime and `req.body` is `any`, so ANY column on the model
 * could be written by simply including it in the request. That allowed a tutor
 * to set `is_verified` on their own profile, and a tutor to set
 * `payment_status: "PAID"` on a booking without involving Stripe.
 *
 * Whitelisting at the service boundary closes the whole class: a field that is
 * not named here can never reach the database, no matter what the client sends.
 */
export const pick = <T extends object>(
  source: unknown,
  keys: readonly string[],
): T => {
  const out: Record<string, unknown> = {};
  if (source && typeof source === "object") {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        out[key] = (source as Record<string, unknown>)[key];
      }
    }
  }
  return out as T;
};
