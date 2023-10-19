import { Chain, polygonMumbai } from "wagmi/chains";

interface ChainConfig {
  chain: Chain;
  contracts: {
    profile: `0x${string}`;
    project: `0x${string}`;
  };
}

/**
 * Get chain configs defined by environment variables.
 */
export function getSupportedChainConfigs(): ChainConfig[] {
  const chainConfigs: ChainConfig[] = [];
  if (process.env.NEXT_PUBLIC_POLYGON_MUMBAI_PROFILE_CONTRACT_ADDRESS) {
    chainConfigs.push({
      chain: polygonMumbai,
      contracts: {
        profile: process.env
          .NEXT_PUBLIC_POLYGON_MUMBAI_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
        project: process.env
          .NEXT_PUBLIC_POLYGON_MUMBAI_PROJECT_CONTRACT_ADDRESS as `0x${string}`,
      },
    });
  }
  return chainConfigs;
}

/**
 * Get chains using supported chain configs.
 */
export function getSupportedChains(): Chain[] {
  return getSupportedChainConfigs().map((chainConfig) => chainConfig.chain);
}

/**
 * Get the first chain config from supported chains.
 */
export function getDefaultSupportedChainConfig(): ChainConfig {
  const chainConfigs = getSupportedChainConfigs();
  if (chainConfigs.length === 0) {
    throw new Error("Supported chain config is not found");
  } else {
    return chainConfigs[0];
  }
}

/**
 * Return config of specified chain if it supported, otherwise return config of default supported chain.
 */
export function chainToSupportedChainConfig(
  chain: Chain | undefined
): ChainConfig {
  for (const config of getSupportedChainConfigs()) {
    if (config.chain.id === chain?.id) {
      return config;
    }
  }
  return getDefaultSupportedChainConfig();
}
