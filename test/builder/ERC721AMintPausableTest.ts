import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721AMintPausableMock, ERC721AMintPausableMock__factory } from "../../typechain";

describe("ERC721AMintPausable State", () => {
  let mock: MockContract<ERC721AMintPausableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721AMintPausableMock__factory>(
      "ERC721AMintPausableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner call pauseMint function", async () => {
    await mock.setSaleState(1);
    await expect(
      mock
        .connect(signer)
        .pauseMint()
    )
      .to.not.be.reverted;
  });

  it("should revert when user call pauseMint function", async () => {
    await mock.setSaleState(1);
    await expect(
      mock
      .connect(user1)
      .pauseMint()
    )
      .to.be.reverted;
  });

  it("should not revert when owner call unpauseMint function", async () => {
    await mock.setSaleState(2);
    await expect(
      mock
      .connect(signer)
      .unpauseMint()
    )
    .to.not.be.reverted;
  });

  it("should revert when user call unpauseMint function", async () => {
    await mock.setSaleState(2);
    await expect(
      mock
      .connect(user1)
      .unpauseMint()
    )
    .to.be.reverted;
  });
});
