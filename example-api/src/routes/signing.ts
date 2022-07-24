import express from "express";
import {
  getEmergencyStopStatus,
  getSalt,
  getSaleStatusCache,
  setSalt,
  getSaleTypeCache,
} from "../utils/cacheHandler";
import { ethers } from "ethers";
import { randomBytes } from "crypto";
import { signMintRequest } from "../utils/web3";
import { merkleTree } from "./whitelist";
import merkleTreeData from "../whitelist/merkleTreeData.json";
import { SaleType } from "../utils/constants";

const router = express.Router();

router.post("/sign", async (req, res) => {
  const { userSig, walletAddress, jungle, quantity } = req.body;

  const saleTypeCache = await getSaleTypeCache();
  const saleType = saleTypeCache.type;
  const salt = await getSalt(walletAddress);

  if (!salt) {
    res.status(422).send({ error: "Salt not found" });
    return;
  }

  if (!userSig || !ethers.utils.isAddress(walletAddress)) {
    res.status(422).send({ error: "Request is incomplete" });
    return;
  }

  console.log(saleType);
  // Generate signature
  let msg = "Signature Verification\n\n";
  switch (saleType) {
    case "HoldersGuaranteeMint":
      msg += `Jungle: ${ethers.utils.formatEther(jungle).split(".")[0]}\n\n`;
      break;
    case "HoldersMint":
    case "PublicMint":
      msg += `Jungle: ${ethers.utils.formatEther(jungle).split(".")[0]}\n`;
      msg += `Quantity: ${quantity}\n\n`;
      break;
    case "AllowListMint":
      msg += `Quantity: ${quantity}\n\n`;
      break;
    default:
      break;
  }
  msg += `security: ${salt}`;

  console.log(msg);

  const address = ethers.utils.verifyMessage(msg, userSig);

  if (address.toLowerCase() !== walletAddress.toLowerCase()) {
    console.log({ address, walletAddress });
    return res.status(401).send({ error: `Unauthorized` });
  }

  let signature: string;
  switch (saleType) {
    case "AllowListMint":
      const lookup = merkleTreeData.leafLookup as Record<string, string>;
      const leaf = lookup[walletAddress];
      let merkleProof: string[] = [];
      console.log({ merkleProof, leaf });
      if (leaf !== undefined && leaf !== null) {
        merkleProof = merkleTree.getHexProof(leaf);
      }
      signature = await signMintRequest(
        walletAddress,
        salt,
        ["bytes32[]", "uint8"],
        [merkleProof, quantity],
      );
      break;
    case "HoldersGuaranteeMint":
      signature = await signMintRequest(
        walletAddress,
        salt,
        ["uint256"],
        [jungle],
      );
      break;
    case "HoldersMint":
    case "PublicMint":
      signature = await signMintRequest(
        walletAddress,
        salt,
        ["uint256", "uint8"],
        [jungle, quantity],
      );
      break;
    default:
      signature = await signMintRequest(walletAddress, salt);
  }

  const response = { signature, salt };

  const emergencyStop = await getEmergencyStopStatus();
  if (emergencyStop) {
    return res.json({ error: "All tokens are minted" });
  }

  res.json(response);

  await setSalt(walletAddress, `0x${randomBytes(8).toString("hex")}`);
});

export default router;
