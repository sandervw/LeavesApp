import { useState, useEffect } from 'react';
import MarkdownText from './common/MarkdownText.tsx';
import Draggable from '../wrapper/Draggable';
import useElementContext from '../../hooks/useElementContext';
import { InputHeader } from './common/ElementTraits';

const StorynodeCreate = () => {
  const { element } = useElementContext();
  const type = element ? 'leaf' : 'root';
  const parent = element ? element._id : null;
  const [newCreate, setNewCreate] = useState({ name: '', text: '', kind: 'storynode', type, parent });

  // Update the state when the element context changes
  useEffect(() => {
    setNewCreate({
      name: '',
      text: '',
      kind: 'storynode',
      type: element ? 'leaf' : 'root',
      parent: element ? element._id : null
    });
  }, [element]);

  return (
    <Draggable
      id='storynodeCreate'
      source='storynodeCreate'
      className='card container'
      data={{ ...newCreate, name: (newCreate.name !== '' ? newCreate.name : 'New ' + type) }}>
      <div>
        <InputHeader
          dragHandler={true}
          placeholder={'New ' + type}
          className='input-stretch font-medium'
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

export default StorynodeCreate;