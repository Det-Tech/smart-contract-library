import { BigNumber, Contract, ethers, Wallet } from "ethers";
import JungleFreaksMotorClub from "../abi/JungleFreaksMotorClub.json";
import env from "../env";
import {
  getCollectionPrice,
  getFinalTokenId,
  setCollectionPrice,
  setEmergencyStopStatus,
} from "./cacheHandler";

const provider = new ethers.providers.JsonRpcProvider(
  env.ETHEREUM_RPC_PROVIDER,
);

const signer = new Wallet(env.SIGNER_PRIVATE_KEY, provider);

const jfmcContract = new Contract(
  env.JFMC_CONTRACT_ADDRESS,
  JungleFreaksMotorClub.abi,
  provider,
);

export async function mintCheck(tokenId: string): Promise<boolean> {
  // console.log("mintCheck:", tokenId);
  try {
    await jfmcContract.ownerOf(tokenId);
  } catch (e) {
    // console.log(e);

    return false;
  }

  return true;
}

export async function getSignerAddress(): Promise<string> {
  return signer.address;
}

export function signMintRequest(
  walletAddress: string,
  salt: string,
  type: string[] = [],
  value: any[] = [],
) {
  const hash = ethers.utils.solidityKeccak256(
    ["address", "bytes8", ...type],
    [walletAddress, salt, ...value],
  );

  return signer.signMessage(ethers.utils.arrayify(hash));
}

export async function fetchCollectionPrice() {
  const { preSalePrice, salePrice } = await getCollectionPrice();
  if (!preSalePrice || !salePrice) {
    const preSalePrice = Number(
      ethers.utils.formatEther(await jfmcContract.SALE_PRICE()),
    );
    const salePrice = Number(
      ethers.utils.formatEther(await jfmcContract.SALE_PRICE()),
    );
    await setCollectionPrice({ preSalePrice, salePrice });
  }
}

export function subscribeToMintEvents() {
  jfmcContract.on(
    "Transfer",
    async (from: string, to: string, tokenId: BigNumber) => {
      if (from === "0x0000000000000000000000000000000000000000") {
        console.log({ minted: tokenId.toString() });
        const finalTokenId = await getFinalTokenId();
        if (tokenId.toNumber() >= finalTokenId) {
          await setEmergencyStopStatus(true);
          console.error(
            "EMERGENCY STOP!!! Reached final tokenId",
            tokenId.toString(),
          );
        }
      }
    },
  );
}
