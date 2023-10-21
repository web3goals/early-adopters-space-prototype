import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const accounts = [];
if (process.env.PRIVATE_KEY_1) {
  accounts.push(process.env.PRIVATE_KEY_1);
}
if (process.env.PRIVATE_KEY_2) {
  accounts.push(process.env.PRIVATE_KEY_2);
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    polygonMumbai: {
      url: process.env.RPC_URL_POLYGON_MUMBAI as string,
      accounts: accounts,
    },
    filecoinCalibration: {
      url: process.env.RPC_URL_FILECOIN_CALIBRATION as string,
      accounts: accounts,
    },
    scrollSepolia: {
      url: process.env.RPC_URL_SCROLL_SEPOLIA as string,
      accounts: accounts,
    },
    mantleTestnet: {
      url: process.env.RPC_URL_MANTLE_TESTNET as string,
      accounts: accounts,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY_POLYGON_MUMBAI as string,
      scrollSepolia: "abc",
    },
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://sepolia-blockscout.scroll.io/api",
          browserURL: "https://sepolia-blockscout.scroll.io/",
        },
      },
    ],
  },
};

export default config;
