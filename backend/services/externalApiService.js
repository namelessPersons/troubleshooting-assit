// backend/services/externalApiService.js

// Node.js v22 以降ならグローバル fetch が使えます。
// サブスクリプションキー等は本番環境で安全に管理してください。

const ENDPOINT_URL = 'https://aibot-apim-uat-jpe.azure-api.net/satori-uat/DocumentQueryWithAnswer';
const SUBSCRIPTION_KEY = process.env.SUBSCRIPTION_KEY;

// GPT要約用
const ENDPOINT_GPT_SUMMARY = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// "GPT4o-mini" を利用する、というリクエストパラメータ例
const GPT_MODEL = 'gpt-4o-mini';

exports.queryDocument = async (params) => {
  // params: { Query, DocumentNumber, Source, DocumentType, Language, ... }
  const response = await fetch(ENDPOINT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`External API error: ${response.status} - ${text}`);
  }

  const json = await response.json();
  const { topNResults } = json;
  if (!topNResults) {
    return { openAiAnswer: '', pages: [] };
  }
  return {
    openAiAnswer: topNResults.openAiAnswer || '',
    pages: topNResults.pages || []
  };
};


/**
 * GPTに「20文字以内で要約して」と問い合わせる例
 */
exports.summarizeText = async (originalText) => {
    // ChatGPT API (OpenAI) へのリクエスト例
    // "model": "GPT4o-mini" を指定
    // promptとして「20文字以内に要約して」という指示を送る
    const prompt = `Summarize the following text in 20 English characters or fewer:\n\n${originalText}`;
  
    const response = await fetch(ENDPOINT_GPT_SUMMARY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: GPT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GPT Summarize API error: ${response.status} - ${text}`);
    }
  
    const json = await response.json();
    // ChatCompletionのレスポンス構造: { choices: [ { message: { role, content } } ], ... }
    const summary = json.choices?.[0]?.message?.content || '';
    return summary.trim();
  };
