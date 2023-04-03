const HttpsProxyAgent = require('https-proxy-agent');
const proxyUrl = 'http://127.0.0.1:1087';
let proxyAgent
if(process.platform === 'darwin') {
  proxyAgent = new HttpsProxyAgent(proxyUrl);
}
export default class ChatGPTClient {
  // readonly baseUri = 'https://api.openai.com/v1/chat/completions';
  readonly baseUri = 'https://openai.clipmedias.com/v1/chat/completions';

  public async writeUseApi (text: string, {
    model =  'gpt-3.5-turbo',
    accessKey,
    context,
  }) {
    try {
      let body = {
          model: model || 'gpt-3.5-turbo',
          messages: [
              ...context,
              { "role": "user", "content": text },
          ]
      };
      const response = await fetch(this.baseUri, {
        body: JSON.stringify(body),
        // TODO 如果需要可以修改你的agent地址
        // agent: proxyAgent,
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessKey}`,
        },
      }).then(res => res.json()).then(res => {
        console.log(res)
        return res.choices[0].message?.content
      });
      return response
    } catch (error) {
        console.log(error);
    }
  }
}

let client: any = null;
export const getClient = async (restart = false): Promise<ChatGPTClient> => {
  if (client) return client;
  client = new ChatGPTClient();
  return client;
}
