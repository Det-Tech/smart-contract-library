import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721AHoldersMintableMock, ERC721AHoldersMintableMock__factory } from "../../../typechain";

describe("ERC721AHoldersMintable State", () => {
  let mock: MockContract<ERC721AHoldersMintableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721AHoldersMintableMock__factory>(
      "ERC721AHoldersMintableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner set TokenContract without zero address", async () => {
    const _tokenContract = user1.address;
    await expect(
          mock
        .connect(signer)
        .setTokenContract(_tokenContract)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set TokenContract without zero address", async () => {
    const _tokenContract = user1.address;
    await expect(
          mock
        .connect(user1)
        .setTokenContract(_tokenContract)
    )
    .to.be.reverted;
  });

  it("should revert when owner set TokenContract with zero address", async () => {
    const _tokenContract = "0x0000000000000000000000000000000000000000";
    await expect(
          mock
        .connect(signer)
        .setTokenContract(_tokenContract)
    )
    .to.be.reverted;
  });

  it("should revert when user set TokenContract with zero address", async () => {
    const _tokenContract = 0x0000000000000000000000000000000000000000;
    await expect(
          mock
        .connect(user1)
        .setTokenContract(_tokenContract)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set HoldersMintSupply", async () => {
    const _holdersMintSupply = 100;
    await expect(
        mock
        .connect(signer)
        .setHoldersMintSupply(_holdersMintSupply)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set HoldersMintSupply", async () => {
    const _holdersMintSupply = 100;
    await expect(
        mock
        .connect(user1)
        .setHoldersMintSupply(_holdersMintSupply)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set HoldersMintPrice", async () => {
    const _holdersMintPrice = 100;
    await expect(
        mock
        .connect(signer)
        .setHoldersMintPrice(_holdersMintPrice)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set HoldersMintPrice", async () => {
    const _holdersMintPrice = 100;
    await expect(
        mock
        .connect(user1)
        .setHoldersMintPrice(_holdersMintPrice)
    )
    .to.be.reverted;
  });

  it("should revert when call HoldersMint without holding token", async () => {
    const _quantity = 1;
    const _tokenIds = [1];
    await expect(
        mock
        .connect(user1)
        .holdersMint(_tokenIds, _quantity)
    )
    .to.be.reverted;
  });

  it("should revert when call HoldersMint with empty holding tokenId array", async () => {
    const _quantity = 1;
    const _tokenIds:[] = [];
    await expect(
        mock
        .connect(user1)
        .holdersMint(_tokenIds, _quantity)
    )
    .to.be.reverted;
  });

  it("should revert when user call HoldersMint with empty holding tokenId array", async () => {
    const _quantity = 1;
    const _tokenIds:[] = [];
    await expect(
        mock
        .connect(user1)
        .holdersMint(_tokenIds, _quantity)
    )
    .to.be.reverted;
  });

  it("should not revert when owner call HoldersMint with exact eth, exact _tokenIds, exact quantity", async () => {
    const _quantity = 1;
    const price = "0.1";
    const _tokenIds = [0];
    await mock.connect(signer).setHoldersMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setHoldersMintSupply(100);
    await mock.connect(signer).setTokenContract(mock.address);
    await mock.connect(signer).testMint(signer.address, 1);
    
    await expect(
        mock
        .connect(signer)
        .holdersMint(_tokenIds, _quantity, {value: ethers.utils.parseEther(price)})
    )
    .to.not.be.reverted;
  });

  it("should revert when owner call HoldersMint with wrong eth, exact _tokenIds, exact quantity", async () => {
    const _quantity = 1;
    const price = "0.1";
    const _tokenIds = [0];
    await mock.connect(signer).setHoldersMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setHoldersMintSupply(100);
    await mock.connect(signer).setTokenContract(mock.address);
    await mock.connect(signer).testMint(signer.address, 1);
    
    await expect(
        mock
        .connect(signer)
        .holdersMint(_tokenIds, _quantity, {value: ethers.utils.parseEther("0.2")})
    )
    .to.be.reverted;
  });

  it("should revert when owner call HoldersMint with wrong eth, wrong _tokenIds, exact quantity", async () => {
    const _quantity = 1;
    const price = "0.1";
    const _tokenIds = [1];
    await mock.connect(signer).setHoldersMintPrice(ethers.utils.parseEther(price));
    await mock.connect(signer).setHoldersMintSupply(100);
    await mock.connect(signer).setTokenContract(mock.address);
    await mock.connect(signer).testMint(signer.address, 1);
    
    await expect(
        mock
        .connect(signer)
        .holdersMint(_tokenIds, _quantity, {value: ethers.utils.parseEther("0.2")})
    )
    .to.be.reverted;
  });
});
