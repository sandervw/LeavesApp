import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import usePageContext from './usePageContext';
import * as apiService from '../services/apiService';

/**
 * Hook to set story/template state (Detail and children elements), addable state, and current page state
 * @param {string} page the page name (e.g. 'stories', 'templates', 'storynodeDetail', 'templateDetail')
 * @param {string} elementID OPTIONAL: the element ID (e.g. storynode or template ID)
 * @returns {object} error, isPending, element, children, addables, currentPage
 */
const usePage = ({ page, elementID } = {}) => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const { element, children, dispatch: elementDispatch } = useElementContext();
  const { addables, dispatch: addablesDispatch } = useAddableContext();
  const { currentPage, dispatch: pageDispatch } = usePageContext();

  useEffect(() => {
    if (!page) return;
    (async () => {
      const pageConfigs = {
        stories: { kind: 'storynode', query: 'type=root&archived=false', addQuery: 'type=root', addKind: 'template' },
        templates: { kind: 'template', query: 'type=root' },
        archive: { kind: 'storynode', query: 'type=root&archived=true' },
        storynodeDetail: { kind: 'storynode', detail: true, addQuery: 'type=branch', addKind: 'template' },
        templateDetail: { kind: 'template', detail: true }
      };
      setIsPending(true);
      try {
        pageDispatch({ type: 'SET_PAGE', payload: page });
        const configs = pageConfigs[page];
        const [elements, children, addables] = configs.detail
          ? [await apiService.fetchElement(configs.kind, elementID) ?? null,
          await apiService.fetchChildren(configs.kind, elementID) ?? [],
          configs.addQuery ? await apiService.fetchElements(configs.addKind, configs.addQuery) ?? [] : []]
          : ['', await apiService.fetchElements(configs.kind, configs.query) ?? [],
            configs.addQuery ? await apiService.fetchElements(configs.addKind, configs.addQuery) ?? [] : []];
        elementDispatch({ type: 'SET_ELEMENT', payload: elements });
        elementDispatch({ type: 'SET_CHILDREN', payload: children });
        addablesDispatch({ type: 'SET_ADDABLES', payload: addables });
        setError(null);
        setIsPending(false);
      } catch (err) {
        console.log('Error in usePage:', err);
        elementDispatch({ type: 'SET_ELEMENT', payload: null });
        elementDispatch({ type: 'SET_CHILDREN', payload: [] });
        addablesDispatch({ type: 'SET_ADDABLES', payload: [] });
        pageDispatch({ type: 'SET_PAGE', payload: null });
        setError(err);
        setIsPending(false);
      }
    })();
  }, [elementDispatch, addablesDispatch, pageDispatch, page, elementID]);

  return { error, isPending, element, children, addables, currentPage };
};

export default usePage;