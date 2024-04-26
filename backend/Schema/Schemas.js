const loginSchema = {
  type: "object",
  properties: {
    password: { type: "string" },
    email: { type: "string", pattern: "[@]+" },
  },
  required: ["password", "email"],
  additionalProperties: false,
};

const signupSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      pattern: "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
    },
    password: { type: "string", minLength: 6 },
    firstName: { type: "string", minLength: 1 },
    lastName: { type: "string", minLength: 1 },
    role: { type: "string", enum: ["admin", "user"] },
  },
  required: ["email", "password", "firstName", "lastName", "role"],
  additionalProperties: false,
};

module.exports = { loginSchema, signupSchema };
