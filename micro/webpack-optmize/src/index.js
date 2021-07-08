const btn = document.createElement('button');

btn.innerHTML = 'asd';

btn.addEventListener('click', () => {
  import(/* webpackPrefetch: true */ './title').then((res) => {
    console.log(res);
  });
});

document.body.append(btn);
