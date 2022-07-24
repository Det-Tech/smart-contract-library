import express from "express";
import {
  getCacheUpdateInterval,
  getDataValidationStatus,
  getMetadataCache,
  getRevealStatus,
  setDataValidationStatus,
  setMetadataActiveUpdate,
  setMetadataLastUpdated,
  setMetadataMinted,
} from "../utils/cacheHandler";
import env from "../env";
import { mintCheck } from "../utils/web3";
import { Readable } from "stream";
import { Storage } from "@google-cloud/storage";
import axios from "axios";
import { randomBytes } from "ethers/lib/utils";

interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string | undefined;
  external_url: string;
  attributes: any[];
}
const storage = new Storage();
const metadataBucket = storage.bucket(env.METADATA_BUCKET);

const router = express.Router();

export async function streamToJSON(stream: Readable) {
  const chunks: Buffer[] = [];
  const string: string = await new Promise((resolve, reject) => {
    stream.on("data", chunk => chunks.push(Buffer.from(chunk)));
    stream.on("error", err => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
  return JSON.parse(string);
}

router.get("/contract.json", async (req, res) => {
  const { apiKey } = req.query;

  let contractMetadata = {
    name: "Jungle Freaks Motor Club",
    description:
      "A collection of 8,888 Hand Drawn Cars. 5 Different body styles with over 350+ unique traits. NFT's acting as a metaverse pass for car related games with embedded performance related metadata.",
    image: `${env.BUCKET_BASE_URI}${env.PREREVEAL_BUCKET}/jfmc-logo.png`,
    external_link: "https://www.junglefreaks.io/jfmc",
    seller_fee_basis_points: 500,
    fee_recipient: "0x44A712A81983AD879E14BeeCd23D601D98e3Dc73",
  };

  if (
    env.ENV !== "production" &&
    apiKey !== "3b1ad445-5a38-42a2-a8de-513eccee365d"
  ) {
    contractMetadata = {
      name: "HBRGCY1",
      description: "",
      image: "",
      external_link: "https://example.com",
      seller_fee_basis_points: 500,
      fee_recipient: "",
    };
  }

  res.json(contractMetadata);
});

router.get("/token/:tokenId.json", async (req, res) => {
  const { apiKey, showPrereveal } = req.query;
  const { tokenId } = req.params;

  // Validate tokenId as number between 0 and 9999
  const tokenIdAsNumber = Number(tokenId);
  if (
    Number.isNaN(tokenIdAsNumber) ||
    tokenIdAsNumber < 0 ||
    tokenIdAsNumber >= 8888
  ) {
    res.status(422).send("Unprocessable Entity");
    return;
  }

  const cacheUpdateInterval = await getCacheUpdateInterval();

  let cache = await getMetadataCache(tokenId);

  if (
    !cache.activeUpdate &&
    (!cache.minted || cache.lastUpdated + cacheUpdateInterval < Date.now())
  ) {
    // Active update
    cache = await setMetadataActiveUpdate(tokenId, true, cache);

    // Check if minted
    if (!cache.minted) {
      if (await mintCheck(tokenId)) {
        cache = await setMetadataMinted(tokenId, cache);
      }
    }

    cache = await setMetadataLastUpdated(tokenId, Date.now(), cache);
    cache = await setMetadataActiveUpdate(tokenId, false, cache);
  }

  // if not minted
  if (!cache.minted && apiKey !== "3b1ad445-5a38-42a2-a8de-513eccee365d") {
    res.status(404).send("ERC721A: query for nonexistent token");
    return;
  }

  let tokenMetadata: TokenMetadata = {
    name: `JFMC - ${tokenId.padStart(4, "0")}`,
    description: "",
    image: `${env.BUCKET_BASE_URI}${env.PREREVEAL_BUCKET}/JFMC-prereveal.gif`,
    animation_url: `${env.BUCKET_BASE_URI}${env.PREREVEAL_BUCKET}/JFMC-prereveal.mp4`,
    external_url: "https://junglefreaks.io/jfmc",
    attributes: [],
  };

  if (
    env.ENV !== "production" &&
    apiKey !== "3b1ad445-5a38-42a2-a8de-513eccee365d"
  ) {
    tokenMetadata = {
      name: `HBRGCY1-${tokenId.padStart(4, "0")}`,
      description: "",
      image: `${env.BUCKET_BASE_URI}${env.PREREVEAL_BUCKET}/blank.png`,
      animation_url: undefined,
      external_url: "https://example.com",
      attributes: [],
    };
  }

  // Hide metadata if not revealed
  if (
    (!(await getRevealStatus()) &&
      apiKey !== "3b1ad445-5a38-42a2-a8de-513eccee365d") ||
    (showPrereveal === "true" &&
      apiKey === "3b1ad445-5a38-42a2-a8de-513eccee365d")
  ) {
    return res.json(tokenMetadata);
  }

  // kill server
  // if (apiKey !== "3b1ad445-5a38-42a2-a8de-513eccee365d") {
  //   return res.status(500).send("Internal Server Error");
  // }

  try {
    tokenMetadata = await streamToJSON(
      metadataBucket.file(`${tokenId}.json`).createReadStream(),
    );
  } catch (e) {
    console.log(e);
  }

  return res.json(tokenMetadata);
});

router.get("/data-validation", async (req, res) => {
  const { start, end, chunk, apiKey } = req.query;

  if (apiKey !== "d89f2713-486b-4cf8-a357-c4e9cabdee66")
    return res.json({ error: "Invalid Api Key" });

  const rangeStart = Number(start);
  const rangeEnd = Number(end);
  const rangeChunk = Number(chunk);

  const statusId = `0x${Buffer.from(randomBytes(16)).toString("hex")}`;
  res.json({ statusId });

  let chunkErrors: any = {};
  let checkDups: Record<number, string> = {};

  await setDataValidationStatus(statusId, {
    range: `${rangeStart} - ${rangeEnd}`,
    chunkSize: rangeChunk,
  });

  for (var i = rangeStart; i < rangeEnd; i += rangeChunk) {
    chunkErrors = {};
    await Promise.all(
      new Array(rangeChunk).fill(0).map((_, j) =>
        (async (tokenId: number) => {
          let error: any = {};
          const name = `JFMC-${tokenId.toString().padStart(4, "0")}`;

          const tokenMetadata = await streamToJSON(
            metadataBucket.file(`${tokenId}.json`).createReadStream(),
          ).catch(e => (error.serverError = "metadataError"));

          if (tokenMetadata.name !== name) {
            console.log({ tokenIdMismatch: tokenMetadata.name });
            error.tokenIdMismatch = tokenMetadata.name;
            chunkErrors[tokenId] = error;
            return;
          }

          const [dupTokenId, _] = Object.entries(checkDups).filter(
            ([_, url]) => {
              return url === tokenMetadata.image;
            },
          )[0] ?? [-1, ""];

          if (Number(dupTokenId) > -1) {
            error.duplicateImage = { [dupTokenId]: tokenMetadata.image };
            chunkErrors[tokenId] = error;
            return;
          }

          checkDups = { ...checkDups, [tokenId]: tokenMetadata.image };

          const imageRes = await axios.head(tokenMetadata.image).catch(e => {
            // console.log({ imageError: e.config.url });
            error.serverError = `imageError: ${e.config.url}`;
            return "";
          });

          if (typeof imageRes === "string") {
            chunkErrors[tokenId] = error;
            return;
          }

          if (imageRes.status !== 200) {
            // console.log({ statusCode: imageRes.status });
            error.statusCode = imageRes.status;
            chunkErrors[tokenId] = error;
            return;
          }

          if (imageRes.headers["content-type"] !== "image/png") {
            // console.log({ contentType: imageRes.headers["content-type"] });
            error.contentType = imageRes.headers["content-type"];
            chunkErrors[tokenId] = error;
            return;
          }

          for (var attribute of tokenMetadata.attributes) {
            // Check attributes
          }
        })(i + j),
      ),
    );
    let status = await getDataValidationStatus(statusId);
    await setDataValidationStatus(statusId, {
      ...status,
      recent: i + rangeChunk,
      finished: i + rangeChunk === rangeEnd,
      errorCount: status.errors
        ? Object.keys(status.errors).length + Object.keys(chunkErrors).length
        : 0,
      errors: { ...status.errors, ...chunkErrors },
    });
  }
});

router.get("/data-validation/:statusId", async (req, res) => {
  const { statusId } = req.params;
  res.json(await getDataValidationStatus(statusId));
});

export default router;
