const { HttpError } = require("../helpers/HttpError.js");
const {ctrlWrapper} = require("../helpers/ctrlWrapper.js");

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateById,
} = require("../services/contactsServices.js");

const getAllContacts = async(req, res) => {
  const result = await listContacts();
  res.status(200).json(result);
};

const getOneContact = async(req, res) => {
  const { id } = req.params;
  const result = await getContactById(id);
  if (!result) {
    throw HttpError(404);
  }
  res.status(200).json(result);
};

const deleteContact = async(req, res) => {
  const { id } = req.params;
  const result = await removeContact(id);
  if (!result) {
    throw HttpError(404);
  }
  res.status(200).json(result)
};

const createContact = async (req, res) => {
  const { name, email, phone } = req.body;
  const result = await addContact(name, email, phone);
  res.status(201).json(result);
};

const updateContact = async(req, res) => { 
  const { name, email, phone } = req.body;
  const { id } = req.params;
  const result = await updateById(id, name, email, phone);
  if (!result) {
    throw HttpError(404);
  }
  res.status(200).json(result);
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  deleteContact: ctrlWrapper(deleteContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
}
