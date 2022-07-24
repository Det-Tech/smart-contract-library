import express from "express";
import {
  getTokenImage,
  getUploadStatus,
  setTokenImage,
  setUploadStatus,
} from "../utils/cacheHandler";
import env from "../env";
import { Contract, ethers } from "ethers";
import StandardERC721 from "../abi/StandardERC721.json";
import { randomBytes } from "ethers/lib/utils";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const router = express.Router();

const provider = new ethers.providers.JsonRpcProvider(
  env.ETHEREUM_RPC_PROVIDER,
);

const jfContract = new Contract(
  env.JF_CONTRACT_ADDRESS,
  StandardERC721.abi,
  provider,
);

router.get("/3bb5e0cd-c236-4eb6-9d53-581e3682704d2", async (req, res) => {
  const uploadId = `0x${Buffer.from(randomBytes(16)).toString("hex")}`;
  res.json({ uploadId });
  let finished = false;
  const chunk = 20;
  const numberToFetch = 3333;
  const { startChunk } = req.body;

  for (var i = 0; i < numberToFetch; i += chunk) {
    // Generate indices for the token IDs we actually need
    let indices: number[] = Array.from(
      { length: i + chunk < numberToFetch ? chunk : numberToFetch - i },
      (v, k) => k + i,
    );
    console.log({ i, chunk, indices });

    const tokenIdsString: string = indices.reduce<string>((prev, current) => {
      return (prev += "token_ids=" + current.toString() + "&");
    }, "");
    const url = `https://api.opensea.io/api/v1/assets?${tokenIdsString}asset_contract_address=0x77640cf3F89A4F1B5CA3A1e5c87f3F5B12ebf87e`;
    console.log({ tokenIdsString, url });

    // Request the token data for these indices
    let tokenData = await axios
      .get(url, {
        headers: {
          Accept: "application/json",
          "X-API-KEY": "2a322d7a93c6486ab0530157056c987c",
        },
      })
      .then(res => {
        if (res.status == 200) {
          return res.data.assets;
        } else {
          throw { error: "Failed to fetch token data." };
        }
      })
      .catch(e => console.log({ e }));

    await tokenData.forEach(async (token: any) => {
      console.log({ tokenId: token.token_id, image: token.image_url });
      await setTokenImage(token.token_id, token.image_url);
    });
    await delay(1000);
  }
});

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

router.get("/3bb5e0cd-c236-4eb6-9d53-581e3682704d", async (req, res) => {
  const uploadId = `0x${Buffer.from(randomBytes(16)).toString("hex")}`;
  res.json({ uploadId });
  let finished = false;
  var stream = fs.createWriteStream("failedList.txt", { flags: "a" });
  const chunk = 20;
  for (var i = 0; i < 3333; i += chunk) {
    await setUploadStatus(uploadId, `Starting ${i} - ${i + chunk}`);
    await Promise.all(
      new Array(chunk).fill(0).map((_, chunkIndex) =>
        (async tokenId => {
          if (finished) return;
          let working = true;

          const tokenUri = await jfContract
            .tokenURI(tokenId.toString())
            .catch(async (e: any) => {
              await setUploadStatus(
                uploadId,
                `Hit a missing token Id. Therefore finished.`,
              );
              console.log({ e });
              // finished = true;
              return;
            });

          const tokenMetadata = await axios
            .get(tokenUri)
            .then(res => res.data)
            .catch(e => console.log("metadata", e.response.data));

          const bodyFormData = new FormData();
          bodyFormData.append("url", tokenMetadata.image);
          const headers = bodyFormData.getHeaders();
          headers["x-api-key"] = "Sa3O4frfdCwgkH0OFtzex1iqZhQFeqf4BRyBvv7Q9El";
          const mediaResponse = await axios({
            method: "POST",
            url: "http://127.0.0.1:8085/v1/media",
            data: bodyFormData,
            headers,
            timeout: 180000,
          })
            .then(res => {
              return res.data;
            })
            .catch(e => {
              working = false;
              console.log({ function: "host", error: e, tokenId });
              return;
            });

          if (!working) {
            stream.write(tokenId.toString() + "\n");

            return;
          }

          const published = await axios({
            method: "POST",
            url: "https://api.massless.io/v1/media/publish",
            data: { mediaId: mediaResponse.mediaId },
            headers: {
              "x-api-key": "Sa3O4frfdCwgkH0OFtzex1iqZhQFeqf4BRyBvv7Q9El",
              "Content-Type": "application/json",
            },
            timeout: 120000,
          })
            .then(res => {
              return res.data;
            })
            .catch(e => console.log("publish:", e.response.data));

          await setTokenImage(tokenId.toString(), published.url);

          await axios.get(published.url + "/resize?width=128");
          await axios.get(published.url + "/resize?width=400");
        })(i + chunkIndex),
      ),
    );
  }
  stream.end();
});

router.get("/upload-status/:uploadId", async (req, res) => {
  const { uploadId } = req.params;
  res.json({ status: await getUploadStatus(uploadId) });
});

export default router;
