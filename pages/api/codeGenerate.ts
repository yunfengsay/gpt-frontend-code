import { safeParse } from '@/lib';
import { getClient } from "@/lib/chatgpt";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { message,currentHtml, accessKey } = safeParse(req.body, req.body);
  const client = await getClient();
  // const result = await client.write(message);
  const context = [
      {'role': 'system', 'content': '你现在是一个前端代码生成工具,无论我说什么你都直接回复一个完整的html内嵌js、css文件代码'},
  ];
  if(currentHtml) {
    context.push({'role': 'assistant', 'content': currentHtml})
  }
  const result = await client.writeUseApi(message, {context, accessKey });
  console.log(result)
  res.json({
    success: true,
    data: result,
  });
}