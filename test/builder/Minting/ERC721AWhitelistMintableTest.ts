import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721AWhitelistMintableMock, ERC721AWhitelistMintableMock__factory } from "../../../typechain";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { Wallet } from "ethers";

describe("ERC721AWhitelistMintable State", () => {
  let mock: MockContract<ERC721AWhitelistMintableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<ERC721AWhitelistMintableMock__factory>(
      "ERC721AWhitelistMintableMock"
    );
    mock = await mockFactory.deploy("Massless","Mass");
    await mock.deployed();
  });

  it("should not revert when owner set whitelistMintSupply", async () => {
    await expect(
          mock
        .connect(signer)
        .setWhitelistMintSupply(100)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set whitelistMintSupply", async () => {
    await expect(
          mock
        .connect(user1)
        .setWhitelistMintSupply(100)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set whitelistMintPrice", async () => {
    await expect(
          mock
        .connect(signer)
        .setWhitelistMintPrice(100)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set whitelistMintPrice", async () => {
    await expect(
          mock
        .connect(user1)
        .setWhitelistMintPrice(100)
    )
    .to.be.reverted;
  });

  it("should not revert when owner set MerkleRoot", async () => {
    const maxSupply = 10;
    // Generate allowListSupply + 1 wallets
    const wallets = new Array(maxSupply + 1)
      .fill("")
      .map((_) => ethers.Wallet.createRandom().connect(ethers.provider));
    const leavesLookup = Object.fromEntries(
      wallets.map((wallet: Wallet) => [
        wallet.address,
        ethers.utils.solidityKeccak256(["address"], [wallet.address]),
      ])
    );
    const merkleTree = new MerkleTree(Object.values(leavesLookup), keccak256, {
      sortPairs: true,
    });
    // Set the merkle root on the contract
    const root = merkleTree.getHexRoot();
    await expect(
          mock
        .connect(signer)
        .setMerkleRoot(root)
    )
    .to.not.be.reverted;
  });

  it("should revert when user set MerkleRoot", async () => {
    const maxSupply = 10;
    // Generate allowListSupply + 1 wallets
    const wallets = new Array(maxSupply + 1)
      .fill("")
      .map((_) => ethers.Wallet.createRandom().connect(ethers.provider));
    const leavesLookup = Object.fromEntries(
      wallets.map((wallet: Wallet) => [
        wallet.address,
        ethers.utils.solidityKeccak256(["address"], [wallet.address]),
      ])
    );
    const merkleTree = new MerkleTree(Object.values(leavesLookup), keccak256, {
      sortPairs: true,
    });

    // Set the merkle root on the contract
    const root = merkleTree.getHexRoot();
    await expect(
          mock
        .connect(user1)
        .setMerkleRoot(root)
    )
    .to.be.reverted;
  });

  it("should not revert when owner call whitelistMint with exact merkleProof, quantity, eth", async () => {
    const maxSupply = 10;
    const _quantity = 1;
    const price = '0.1';
    // Generate allowListSupply + 1 wallets
    const wallets = new Array(maxSupply + 1)
      .fill("")
      .map((_) => ethers.Wallet.createRandom().connect(ethers.provider));
    const leavesLookup = Object.fromEntries(
      wallets.map((wallet: Wallet) => [
        signer.address,
        ethers.utils.solidityKeccak256(["address"], [signer.address]),
      ])
    );
    const merkleTree = new MerkleTree(Object.values(leavesLookup), keccak256, {
      sortPairs: true,
    });
    // Set the merkle root on the contract
    const root = merkleTree.getHexRoot();
    await mock.connect(signer).setMerkleRoot(root);
    await mock.connect(signer).setWhitelistMintSupply(100);
    await mock.connect(signer).setWhitelistMintPrice(ethers.utils.parseEther(price));
    
    const leaf = leavesLookup[signer.address];
    const merkleProof = merkleTree.getHexProof(leaf);

    await expect(
          mock
        .connect(signer)
        .whitelistMint(merkleProof, _quantity, {value: ethers.utils.parseEther(price)})

    )
    .to.not.be.reverted;
  });

  it("should revert when user call whitelistMint with exact merkleProof, quantity, eth", async () => {
    const maxSupply = 10;
    const _quantity = 1;
    const price = '0.1';
    // Generate allowListSupply + 1 wallets
    const wallets = new Array(maxSupply + 1)
      .fill("")
      .map((_) => ethers.Wallet.createRandom().connect(ethers.provider));
    const leavesLookup = Object.fromEntries(
      wallets.map((wallet: Wallet) => [
        signer.address,
        ethers.utils.solidityKeccak256(["address"], [signer.address]),
      ])
    );
    const merkleTree = new MerkleTree(Object.values(leavesLookup), keccak256, {
      sortPairs: true,
    });
    // Set the merkle root on the contract
    const root = merkleTree.getHexRoot();
    await mock.connect(signer).setMerkleRoot(root);
    await mock.connect(signer).setWhitelistMintSupply(100);
    await mock.connect(signer).setWhitelistMintPrice(ethers.utils.parseEther(price));
    
    const leaf = leavesLookup[signer.address];
    const merkleProof = merkleTree.getHexProof(leaf);

    await expect(
          mock
        .connect(user1)
        .whitelistMint(merkleProof, _quantity, {value: ethers.utils.parseEther(price)})

    )
    .to.be.reverted;
  });

  it("should revert when user call whitelistMint with wrong eth", async () => {
    const maxSupply = 10;
    const _quantity = 1;
    const price = '0.1';
    // Generate allowListSupply + 1 wallets
    const wallets = new Array(maxSupply + 1)
      .fill("")
      .map((_) => ethers.Wallet.createRandom().connect(ethers.provider));
    const leavesLookup = Object.fromEntries(
      wallets.map((wallet: Wallet) => [
        signer.address,
        ethers.utils.solidityKeccak256(["address"], [signer.address]),
      ])
    );
    const merkleTree = new MerkleTree(Object.values(leavesLookup), keccak256, {
      sortPairs: true,
    });
    // Set the merkle root on the contract
    const root = merkleTree.getHexRoot();
    await mock.connect(signer).setMerkleRoot(root);
    await mock.connect(signer).setWhitelistMintSupply(100);
    await mock.connect(signer).setWhitelistMintPrice(ethers.utils.parseEther(price));
    
    const leaf = leavesLookup[signer.address];
    const merkleProof = merkleTree.getHexProof(leaf);

    await expect(
          mock
        .connect(user1)
        .whitelistMint(merkleProof, _quantity, {value: ethers.utils.parseEther("0.2")})

    )
    .to.be.reverted;
  });
});
