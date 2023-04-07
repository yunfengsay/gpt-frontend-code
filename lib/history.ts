export interface HistoryData {
  [key: string]: any;
}

interface HistoryCache {
  history: HistoryData[];
  current: number;
}

class HistoryManager {
  private history: HistoryData[] = [];
  private current: number = -1;
  private maxSize: number = 10;
  private cacheKey: string = 'history_cache';

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
    this.loadCache();
  }
  
  // 获取当前历史记录数据
  getCurrent(): any {
    if (this.current >= 0 && this.current < this.history.length) {
      return this.history[this.current];
    }
    return null;
  }
  // 前进方法
  forward(): HistoryData | null {
    if (this.current + 1 < this.history.length) {
      this.current++;
      this.saveCache();
      return this.history[this.current];
    }
    return null;
  }

  // 回退方法
  back(): HistoryData | null {
    if (this.current > 0) {
      this.current--;
      this.saveCache();
      return this.history[this.current];
    }
    return null;
  }

  // 添加历史记录
  addHistory(data: any): void {
    if (this.history.length > 0 && this.current < this.history.length - 1) {
      this.history = this.history.slice(0, this.current + 1);
    }
    this.history.push(data);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
    this.current = this.history.length - 1;
    this.saveCache();
  }

  // 加载缓存
  private loadCache(): void {
    if(typeof window === 'undefined') return;
    const cache = localStorage.getItem(this.cacheKey);
    if (cache) {
      const { history, current }: HistoryCache = JSON.parse(cache);
      this.history = history;
      this.current = current;
    }
  }

  // 保存缓存
  private saveCache(): void {
    const cache: HistoryCache = {
      history: this.history,
      current: this.current
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }
}

export  const historyManager = new HistoryManager(20);
if(typeof window !== 'undefined') {
// @ts-ignore
  window.historyManager = historyManager;
}