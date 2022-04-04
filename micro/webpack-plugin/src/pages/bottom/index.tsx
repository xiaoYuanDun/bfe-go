import React, { FC } from 'react';
import orgStore from '../../store/org';
import personStore from '../../store/person';

type IndexProps = {};

const Index: FC<IndexProps> = (props) => {
  return (
    <div>
      this. is bottom
      <div>org.id: {orgStore.initState.id}</div>
      <div>person.name: {personStore.initState.name}</div>
    </div>
  );
};

export default Index;
