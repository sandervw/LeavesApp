import React from 'react';

const DeleteConfirmation = ({ hideModal, confirmModal }) => {
  return (
    <div>
      <div className='modal'>
        <div className='display-flex-column gap-medium'>
          <p>Are you sure you want to delete this item?</p>
          <div className="display-flex-between">
            <button className='btn-danger' onClick={confirmModal}>Delete</button>
            <button className='btn' onClick={hideModal}>Cancel</button>
          </div>
        </div>
      </div>
      <div className='modal-backdrop' onClick={hideModal}></div>
    </div>
  );
};

export default DeleteConfirmation;