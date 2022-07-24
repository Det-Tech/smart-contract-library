import { expect } from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { AdminPermissionableMock, AdminPermissionableMock__factory } from "../../typechain";

describe("AdminPermissionable State", () => {
  let mock: MockContract<AdminPermissionableMock>;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;

  before(async () => {
    [signer, user1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const mockFactory = await smock.mock<AdminPermissionableMock__factory>(
      "AdminPermissionableMock"
    );
    mock = await mockFactory.deploy();
    await mock.deployed();
  });

  it("should not revert when  owner call setAdminPermission without zero address", async () => {
    await expect(
        mock
        .connect(signer)
        .setAdminPermission(user1.address)
    )
    .to.not.be.reverted;
  });

  it("should revert when  user call setAdminPermission without zero address", async () => {
    await expect(
        mock
        .connect(user1)
        .setAdminPermission(user1.address)
    )
    .to.be.reverted;
  });

  it("should revert when  owner call setAdminPermission with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";

    await expect(
        mock
        .connect(signer)
        .setAdminPermission(address)
    )
    .to.be.reverted;
  });

  it("should revert when  user call setAdminPermission with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";

    await expect(
        mock
        .connect(user1)
        .setAdminPermission(address)
    )
    .to.be.reverted;
  });

  it("should not revert when owner call removeAdminPermission without zero address", async () => {
    await expect(
        mock
        .connect(signer)
        .removeAdminPermission(user1.address)
    )
    .to.not.be.reverted;
  });

  it("should revert when user call removeAdminPermission without zero address", async () => {
    await expect(
        mock
        .connect(user1)
        .removeAdminPermission(user1.address)
    )
    .to.be.reverted;
  });

  it("should revert when owner call removeAdminPermission with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";
    await expect(
        mock
        .connect(signer)
        .removeAdminPermission(address)
    )
    .to.be.reverted;
  });

  it("should revert when user call removeAdminPermission with zero address", async () => {
    const address = "0x0000000000000000000000000000000000000000";
    await expect(
        mock
        .connect(user1)
        .removeAdminPermission(address)
    )
    .to.be.reverted;
  });
});
