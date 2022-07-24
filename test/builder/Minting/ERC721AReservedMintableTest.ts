import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721AReservedMintableMock, ERC721AReservedMintableMock__factory } from "../../../typechain";

describe("ERC721AReservedMintable State", () => {
  let mock: MockContract<ERC721AReservedMintableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721AReservedMintableMock__factory>(
      "ERC721AReservedMintableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner set reservedMintSupply", async () => {
    await expect(
          mock
        .connect(signer)
        .setReservedMintSupply(100)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set reservedMintSupply", async () => {
    await expect(
          mock
        .connect(user1)
        .setReservedMintSupply(100)
    )
    .to.be.reverted;
  });

  it("should not revert when owner call reserverdMint with zero address ", async () => {
    const _quantity = 1;
    const _to = "0x0000000000000000000000000000000000000000";

    await mock.setReservedMintSupply(100);
    await expect(
          mock
        .connect(signer)
        .reservedMint(_to, _quantity)
    )
    .to.be.reverted;
  });

  it("should not revert when user call reserverdMint with zero address ", async () => {
    const _quantity = 1;
    const _to = "0x0000000000000000000000000000000000000000";

    await mock.setReservedMintSupply(100);
    await expect(
          mock
        .connect(user1)
        .reservedMint(_to, _quantity)
    )
    .to.be.reverted;
  });

  it("should not revert when owner call reserverdMint with less quantity than ReservedMintSupply ", async () => {
    const _quantity = 1;
    const _to = user1.address;
    await mock.setReservedMintSupply(100);
    await expect(
          mock
        .connect(signer)
        .reservedMint(_to, _quantity)
    )
    .to.not.be.reverted;
  });

  it("should revert when owner call reserverdMint with less quantity than ReservedMintSupply ", async () => {
    const _quantity = 1;
    const _to = "0x0000000000000000000000000000000000000000";
    await mock.setReservedMintSupply(100);
    await expect(
          mock
        .connect(signer)
        .reservedMint(_to, _quantity)
    )
    .to.be.reverted;
  });

  it("should revert when owner call reserverdMint with more quantity than ReservedMintSupply", async () => {
    const _quantity = 101;
    const _to = user1.address;
    await mock.setReservedMintSupply(100);
    await expect(
          mock
        .connect(signer)
        .reservedMint(_to, _quantity)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set ReservedMintSupply with 0, call reserverdMint with more quantity", async () => {
    const _quantity = 1000;
    const _to = user1.address;
    await mock.setReservedMintSupply(0);
    await expect(
          mock
        .connect(signer)
        .reservedMint(_to, _quantity)
    )
    .to.not.be.reverted;
  });
});
