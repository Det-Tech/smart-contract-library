import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { PricePayableMock, PricePayableMock__factory } from "../../typechain";
import { sign } from "crypto";

describe("PricePayable State", () => {
  let mock: MockContract<PricePayableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<PricePayableMock__factory>(
      "PricePayableMock"
    );
    mock = await mockFactory.deploy();
    await mock.deployed();
  });

  it("should revert  when owner call EthPayableMultiple without eth", async () => {
    const price = '0.1';
    const _quantity = 1;
    await expect(
        mock
        .connect(signer)
        .EthPayableMultiple(ethers.utils.parseEther(price), _quantity)
    )
      .to.be.reverted;
  });

  it("should revert  when user call EthPayableMultiple without eth", async () => {
    const price = '0.1';
    const _quantity = 1;
    await expect(
        mock
        .connect(user1)
        .EthPayableMultiple(ethers.utils.parseEther(price), _quantity)
    )
      .to.be.reverted;
  });

  it("should not revert  when owner call EthPayableMultiple with exact eth", async () => {
    const price = '0.1';
    const _quantity = 1;
    await expect(
        mock
        .connect(signer)
        .EthPayableMultiple(ethers.utils.parseEther(price), _quantity, {value: ethers.utils.parseEther(price)})
    )
      .to.not.be.reverted;
  });

  it("should not revert  when user call EthPayableMultiple with exact eth", async () => {
    const price = '0.1';
    const _quantity = 1;
    await expect(
        mock
        .connect(user1)
        .EthPayableMultiple(ethers.utils.parseEther(price), _quantity, {value: ethers.utils.parseEther(price)})
    )
      .to.not.be.reverted;
  });

  it("should revert  when owner call EthPayable without eth", async () => {
    const _quantity = 1;
    await expect(
        mock
        .connect(signer)
        .EthPayable(_quantity)
    )
      .to.be.reverted;
  });

  it("should revert  when user call EthPayable without eth", async () => {
    const _quantity = 1;
    await expect(
        mock
        .connect(user1)
        .EthPayable(_quantity)
    )
      .to.be.reverted;
  });

  it("should not revert  when owner call EthPayable with eth", async () => {
    await expect(
        mock
        .connect(signer)
        .EthPayable(ethers.utils.parseEther('0.1'), {value: ethers.utils.parseEther('0.1')})
    )
      .to.not.be.reverted;
  });

  it("should not revert  when user call EthPayable with eth", async () => {
    await expect(
        mock
        .connect(user1)
        .EthPayable(ethers.utils.parseEther('0.1'), {value: ethers.utils.parseEther('0.1')})
    )
      .to.not.be.reverted;
  });
});
