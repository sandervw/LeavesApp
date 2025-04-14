import React from 'react';

const DeleteConfirmation = ({ hideModal, confirmModal }) => {
  return (
    <div>
      <div className='modal-overlay'>
        <div className='modal-content'>
          <p>Are you sure you want to delete this item?</p>
          <button className='delete-button text-button' onClick={confirmModal}>Delete</button>
          <button className='cancel-button text-button' onClick={hideModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;