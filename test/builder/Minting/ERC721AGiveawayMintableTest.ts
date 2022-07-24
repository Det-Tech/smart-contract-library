import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721AGiveawayMintableMock, ERC721AGiveawayMintableMock__factory } from "../../../typechain";

describe("ERC721AGiveawayMintable State", () => {
  let mock: MockContract<ERC721AGiveawayMintableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721AGiveawayMintableMock__factory>(
      "ERC721AGiveawayMintableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should revert when owner call giveawayMint with empty address array and quantity", async () => {
    const _to: any[] = [];
    const _quantity: any[] = [];
    await expect(
        mock
        .connect(signer)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when owner call giveawayMint with zero address", async () => {
    const _to = ["0x0000000000000000000000000000000000000000"];
    const _quantity = [1];
    await expect(
        mock
        .connect(signer)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when user call giveawayMint with zero address", async () => {
    const _to = ["0x0000000000000000000000000000000000000000"];
    const _quantity = [1];
    await expect(
        mock
        .connect(user1)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when owner call giveawayMint with zero quantity", async () => {
    const _to = [user1.address];
    const _quantity = [0];
    await expect(
        mock
        .connect(signer)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when user call giveawayMint with zero quantity", async () => {
    const _to = [user1.address];
    const _quantity = [0];
    await expect(
        mock
        .connect(user1)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when user call giveawayMint with empty address array and quantity", async () => {
    const _to: any[] = [];
    const _quantity: any[] = [];
    await expect(
        mock
        .connect(user1)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should not revert when owner call giveawayMint with exact address, quantity", async () => {
    const _to = [user1.address];
    const _quantity = [1];
    await expect(
        mock
        .connect(signer)
        .giveawayMint(_to, _quantity)
    )
      .to.not.be.reverted;
  });

  it("should revert when user call giveawayMint with exact address, quantity", async () => {
    const _to = [user1.address];
    const _quantity = [1];
    await expect(
        mock
        .connect(user1)
        .giveawayMint(_to, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when owner call giveawayMint with wrong address format", async () => {
    const _to = [user1.address];
    const _quantity = [1];
    await expect(
        mock
        .connect(signer)
        .giveawayMint(_quantity, _quantity)
    )
      .to.be.reverted;
  });

  it("should revert when owner call giveawayMint with wrong quantity", async () => {
    const _to = [user1.address];
    const _quantity = [1];
    await expect(
        mock
        .connect(signer)
        .giveawayMint(_to, _to)
    )
      .to.be.reverted;
  });
});
