import React, { useState, useEffect } from 'react';
import MarkdownText from './common/MarkdownText.tsx';
import Draggable from '../wrapper/Draggable';
import useElementContext from '../../hooks/useElementContext';
import { InputHeader } from './common/ElementTraits';

const TemplateCreate = () => {
  const { element } = useElementContext();
  const type = element ? 'branch' : 'root';
  const parent = element ? element._id : null;
  const [newCreate, setNewCreate] = useState({ name: '', text: '', kind: 'template', type, parent });

  // Update the state when the element context changes
  useEffect(() => {
    setNewCreate({
      name: '',
      text: '',
      kind: 'template',
      type: element ? 'branch' : 'root', // If we are on the detail page, set the type to branch
      parent: element ? element._id : null
    });
  }, [element]);

  return (
    <Draggable
      id='templateCreate'
      source='templateCreate'
      className='card container'
      data={{ ...newCreate, name: (newCreate.name !== '' ? newCreate.name : 'New ' + type) }}>
      <div>
        <InputHeader
          dragHandler={true}
          placeholder={'New ' + type}
          className='input font-medium'
          required
          value={newCreate.name}
          onChange={(e) => setNewCreate({ ...newCreate, name: e.target.value })}
        />
      </div>
      <div>
        <MarkdownText
          key={newCreate.text}
          text={newCreate.text}
          className='padding-small'
          update={(val) => setNewCreate({ ...newCreate, text: val })} />
      </div>
    </Draggable>
  );
};

export default TemplateCreate;