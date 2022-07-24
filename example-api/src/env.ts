import * as dotenv from "dotenv";

dotenv.config();

function parseString(variable: string | undefined, name: string): string {
  if (variable) return variable;

  console.error(`No ${name} set`);
  process.exit(1);
}

function parseNumber(variable: string | undefined, name: string): number {
  if (variable) return Number(variable);

  console.error(`No ${name} set`);
  process.exit(1);
}

export default {
  ENV: parseString(process.env.ENV, "ENV"),
  REDISHOST: parseString(process.env.REDISHOST, "REDISHOST"),
  REDISPORT: parseNumber(process.env.REDISPORT, "REDISPORT"),
  ETHEREUM_RPC_PROVIDER: parseString(
    process.env.ETHEREUM_RPC_PROVIDER,
    "ETHEREUM_RPC_PROVIDER",
  ),
  SIGNER_PRIVATE_KEY: parseString(
    process.env.SIGNER_PRIVATE_KEY,
    "SIGNER_PRIVATE_KEY",
  ),
  JF_CONTRACT_ADDRESS: parseString(
    process.env.JF_CONTRACT_ADDRESS,
    "JF_CONTRACT_ADDRESS",
  ),
  JUNGLE_CONTRACT_ADDRESS: parseString(
    process.env.JUNGLE_CONTRACT_ADDRESS,
    "JUNGLE_CONTRACT_ADDRESS",
  ),
  JFMC_CONTRACT_ADDRESS: parseString(
    process.env.JFMC_CONTRACT_ADDRESS,
    "JFMC_CONTRACT_ADDRESS",
  ),
  BUCKET_BASE_URI: parseString(process.env.BUCKET_BASE_URI, "BUCKET_BASE_URI"),
  PREREVEAL_BUCKET: parseString(
    process.env.PREREVEAL_BUCKET,
    "PREREVEAL_BUCKET",
  ),
  METADATA_BUCKET: parseString(process.env.METADATA_BUCKET, "METADATA_BUCKET"),
  IMAGE_BUCKET: parseString(process.env.IMAGE_BUCKET, "IMAGE_BUCKET"),
  GAS_API_KEY: parseString(process.env.GAS_API_KEY, "GAS_API_KEY"),
};
