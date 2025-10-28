import InlineSVG from './InlineSVG';

export const ReturnButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()} title='return icon'>
            <InlineSVG src='/return.svg' alt='return icon' className='icon' />
        </button>
     );
}

export const DownloadButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()} title='download icon'>
            <InlineSVG src='/download.svg' alt='download icon' className='icon' />
        </button>
     );
}

export const ArchiveButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()} title='archive icon'>
            <InlineSVG src='/archive.svg' alt='archive icon' className='icon' />
        </button>
     );
}

export const UnarchiveButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()} title='unarchive icon'>
            <InlineSVG src='/unarchive.svg' alt='unarchive icon' className='icon' />
        </button>
     );
}

export const DeleteButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()} title='delete icon'>
            <InlineSVG src='/delete.svg' alt='delete icon' className='icon' />
        </button>
     );
}

export const DraggableButton = (props) => {
    return (
        <button {...props} title='drag icon'>
            <InlineSVG src='/drag.svg' alt='drag icon' className='icon' />
        </button>
    );
}

export const SunButton = (props) => {
    return (
        <button {...props} title='sun icon'>
            <InlineSVG src='/sun.svg' alt='sun icon' className='icon' />
        </button>
    );
}

export const MoonButton = (props) => {
    return (
        <button {...props} title='moon icon'>
            <InlineSVG src='/moon.svg' alt='moon icon' className='icon' />
        </button>
    );
}