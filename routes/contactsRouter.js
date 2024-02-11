const express = require("express");
const {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} = require("../controllers/contactsControllers.js");

const {validateBody} = require("../helpers/validateBody.js");
const {isValidId} = require("../helpers/isValidId.js");

const {
  createContactSchema,
  updateFavoriteSchema,
} = require("../schemas/contactsSchemas.js");

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", isValidId, getOneContact);

contactsRouter.delete("/:id", isValidId, deleteContact);

contactsRouter.post("/", validateBody(createContactSchema), createContact);

contactsRouter.put("/:id", validateBody(createContactSchema), updateContact);
contactsRouter.patch(
  "/:id/favorite",
  isValidId,
  validateBody(updateFavoriteSchema),
  updateStatusContact
);

module.exports = {
  contactsRouter,
};
