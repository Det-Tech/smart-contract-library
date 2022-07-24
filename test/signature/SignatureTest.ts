import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { randomBytes } from "crypto";
import { SignatureMock, SignatureMock__factory } from "../../typechain";

describe("Signature State", () => {
  let mock: MockContract<SignatureMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<SignatureMock__factory>(
      "SignatureMock"
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

  describe("Check signed mint", async () => {
    it("should emit true when signed properly", async () => {
      const freeMint = [0, 1, 2, 6, 8, 10, 16, 18, 25, 30, 31, 32];
      const preSale = [0, 1, 3, 6, 9, 10, 16, 20];

      let nonce = randomBytes(10).toString("hex");

      let apiSignature = await signMintRequest(
        user1.address,
        nonce,
        freeMint,
        preSale
      );

      expect(
        await mock
          .connect(user1)
          .testSignedMint(freeMint, preSale, nonce, apiSignature)
      )
        .to.emit(mock, "MintToken")
        .withArgs(true);
    });
  });
});
