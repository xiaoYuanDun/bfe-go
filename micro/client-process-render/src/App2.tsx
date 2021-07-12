import React, { useState } from 'react';
import './App2.less';

const App2 = () => {
  const [isPlay, setIsPlay] = useState(false); // 是否播放
  const [type, setType] = useState(0); // 使用哪个动画。0: @keyframes play; 1: @keyframes replay;
  const [isDone, setIsDone] = useState(0); // 是否已完成一次

  // 暂停 && 播放
  const handleVideo = () => {
    if (isDone) {
      setType(type ? 0 : 1);
      setIsDone(0);
    }
    setIsPlay(!isPlay);
  };

  // 重播
  const replay = () => {
    setIsPlay(true);
    setType(type ? 0 : 1);
  };

  const handleEnd = () => {
    // alert('播放结束');
    console.log('done ...');
    setIsPlay(false);
    setIsDone(1);
  };

  console.log('render ...');

  return (
    <div id="root">
      <button onClick={handleVideo}>{isPlay ? '暂停' : '播放'}</button>
      <button onClick={replay}>重播</button>
      <div className="container">
        <div
          className={`progress ${isPlay ? 'play' : 'pause'}`}
          style={{
            animationName: `${type ? 'replay' : 'play'}`,
          }}
          onAnimationEnd={handleEnd}
        />
      </div>
    </div>
  );
};

export default App2;
