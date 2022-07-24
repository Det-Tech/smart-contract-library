import express from "express";
import { getFinalTokenId, getEmergencyStopStatus } from "../utils/cacheHandler";
import merkleTreeData from "../whitelist/merkleTreeData.json";
import { getSignerAddress } from "../utils/web3";

const router = express.Router();

router.get("/stats", async (req, res) => {
  const merkleRoot = merkleTreeData.merkleRoot;
  // const finalTokenId = await getFinalTokenId();
  const signerAddress = await getSignerAddress();
  const emergencyStop = await getEmergencyStopStatus();

  res.json({ merkleRoot, signerAddress, emergencyStop });
});

export default router;
