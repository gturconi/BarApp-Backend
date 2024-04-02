export const SELECT_CONTACT =
  'SELECT name, description, tel, address, contact_email, open_dayhr FROM contact';

export const UPDATE_CONTACT =
  "UPDATE contact SET name = IFNULL(?, name), description= IFNULL(?, description), tel = IFNULL(?, tel), address = IFNULL(?, address), contact_email = IFNULL(?, contact_email) ,open_dayhr = IFNULL(?, open_dayhr) WHERE id = ?";
  
