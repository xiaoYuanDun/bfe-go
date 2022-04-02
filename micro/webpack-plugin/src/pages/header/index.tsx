import React, { FC } from 'react';

type IndexProps = {
  name: string;
};

const Index: FC<IndexProps> = (props) => {
  const { name } = props;

  return (
    <div>
      <p>{name}</p>
      Big fucking header ...
    </div>
  );
};

export default Index;
