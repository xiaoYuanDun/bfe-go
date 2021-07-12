import React, { useState } from 'react';
import { calc } from './utils';

import './App1.less';

let timer: any = null; //  递增进度的定时器
let totalTime = 3000; // 假设视频播放为3s

const App1 = () => {
  const [progress, setProgress] = useState(0); // 进度
  const [isPlay, setIsPlay] = useState(false); // 是否播放

  // // setProgress的递增逻辑
  const handlerProgress = (pre: number) => {
    if (pre < 100) return pre + 1;
    else {
      // alert('播放结束');
      console.log('done ...');
      clearInterval(timer);
      return pre; // 播放结束，重新开始播放
    }
  };

  // // 开始播放 && 暂停播放
  const handleVideo = () => {
    setIsPlay(!isPlay);
    isPlay
      ? clearInterval(timer)
      : (timer = setInterval(
          () => setProgress(handlerProgress),
          totalTime / 100
        ));
  };

  // // 重播
  const replay = () => {
    setIsPlay(true);
    if (timer) clearInterval(timer);
    setProgress(0);
    timer = setInterval(() => setProgress(handlerProgress), totalTime / 100);
  };

  calc();
  console.log('render ...');

  return (
    <div id="root">
      <button onClick={handleVideo}>{isPlay ? '暂停' : '播放'}</button>
      <button onClick={replay}>重播</button>
      <div className="container">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default App1;