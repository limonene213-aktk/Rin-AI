//追加機能としてContextmanager.gsとの連携
  function getLogSpreadsheetId() {
  return PropertiesService.getScriptProperties().getProperty('LOG_SPREADSHEET_ID');
}

//追加機能用、contextManagerをグローバルスコープにした
const LOG_SPREADSHEET_ID = getLogSpreadsheetId();
const contextManager = new ContextManager(LOG_SPREADSHEET_ID);

//getReplyも改変して、過去のコンテクストをみられるようにします。
//getReply関数は非常に長いので終了位置もコメントアウトしました。
function getReply(userInput, characterSettings = null, userContext = []) {
  const maxMessages = 10;
  userContext = userContext.slice(-maxMessages);
  // ここでコンテキストのメッセージが文字列型であることを確認
  userContext = userContext.map((message) => {
    if (typeof message.content !== 'string') {
      message.content = JSON.stringify(message.content);
    }
    return message;
  });

  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");

  const headers = {
    'Authorization': 'Bearer ' + OPENAI_API_KEY,
    'Content-Type': 'application/json'
  };

  let prompt = [
    ...userContext,
    {
      'role': 'user',
      'content': userInput
    }
  ];

  if (characterSettings != null) {
    prompt.unshift({
      'role': 'system',
      'content': characterSettings
    });
  }

  const options = {
    'muteHttpExceptions' : true,
    'headers': headers, 
    'method': 'POST',
    'payload': JSON.stringify({
      'model': 'gpt-3.5-turbo',
      'temperature' : 0.8,
      'messages': prompt})
  };

  //暫定処置
  try {
    const response = JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());
    if (response.choices && response.choices[0]) {
      const tokenLog = `prompt_tokens: ${response.usage.prompt_tokens}\n`
                    + `completion_tokens: ${response.usage.completion_tokens}\n`
                    + `total_tokens: ${response.usage.total_tokens}`;
      writeLog(tokenLog);
      writeLog(response);
      return response.choices[0].message.content;
    } else {
      // エラーメッセージを返す
      return "エラーが発生したようです、状況の確認をお願いします。";
    }
  } catch(e) {
    return e.message;
  }
}
//getReplyはここまでです。


//dePostも機能追加しています。
async function doPost(e) {
  const contents = JSON.parse(e.postData.contents);

  const lock = LockService.getScriptLock();
  const success = lock.tryLock(20000);
  if(success){
    if(isFirstTime(contents.event_id)){
      addEventIdOnLockSheet(contents.event_id);
      writeLog(contents);
      SpreadsheetApp.flush();
      lock.releaseLock();
    } else {
      lock.releaseLock();
      return;
    }
  } else {
    return;
  }

  if (contents.type == 'url_verification') {
    return ContentService.createTextOutput(contents.challenge);
  }

  if (contents.event.type == 'message') {
    const message = contents.event.text;
    const channel = contents.event.channel;
    const botId = PropertiesService.getScriptProperties().getProperty("SLACK_BOT_ID"); // スクリプトプロパティからBotのIDを読み込む
    const userId = contents.event.user;

    // イベントがBotのメッセージでないことを確認
    if (!('bot_id' in contents.event)) {
      // イベントがDMチャンネルであるか、メンションされているかどうかを確認
      if (channel.startsWith('D') || message.includes(`<@${botId}>`)) {
        // Get the user's context
        const userContext = contextManager.getContext(userId);
        
        // キャラクター設定をしない場合、AI_SETTINGSの引数は不要
        const reply = await getReply(message, AI_SETTINGS, userContext);

        // Update the user's context
        const updatedContext = userContext.concat([{ role: "user", content: message }, { role: "assistant", content: reply }]);
        contextManager.saveContext(userId, updatedContext);
        
        postMessage(reply, channel);
      }
    }
  }
}


function postMessage(message, channel) {
  const SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("SLACK_ACCESS_TOKEN");
  const options = {
    'method': 'post',
    'headers': {
    'Authorization': 'Bearer ' + SLACK_ACCESS_TOKEN,
    'Content-Type': 'application/json; charset=utf-8'
    },
    'payload': JSON.stringify({
      'channel': channel,
      'text': message
    })
  };
  UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', options);
}

function writeLog(message){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("log");
  sheet.appendRow([message]);
}

function addEventIdOnLockSheet(eventId){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("lock");
  sheet.appendRow([eventId]);
}

function isFirstTime(eventId){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("lock");  
  const lockedIds = sheet.getDataRange().getValues().flat();
  return !lockedIds.includes(eventId);
}