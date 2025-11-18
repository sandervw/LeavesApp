import TemplateService from '../services/template.service';
import { createCrudControllers } from './base.controller';

/**
 * Template CRUD controllers.
 */
const crud = createCrudControllers(TemplateService);

export const getTemplatesController = crud.getAll;

export const getOneTemplateController = crud.getOne;

export const getTemplateChildrenController = crud.getChildren;

export const postTemplateController = crud.create;

export const deleteTemplateController = crud.delete; 
