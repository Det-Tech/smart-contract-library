import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { RoyaltyMock, RoyaltyMock__factory } from "../../typechain";

describe("Royalty", () => {
  let mock: MockContract<RoyaltyMock>;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [owner, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<RoyaltyMock__factory>("RoyaltyMock");
    mock = await mockFactory.deploy();
    await mock.deployed();
    await mock.setRoyaltyReceiver(user1.address);
  });

  it("should support ERC2981 Interface", async () => {
    const ERC2981InterfaceId = "0x2a55205a"; // type(IERC2981).interfaceId

    expect(await mock.supportsInterface(ERC2981InterfaceId)).to.equal(true);
  });

  it("should get royalty receiver", async () => {
    expect(await mock.royaltyReceiver()).to.equal(user1.address);
  });

  it("should set royalty receiver", async () => {
    await expect(mock.setRoyaltyReceiver(user1.address)).to.not.be.reverted;
    expect(await mock.royaltyReceiver()).to.equal(user1.address);
  });
   
});
