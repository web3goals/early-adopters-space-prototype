/**
 * Convert "0xC6F4..." to "eip155:0xC6F4...".
 */
export function addressToDid(address?: string): string {
  if (!address) {
    throw new Error(`Fail to converting address to DID: ${address}`);
  }
  return `eip155:${address}`;
}

/**
 * Convert "eip155:0xC6F4..." to "0xC6F4...".
 */
export function didToAddress(did?: string): string {
  if (!did || !did.startsWith("eip155:")) {
    throw new Error(`Fail to converting DID to address: ${did}`);
  }
  return did.replace("eip155:", "");
}
