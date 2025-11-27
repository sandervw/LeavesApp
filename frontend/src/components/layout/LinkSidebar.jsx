import RubbishPile from '../part/RubbishPile';
import useAuthContext from '../../hooks/useAuthContext';
import useTreelistContext from '../../hooks/useTreelistContext';
import ExpandList from '../part/ExpandList';

const LinkSidebar = () => {
  const { user } = useAuthContext();
  const { trees } = useTreelistContext();
  const safeTrees = trees || [];

  return (
    !user
      ? <div></div>
      : <aside className='sidebar container'>
        <ul className='list'>
          <ExpandList
            type="Story"
            title="Stories"
            items={safeTrees.filter((tree) => tree.kind === 'storynode' && !tree.archived)}
          />
          <ExpandList
            type="Template"
            title="Templates"
            items={safeTrees.filter((tree) => tree.kind === 'template')}
          />
          <ExpandList
            type="Story"
            title="Archive"
            items={safeTrees.filter((tree) => tree.archived)}
          />
        </ul>
        <div className='rubbish-pile'>
          <RubbishPile />
        </div>
      </aside>
  );

};

export default LinkSidebar;