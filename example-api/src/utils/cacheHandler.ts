import { randomBytes } from "crypto";
import Redis from "ioredis";
import env from "../env";
import { MerkleTree } from "merkletreejs";
import keccak256 from "../utils/keccak256";
import merkleTreeData from "../whitelist/merkleTreeData.json";

const merkleTree = new MerkleTree(
  Object.values(merkleTreeData.leafLookup),
  keccak256,
  {
    sortPairs: true,
  },
);
const host = env.REDISHOST;
const port = env.REDISPORT;

console.log("Redis: ", host, port);
const redis = new Redis({ host, port });

redis.on("error", err => {
  console.log("REDIS:", err);
});

export interface MetadataCacheItem {
  minted: boolean;
  lastUpdated: number; // unix timestamp ms;
  activeUpdate: boolean;
}

const metadataCacheItemInitialState: MetadataCacheItem = {
  minted: false,
  lastUpdated: 0,
  activeUpdate: false,
};

export interface GasPriceCache {
  gasPrice: any;
  lastUpdated: number;
  activeUpdate: boolean;
}

const gasPriceCacheInitialState: GasPriceCache = {
  gasPrice: {},
  lastUpdated: 0,
  activeUpdate: false,
};

export interface MintStatus {
  freeMintUsed: boolean;
  preSaleUsed: boolean;
}

export interface MintStatusCacheItem {
  mintStatus: MintStatus;
  lastUpdated: number;
  activeUpdate: boolean;
}

const mintStatusCacheItemInitialState: MintStatusCacheItem = {
  mintStatus: { freeMintUsed: false, preSaleUsed: false },
  lastUpdated: 0,
  activeUpdate: false,
};

export interface CollectionPrice {
  salePrice: number;
  preSalePrice: number;
}

const collectionPriceInitialState: CollectionPrice = {
  preSalePrice: 0,
  salePrice: 0,
};

export interface SaleInfo {
  allowListMinted?: number;
  allowListSupply?: number;
  soldOutAllowList?: boolean;
  allowance: number;
  salePrice: string;
  soldOut?: boolean;
  used?: boolean;
  eligible?: boolean;
  MAX_BATCH_MINT?: number;
  publicPrice?: string;
  eligibleForJunglePay?: boolean;
  totalMinted?: number;
  maxSupply?: number;
  proofArray?: string[];
  jungle?: string;
  eth?: string;
  gasPrice?: number;
}

export const saleInfoInitialState: SaleInfo = {
  allowance: 0,
  salePrice: "",
  soldOut: false,
};

interface SaleInfoCacheItem {
  data: SaleInfo;
  lastUpdated: number; // unix timestamp ms;
  activeUpdate: boolean;
  saleType: string;
}

const saleInfoCacheInitialState: SaleInfoCacheItem = {
  data: saleInfoInitialState,
  lastUpdated: 0,
  activeUpdate: false,
  saleType: "",
};

export interface SaleStatusCacheItem {
  status: string;
  lastUpdated: number; // unix timestamp ms;
  activeUpdate: boolean;
}

export interface SaleTypeCacheItem {
  type: string;
  lastUpdated: number; // unix timestamp ms;
  activeUpdate: boolean;
}

const saleStatusCacheItemInitialState: SaleStatusCacheItem = {
  status: "NOT_STARTED",
  lastUpdated: 0,
  activeUpdate: false,
};

const saleTypeCacheItemInitialState: SaleTypeCacheItem = {
  type: "",
  lastUpdated: 0,
  activeUpdate: false,
};

// Nonce
export async function setSalt(walletAddress: string, salt: string) {
  await redis.set(`${env.ENV}:nonce:${walletAddress}`, salt);
}

export async function getSalt(walletAddress: string): Promise<string | null> {
  let salt = await redis.get(`${env.ENV}:nonce:${walletAddress}`);
  if (!salt) {
    salt = `0x${randomBytes(8).toString("hex")}`;
    await setSalt(walletAddress, salt);
  }
  return salt;
}

// Token image
export async function setTokenImage(tokenId: string, imageUrl: string) {
  await redis.set(`tokenImage:${tokenId}`, imageUrl);
}

export async function getTokenImage(tokenId: string) {
  return await redis.get(`tokenImage:${tokenId}`);
}

// Upload Status
export async function setUploadStatus(uploadId: string, status: string) {
  await redis.set(`uploadStatus:${uploadId}`, status);
}

export async function getUploadStatus(uploadId: string) {
  return await redis.get(`uploadStatus:${uploadId}`);
}

// Metadata Cache
export async function setMetadataCache(
  tokenId: string,
  cache: MetadataCacheItem,
) {
  const data = JSON.stringify(cache);
  await redis.set(`${env.ENV}:metadataCache${tokenId}`, data);
}

export async function getMetadataCache(
  tokenId: string,
): Promise<MetadataCacheItem> {
  const dataString = await redis.get(`${env.ENV}:metadataCache${tokenId}`);
  if (!dataString) return metadataCacheItemInitialState;
  return JSON.parse(dataString);
}

export async function setMetadataActiveUpdate(
  tokenId: string,
  state: boolean,
  cache: MetadataCacheItem,
): Promise<MetadataCacheItem> {
  cache = { ...cache, activeUpdate: state };
  await setMetadataCache(tokenId, cache);
  return cache;
}

export async function setMetadataLastUpdated(
  tokenId: string,
  time: number,
  cache: MetadataCacheItem,
): Promise<MetadataCacheItem> {
  cache = { ...cache, lastUpdated: time };
  await setMetadataCache(tokenId, cache);
  return cache;
}

export async function setMetadataMinted(
  tokenId: string,
  cache: MetadataCacheItem,
): Promise<MetadataCacheItem> {
  cache = { ...cache, minted: true };
  await setMetadataCache(tokenId, cache);
  return cache;
}

// Gas price cache
export async function setGasPriceCache(cache: GasPriceCache) {
  const data = JSON.stringify(cache);
  await redis.set(`${env.ENV}:gasPriceCache`, data);
}

export async function getGasPriceCache(): Promise<GasPriceCache> {
  const dataString = await redis.get(`${env.ENV}:gasPriceCache`);
  if (!dataString) return gasPriceCacheInitialState;
  return JSON.parse(dataString);
}

// Reveal
export async function setRevealStatus(status: boolean) {
  await redis.set(`${env.ENV}:revealStatus`, JSON.stringify(status));
}

export async function getRevealStatus(): Promise<boolean> {
  const data = await redis.get(`${env.ENV}:revealStatus`);
  return JSON.parse(data || "false");
}

// Collection Price
export async function setCollectionPrice(collectionPrice: CollectionPrice) {
  await redis.set(
    `${env.ENV}:collectionPrice`,
    JSON.stringify(collectionPrice),
  );
}

export async function getCollectionPrice(): Promise<CollectionPrice> {
  const dataString = await redis.get(`${env.ENV}:collectionPrice`);
  if (!dataString) return collectionPriceInitialState;
  return JSON.parse(dataString);
}

// Sale Info Cache
export async function setSaleInfoCache(
  walletAddress: string,
  cache: SaleInfoCacheItem,
) {
  const data = JSON.stringify(cache);
  await redis.set(`${env.ENV}:saleInfoCache${walletAddress}`, data);
}

export async function getSaleInfoCache(
  walletAddress: string,
): Promise<SaleInfoCacheItem> {
  const dataString = await redis.get(
    `${env.ENV}:saleInfoCache${walletAddress}`,
  );
  if (!dataString) return saleInfoCacheInitialState;
  return JSON.parse(dataString);
}

export async function setSaleInfoActiveUpdate(
  walletAddress: string,
  state: boolean,
  cache: SaleInfoCacheItem,
): Promise<SaleInfoCacheItem> {
  cache = { ...cache, activeUpdate: state };
  await setSaleInfoCache(walletAddress, cache);
  return cache;
}

export async function setSaleInfoLastUpdated(
  walletAddress: string,
  time: number,
  cache: SaleInfoCacheItem,
): Promise<SaleInfoCacheItem> {
  cache = { ...cache, lastUpdated: time };
  await setSaleInfoCache(walletAddress, cache);
  return cache;
}

export async function setSaleInfo(
  walletAddress: string,
  data: SaleInfo,
  saleType: string,
  cache: SaleInfoCacheItem,
): Promise<SaleInfoCacheItem> {
  cache = { ...cache, saleType, data };
  await setSaleInfoCache(walletAddress, cache);
  return cache;
}

// Sale Type Cache
export async function setSaleTypeCache(cache: SaleTypeCacheItem) {
  const data = JSON.stringify(cache);
  await redis.set(`${env.ENV}:saleTypeCache`, data);
}

export async function getSaleTypeCache(): Promise<SaleTypeCacheItem> {
  const dataString = await redis.get(`${env.ENV}:saleTypeCache`);
  if (!dataString) return saleTypeCacheItemInitialState;
  return JSON.parse(dataString);
}

export async function setSaleTypeActiveUpdate(
  state: boolean,
  cache: SaleTypeCacheItem,
): Promise<SaleTypeCacheItem> {
  cache = { ...cache, activeUpdate: state };
  await setSaleTypeCache(cache);
  return cache;
}

export async function setSaleTypeLastUpdated(
  time: number,
  cache: SaleTypeCacheItem,
): Promise<SaleTypeCacheItem> {
  cache = { ...cache, lastUpdated: time };
  await setSaleTypeCache(cache);
  return cache;
}

export async function setSaleType(
  type: string,
  cache: SaleTypeCacheItem,
): Promise<SaleTypeCacheItem> {
  cache = { ...cache, type: type };
  await setSaleTypeCache(cache);
  return cache;
}

// Sale Status Cache
export async function setSaleStatusCache(cache: SaleStatusCacheItem) {
  const data = JSON.stringify(cache);
  await redis.set(`${env.ENV}:saleStatusCache`, data);
}

export async function getSaleStatusCache(): Promise<SaleStatusCacheItem> {
  const dataString = await redis.get(`${env.ENV}:saleStatusCache`);
  if (!dataString) return saleStatusCacheItemInitialState;
  return JSON.parse(dataString);
}

export async function setSaleStatusActiveUpdate(
  state: boolean,
  cache: SaleStatusCacheItem,
): Promise<SaleStatusCacheItem> {
  cache = { ...cache, activeUpdate: state };
  await setSaleStatusCache(cache);
  return cache;
}

export async function setSaleStatusLastUpdated(
  time: number,
  cache: SaleStatusCacheItem,
): Promise<SaleStatusCacheItem> {
  cache = { ...cache, lastUpdated: time };
  await setSaleStatusCache(cache);
  return cache;
}

export async function setSaleStatus(
  status: string,
  cache: SaleStatusCacheItem,
): Promise<SaleStatusCacheItem> {
  cache = { ...cache, status: status };
  await setSaleStatusCache(cache);
  return cache;
}

// Cache Update Interval
export async function setCacheUpdateInterval(interval: number) {
  await redis.set(`${env.ENV}:cacheUpdateInterval`, JSON.stringify(interval));
}

export async function getCacheUpdateInterval(): Promise<number> {
  const dataString = await redis.get(`${env.ENV}:cacheUpdateInterval`);
  if (!dataString) return 30000;
  return JSON.parse(dataString);
}

export async function getSaleTypeCacheUpdateInterval(): Promise<number> {
  const dataString = await redis.get(`${env.ENV}:saleTypeCacheUpdateInterval`);
  if (!dataString) return 30000;
  return JSON.parse(dataString);
}

// Mint Status Cache
export async function setMintStatusCache(
  tokenId: string,
  cache: MintStatusCacheItem,
) {
  const data = JSON.stringify(cache);
  await redis.set(`${env.ENV}:mintStatusCache:${tokenId}`, data);
}

export async function getMintStatusCache(
  tokenId: string,
): Promise<MintStatusCacheItem> {
  const dataString = await redis.get(`${env.ENV}:mintStatusCache:${tokenId}`);
  if (!dataString) return mintStatusCacheItemInitialState;
  return JSON.parse(dataString);
}

export async function setMintStatusActiveUpdate(
  tokenId: string,
  state: boolean,
  cache: MintStatusCacheItem,
): Promise<MintStatusCacheItem> {
  cache = { ...cache, activeUpdate: state };
  await setMintStatusCache(tokenId, cache);
  return cache;
}

export async function setMintStatusLastUpdated(
  tokenId: string,
  time: number,
  cache: MintStatusCacheItem,
): Promise<MintStatusCacheItem> {
  cache = { ...cache, lastUpdated: time };
  await setMintStatusCache(tokenId, cache);
  return cache;
}

export async function setMintStatus(
  tokenId: string,
  status: MintStatus,
  cache: MintStatusCacheItem,
): Promise<MintStatusCacheItem> {
  cache = { ...cache, mintStatus: status };
  await setMintStatusCache(tokenId, cache);
  return cache;
}

export async function getFinalTokenId(): Promise<number> {
  const numberString = await redis.get(`${env.ENV}:finalTokenId`);
  const finalTokenId = Number(numberString);
  if (Number.isNaN(finalTokenId) || finalTokenId === 0) return 9999;
  return finalTokenId;
}

// Emergency Stop
export async function setEmergencyStopStatus(status: boolean) {
  await redis.set(`${env.ENV}:emergencyStopStatus`, JSON.stringify(status));
}

export async function getEmergencyStopStatus(): Promise<boolean> {
  const data = await redis.get(`${env.ENV}:emergencyStopStatus`);
  return JSON.parse(data || "false");
}

// Data Validation Check
export async function setDataValidationStatus(uploadId: string, status: any) {
  const data = JSON.stringify(status);
  await redis.set(`dataValidationStatus:${uploadId}`, data);
}

export async function getDataValidationStatus(uploadId: string) {
  let data = await redis.get(`dataValidationStatus:${uploadId}`);
  if (!data) return JSON.parse("{}");
  return JSON.parse(data);
}

export function getMerkleProof(walletAddress: string): string[] {
  const lookup = merkleTreeData.leafLookup as Record<string, string>;
  const leaf = lookup[walletAddress];
  let wlProof: string[] = [];
  if (leaf) {
    wlProof = merkleTree.getHexProof(leaf);
  }

  return wlProof;
}
