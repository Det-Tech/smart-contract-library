import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721APublicMintableMock, ERC721APublicMintableMock__factory } from "../../../typechain";

describe("ERC721APublicMintable State", () => {
  let mock: MockContract<ERC721APublicMintableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721APublicMintableMock__factory>(
      "ERC721APublicMintableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner set MaxBatchMint", async () => {
    const _maxBatchMint = 10;
    await expect(
          mock
        .connect(signer)
        .setMaxBatchMint(_maxBatchMint)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set MaxBatchMint", async () => {
    const _maxBatchMint = 10;
    await expect(
          mock
        .connect(user1)
        .setMaxBatchMint(_maxBatchMint)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set PublicMintSupply", async () => {
    const _publicMintSupply = 100;
    await expect(
        mock
        .connect(signer)
        .setPublicMintSupply(_publicMintSupply)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set PublicMintSupply", async () => {
    const _publicMintSupply = 100;
    await expect(
        mock
        .connect(user1)
        .setPublicMintSupply(_publicMintSupply)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set PublicMintPrice", async () => {
    const _publicMintPrice = "0.1";
    await expect(
        mock
        .connect(signer)
        .setPublicMintPrice(ethers.utils.parseEther(_publicMintPrice))
    )
    .to.not.be.reverted;
  });

  it("should revert when user set PublicMintPrice", async () => {
    const _publicMintPrice = 100;
    await expect(
        mock
        .connect(user1)
        .setPublicMintPrice(_publicMintPrice)
    )
    .to.be.reverted;
  });

  it("should revert when owner call PublicMint without eth", async () => {
    const _quantity = 1;
    await expect(
        mock
        .connect(signer)
        .publicMint(_quantity)
    )
    .to.be.reverted;
  });

  it("should revert when user call PublicMint without eth", async () => {
    const _quantity = 1;
    await expect(
        mock
        .connect(user1)
        .publicMint(_quantity)
    )
    .to.be.reverted;
  });

  it("should revert when owner call PublicMint with wrong eth", async () => {
    const _quantity = 1;
    const price = "0.1";
    await mock.connect(signer).setPublicMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setMaxBatchMint(5);
    await expect(
        mock
        .connect(signer)
        .publicMint(_quantity, {value: ethers.utils.parseEther("0.2")})
    )
    .to.be.reverted;
  });

  it("should revert when user call PublicMint with wrong eth", async () => {
    const _quantity = 1;
    const price = "0.1";
    await mock.connect(signer).setPublicMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setMaxBatchMint(5);
    await expect(
        mock
        .connect(user1)
        .publicMint(_quantity, {value: ethers.utils.parseEther("0.2")})
    )
    .to.be.reverted;
  });

  it("should revert when BatchMint set 0, owner call PublicMint", async () => {
    const _quantity = 1;
    const price = "0.1";
    await mock.connect(signer).setPublicMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setMaxBatchMint(0);
    await expect(
        mock
        .connect(signer)
        .publicMint(_quantity, {value: ethers.utils.parseEther("0.2")})
    )
    .to.be.reverted;
  });

  it("should revert when BatchMint set 0, user call PublicMint", async () => {
    const _quantity = 1;
    const price = "0.1";
    await mock.connect(signer).setPublicMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setMaxBatchMint(0);
    await expect(
        mock
        .connect(user1)
        .publicMint(_quantity, {value: ethers.utils.parseEther("0.2")})
    )
    .to.be.reverted;
  });

  it("should not revert when owner call PublicMint with exact eth, quantity, MaxBatchMint", async () => {
    const _quantity = 1;
    const price = "0.1";
    await mock.connect(signer).setPublicMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setMaxBatchMint(5);
    await expect(
        mock
        .connect(signer)
        .publicMint(_quantity, {value: ethers.utils.parseEther(price)})
    )
    .to.not.be.reverted;
  });  

  it("should not revert when user call PublicMint with exact eth, quantity, MaxBatchMint", async () => {
    const _quantity = 1;
    const price = "0.1";
    await mock.connect(signer).setPublicMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setMaxBatchMint(5);
    await expect(
        mock
        .connect(user1)
        .publicMint(_quantity, {value: ethers.utils.parseEther(price)})
    )
    .to.not.be.reverted;
  }); 
});
