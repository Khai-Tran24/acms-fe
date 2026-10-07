import "./typescript-loader.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { resourceConfigs } =
  await import("../components/custom/resource/resource-fields.ts");
const { parentFormValues, itemFormValues, linkedProperties, resourcePayload } =
  await import("../components/custom/resource/form/form-values.ts");
const { jsonEntries, serializeJsonEntries } =
  await import("../components/custom/resource/form/json-entries.ts");
const { auctionPriceGap } =
  await import("../lib/helper/auction-finance.helper.ts");
const { AuctionPriceComparison } =
  await import("../components/custom/resource/auction-price-comparison.tsx");

const fields = resourceConfigs.contract.fields;
test("parent autofill copies shared details and assets while preserving child identity and status", () => {
  const parent = {
    id: 1,
    contractNumber: "PARENT",
    contractStatus: "DAU_GIA_KHONG_THANH",
    contractType: "HOP_DONG_MOI",
    contractDate: "2026-10-01T00:00:00Z",
    assignedTo: { id: 8 },
    startingPrice: "1000000.00",
    stepPrice: "0.00",
    customer: {
      "Đơn vị": "Owner",
      "Đại diện người có tài sản": "Representative",
    },
    contractOwnerType: "TAI_SAN_CONG",
    contractProperties: [
      { property: { id: 9, propertyName: "Asset", propertyNote: "Note" } },
    ],
  };
  const values = {
    contractNumber: "CHILD",
    contractStatus: "MOI",
    parentContractId: "1",
    ...parentFormValues(fields, parent),
  };
  assert.equal(values.contractNumber, "CHILD");
  assert.equal(values.contractStatus, "MOI");
  assert.equal(values.parentContractId, "1");
  assert.equal(values.assignedToId, "8");
  assert.equal(values.contractDate, "2026-10-01");
  const payload = resourcePayload(fields, values);
  assert.equal(payload.startingPrice, 1000000);
  assert.equal(payload.stepPrice, 0);
  assert.deepEqual(payload.customer, parent.customer);
  assert.equal(payload.contractType, undefined);
  assert.deepEqual(linkedProperties(parent), [
    {
      id: 9,
      name: "Asset",
      type: undefined,
      note: "Note",
      originalNote: "Note",
    },
  ]);
  assert.equal(parentFormValues(fields, { id: 2 }).customer, "");
  assert.equal(parentFormValues(fields, { id: 2 }).contractDate, "");
});
test("editing preserves saved values and resolves relation IDs", () => {
  const values = itemFormValues(resourceConfigs["auction-result"].fields, {
    id: 3,
    contract: { id: 42 },
    winningPrice: "1500000",
    startingPrice: "1000000",
    auctionCost: [{ name: "Cost", amount: 10 }],
  });
  assert.equal(values.contractId, "42");
  assert.equal(values.winningPrice, "1500000");
  assert.equal(values.startingPrice, "1000000");
  assert.deepEqual(JSON.parse(values.auctionCost), [
    { name: "Cost", amount: 10 },
  ]);
});
test("payload preserves optional nulls, zero amounts, fixed JSON keys, and excludes derived financial fields", () => {
  const payload = resourcePayload(resourceConfigs["auction-result"].fields, {
    contractId: "42",
    auctionResultNumber: "RESULT",
    winner: '{"name":"A"}',
    winningPrice: "0",
    startingPrice: "0",
    priceGap: "0",
    finalPrice: "0",
    auctionCost: "[]",
    completedAt: "2026-10-07T12:00:00+07:00",
    note: "",
  });
  assert.equal(payload.startingPrice, undefined);
  assert.equal(payload.priceGap, undefined);
  assert.equal(payload.winningPrice, 0);
  assert.equal(payload.completedAt, "2026-10-07T05:00:00.000Z");
  assert.deepEqual(payload.winner, {
    name: "A",
    identityNumber: "",
    address: "",
  });
  const cleared = resourcePayload(
    resourceConfigs["auction-registration"].fields,
    {
      registrationFeePaidDate: "",
      depositAmountPaidDate: "",
      registrationFee: "0",
      depositAmount: "0",
    },
  );
  assert.equal(cleared.registrationFeePaidDate, null);
  assert.equal(cleared.depositAmountPaidDate, null);
  assert.equal(cleared.depositAmount, 0);
});
test("JSON editor retains fixed keys and converts formatted costs", () => {
  assert.deepEqual(jsonEntries('{"name":"A"}', "object", ["name", "address"]), [
    { key: "name", value: "A" },
    { key: "address", value: "" },
  ]);
  assert.deepEqual(
    JSON.parse(
      serializeJsonEntries([{ key: "Expense", value: "1.000" }], "cost-array"),
    ),
    [{ name: "Expense", amount: 1000 }],
  );
});
test("price gap supports zero, decimal amounts and unavailable values", () => {
  assert.equal(auctionPriceGap("1000000.00", "1500000.50"), 500000.5);
  assert.equal(auctionPriceGap(0, 0), 0);
  assert.equal(auctionPriceGap(100, 99), -1);
  for (const missing of [null, undefined, "", "invalid"])
    assert.equal(auctionPriceGap(missing, 100), null);
  assert.equal(auctionPriceGap(100, ""), null);
});
test("price comparison renders starting price and recalculates the displayed difference", () => {
  const first = renderToStaticMarkup(
    createElement(AuctionPriceComparison, {
      startingPrice: "1000000",
      winningPrice: "1500000",
    }),
  );
  assert.match(first, /1\.000\.000/);
  assert.match(first, /500\.000/);
  const edited = renderToStaticMarkup(
    createElement(AuctionPriceComparison, {
      startingPrice: "1000000",
      winningPrice: "1750000",
    }),
  );
  assert.match(edited, /750\.000/);
  const missing = renderToStaticMarkup(
    createElement(AuctionPriceComparison, {
      startingPrice: null,
      winningPrice: "100",
    }),
  );
  assert.equal((missing.match(/—/g) ?? []).length, 2);
});

test("selector policies keep parent, active and result eligibility separate", async () => {
  const { contractSelectionQuery } =
    await import("../lib/helper/contract-selection.helper.ts");
  assert.deepEqual(contractSelectionQuery("parent"), {
    selectableOnly: true,
    contractType: "HOP_DONG_MOI",
  });
  assert.deepEqual(contractSelectionQuery("active"), { selectableOnly: true });
  assert.deepEqual(contractSelectionQuery("successful"), {
    contractStatus: "DAU_GIA_THANH",
  });
  assert.deepEqual(contractSelectionQuery(), {});
});
