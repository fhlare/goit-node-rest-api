import fs from 'fs/promises';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const contactsPath = path.join(__dirname, 'db', 'contacts.json');

console.log(contactsPath);
export async function listContacts() {
  // ...твій код. Повертає масив контактів.
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
  } catch(error) {
    console.error(error.message);
  }
}

export async function getContactById(contactId) {
  // ...твій код. Повертає об'єкт контакту з таким id. Повертає null, якщо контакт з таким id не знайдений.
  try {
    const contacts = await listContacts();
    const result = contacts.find(item => item.id === contactId);
    return result || null;
  } catch (error) {
    console.error(error.message);
  }

}

export async function removeContact(contactId) {
  // ...твій код. Повертає об'єкт видаленого контакту. Повертає null, якщо контакт з таким id не знайдений.
  try {
    const contacts = await listContacts();
    const index = contacts.findIndex(item => item.id === contactId);
    if (index === -1) return null;
    const [result] = contacts.splice(index, 1);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

export async function addContact(name, email, phone) {
  // ...твій код. Повертає об'єкт доданого контакту (з id).
  try {
    const contacts = await listContacts();
    const newContact = {
      id: nanoid(),
      name,
      email,
      phone,
    };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    console.error(error.message);
  }
}

export async function updateContact (id){
  try {
    
  } catch (error) {
    
  }
}


