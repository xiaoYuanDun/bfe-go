import React from 'react';
import ReactDOM from 'react-dom';

import Form, { Field } from 'rc-field-form';
const ele = (
  <Form
    onFinish={values => {
      console.log('Finish:', values);
    }}
  >
    <Field name="username">
      <input placeholder="Username" />
    </Field>
    <br />

    <Field name="password">
      <input placeholder="Password" />
    </Field>
    <br />
    <button>Submit</button>
  </Form>
);

// import Form, { Field } from './src/index';

// const ele = (
//   <Form>
//     <Field>
//       <input placeholder="Username" />
//     </Field>
//     <br />
//     <Field>
//       <input placeholder="Password" />
//     </Field>
//     <button>Submit</button>
//   </Form>
// );

ReactDOM.render(ele, document.getElementById('root'));
