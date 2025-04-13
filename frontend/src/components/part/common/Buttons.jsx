import InlineSVG from "./InlineSVG";

const ReturnButton = (onClick) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src="/return.svg" alt="return icon" className="icon" />
        </button>
     );
}

const DownloadButton = (onClick) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src="/download.svg" alt="download icon" className="icon" />
        </button>
     );
}

const ArchiveButton = (onClick) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src="/archive.svg" alt="archive icon" className="icon" />
        </button>
     );
}

const UnarchiveButton = (onClick) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src="/unarchive.svg" alt="unarchive icon" className="icon" />
        </button>
     );
}

const DeleteButton = (onClick) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src="/delete.svg" alt="delete icon" className="icon" />
        </button>
     );
}

const DraggableButton = (onClick) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src="/drag.svg" alt="drag icon" className="icon" />
        </button>
     );
}
 
export { ReturnButton, DownloadButton, ArchiveButton, UnarchiveButton, DeleteButton, DraggableButton };