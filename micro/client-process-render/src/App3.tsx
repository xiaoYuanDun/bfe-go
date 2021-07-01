import React, { useState } from 'react';
import './App3.less';

const App3 = () => {
  const [isPlay, setIsPlay] = useState(false);
  const [type, setType] = useState(0);
  const [isDone, setIsDone] = useState(0);

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

export default App3;
