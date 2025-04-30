import mongoose from 'mongoose';
import TreeService from './tree.service';
import { Template } from '../models/models';
import { TemplateDoc } from '../schemas/mongo.schema';

class templateService extends TreeService<TemplateDoc> {
    constructor() {
        super(Template);
    }
}

export default new templateService();