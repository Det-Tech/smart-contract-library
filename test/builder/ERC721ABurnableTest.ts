import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721ABurnableMock, ERC721ABurnableMock__factory } from "../../typechain";

describe("ERC721ABurnable State", () => {
  let mock: MockContract<ERC721ABurnableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721ABurnableMock__factory>(
      "ERC721ABurnableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should revert when call burn wrong tokenID", async () => {
    const tokenId = 1000;
    await expect(
        mock
        .connect(user1)
        .burn(tokenId)
    )
      .to.be.reverted;
  });

  it("should not revert when call burn exact tokenID", async () => {
    const tokenId = 0;
    await mock.connect(user1).testMint(user1.address, 1);
    await expect(
        mock
        .connect(user1)
        .burn(tokenId)
    )
      .to.not.be.reverted;
  });
});
