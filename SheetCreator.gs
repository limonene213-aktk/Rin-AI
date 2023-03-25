//以下のコードを実行するとContextManagerのシートを自動構成できます。

const SHEET_NUMBER = 50;

function createSheets() {
  Logger.log(LOG_SPREADSHEET_ID);
    var ss = SpreadsheetApp.openById(LOG_SPREADSHEET_ID);
  
  // 最初のシートをlogsにリネーム
  var firstSheet = ss.getSheets()[0];
  firstSheet.setName("logs");

  // 1から50までのシートを作成
  for (var i = 1; i <= SHEET_NUMBER; i++) {
    ss.insertSheet(i.toString());
  }
}//以下のコードを実行するとContextManagerのシートを自動構成できます。

const SHEET_NUMBER = 50;

function createSheets() {
  Logger.log(LOG_SPREADSHEET_ID);
    var ss = SpreadsheetApp.openById(LOG_SPREADSHEET_ID);
  
  // 最初のシートをlogsにリネーム
  var firstSheet = ss.getSheets()[0];
  firstSheet.setName("logs");

  // 1から50までのシートを作成
  for (var i = 1; i <= SHEET_NUMBER; i++) {
    ss.insertSheet(i.toString());
  }
}
