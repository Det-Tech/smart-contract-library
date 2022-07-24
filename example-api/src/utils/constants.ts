export enum SaleType {
  AllowListMint = "AllowListMint",
  HoldersGuaranteeMint = "HoldersGuaranteeMint",
  HoldersMint = "HoldersMint",
  PublicMint = "PublicMint",
}

export const SALE_STATUS: Record<string, string> = {
  0: "NOT_STARTED", // 0
  1: "ACTIVE", // 1
  2: "PAUSED", // 2
  3: "FINISHED", // 3
};
