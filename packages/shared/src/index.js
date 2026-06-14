// packages/shared/src/index.js  ← server still imports this (JS)
const FUEL_TYPES = ["PETROL", "DIESEL", "KEROSENE"];
const PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER"];
const CUSTOMER_TYPES = ["WALK_IN", "REGISTERED"];
const ROLES = ["ADMIN", "MANAGER", "ATTENDANT"];

module.exports = { FUEL_TYPES, PAYMENT_METHODS, CUSTOMER_TYPES, ROLES };
