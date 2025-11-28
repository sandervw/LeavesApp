import { useEffect, useState } from 'react';
import { useDndContext } from '@dnd-kit/core';
import DeleteConfirmation from '../overlay/DeleteConfirmation';
import Droppable from '../wrapper/Droppable';
import useDropHandler from '../../hooks/useDropHandler';
import SVG from './common/SVG';

/**
 * @returns {JSX.Element} A Droppable component where elements can be dragged for deletion.
 */
const RubbishPile = () => {
  const [showModal, setShowModal] = useState(false);
  const [deleteParams, setDeleteParams] = useState({ source: '', data: null });
  const { handleDelete } = useDropHandler('trash');
  const { active } = useDndContext();
  const [className, setClassName] = useState('display-none');
  useEffect(() => {
    setClassName('display-none'); // Reset className state
    // Check if the active item is a droppable element
    if (active
      && (active.data.current.source === 'detail'
        || active.data.current.source === 'roots'
        || active.data.current.source === 'children'
      )) {
      setClassName('trash-zone container');
    }
  }, [active]);

  // Make user confirm deletion if it is a detail or root element
  const checkConfirmation = (source, data) => {
    setDeleteParams({ source, data });
    if (source === 'detail' || source === 'roots') setShowModal(true);
    else handleDelete(source, data); // No confirmation needed for children
  };

  // handle delete on confirmation
  const confirmDelete = () => {
    handleDelete(deleteParams.source, deleteParams.data);
    setDeleteParams({ source: '', data: null }); // Reset deleteParams after deletion
    setShowModal(false);
  };

  return (
    <Droppable id='trash' className={className} function={checkConfirmation}>
      <SVG
        name='trashcan'
      />
      {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={() => confirmDelete()} />}
    </Droppable>

  );
};

export default RubbishPile;