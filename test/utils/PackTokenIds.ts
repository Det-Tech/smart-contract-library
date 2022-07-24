import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { PackTokenIdsMock, PackTokenIdsMock__factory } from "../../typechain";

describe("Pack Tokens", () => {
  let mock: MockContract<PackTokenIdsMock>;

  before(async () => {
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<PackTokenIdsMock__factory>(
      "PackTokenIdsMock"
    );
    mock = await mockFactory.deploy();
    await mock.deployed();
  });

  describe("Check token exists", async () => {
    it("should emit false when free mint token doesn't exist", async () => {
        expect(await mock.isFreeMintTokenUsed(1234))
        .to.equal(false)

    });

    it("should emit false when pre sale token doesn't exist", async () => {
        expect(await mock.isPreSaleTokenUsed(5678))
        .to.equal(false)

    });

    it("pack bool should return 1", async () => {
        expect(await mock.packBool(0,0,true)).to.equal(1)

    });

    it("unpack pack bool should be true", async () => {
      const packedBool =  mock.packBool(0,0,true)

      expect(await mock.isUnpackBool(packedBool, 0)).to.equal(true)
        // expect(await mock.is(0,0,true)).to.equal(1)

    });

    it("used token ids should be consistent with isUsed checker", async () => {
      const packedBool =  mock.packBool(0,0,true)

      expect(await mock.isUnpackBool(packedBool, 0)).to.equal(true)
        // expect(await mock.is(0,0,true)).to.equal(1)

    });

    it("set used pre and free token ids should return true but not vice versa", async () => {
      await mock.setUsedTokenIds([1234],[5678]);

      expect(await mock.isFreeMintTokenUsed(1234))
      .to.equal(true)

      expect(await mock.isPreSaleTokenUsed(5678))
      .to.equal(true)


      expect(await mock.isFreeMintTokenUsed(5678))
      .to.equal(false)

      expect(await mock.isPreSaleTokenUsed(1234))
      .to.equal(false)
      // expect(await mock.is(0,0,true)).to.equal(1)

    });
  });
});
