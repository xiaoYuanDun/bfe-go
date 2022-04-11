import { registerMicroApps, start } from 'qiankun';
import { importEntry } from './import-html-entry';

registerMicroApps(
  [
    {
      name: 'app-data',
      entry: '//localhost:3001',
      container: '#container',
      activeRule: '/data-app',
    },
    {
      name: 'app-user',
      entry: '//localhost:3002',
      container: '#container',
      activeRule: '/user-app',
      //   props: {
      //     name: 'kuitos',
      //   },
    },
  ],
  {
    beforeLoad: (app) => console.log('before load', app.name),
    beforeMount: [(app) => console.log('before mount', app.name)],
  }
);

start();

importEntry('//localhost:3002');
