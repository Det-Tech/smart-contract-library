import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SaleStateMock, SaleStateMock__factory } from "../../typechain";

describe("Sale State", () => {
  let mock: MockContract<SaleStateMock>;

  beforeEach(async () => {
    const mockFactory = await smock.mock<SaleStateMock__factory>(
      "SaleStateMock"
    );
    mock = await mockFactory.deploy();
    await mock.deployed();
  });

  describe("Check setters and getters", async () => {
    it("should emit test when sale type is set", async () => {
      expect(await mock.setSaleType("TestSale"))
        .to.emit(mock, "TypeOfSale")
        .withArgs("TestSale");
    });

    it("should emit sale state when sale state is set", async () => {
      expect(await mock.setSaleState(0))
        .to.emit(mock, "StateOfSale")
        .withArgs(0);
    });

    it("should return last known sale state", async () => {
      expect(await mock.getSaleState()).to.equal(0);
    });
  });

  describe("Check test mint", async () => {
    it("should emit true when sale type is set", async () => {
      expect(await mock.setSaleType("TestSale"))
        .to.emit(mock, "TypeOfSale")
        .withArgs("TestSale");
      expect(await mock.setSaleState(1))
        .to.emit(mock, "StateOfSale")
        .withArgs(1);
      expect(await mock.getSaleState()).to.equal(1);
      expect(await mock.testMint("TestSale"))
        .to.emit(mock, "MintToken")
        .withArgs(true);
    });

    it("should revert when NoActiveSale", async () => {
      expect(await mock.setSaleState(0))
        .to.emit(mock, "StateOfSale")
        .withArgs(0);
      expect(await mock.getSaleState()).to.equal(0);
      expect(await mock.setSaleType("TestSale"))
        .to.emit(mock, "TypeOfSale")
        .withArgs("TestSale");
      await expect(mock.testMint("TestSale")).to.be.revertedWith(
        "NoActiveSale"
      );
    });

    it("should revert when paused", async () => {
      expect(await mock.setSaleState(1))
        .to.emit(mock, "StateOfSale")
        .withArgs(1);
      expect(await mock.getSaleState()).to.equal(1);
      expect(await mock.pause())
        .to.emit(mock, "IsPaused")
        .withArgs(true);
      await expect(mock.testMint("None")).to.be.revertedWith("NoActiveSale");
    });
  });
});
