/** *user.model.ts */
// total size: 844 chars
import mongoose from 'mongoose';
import { compareValue, hashValue } from '../utils/bcrypt';
import { UserDoc } from '../schemas/mongo.schema';

export default mongoose.model<UserDoc>("User", userSchema);

/** *verificationCode.model.ts */
// total size: 433 chars
import mongoose from 'mongoose';
import { VerificationCodeDoc } from '../schemas/mongo.schema';

export default mongoose.model<VerificationCodeDoc>(
    'VerificationCode',
    VerificationCodeSchema,
    'verification_codes'
);

/** *session.model.ts */
// total size: 485 chars
import mongoose from 'mongoose';
import { thirtyDaysFromNow } from '../utils/date';
import { SessionDoc } from '../schemas/mongo.schema';

export default mongoose.model<SessionDoc>(
  'Session',
  sessionSchema,
);

/** *tree.model.ts */
// total size: 918 chars
import mongoose from 'mongoose';
import { StorynodeDoc, TemplateDoc, TreeDoc } from '../schemas/mongo.schema';

export const Tree: mongoose.Model<TreeDoc>;
export const Template: mongoose.Model<TemplateDoc>;
export const Storynode: mongoose.Model<StorynodeDoc>;
