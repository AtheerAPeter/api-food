export default class Validator {
  static register = (must = true) => ({
    name: {
      presence: must,
      type: "string",
    },
    email: {
      presence: must,
      email: true,
      type: "string",
    },
    password: {
      presence: must,
      length: { maximum: 15, minimum: 4 },
      type: "string",
    },
  });

  static login = (must = true) => ({
    email: {
      presence: must,
      email: true,
    },
    password: {
      presence: must,
      length: { maximum: 15, minimum: 4 },
    },
  });
  static product = (must = true) => ({
    name: {
      presence: must,
      type: "string",
    },
    price: {
      presence: must,
      type: "string",
    },
    image: {
      presence: must,
      type: "string",
    },
    description: { presence: must, type: "string" },
    currency: { presence: must, type: "string" },
    rating: { presence: false, type: "string" },
  });

  static invoice = (must = true) => ({
    items: {
      type: "array",
    },
  });
}
