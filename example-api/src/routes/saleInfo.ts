import express from "express";
import {
  getCacheUpdateInterval,
  getCollectionPrice,
  getSaleInfoCache,
  getSaleStatusCache,
  getSaleTypeCache,
  getSalt,
  getMerkleProof,
  saleInfoInitialState,
  setSaleInfo,
  setSaleInfoActiveUpdate,
  setSaleInfoLastUpdated,
  setSaleStatusActiveUpdate,
  setSaleStatusCache,
  setSaleTypeActiveUpdate,
  setSaleTypeCache,
  getGasPriceCache,
  SaleInfo,
  getSaleTypeCacheUpdateInterval,
  setSaleInfoCache,
} from "../utils/cacheHandler";
import env from "../env";
import { Contract, ethers } from "ethers";
import JungleFreaksMotorClub from "../abi/JungleFreaksMotorClub.json";
import StandardERC20 from "../abi/StandardERC20.json";
import merkleTreeData from "../whitelist/merkleTreeData.json";
import { SaleType, SALE_STATUS } from "../utils/constants";
import { getGasPrice } from "./gasPrice";

const router = express.Router();

const whiteList = Object.keys(merkleTreeData.leafLookup);

router.get("/sale-info/:walletAddress", async (req, res) => {
  const provider = new ethers.providers.JsonRpcProvider(
    env.ETHEREUM_RPC_PROVIDER,
  );

  const jungleContract = new Contract(
    env.JUNGLE_CONTRACT_ADDRESS,
    StandardERC20,
    provider,
  );

  const jfmcContract = new Contract(
    env.JFMC_CONTRACT_ADDRESS,
    JungleFreaksMotorClub.abi,
    provider,
  );

  const { walletAddress } = req.params;
  // return res.status(429).send("Too Many Requests");

  // const { preSalePrice, salePrice } = await getCollectionPrice();

  const cacheUpdateInterval = await getCacheUpdateInterval();
  const saleTypeCacheUpdateInterval = await getSaleTypeCacheUpdateInterval();

  if (!ethers.utils.isAddress(walletAddress)) {
    res.status(422).send({ error: "Invalid wallet address" });
    return;
  }

  const gasPriceCache = await getGasPriceCache();
  if (
    !gasPriceCache.activeUpdate &&
    gasPriceCache.lastUpdated + cacheUpdateInterval < Date.now()
  ) {
    getGasPrice();
  }

  // Gas price is cached as the full response, we need the average and to divide by 10 to undo what the response does.
  const gasPrice = gasPriceCache.gasPrice.average / 10;

  let saleStatusCache = await getSaleStatusCache();
  let status = saleStatusCache.status;
  if (
    !saleStatusCache.activeUpdate &&
    saleStatusCache.lastUpdated + cacheUpdateInterval < Date.now()
  ) {
    // Active update
    saleStatusCache = await setSaleStatusActiveUpdate(true, saleStatusCache);

    status = await jfmcContract.getSaleState();
    await setSaleStatusCache({
      status,
      lastUpdated: Date.now(),
      activeUpdate: false,
    });
  }

  // const status = await jfmcContract.getSaleState();

  // Have a much more frequent update of the sale type cache
  let saleTypeCache = await getSaleTypeCache();
  let saleType = saleTypeCache.type;
  if (
    !saleTypeCache.activeUpdate &&
    saleTypeCache.lastUpdated + saleTypeCacheUpdateInterval < Date.now()
  ) {
    // Active update
    await setSaleTypeActiveUpdate(true, saleTypeCache);

    // Set the sale type correctly
    saleType = await jfmcContract.getSaleType();

    await setSaleTypeCache({
      type: saleType,
      lastUpdated: Date.now(),
      activeUpdate: false,
    });
  }

  // const saleType = await jfmcContract.getSaleType();

  // let saleTypeChanged = false;
  // let saleInfoCache = await getSaleInfoCache(walletAddress);

  // // Check if it's been updated since this saleInfo was cached
  // if (saleInfoCache.saleType !== saleType) {
  //   saleTypeChanged = true;
  // }

  // let saleInfo: SaleInfo = { ...saleInfoCache.data, gasPrice };
  // if (
  //   !saleInfoCache.activeUpdate &&
  //   (saleInfoCache.lastUpdated + cacheUpdateInterval < Date.now() ||
  //     saleTypeChanged)
  // ) {
  //   try {
  //     // Active update
  //     saleInfoCache = await setSaleInfoActiveUpdate(
  //       walletAddress,
  //       true,
  //       saleInfoCache,
  //     );

  //     // Reset
  //     saleInfo = saleInfoInitialState;

  //     const jungle = ethers.utils.formatEther(
  //       await jungleContract.balanceOf(walletAddress),
  //     );
  //     const eth = ethers.utils.formatEther(
  //       await provider.getBalance(walletAddress),
  //     );
  //     saleInfo.jungle = jungle;
  //     saleInfo.eth = eth;
  //     saleInfo.gasPrice = gasPrice;

  //     saleInfo.maxSupply = parseFloat(
  //       (await jfmcContract.MAX_SUPPLY()).toString(),
  //     );
  //     saleInfo.totalMinted = (await jfmcContract.totalMinted()).toNumber();
  //     saleInfo.soldOut =
  //       (saleInfo.maxSupply ?? 0) <= (saleInfo.totalMinted ?? 0);

  //     // Set values based on sale state
  //     switch (saleType) {
  //       case SaleType.AllowListMint:
  //         saleInfo.salePrice = ethers.utils.formatEther(
  //           await jfmcContract.SALE_PRICE(),
  //         );
  //         saleInfo.allowListSupply = parseFloat(
  //           (await jfmcContract.ALLOW_LIST_SUPPLY()).toString(),
  //         );
  //         saleInfo.allowListMinted = parseFloat(
  //           (await jfmcContract.allowListQuantity()).toString(),
  //         );
  //         saleInfo.soldOutAllowList =
  //           (saleInfo.allowListSupply ?? 0) <= (saleInfo.allowListMinted ?? 0);
  //         const [, stakedHoldings] = await jfmcContract.getTotalHoldings(
  //           walletAddress,
  //         );
  //         const wlProof = getMerkleProof(walletAddress);
  //         console.log({ wlProof });
  //         saleInfo.proofArray = wlProof;
  //         if (wlProof.length || stakedHoldings.toNumber() > 0) {
  //           saleInfo.eligible = true;
  //           saleInfo.allowance = 2;
  //         } else {
  //           saleInfo.eligible = false;
  //           saleInfo.allowance = 0;
  //         }

  //         break;
  //       case SaleType.HoldersGuaranteeMint: {
  //         const jungle = ethers.utils.parseEther("0");
  //         saleInfo.salePrice = ethers.utils.formatEther(
  //           await jfmcContract.holdersEthPrice(jungle, 1),
  //         );
  //         saleInfo.used = await jfmcContract.getHoldersGuaranteeUsed(
  //           walletAddress,
  //         );
  //         const [totalTokens] = await jfmcContract.getTotalHoldings(
  //           walletAddress,
  //         );
  //         if (totalTokens.toNumber() > 0) {
  //           saleInfo.eligible = true;
  //         } else {
  //           saleInfo.eligible = false;
  //         }
  //         if (saleInfo.used) {
  //           saleInfo.allowance = 0;
  //         } else {
  //           saleInfo.allowance = 1;
  //         }
  //         break;
  //       }
  //       case SaleType.HoldersMint: {
  //         const jungle = ethers.utils.parseEther("0");
  //         saleInfo.salePrice = ethers.utils.formatEther(
  //           await jfmcContract.holdersEthPrice(jungle, 1),
  //         );
  //         const allowance = (
  //           await jfmcContract.getHoldersTxAllowance(walletAddress)
  //         ).toNumber();
  //         if (allowance > 0) {
  //           saleInfo.eligible = true;
  //         } else {
  //           saleInfo.eligible = false;
  //         }
  //         saleInfo.allowance = allowance;
  //         break;
  //       }
  //       case SaleType.PublicMint:
  //         {
  //           saleInfo.salePrice = ethers.utils.formatEther(
  //             await jfmcContract.SALE_PRICE(),
  //           );
  //           const jungle = ethers.utils.parseEther("0");
  //           saleInfo.publicPrice = ethers.utils.formatEther(
  //             await jfmcContract.publicEthPrice(jungle, 1),
  //           );
  //           saleInfo.MAX_BATCH_MINT = await jfmcContract.MAX_BATCH_MINT();

  //           const [totalTokens] = await jfmcContract.getTotalHoldings(
  //             walletAddress,
  //           );
  //           if (totalTokens.toNumber() > 0) {
  //             saleInfo.eligibleForJunglePay = true;
  //           } else {
  //             saleInfo.eligibleForJunglePay = false;
  //           }
  //           saleInfo.eligible = true;
  //           saleInfo.allowance = 5;
  //         }
  //         break;
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     saleInfoCache = await setSaleInfo(
  //       walletAddress,
  //       saleInfo,
  //       saleType,
  //       saleInfoCache,
  //     );

  //     saleInfoCache = await setSaleInfoLastUpdated(
  //       walletAddress,
  //       Date.now(),
  //       saleInfoCache,
  //     );
  //     saleInfoCache = await setSaleInfoActiveUpdate(
  //       walletAddress,
  //       false,
  //       saleInfoCache,
  //     );
  //   }
  // }
  try {
    let saleInfo: SaleInfo = { ...saleInfoInitialState };
    const jungle = ethers.utils.formatEther(
      await jungleContract.balanceOf(walletAddress),
    );
    const eth = ethers.utils.formatEther(
      await provider.getBalance(walletAddress),
    );
    saleInfo.jungle = jungle;
    saleInfo.eth = eth;
    saleInfo.gasPrice = gasPrice;

    saleInfo.maxSupply = 8888;
    saleInfo.totalMinted = (await jfmcContract.totalMinted()).toNumber();
    saleInfo.soldOut = (saleInfo.maxSupply ?? 0) <= (saleInfo.totalMinted ?? 0);

    // Set values based on sale state
    switch (saleType) {
      case SaleType.AllowListMint:
        saleInfo.salePrice = ethers.utils.formatEther(
          await jfmcContract.SALE_PRICE(),
        );
        saleInfo.allowListSupply = parseFloat(
          (await jfmcContract.ALLOW_LIST_SUPPLY()).toString(),
        );
        saleInfo.allowListMinted = parseFloat(
          (await jfmcContract.allowListQuantity()).toString(),
        );
        saleInfo.soldOutAllowList =
          (saleInfo.allowListSupply ?? 0) <= (saleInfo.allowListMinted ?? 0);
        const [, stakedHoldings] = await jfmcContract.getTotalHoldings(
          walletAddress,
        );
        const wlProof = getMerkleProof(walletAddress);
        console.log({ wlProof });
        saleInfo.proofArray = wlProof;
        if (wlProof.length || stakedHoldings.toNumber() > 0) {
          saleInfo.eligible = true;
          saleInfo.allowance = 2;
        } else {
          saleInfo.eligible = false;
          saleInfo.allowance = 0;
        }

        break;
      case SaleType.HoldersGuaranteeMint: {
        // const jungle = ethers.utils.parseEther("0");
        saleInfo.salePrice = "0.08";
        // saleInfo.salePrice = ethers.utils.formatEther(
        //   await jfmcContract.holdersEthPrice(ethers.utils.parseEther("0"), 1),
        // );
        saleInfo.used = await jfmcContract.getHoldersGuaranteeUsed(
          walletAddress,
        );
        const [totalTokens] = await jfmcContract.getTotalHoldings(
          walletAddress,
        );
        if (totalTokens.toNumber() > 0) {
          saleInfo.eligible = true;
        } else {
          saleInfo.eligible = false;
        }
        if (saleInfo.used) {
          saleInfo.allowance = 0;
        } else {
          saleInfo.allowance = 1;
        }
        break;
      }
      case SaleType.HoldersMint: {
        // const jungle = ethers.utils.parseEther("0");
        saleInfo.salePrice = "0.08";
        const allowance = (
          await jfmcContract.getHoldersTxAllowance(walletAddress)
        ).toNumber();
        if (allowance > 0) {
          saleInfo.eligible = true;
        } else {
          saleInfo.eligible = false;
        }
        saleInfo.allowance = allowance;
        break;
      }
      case SaleType.PublicMint: {
        saleInfo.salePrice = "0.1";
        // const jungle = ethers.utils.parseEther("0");
        saleInfo.publicPrice = "0.1";
        saleInfo.MAX_BATCH_MINT = 5;

        const [totalTokens] = await jfmcContract.getTotalHoldings(
          walletAddress,
        );
        if (totalTokens.toNumber() > 0) {
          saleInfo.eligibleForJunglePay = true;
        } else {
          saleInfo.eligibleForJunglePay = false;
        }
        saleInfo.eligible = true;
        saleInfo.allowance = 5;
        break;
      }
    }

    const salt = await getSalt(walletAddress);

    // saleType = "AllowListMint";
    // res.json({ ...saleInfo, status: "PAUSED", saleType, salt });

    return res.json({
      ...saleInfo,
      status: SALE_STATUS[status],
      saleType,
      salt,
    });
  } catch {
    return res.status(429).send("Too Many Requests");
  }
});

export default router;
