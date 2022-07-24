import express from "express";
import {
  getCacheUpdateInterval,
  getMintStatusCache,
  getTokenImage,
  setMintStatus,
  setMintStatusActiveUpdate,
  setMintStatusCache,
  setMintStatusLastUpdated,
} from "../utils/cacheHandler";
import env from "../env";
import { Contract, ethers } from "ethers";
import JungleFreaksMotorClub from "../abi/JungleFreaksMotorClub.json";

const router = express.Router();

const provider = new ethers.providers.JsonRpcProvider(
  env.ETHEREUM_RPC_PROVIDER,
);

const jfmcContract = new Contract(
  env.JFMC_CONTRACT_ADDRESS,
  JungleFreaksMotorClub.abi,
  provider,
);

router.get("/token-mint-status/:tokenId", async (req, res) => {
  const { tokenId } = req.params;

  // Validate tokenId as number between 0 and 3332
  const tokenIdAsNumber = Number(tokenId);
  if (
    Number.isNaN(tokenIdAsNumber) ||
    tokenIdAsNumber < 0 ||
    tokenIdAsNumber > 3332
  ) {
    res.status(422).send("Unprocessable Entity");
    return;
  }

  const cacheUpdateInterval = await getCacheUpdateInterval();

  let mintStatusCache = await getMintStatusCache(tokenId);
  let mintStatus = mintStatusCache.mintStatus;

  if (
    !mintStatusCache.activeUpdate &&
    mintStatusCache.lastUpdated + cacheUpdateInterval < Date.now()
  ) {
    // Active update
    mintStatusCache = await setMintStatusActiveUpdate(
      tokenId,
      true,
      mintStatusCache,
    );

    const [freeMintUsed, preSaleUsed] = await jfmcContract.usedTokenId(tokenId);
    mintStatus = { freeMintUsed, preSaleUsed };
    mintStatusCache = await setMintStatus(tokenId, mintStatus, mintStatusCache);

    mintStatusCache = await setMintStatusLastUpdated(
      tokenId,
      Date.now(),
      mintStatusCache,
    );
    mintStatusCache = await setMintStatusActiveUpdate(
      tokenId,
      false,
      mintStatusCache,
    );
  }
  const image = await getTokenImage(tokenId);

  res.json({ ...mintStatus, image });
});

export default router;
