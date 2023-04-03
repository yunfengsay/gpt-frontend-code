export const safeParse = (json: string, defaultValue?) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return defaultValue ||  null;
  }
} 

export const safeStringify = (json: any, defaultValue?) => {
  try {
    return JSON.stringify(json);
  } catch (e) {
    return defaultValue ||  '';
  }
}

export const copyToClipboard = (text: string) => {
  const input = document.createElement('input');
  input.setAttribute('readonly', 'readonly');
  input.setAttribute('value', text);
  document.body.appendChild(input);
  input.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
  }
  document.body.removeChild(input);
}

export const getLocalCache = (key: string) => {
  const value:any = localStorage.getItem(key)
  try {
    return JSON.parse(value)
  }catch(e) {
    return value
  }
}

export const setLocalCache = (key: string, value: any) => {
  if(typeof value === 'object') {
    value = JSON.stringify(value)
  }
  return localStorage.setItem(key, value)
}

export const getBlockCode = (text) => {
  try{
    let codeBlock = text.match(/```([\s\S]*)```/)[1];
    return codeBlock;
  } catch(e) {
    console.log(e,text )
    return text
  }
}

const startWord = '贾维斯';
const endWord = '执行'
export const getVoiceText = (text) => {
  const regex = /贾维斯([^]*$)/;
  const match = regex.exec(text);
  let content =  '' 
  let isOver = false; 
  if (match) {
    content =  match[1];
  }
  if(content.includes(endWord)) {
    content.split(endWord)[0]
    isOver = true;
  }
  return {
    content,
    isOver
  };
}