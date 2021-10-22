import React from 'react';
import ReactDOM from 'react-dom';

import Form, { Field } from './es';
// import Form, { Field } from './src';

const Ele = () => {
  const [form] = Form.useForm();

  console.log('render once ...');

  return (
    <Form form={form} fields={[{ name: 'name', value: 'danny' }, { name: 'age' }]}>
      <Field name="name">
        <input />
      </Field>
      {/* <Field name="name" initialValue="danny">
        <input placeholder="name" />
      </Field>
      <Field name="age">
        <input placeholder="age" />
      </Field> */}
    </Form>
  );
};

ReactDOM.render(<Ele />, document.getElementById('root'));

// return (
//   <>
//     <div>
//       <Form form={form}>
//         <Field name="name">
//           <input placeholder="name" />
//         </Field>
//         <br />

//         <Field name="pwd">
//           <input placeholder="pwd" />
//         </Field>
//         <br />

//         <Field name="age">
//           <input placeholder="age" />
//         </Field>
//         <br />
//         <button>Submit</button>
//       </Form>

//       <button
//         onClick={() => {
//           console.log(form.getFieldsValue());
//         }}
//       >
//         console form
//       </button>

//       <button
//         onClick={() => {
//           console.log(form.getFieldsValue(['age']));
//         }}
//       >
//         console age
//       </button>
//     </div>
//     <div></div>
//   </>
// );
