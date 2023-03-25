# Rin-AIのCore部分

GASで動くSlack用Chatbotです。

以下、スクリプトプロパティに持たせるもの

* CRYPT_KEYCRYPT_KEY：任意の文字列
* LOG_SPREADSHEET_ID：ContextManagerで使うためのスプレッドシートID
* OPENAI_API_KEY：APIキーを入れてください
* SLACK_ACCESS_TOKEN：トークンを入れてください
* SLACK_BOT_ID：SlackのBot IDを入れてください
* SLACK_ERROR_CHANNEL：エラーログを吐き出させたいSlackチャンネルID

作り方など

* 最初にGoogleスプレッドシートに新しいファイルを作成します。
* 、「logs」と「lock」というシートを作ります（注：ContextManagement用のシートとは別です）
* 機能からGASに接続し、コード等を入力し、ContextManagerのシートを作る
* ntextManagerは「logs」と「１～５０の数字の書かれた」シート（計５１シート）から構成されます。

ContextManager用のスプレッドシートを作成するためのコードを作りました。
