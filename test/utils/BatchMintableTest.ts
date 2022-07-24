import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { BatchMintableMock, BatchMintableMock__factory } from "../../typechain";

describe("BatchMintable State", () => {
  let mock: MockContract<BatchMintableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<BatchMintableMock__factory>(
      "BatchMintableMock"
    );
    mock = await mockFactory.deploy();
    await mock.deployed();
    await mock.setMaxBatchMint(10);

  });

  it("should not revert when owner call setMaxBatchMint", async () => {
    const _quantity = 4;
    await expect(
          mock
          .connect(signer)
          .setMaxBatchMint(_quantity)
    )
      .to.not.be.reverted;
  });

  it("should not revert when user call setMaxBatchMint", async () => {
    const _quantity = 4;
    await expect(
          mock
          .connect(user1)
          .setMaxBatchMint(_quantity)
    )
      .to.not.be.reverted;
  });

  it("should retrieve correct maxBatchMint", async () => {
    expect(
        await mock
       .connect(signer)
       .maxBatchMint()
    )
    .to.equal("10");
  });
});
