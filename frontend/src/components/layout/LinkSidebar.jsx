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
      : <div className='display-flex-column sidebar'>
        <aside className='container flex-child-grow'>
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
        </aside>
        <RubbishPile />
      </div>
  );

};

export default LinkSidebar;