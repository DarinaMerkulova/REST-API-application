import contacts from "../models/contacts.js";
import HttpError from "../helpers/HttpError.js";

export const getAll = async (req, res) => {
  const result = await contacts.listContacts();
  res.status(200).json(result);
};

export const getById = async (req, res, next) => {
  const { contactId } = req.params;
  const result = await contacts.getContactById(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
};

export const add = async (req, res) => {
  const result = await contacts.addContact(req.body);
  res.status(201).json(result);
};

export const put = async (req, res) => {
  const { contactId } = req.params;
  const result = await contacts.updateContact(contactId, req.body);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
};

export const remove = async (req, res) => {
  const { contactId } = req.params;
  const result = await contacts.removeContact(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({
    message: "contact deleted",
  });
};

export default {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  put: ctrlWrapper(put),
  remove: ctrlWrapper(remove),
};
