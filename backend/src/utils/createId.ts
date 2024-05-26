import { customAlphabet } from "nanoid";

/**
 * Generate a random uuid string of length 26.
 * E.g. "b3d4e5f6g7h8i9j0k1l2m3n4o5"
 *
 * The alphabet used for each character is base32 which is 5 bits.
 * All characters are URI safe ie do not need to be URI-encoded.
 * The final uuid is (2^5)*26 = 2^130 which is a 130 bit number.
 * COmplies with IETF RFC4122 v4 UUID standard.
 *
 * The IETF (Internet Engineering Task Force) defines the UUID protocol in RFC
 * 4122 as “A 128-bits-long identifier that can guarantee uniqueness across
 * space and time.”
 */
const createId = customAlphabet("abcdefghijklmnopqrstuvwxyz012345", 26);

export default createId;
