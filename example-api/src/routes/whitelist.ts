import express from "express";
import { MerkleTree } from "merkletreejs";
import keccak256 from "../utils/keccak256";
import merkleTreeData from "../whitelist/merkleTreeData.json";

const router = express.Router();

export const merkleTree = new MerkleTree(
  Object.values(merkleTreeData.leafLookup),
  keccak256,
  {
    sortPairs: true,
  },
);

router.get("/whitelist/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  const lookup = merkleTreeData.leafLookup as Record<string, string>;
  const leaf = lookup[walletAddress];
  let wlProof: string[] = [];
  if (leaf) {
    wlProof = merkleTree.getHexProof(leaf);
  }

  res.json({ wlProof });
});

export default router;
