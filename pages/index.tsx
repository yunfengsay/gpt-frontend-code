import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, message, Modal } from 'antd';
const { TextArea } = Input;
import { setLocalCache, getLocalCache, copyToClipboard, getBlockCode } from '@/lib';


let currentHighlightedElement: HTMLElement | null = null;
const cacheName = '__generated_code';
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

  dom.addEventListener('keydown', (event: KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === 'Escape' && currentHighlightedElement) {
      currentHighlightedElement.classList.remove('highlight');
      currentHighlightedElement = null;
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
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('reload')
    initHightLight()
    // if(!getLocalCache(cacheName)) {
    //   reloadAI()
    // }
  }, [])
  const handleSend = () => {
    const accessKey = getLocalCache(accessKeyName);
    if (!accessKey) {
      alert('请先设置accessKey')
    }
    // @ts-ignore
    setLoading(true)
    const value = ref.current?.resizableTextArea?.textArea?.value
    const context = currentHighlightedElement?.innerHTML;
    const message = context ? context + ' 这部分按下面要求修改并返回修改后的完整html代码->\n' + value : value;
    fetchAI({
      message,
      accessKey,
      currentHtml: getLocalCache(cacheName) || '',
    }).then(res => {
      const value = getBlockCode(res?.data);
      setLocalCache(cacheName, value)
      setCode(value);
    }).finally(() => {
      setLoading(false)
    })
  }

  return <div className="chat rounded-md p-4 shadow-md fixed right-4 bottom-4">
    <TextArea ref={ref} placeholder="maxLength is 2000" rows={10} maxLength={2000} />
    <Button loading={loading} onClick={handleSend} className="w-full mt-4 bg-blue-500" type="primary">Subimt</Button>
    <div className='w-full mt-4 flex justify-between'>
      <Button onClick={() => {
        // reloadAI()
        setLocalCache(cacheName, '')
        setCode('')
      }} className="w-1/2 mr-4 bg-blue-500" type="primary">reset</Button>
      <Button onClick={() => {
        copyToClipboard(getLocalCache(cacheName) || '')
      }} className="w-1/2 bg-blue-500" type="primary">copy</Button>
      {/* <Button onClick={() => {}} className="w-1/4 bg-blue-500" type="primary">share</Button> */}
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
    <Modal
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
      <Input ref={ref} placeholder="accesskey" />
    </Modal>
  </div>
}

const CodeGenerator = () => {
  const [code, setCode] = useState('');
  useEffect(() => {
    setCode(getLocalCache(cacheName) || '')
  }, [])

  if (typeof window === 'undefined') {
    return <></>;
  }
  return <div>
    <AccessKeyChecker />
    {/* eval html code */}
    <div id="container" className="code w-screen h-screen" dangerouslySetInnerHTML={{ __html: code }}></div>
    <Chat setCode={setCode} />
  </div>
}

export default CodeGenerator;