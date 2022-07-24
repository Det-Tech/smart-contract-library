import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721ASizeableMock, ERC721ASizeableMock__factory } from "../../typechain";

describe("ERC721ASizeable State", () => {
  let mock: MockContract<ERC721ASizeableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  it("should not revert when set collection size", async () => {

    const mockFactory = await smock.mock<ERC721ASizeableMock__factory>(
      "ERC721ASizeableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass", 1000);
    await expect(
      mock.deployed()
    )
      .to.not.be.reverted;
  });
});
