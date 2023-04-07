import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, message, Modal, Switch } from 'antd';
const { TextArea } = Input;
import { setLocalCache, getLocalCache, copyToClipboard, getBlockCode, getVoiceText } from '@/lib';
import { speechRecognition } from '@/lib/stt';
import { historyManager } from '@/lib/history';
import { eventEmmiter } from '@/lib/emitter';


let currentHighlightedElement: HTMLElement | null = null;
const accessKeyName = '__access_key';
const initHightLight = () => {
  const dom = document.getElementById('container');
  // const dom = document.body;
  if (!dom) {
    alert('dom is null')
    return
  };
  dom.addEventListener('mouseover', (event: MouseEvent) => {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('x-highlight');
  });

  dom.addEventListener('mouseout', (event: MouseEvent) => {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('x-highlight');
  });

  dom.addEventListener('click', (event: MouseEvent) => {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('x-highlight');
    currentHighlightedElement = target;
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === 'Escape' && currentHighlightedElement) {
      currentHighlightedElement.classList.remove('highlight');
      currentHighlightedElement = null;
    } 
    // ctrl + z 回退 
    if((event.ctrlKey || event.metaKey) && event.key === 'z') {
      historyManager.back()
      eventEmmiter.emit('codechange')
    }
    // ctrl + z 前进
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z') {
      historyManager.forward()
      eventEmmiter.emit('codechange')
    }
  });
}

const fetchAI = (body) => {
  return fetch('/api/codeGenerate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  }).then(res => res.json())
}

const Chat = (props) => {
  const { setCode } = props;
  const [prompt, setPrompt] = useState('');
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    initHightLight()
    eventEmmiter.on('codechange', () => {
      const data = historyManager.getCurrent()
      console.log(data)
      setCode(data) 
    })
  }, [])
  const handleSend = () => {
    const accessKey = getLocalCache(accessKeyName);
    if (!accessKey) {
      alert('请先设置accessKey')
    }
    // @ts-ignore
    setLoading(true)
    const value = prompt;
    const context = currentHighlightedElement?.innerHTML;
    const message = context ? context + ' 这部分按下面要求修改并返回修改后的完整html代码->\n' + value : value;
    fetchAI({
      message,
      accessKey,
      currentHtml: historyManager.getCurrent() || '',
    }).then(res => {
      const value = getBlockCode(res?.data);
      historyManager.addHistory(value)
      setCode(value);
    }).finally(() => {
      setLoading(false)
    })
  }
    
  const onVoiceText = (text, reset) => {
    const { content, isOver } = getVoiceText(text)
    setPrompt(content)
    if (!content || !isOver) {
      return
    }
    reset()
    handleSend()
  }

  return <div className="chat rounded-md p-4 shadow-md fixed right-4 bottom-4">
    <TextArea ref={ref} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="maxLength is 2000" rows={10} maxLength={2000} />
    <Button loading={loading} onClick={handleSend} className="w-full mt-4 bg-blue-500" type="primary">Submit</Button>
    <div className='w-full mt-4 flex justify-between'>
      <Button onClick={() => {
        // reloadAI()
        historyManager.addHistory('');
        setCode('')
      }} className="w-1/2 mr-4 bg-blue-500" type="primary">reset</Button>
      <Button onClick={() => {
        copyToClipboard(historyManager.getCurrent() || '')
      }} className="w-1/2 bg-blue-500" type="primary">copy</Button>
      {/* <Button onClick={() => {}} className="w-1/4 bg-blue-500" type="primary">share</Button> */}
    </div>
    <div>
      <VoiceControl onVoiceText={onVoiceText} />
    </div>
  </div>
}

const AccessKeyChecker = () => {
  const [accessKey, setAccessKey] = useState('');
  const ref = useRef<any>(null);
  useEffect(() => {
    setAccessKey(getLocalCache(accessKeyName))
  }, [])
  return <div>
    {
      accessKey && <Modal
      open={!accessKey}
      title="输入accesskey,放心这只会存储到你本地"
      okText="确认"
      // cancelText="Cancel"
      onOk={() => {
        const accessKey = ref.current?.input?.value;
        setAccessKey(accessKey)
        setLocalCache(accessKeyName, accessKey)
      }}
    >
      <Input ref={ref} type="password" placeholder="accesskey" />
    </Modal>
    }
  </div>
}

const VoiceControl = (props) => {
  const { onVoiceText } = props;
  const [isRecording, setIsRecording] = useState(false);
  const onChange = (checked: boolean) => {
    if (checked) {
      speechRecognition.start()
      speechRecognition.onResult(onVoiceText)
    }
    if (!checked) {
      speechRecognition.stop()
    }
    setIsRecording(checked)
  }
  return <div className='flex w-full bg-blue-300 p-3 rounded-md items-center mt-4'>
    <span className='font-thin mr-4'>
      语音控制
    </span>
    <Switch className='bg-red-200 w-auto' checked={isRecording} onChange={onChange} />
  </div>
}

const CodeGenerator = () => {
  const [code, setCode] = useState('');
  useEffect(() => {
    setCode(historyManager.getCurrent() || '')
  }, [])

  return <div>
    <AccessKeyChecker />
    {/* eval html code */}
    <div id="container" className="code w-screen h-screen" dangerouslySetInnerHTML={{ __html: code }}></div>
    <Chat setCode={setCode} />
  </div>
}

export default CodeGenerator;