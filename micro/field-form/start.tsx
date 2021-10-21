import React from 'react';
import ReactDOM from 'react-dom';

import Form, { Field } from './es';

const Ele = () => {
  const [form] = Form.useForm();

  console.log('render once ...');
  return (
    <>
      <Form form={form}>
        <Field name="name">
          <input placeholder="name" />
        </Field>
        <br />

        <Field name="pwd">
          <input placeholder="pwd" />
        </Field>
        <br />

        <Field name="age">
          <input placeholder="age" />
        </Field>
        <br />
        <button>Submit</button>
      </Form>

      <button
        onClick={() => {
          console.log(form.getFieldsValue());
        }}
      >
        console form
      </button>

      <button
        onClick={() => {
          console.log(form.getFieldsValue(['age']));
        }}
      >
        console age
      </button>
    </>
  );
};

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

ReactDOM.render(<Ele />, document.getElementById('root'));
