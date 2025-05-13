import InlineSVG from './InlineSVG';

export const ReturnButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src='/return.svg' alt='return icon' className='icon' />
        </button>
     );
}

export const DownloadButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src='/download.svg' alt='download icon' className='icon' />
        </button>
     );
}

export const ArchiveButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src='/archive.svg' alt='archive icon' className='icon' />
        </button>
     );
}

export const UnarchiveButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src='/unarchive.svg' alt='unarchive icon' className='icon' />
        </button>
     );
}

export const DeleteButton = ({onClick}) => {
    return ( 
        <button onClick={() => onClick()}>
            <InlineSVG src='/delete.svg' alt='delete icon' className='icon' />
        </button>
     );
}

export const DraggableButton = (props) => {
    return ( 
        <button {...props}>
            <InlineSVG src='/drag.svg' alt='drag icon' className='icon' />
        </button>
     );
}

export const SunButton = (props) => {
    return ( 
        <button {...props}>
            <InlineSVG src='/sun.svg' alt='drag icon' className='icon' />
        </button>
     );
}

export const MoonButton = (props) => {
    return ( 
        <button {...props}>
            <InlineSVG src='/moon.svg' alt='drag icon' className='icon' />
        </button>
     );
}