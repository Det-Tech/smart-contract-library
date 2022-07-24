import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721ABaseURIMock, ERC721ABaseURIMock__factory } from "../../typechain";

describe("ERC721ABaseURI State", () => {
  let mock: MockContract<ERC721ABaseURIMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721ABaseURIMock__factory>(
      "ERC721ABaseURIMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner set exact baseURI format", async () => {
    const _baseURI = "https://github.com/massless/";
    await expect(
          mock
        .connect(signer)
        .setBaseURI(_baseURI)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set exact baseURI format", async () => {
    const _baseURI = "https://github.com/massless/";
    await expect(
          mock
        .connect(user1)
        .setBaseURI(_baseURI)
    )
    .to.be.reverted;
  });

  it("should revert when owner set wrong baseURI format", async () => {
    const _baseURI = "https://github.com/massless";
    await expect(
          mock
        .connect(signer)
        .setBaseURI(_baseURI)
    )
    .to.be.reverted;
  });

  it("should revert when user set wrong baseURI format", async () => {
    const _baseURI = "https://github.com/massless";
    await expect(
          mock
        .connect(user1)
        .setBaseURI(_baseURI)
    )
    .to.be.reverted;
  });

  it("should retrieve correct default contractURI", async () => {
    const _baseURI = "https://github.com/massless/";
    await mock.connect(signer).setBaseURI(_baseURI);
    expect(
           await mock
          .connect(signer)
          .contractURI()
      )
      .to.equal(
      `https://github.com/massless/contract.json`
    );

  });
});
