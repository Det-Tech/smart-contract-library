import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { randomBytes } from "crypto";
import { SignableMock, SignableMock__factory } from "../../typechain";

describe("Signable State", () => {
  let mock: MockContract<SignableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<SignableMock__factory>(
      "SignableMock"
    );
    mock = await mockFactory.deploy();
    await mock.deployed();
    await mock.setSignerAddress(signer.address);
  });

  function signMintRequest(
    address: string,
    nonce: string,
    freeMint: number[],
    preSale: number[]
  ) {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "string", "uint256[]", "uint256[]"],
      [address, nonce, freeMint, preSale]
    );

    return signer.signMessage(ethers.utils.arrayify(hash));
  }

  it("should not revert when signed properly", async () => {
    const freeMint = [0, 1, 2, 6, 8, 10, 16, 18, 25, 30, 31, 32];
    const preSale = [0, 1, 3, 6, 9, 10, 16, 20];
    let nonce = randomBytes(10).toString("hex");

    let apiSignature = await signMintRequest(
      user1.address,
      nonce,
      freeMint,
      preSale
    );

    await expect(
        mock
        .connect(user1)
        .testSignedMint(freeMint, preSale, nonce, apiSignature)
    )
      .to.not.be.reverted;
  });

  it("should not revert when owner call setSignerAddress without zero address", async () => {
    await expect(
          mock
          .connect(signer)
          .setSignerAddress(signer.address)
    )
      .to.not.be.reverted;
  });

  it("should revert when user call setSignerAddress without zero address", async () => {
    await expect(
          mock
          .connect(user1)
          .setSignerAddress(user1.address)
    )
      .to.be.reverted;
  });

  it("should revert when owner call setSignerAddress with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";

    await expect(
          mock
          .connect(signer)
          .setSignerAddress(address)
    )
      .to.be.reverted;
  });

  it("should revert when user call setSignerAddress with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";

    await expect(
          mock
          .connect(user1)
          .setSignerAddress(address)
    )
      .to.be.reverted;
  });
});
