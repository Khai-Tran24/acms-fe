import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyDepositPercentage,
  applyMoneyInput,
  depositPercentage,
  auctionFormErrors,
  contractAutofill,
  contractAuctionTerms,
} from "../lib/helper/auction-form.helper.ts";

const terms = {
  startingPrice: "1000000",
  startRegisterDate: "2026-09-30T17:00:00Z",
  endRegisterDate: "2026-10-09T17:00:00Z",
  auctionDate: "2026-10-11T09:00:00+07:00",
};
test("percentage entry updates the actual deposit required by Save and its payload", () => {
  const form = applyDepositPercentage(
    { startingPrice: "1000000", depositAmount: "" },
    "20",
  );
  assert.equal(form.depositAmount, "200000");
  assert.ok(form.depositAmount);
  assert.equal(Number(form.depositAmount), 200000);
  assert.equal(depositPercentage(form.startingPrice, form.depositAmount), "20");
  assert.equal(
    applyMoneyInput(form, "startingPrice", "2.000.000", "20").depositAmount,
    "400000",
  );
  assert.equal(
    applyMoneyInput(form, "depositAmount", "150.000", null).depositAmount,
    "150000",
  );
  assert.equal(
    applyMoneyInput(form, "startingPrice", "2.000.000", null).depositAmount,
    "200000",
  );
  assert.equal(applyDepositPercentage(form, "2.5").depositAmount, "25000");
  assert.equal(applyDepositPercentage(form, "").depositAmount, "");
  assert.equal(applyDepositPercentage(form, ".").depositAmount, "");
});
test("autofill chooses the latest auction records and keeps participant/winner details separate", () => {
  const contract = {
    id: 1,
    startingPrice: "100",
    customer: { name: "Owner" },
    regulations: [
      {
        id: 5,
        startingPrice: "200",
        registrationFee: "10",
        depositAmount: "20",
      },
      { id: 2, startingPrice: "150", registrationFee: "5" },
    ],
    announcements: [
      {
        id: 3,
        startingPrice: "300",
        registrationFee: "15",
        depositAmount: "30",
      },
    ],
  };
  assert.deepEqual(contractAutofill(contract, "auction-registration"), {
    registrationFee: "15",
    depositAmount: "30",
  });
  assert.deepEqual(contractAutofill(contract, "auction-result"), {
    winningPrice: "300",
  });
  assert.equal(contractAutofill(contract, "regulation").startingPrice, "100");
  assert.equal(contractAutofill(contract, "announcement").startingPrice, "200");
  assert.equal(
    contractAuctionTerms({ ...contract, announcements: [] }).startingPrice,
    "200",
  );
  assert.equal(
    contractAutofill({ id: 2, startingPrice: "500" }, "auction-registration")
      .depositAmount,
    undefined,
  );
});
test("regulation dates are strictly ordered and deposits strictly smaller", () => {
  const form = { ...terms, depositAmount: "200000" };
  assert.deepEqual(auctionFormErrors("regulation", form, null), {});
  assert.ok(
    auctionFormErrors(
      "regulation",
      { ...form, endRegisterDate: form.startRegisterDate },
      null,
    ).endRegisterDate,
  );
  assert.ok(
    auctionFormErrors(
      "regulation",
      { ...form, auctionDate: form.endRegisterDate },
      null,
    ).auctionDate,
  );
  assert.ok(
    auctionFormErrors(
      "regulation",
      { ...form, depositAmount: form.startingPrice },
      null,
    ).depositAmount,
  );
  assert.ok(
    auctionFormErrors("regulation", applyDepositPercentage(form, "101"), null)
      .depositAmount,
  );
});
for (const field of ["registrationFeePaidDate", "depositAmountPaidDate"]) {
  test(`${field} accepts payment dates regardless of the registration period`, () => {
    for (const context of [terms, {}, null]) {
      for (const day of ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-10", "2026-10-11", ""]) {
        assert.deepEqual(
          auctionFormErrors("auction-registration", { [field]: day }, context),
          {},
        );
      }
    }
  });
}

test("winning price accepts equality but completion must be strictly after auction", () => {
  const form = {
    winningPrice: terms.startingPrice,
    completedAt: "2026-10-11T09:01:00+07:00",
  };
  assert.deepEqual(auctionFormErrors("auction-result", form, terms), {});
  assert.ok(
    auctionFormErrors(
      "auction-result",
      { ...form, winningPrice: "999999" },
      terms,
    ).winningPrice,
  );
  assert.ok(
    auctionFormErrors(
      "auction-result",
      { ...form, completedAt: terms.auctionDate },
      terms,
    ).completedAt,
  );
  assert.ok(
    auctionFormErrors("auction-result", form, {
      startingPrice: terms.startingPrice,
    }).completedAt,
  );
});
