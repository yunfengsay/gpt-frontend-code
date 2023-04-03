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