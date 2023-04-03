class SpeechRecognition {
  content: string;
  recognition: any;
  constructor() {
    this.content = '';
    if(typeof window === 'undefined') return
    // @ts-ignore
    this.recognition = new window.webkitSpeechRecognition()
    // @ts-ignore
    this.recognition.continuous = true
  }
  init() {

  }
  getContent() {
    return this.content 
  }
  
  stop() {
    this.recognition.stop()
  }
  start() {
    this.recognition.start()
  }
  onError(callback) {
    this.recognition.onerror = () => {
      callback && callback()
      this.recognition.stop()
    }
  }
  onSpeechEnd(callback) {
    this.recognition.onspeechend = () => {
      callback && callback()
      this.recognition.stop()
    }
  }
  onStart(callback) {
    this.recognition.onstart = () => {
      callback && callback()
    }
  }
  onResult(callback: (content: string) => void) {
    this.recognition.onresult = (event: any) => {
      var current = event.resultIndex;
      var transcript = event.results[current][0].transcript
      this.content += transcript
      callback(this.content)
    }
  }
}

export const speechRecognition = new SpeechRecognition()