import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";

/**
 * Get signer by wallet client.
 */
export default function useSigner(): {
  signer: ethers.providers.JsonRpcSigner | undefined;
} {
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >();

  useEffect(() => {
    setSigner(undefined);
    if (walletClient) {
      const network = {
        chainId: walletClient.chain.id,
        name: walletClient.chain.name,
        ensAddress: walletClient.chain.contracts?.ensRegistry?.address,
      };
      const provider = new ethers.providers.Web3Provider(
        walletClient.transport,
        network
      );
      setSigner(provider.getSigner(walletClient.account.address));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletClient]);

  return { signer };
}
