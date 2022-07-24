import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721ARoyaltyMock, ERC721ARoyaltyMock__factory } from "../../typechain";

describe("ERC721ARoyalty State", () => {
  let mock: MockContract<ERC721ARoyaltyMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721ARoyaltyMock__factory>(
      "ERC721ARoyaltyMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner set RoyaltyReceiver address without zero address", async () => {
    const _address = user1.address;
    await expect(
          mock
        .connect(signer)
        .setRoyaltyReceiver(_address)
    )
      .to.not.be.reverted;
  });

  it("should revert when user set RoyaltyReceiver address without zero address", async () => {
    const _address = user1.address;
    await expect(
          mock
        .connect(user1)
        .setRoyaltyReceiver(_address)
    )
      .to.be.reverted;
  });

  it("should revert when owner set RoyaltyReceiver address with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";
    await expect(
          mock
        .connect(signer)
        .setRoyaltyReceiver(address)
    )
      .to.be.reverted;
  });

  it("should revert when user set RoyaltyReceiver address with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";
    await expect(
          mock
        .connect(user1)
        .setRoyaltyReceiver(address)
    )
      .to.be.reverted;
  });

  it("should not revert when owner set RoyaltyBasisPoints without zero basisPoints", async () => {
    const _basisPoints = 100;
    await expect(
          mock
        .connect(signer)
        .setRoyaltyBasisPoints(_basisPoints)
    )
      .to.not.be.reverted;
  });

  it("should revert when user set RoyaltyBasisPoints without zero basisPoints", async () => {
    const _basisPoints = 100;
    await expect(
          mock
        .connect(user1)
        .setRoyaltyBasisPoints(_basisPoints)
    )
      .to.be.reverted;
  });

  it("should not revert when owner set RoyaltyBasisPoints with zero basisPoints", async () => {
    const _basisPoints = 0;
    await expect(
          mock
        .connect(signer)
        .setRoyaltyBasisPoints(_basisPoints)
    )
      .to.be.reverted;
  });

  it("should revert when user set RoyaltyBasisPoints with zero basisPoints", async () => {
    const _basisPoints = 0;
    await expect(
          mock
        .connect(user1)
        .setRoyaltyBasisPoints(_basisPoints)
    )
      .to.be.reverted;
  });
});
