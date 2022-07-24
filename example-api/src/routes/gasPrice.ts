import express from "express";
import {
  getCacheUpdateInterval,
  getGasPriceCache,
  setGasPriceCache,
} from "../utils/cacheHandler";
import env from "../env";
import axios from "axios";

const router = express.Router();

export function getGasPrice() {
  getGasPriceCache().then(async cache => {
    await setGasPriceCache({ ...cache, activeUpdate: true });
    return axios
      .get(
        `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=${env.GAS_API_KEY}`,
      )
      .then(async res => {
        await setGasPriceCache({
          gasPrice: res.data,
          lastUpdated: Date.now(),
          activeUpdate: false,
        });
      })
      .catch(e => console.log("Failed to get latest gas price"));
  });
}

router.get("/gas-price", async (req, res) => {
  const cacheUpdateInterval = await getCacheUpdateInterval();

  const gasPriceCache = await getGasPriceCache();
  if (
    !gasPriceCache.activeUpdate &&
    gasPriceCache.lastUpdated + cacheUpdateInterval < Date.now()
  ) {
    getGasPrice();
  }

  res.json(gasPriceCache.gasPrice);
});

export default router;
