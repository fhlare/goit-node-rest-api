const express = require("express");

const contactsRouter = express.Router();

const {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
} = require("../controllers/contactsControllers.js");

const { validateBody } = require("../helpers/validateBody.js");
const { createContactSchema, updateContactSchema } = require("../schemas/contactsSchemas.js");

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", getOneContact);

contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/",validateBody(createContactSchema), createContact);

contactsRouter.put("/:id", validateBody(updateContactSchema), updateContact);

module.exports = {
  contactsRouter,
};
