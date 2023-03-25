// スクリプトプロパティからCRYPT_KEYを取得します
const scriptProperties = PropertiesService.getScriptProperties();
const SECRET_KEY = scriptProperties.getProperty('CRYPT_KEY');

// bmSimpleCrypto.GasCryptオブジェクトを作成します
const gc = bmSimpleCrypto.GasCrypt;
const sc = gc.newCrypto(SECRET_KEY);

class ContextManager {
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
  }

  getUserCell(userId) {
    const mainsheet = SpreadsheetApp.openById(this.spreadsheetId);
    const sheetName = this._hashString(userId, 50) + 1;
    const rowNumber = this._hashString(userId, 8000) + 1;
    const columnLetter = this._numberToAlphabet(this._hashString(userId, 26) + 1);
    const cellAddress = columnLetter + rowNumber;

    const sheet = mainsheet.getSheetByName(sheetName.toString());
    return sheet.getRange(cellAddress);
  }

getContext(userId) {
  const cell = this.getUserCell(userId);
  const encryptedData = cell.getValue();

  if (!encryptedData) {
    return [];
  }

  const decryptedData = sc.decrypt(encryptedData);
  
  // Assign decryptedData directly to userData
  const userData = decryptedData;

  if (userId !== userData.userId) {
    return [];
  }

  return userData.messages;
}

  saveContext(userId, messages) {
    const cell = this.getUserCell(userId);
    const userData = {
      userId: userId,
      messages: messages,
    };

    const dataToSave = JSON.stringify(userData);
    const encryptedData = sc.encrypt(dataToSave);
    cell.setValue(encryptedData);
  }

  clearContext(userId) {
    const cell = this.getUserCell(userId);
    cell.setValue('');
  }

  _hashString(str, m) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return (Math.abs(hash) % m);
  }

  _numberToAlphabet(num) {
    return String.fromCharCode(64 + num);
  }
}